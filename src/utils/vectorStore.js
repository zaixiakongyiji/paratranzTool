// IndexedDB 向量存储封装
// 用于存储和检索已翻译词条的 Embedding 向量
import { Storage } from './storage.js';

const DB_NAME = 'paratranz_vector_store';
const DB_VERSION = 1;
const STORE_NAME = 'translations';
const META_STORE = 'sync_meta';

// 数据库连接缓存
let dbInstance = null;

/**
 * 打开或创建 IndexedDB 数据库
 */
function openDB() {
  if (dbInstance) return Promise.resolve(dbInstance);
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // 翻译条目存储
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('by_project', 'projectId', { unique: false });
        store.createIndex('by_file', ['projectId', 'fileId'], { unique: false });
        store.createIndex('by_stage', ['projectId', 'stage'], { unique: false });
        store.createIndex('by_has_embedding', ['projectId', 'hasEmbedding'], { unique: false });
      }
      
      // 同步元数据存储
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'projectId' });
      }
    };
    
    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };
    
    request.onerror = () => reject(request.error);
  });
}

export const VectorStore = {
  /**
   * 批量写入翻译条目（不含向量）
   * @param {string} projectId - 项目 ID
   * @param {Array} items - 词条数组 { id, original, translation, fileId, fileName, stage, updatedAt }
   */
  async upsertItems(projectId, items) {
    const db = await openDB();
    
    // 方案：先读取出该项目的所有旧数据，记录下它们的 embedding 以供“合并/回填”
    // 这样在后面的写入事务中就全是同步操作，不会因为 await 导致事务自动提交
    const existingMap = new Map();
    const existingItems = await this.getItemsWithEmbedding(projectId);
    existingItems.forEach(item => existingMap.set(item.id, item));
    const leftovers = await this.getItemsWithoutEmbedding(projectId);
    leftovers.forEach(item => existingMap.set(item.id, item));

    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    for (const item of items) {
      const existing = existingMap.get(item.id);
      
      store.put({
        id: item.id,
        projectId: String(projectId),
        original: item.original,
        translation: item.translation,
        fileId: item.fileId,
        fileName: item.fileName || '',
        stage: item.stage,
        updatedAt: item.updatedAt,
        // 保留已有向量，或标记无向量
        embedding: existing?.embedding || null,
        embeddingModel: existing?.embeddingModel || null,
        hasEmbedding: existing?.hasEmbedding || 0
      });
    }
    
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  },

  async setEmbedding(id, embedding, modelName) {
    const settings = Storage.getSettings();
    const db = await openDB();
    
    // 1. 先从数据库读出完整条目（为了 Payload 的元数据）
    const item = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    
    if (!item) return;

    // 2. 如果开启了 Qdrant，先执行网络请求（这一步耗时，不能在事务里做）
    let hasUploadedToQdrant = false;
    if (settings.qdrantEnabled && settings.qdrantUrl) {
      try {
        const { QdrantClient } = await import('../api/qdrant.js');
        await QdrantClient.upsertPoints(settings.qdrantUrl, settings.qdrantApiKey, [{
          id: item.id,
          vector: Array.from(embedding),
          payload: {
            projectId: item.projectId,
            fileId: item.fileId,
            fileName: item.fileName,
            original: item.original,
            translation: item.translation,
            stage: item.stage
          }
        }]);
        hasUploadedToQdrant = true;
      } catch (e) {
        console.error("Qdrant 写入失败:", e);
        throw e;
      }
    }

    // 3. 最后开启一个简短的写事务，更新本地状态
    const txWrite = db.transaction(STORE_NAME, 'readwrite');
    const storeWrite = txWrite.objectStore(STORE_NAME);
    
    item.embedding = hasUploadedToQdrant ? null : Array.from(embedding);
    item.embeddingModel = modelName;
    item.hasEmbedding = 1;
    storeWrite.put(item);
    
    await new Promise((resolve, reject) => {
      txWrite.oncomplete = resolve;
      txWrite.onerror = () => reject(txWrite.error);
    });
  },

  async getItemsWithoutEmbedding(projectId) {
    const settings = Storage.getSettings();
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('by_has_embedding');
    
    const items = await new Promise((resolve, reject) => {
      const request = index.getAll([String(projectId), 0]);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });

    if (items.length === 0) return [];

    // 若启用 Qdrant，去服务端验证是否真的缺失（可能换电脑后本地 DB 空，但服务端已有）
    if (settings.qdrantEnabled && settings.qdrantUrl) {
      try {
        const { QdrantClient } = await import('../api/qdrant.js');
        // 分批查询防止 Request URI 过大（按 1000 批）
        let existingIds = new Set();
        const batchSize = 1000;
        for (let i = 0; i < items.length; i += batchSize) {
          const batchIds = items.slice(i, i + batchSize).map(item => item.id);
          const found = await QdrantClient.getExistingIds(settings.qdrantUrl, settings.qdrantApiKey, batchIds);
          found.forEach(id => existingIds.add(id));
        }
        
        const missing = [];
        
        // 同步状态到本地 IndexedDB（把已上传的回填为 hasEmbedding=1）
        if (existingIds.size > 0) {
          const dbWrite = await openDB();
          const txWrite = dbWrite.transaction(STORE_NAME, 'readwrite');
          const storeWrite = txWrite.objectStore(STORE_NAME);

          for (const item of items) {
            if (existingIds.has(item.id)) {
              item.hasEmbedding = 1;
              item.embedding = null; 
              storeWrite.put(item);
            } else {
              missing.push(item);
            }
          }
          await new Promise((resolve, reject) => {
            txWrite.oncomplete = resolve;
            txWrite.onerror = () => reject(txWrite.error);
          });
          return missing;
        }
      } catch (e) {
        console.warn("Qdrant 校验缺失条目失败，回退到原生重置:", e);
        throw e; // 这里不能吞掉报错，需要向上传递以便排查
      }
    }

    return items;
  },

  /**
   * 获取项目中所有已向量化的条目
   */
  async getItemsWithEmbedding(projectId) {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('by_has_embedding');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll([String(projectId), 1]);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * 获取项目的所有条目数量
   */
  async getProjectItemCount(projectId) {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const index = tx.objectStore(STORE_NAME).index('by_project');
    
    return new Promise((resolve, reject) => {
      const request = index.count(String(projectId));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async searchSimilar(projectId, queryVec, topK = 15, filters = {}) {
    const settings = Storage.getSettings();

    // =============== Qdrant 检索模式 ===============
    if (settings.qdrantEnabled && settings.qdrantUrl) {
      try {
        const { QdrantClient } = await import('../api/qdrant.js');
        const results = await QdrantClient.search(settings.qdrantUrl, settings.qdrantApiKey, projectId, queryVec, topK * 2);
        
        let scored = results.map(r => ({
          item: r.payload,
          score: r.score
        }));
        
        // Qdrant 检索回来的结果，在前端再执行一次相同的规则微调过滤
        if (filters.fileId) {
          scored = scored.map(s => ({
            ...s,
            score: s.item.fileId === filters.fileId ? s.score * 1.2 : s.score
          }));
        }
        if (filters.minStage) {
          scored = scored.filter(s => s.item.stage >= filters.minStage);
        }
        if (filters.maxLenRatio && filters.queryLen) {
          scored = scored.filter(s => {
            const ratio = s.item.original.length / filters.queryLen;
            return ratio >= (1 / filters.maxLenRatio) && ratio <= filters.maxLenRatio;
          });
        }
        
        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, topK);
      } catch (e) {
        console.error("Qdrant 检索失败:", e);
        return [];
      }
    }

    // =============== 原生 IndexedDB 检索模式 ===============
    // 如果之前开启了 Qdrant 模式，本地条目的 embedding 为 null，需要过滤掉，防止计算报错
    const items = (await this.getItemsWithEmbedding(projectId)).filter(it => it.embedding);
    if (items.length === 0) return [];
    
    const queryLen = Math.sqrt(queryVec.reduce((sum, v) => sum + v * v, 0));
    if (queryLen === 0) return [];
    
    let scored = items.map(item => {
      const emb = item.embedding;
      let dot = 0, embLen = 0;
      for (let i = 0; i < emb.length; i++) {
        dot += queryVec[i] * emb[i];
        embLen += emb[i] * emb[i];
      }
      embLen = Math.sqrt(embLen);
      const score = embLen > 0 ? dot / (queryLen * embLen) : 0;
      return { item, score };
    });
    
    // 元数据规则过滤
    if (filters.fileId) {
      // 同文件加权（得分 x 1.2）
      scored = scored.map(s => ({
        ...s,
        score: s.item.fileId === filters.fileId ? s.score * 1.2 : s.score
      }));
    }
    
    if (filters.minStage) {
      scored = scored.filter(s => s.item.stage >= filters.minStage);
    }
    
    if (filters.maxLenRatio && filters.queryLen) {
      // 过滤长度差异过大的(原文长度比)
      scored = scored.filter(s => {
        const ratio = s.item.original.length / filters.queryLen;
        return ratio >= (1 / filters.maxLenRatio) && ratio <= filters.maxLenRatio;
      });
    }
    
    // 按分数排序取 Top-K
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  },

  /**
   * 保存同步元数据
   */
  async saveSyncMeta(projectId, meta) {
    const db = await openDB();
    const tx = db.transaction(META_STORE, 'readwrite');
    tx.objectStore(META_STORE).put({ projectId: String(projectId), ...meta });
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  },

  /**
   * 获取同步元数据
   */
  async getSyncMeta(projectId) {
    const db = await openDB();
    const tx = db.transaction(META_STORE, 'readonly');
    return new Promise((resolve, reject) => {
      const req = tx.objectStore(META_STORE).get(String(projectId));
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  },

  /**
   * 清空指定项目的所有数据
   */
  async deleteProjectData(projectId) {
    const db = await openDB();
    const tx = db.transaction([STORE_NAME, META_STORE], 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('by_project');
    
    // 逐条删除该项目的条目
    const keys = await new Promise((resolve, reject) => {
      const req = index.getAllKeys(String(projectId));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    
    for (const key of keys) {
      store.delete(key);
    }
    
    // 删除同步元数据
    tx.objectStore(META_STORE).delete(String(projectId));
    
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    
    // 同步清空 Qdrant 远端向量库中该项目的数据
    const settings = Storage.getSettings();
    if (settings.qdrantEnabled && settings.qdrantUrl) {
      try {
        const { QdrantClient } = await import('../api/qdrant.js');
        await QdrantClient.deletePointsByProjectId(settings.qdrantUrl, settings.qdrantApiKey, projectId);
      } catch (e) {
        console.warn("清理 Qdrant 失败:", e);
      }
    }
  },

  /**
   * 彻底清空远端 Qdrant 集合（包括所有项目的数据）
   * 专门用于解决向量维度不匹配 (Dimension Error) 的情况
   */
  async resetQdrantCollection() {
    const settings = Storage.getSettings();
    if (settings.qdrantEnabled && settings.qdrantUrl) {
      const { QdrantClient } = await import('../api/qdrant.js');
      await QdrantClient.deleteCollection(settings.qdrantUrl, settings.qdrantApiKey);
      
      // 还需要清除本地所有条目的 hasEmbedding 标志，因为集合没了，它们在服务器上也就不存在了
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      
      const req = store.openCursor();
      return new Promise((resolve, reject) => {
        req.onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor) {
            const item = cursor.value;
            if (item.hasEmbedding === 1) {
              item.hasEmbedding = 0;
              item.embedding = null;
              cursor.update(item);
            }
            cursor.continue();
          } else {
            resolve();
          }
        };
        req.onerror = () => reject(req.error);
      });
    }
  }
};
