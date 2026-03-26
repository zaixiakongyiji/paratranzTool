// RAG 管线编排
// 语料同步 → 向量化 → 检索 → 过滤 → 重排序 → 输出参考

import { Storage } from './storage.js';
import { VectorStore } from './vectorStore.js';
import { EmbeddingClient } from '../api/embedding.js';

export const RAG = {
  /**
   * 从 ParaTranz 同步已翻译词条到 IndexedDB
   * @param {string} projectId - 项目 ID
   * @param {Function} onProgress - 进度回调 (status, detail)
   * @returns {object} { totalSynced, newEmbeddings }
   */
  async syncCorpus(projectId, onProgress = null) {
    const { paraTranzApi } = await import('../api/paratranz.js');
    
    if (onProgress) onProgress('pulling', '正在从 ParaTranz 拉取已翻译词条...');
    
    // 获取文件列表
    const files = await paraTranzApi.getFiles(projectId);
    
    let allStrings = [];
    let fileCount = 0;
    
    for (const file of files) {
      fileCount++;
      if (onProgress) onProgress('pulling', `正在拉取文件 ${fileCount}/${files.length}: ${file.name}`);
      
      try {
        // 拉取已翻译 (stage=1) 和已审核 (stage=2) 的词条
        const translated = await paraTranzApi.getStrings(projectId, file.id, 1);
        const reviewed = await paraTranzApi.getStrings(projectId, file.id, 2);
        
        const withMeta = [...translated, ...reviewed]
          .filter(s => s.original && s.translation) // 过滤无效条目
          .map(s => ({
            id: s.id,
            original: s.original,
            translation: s.translation,
            fileId: file.id,
            fileName: file.name,
            stage: s.stage,
            updatedAt: s.updatedAt || new Date().toISOString()
          }));
        
        allStrings.push(...withMeta);
      } catch (e) {
        console.warn(`拉取文件 ${file.name} 失败:`, e);
      }
      
      // 每 3 个文件暂停 200ms 避免限流
      if (fileCount % 3 === 0) {
        await new Promise(r => setTimeout(r, 200));
      }
    }
    
    // 去重（以 ID 为主键，重复条保留最后出现的）
    const uniqueMap = new Map();
    allStrings.forEach(s => uniqueMap.set(s.id, s));
    allStrings = Array.from(uniqueMap.values());
    
    if (onProgress) onProgress('saving', `正在写入本地数据库 (${allStrings.length} 条)...`);
    
    // 分批写入 IndexedDB
    const BATCH = 100;
    for (let i = 0; i < allStrings.length; i += BATCH) {
      await VectorStore.upsertItems(projectId, allStrings.slice(i, i + BATCH));
    }
    
    // 保存同步时间
    await VectorStore.saveSyncMeta(projectId, {
      lastSync: new Date().toISOString(),
      totalItems: allStrings.length
    });
    
    // 如果向量化模型已配置，自动进行向量化
    const settings = Storage.getSettings();
    let newEmbeddings = 0;
    
    if (settings.embeddingEnabled && settings.embeddingApiKey) {
      if (onProgress) onProgress('embedding', '正在向量化...');
      newEmbeddings = await this.embedPending(projectId, onProgress);
    }
    
    if (onProgress) onProgress('done', `同步完成！共 ${allStrings.length} 条，新增向量 ${newEmbeddings} 条`);
    
    return { totalSynced: allStrings.length, newEmbeddings };
  },

  /**
   * 对待处理条目进行向量化
   */
  async embedPending(projectId, onProgress = null) {
    const pending = await VectorStore.getItemsWithoutEmbedding(projectId);
    if (pending.length === 0) return 0;
    
    const settings = Storage.getSettings();
    const BATCH_SIZE = 50; // 每 50 条为一个存储检查点
    let totalDone = 0;
    
    for (let i = 0; i < pending.length; i += BATCH_SIZE) {
      const chunk = pending.slice(i, i + BATCH_SIZE);
      const texts = chunk.map(item => item.original);
      
      if (onProgress) onProgress('embedding', `正在生成第 ${i + 1} - ${Math.min(i + BATCH_SIZE, pending.length)} 条向量...`);
      
      let embeddings = [];
      try {
        embeddings = await EmbeddingClient.embedBatch(
          texts,
          (doneInChunk, totalInChunk) => {
            if (onProgress) {
              const currentTotalDone = i + doneInChunk;
              onProgress('embedding', `向量化进度: ${currentTotalDone}/${pending.length}`);
            }
          },
          10, // 接口调用层级的并发
          300 // 稍微降低延迟提高效率
        );
      } catch (e) {
        console.warn('向量化批次发生异常，触发熔断保护:', e);
        if (onProgress) {
          onProgress('warning', `接口限制或额度耗尽，向量化中止。本次已保存 ${totalDone} 条，剩余记录下次同步时将继续处理。`);
        }
        break; // 触发熔断，保留已经完成的 totalDone，直接结束本轮向量化
      }
      
      // 关键：每拿到一批结果，立即持久化到数据库（和 Qdrant）
      for (let j = 0; j < chunk.length; j++) {
        if (embeddings[j]) {
          await VectorStore.setEmbedding(chunk[j].id, embeddings[j], settings.embeddingModel);
        }
      }
      
      totalDone += embeddings.length;
    }
    
    return totalDone;
  },

  /**
   * 为待翻原文检索相似的历史翻译参考
   * @param {string} projectId - 项目 ID
   * @param {string} original - 待翻原文
   * @param {object} options - { fileId, topK }
   * @returns {Array<{ original, translation, score, fileName, stage }>}
   */
  async retrieveReferences(projectId, original, options = {}) {
    const settings = Storage.getSettings();
    if (!settings.embeddingEnabled) return [];
    
    // 步骤 1: 生成查询向量
    const queryVec = await EmbeddingClient.embed(original);
    
    // 步骤 2: 余弦相似度检索 Top-K
    const rawTopK = 15; // 初始多取一些，后面过滤用
    const results = await VectorStore.searchSimilar(projectId, queryVec, rawTopK, {
      fileId: options.fileId,
      maxLenRatio: 3, // 放宽高低倍数过滤，允许极长段落作为短句的参考
      queryLen: original.length
    });
    
    if (results.length === 0) return [];
    
    let candidates = results.map(r => ({
      original: r.item.original,
      translation: r.item.translation,
      score: r.score,
      fileName: r.item.fileName,
      stage: r.item.stage,
      fileId: r.item.fileId
    }));
    
    // 步骤 3: AI 智能过滤（如果开启）
    if (settings.filterEnabled && settings.filterApiKey) {
      candidates = await this._aiFilter(original, candidates, settings);
    }
    
    // 步骤 4: AI 重排序（如果开启）
    if (settings.rerankEnabled && settings.rerankApiKey && candidates.length > 1) {
      candidates = await this._aiRerank(original, candidates, settings);
    }
    
    // 取最终参考条数
    const refCount = settings.embeddingRefCount || 3;
    return candidates.slice(0, refCount);
  },

  /**
   * AI 智能过滤
   */
  async _aiFilter(original, candidates, settings) {
    const baseUrl = settings.filterBaseUrl.endsWith('/')
      ? settings.filterBaseUrl.slice(0, -1)
      : settings.filterBaseUrl;
    const isGemini = settings.filterApiFormat === 'gemini';
    
    const candidateList = candidates.map((c, i) =>
      `${i + 1}. 原文: "${c.original.substring(0, 100)}..." → 译文: "${c.translation.substring(0, 100)}..." [文件: ${c.fileName}, 相似度: ${c.score.toFixed(3)}]`
    ).join('\n');
    
    const systemPrompt = settings.filterPrompt || '你是一个游戏翻译参考分析助手。';
    const userPrompt = `待翻原文：${original.substring(0, 200)}\n\n候选参考列表：\n${candidateList}\n\n请分析并返回最有参考价值的条目序号（JSON 数组格式 [{"index": 序号}]）：`;
    
    try {
      const result = await this._callLLM(baseUrl, settings.filterApiKey, settings.filterModel, systemPrompt, userPrompt, isGemini);
      
      // 解析返回的 JSON
      const cleanResult = result.replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(cleanResult);
      
      if (Array.isArray(parsed)) {
        const indices = parsed.map(p => (p.index || p) - 1).filter(i => i >= 0 && i < candidates.length);
        if (indices.length > 0) {
          return indices.map(i => candidates[i]);
        }
      }
    } catch (e) {
      console.warn('AI 过滤失败，回退到规则过滤:', e);
    }
    
    // 回退：直接返回原排序
    return candidates;
  },

  /**
   * AI 重排序
   */
  async _aiRerank(original, candidates, settings) {
    const baseUrl = settings.rerankBaseUrl.endsWith('/')
      ? settings.rerankBaseUrl.slice(0, -1)
      : settings.rerankBaseUrl;
    const isGemini = settings.rerankApiFormat === 'gemini';
    
    // 如果是 OpenAI 格式且模型名包含 "Reranker"，尝试原生接口
    const isNativeRerank = !isGemini && settings.rerankModel.toLowerCase().includes('reranker');
    
    if (isNativeRerank) {
      // 容错：如果用户填写的 URL 已经包含了 /rerank，则保留现状，否则添加
      const url = baseUrl.endsWith('/rerank') ? baseUrl : `${baseUrl}/rerank`;
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.rerankApiKey}`
          },
          body: JSON.stringify({
            model: settings.rerankModel,
            query: original,
            documents: candidates.map(c => c.original + "\n" + c.translation),
            top_n: settings.embeddingRefCount || 3
          })
        });
        
        if (!response.ok) throw new Error(`原生 Rerank 请求失败: ${response.status}`);
        const data = await response.json();
        
        if (data.results && Array.isArray(data.results)) {
          // data.results 通常是 [{index: 0, relevance_score: ...}]
          return data.results
            .sort((a, b) => b.relevance_score - a.relevance_score)
            .map(r => candidates[r.index]);
        }
      } catch (e) {
        console.warn('原生 Rerank 失败，回退到 Prompt 排序:', e);
      }
    }

    const candidateList = candidates.map((c, i) =>
      `${i + 1}. "${c.original.substring(0, 80)}" → "${c.translation.substring(0, 80)}"`
    ).join('\n');
    
    const systemPrompt = '你是一个翻译参考排序助手。请将以下候选参考按照对当前待翻文本的参考价值从高到低排序。只返回排序后的序号数组，例如 [3, 1, 2]。';
    const userPrompt = `待翻原文：${original.substring(0, 200)}\n\n候选参考：\n${candidateList}\n\n请返回排序后的序号数组：`;
    
    try {
      const result = await this._callLLM(baseUrl, settings.rerankApiKey, settings.rerankModel, systemPrompt, userPrompt, isGemini);
      
      const cleanResult = result.replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/i, '').trim();
      const indices = JSON.parse(cleanResult);
      
      if (Array.isArray(indices)) {
        const reranked = indices
          .map(i => candidates[i - 1])
          .filter(c => c !== undefined);
        if (reranked.length > 0) return reranked;
      }
    } catch (e) {
      console.warn('AI 重排序失败，保持原排序:', e);
    }
    
    return candidates;
  },

  /**
   * 通用 LLM 调用（支持 OpenAI/Gemini 双格式）
   */
  async _callLLM(baseUrl, apiKey, model, systemPrompt, userPrompt, isGemini) {
    if (isGemini) {
      const url = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { temperature: 0.1 }
        })
      });
      
      if (!response.ok) throw new Error(`Gemini 请求失败: ${response.status}`);
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    } else {
      const url = `${baseUrl}/chat/completions`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.1
        })
      });
      
      if (!response.ok) throw new Error(`LLM 请求失败: ${response.status}`);
      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || '';
    }
  },

  /**
   * 将参考翻译格式化为 Prompt 上下文片段
   */
  formatReferencesForPrompt(references) {
    if (!references || references.length === 0) return '';
    
    const lines = references.map((ref, i) =>
      `${i + 1}. "${ref.original.substring(0, 120)}" → "${ref.translation.substring(0, 120)}"`
    ).join('\n');
    
    return `\n\n以下是该项目中相似内容的历史翻译参考，请保持风格一致：\n${lines}`;
  }
};
