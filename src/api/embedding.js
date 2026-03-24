// Embedding API 封装
// 支持 OpenAI 和 Gemini 双格式的向量生成

import { Storage } from '../utils/storage.js';

export const EmbeddingClient = {
  /**
   * 为单条文本生成 Embedding 向量
   * @param {string} text - 待向量化文本
   * @returns {number[]} 向量数组
   */
  async embed(text) {
    const settings = Storage.getSettings();
    if (!settings.embeddingApiKey) throw new Error('未配置向量化模型的 API Key');
    
    const baseUrl = settings.embeddingBaseUrl.endsWith('/')
      ? settings.embeddingBaseUrl.slice(0, -1)
      : settings.embeddingBaseUrl;
    const isGemini = settings.embeddingApiFormat === 'gemini';
    
    if (isGemini) {
      return await this._embedGemini(baseUrl, settings.embeddingApiKey, settings.embeddingModel, text);
    } else {
      return await this._embedOpenAI(baseUrl, settings.embeddingApiKey, settings.embeddingModel, text);
    }
  },

  /**
   * 批量生成 Embedding（带速率控制）
   * @param {string[]} texts - 文本数组
   * @param {Function} onProgress - 进度回调 (completed, total)
   * @param {number} batchSize - 每批数量
   * @param {number} delayMs - 批次间延迟 ms
   * @returns {number[][]} 向量数组
   */
  async embedBatch(texts, onProgress = null, batchSize = 20, delayMs = 500) {
    const settings = Storage.getSettings();
    if (!settings.embeddingApiKey) throw new Error('未配置向量化模型的 API Key');
    
    const baseUrl = settings.embeddingBaseUrl.endsWith('/')
      ? settings.embeddingBaseUrl.slice(0, -1)
      : settings.embeddingBaseUrl;
    const isGemini = settings.embeddingApiFormat === 'gemini';
    const results = [];
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      
      if (isGemini) {
        // Gemini 逐条处理（不支持原生批量）
        for (const text of batch) {
          const vec = await this._embedGemini(baseUrl, settings.embeddingApiKey, settings.embeddingModel, text);
          results.push(vec);
        }
      } else {
        // OpenAI 支持批量
        const vecs = await this._embedOpenAIBatch(baseUrl, settings.embeddingApiKey, settings.embeddingModel, batch);
        results.push(...vecs);
      }
      
      if (onProgress) onProgress(Math.min(i + batchSize, texts.length), texts.length);
      
      // 批次间等待避免限流
      if (i + batchSize < texts.length) {
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
    
    return results;
  },

  // --- OpenAI 格式 ---
  
  async _embedOpenAI(baseUrl, apiKey, model, text) {
    // 容错：如果用户填写的 URL 已经包含了 /embeddings，则不再重复添加
    const url = baseUrl.endsWith('/embeddings') ? baseUrl : `${baseUrl}/embeddings`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'text-embedding-3-small',
        input: text
      })
    });
    
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Embedding 请求失败: ${response.status} - ${err}`);
    }
    
    const data = await response.json();
    return data.data[0].embedding;
  },

  async _embedOpenAIBatch(baseUrl, apiKey, model, texts) {
    const url = baseUrl.endsWith('/embeddings') ? baseUrl : `${baseUrl}/embeddings`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'text-embedding-3-small',
        input: texts
      })
    });
    
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Embedding 批量请求失败: ${response.status} - ${err}`);
    }
    
    const data = await response.json();
    // OpenAI 返回的 data 按 index 排序
    return data.data
      .sort((a, b) => a.index - b.index)
      .map(d => d.embedding);
  },

  // --- Gemini 格式 ---
  
  async _embedGemini(baseUrl, apiKey, model, text) {
    const modelName = model || 'text-embedding-004';
    const url = `${baseUrl}/models/${modelName}:embedContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: `models/${modelName}`,
        content: { parts: [{ text }] }
      })
    });
    
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini Embedding 请求失败: ${response.status} - ${err}`);
    }
    
    const data = await response.json();
    return data.embedding.values;
  }
};
