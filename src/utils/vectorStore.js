// IndexedDB 向量存储封装
// 用于存储和检索已翻译词条的 Embedding 向量

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
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    for (const item of items) {
      // 先尝试读取已有条目，保留其 embedding
      const existing = await new Promise(resolve => {
        const req = store.get(item.id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      });
      
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
        hasEmbedding: existing?.embedding ? 1 : 0
      });
    }
    
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  },

  /**
   * 为指定条目写入向量
   * @param {number} id - 条目 ID
   * @param {Float32Array|number[]} embedding - 向量
   * @param {string} modelName - 生成向量使用的模型名
   */
  async setEmbedding(id, embedding, modelName) {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    const item = await new Promise((resolve, reject) => {
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    
    if (!item) return;
    
    item.embedding = Array.from(embedding);
    item.embeddingModel = modelName;
    item.hasEmbedding = 1;
    store.put(item);
    
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  },

  /**
   * 获取项目中所有尚未向量化的条目
   */
  async getItemsWithoutEmbedding(projectId) {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('by_has_embedding');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll([String(projectId), 0]);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
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

  /**
   * 余弦相似度检索 Top-K
   * @param {string} projectId - 项目 ID
   * @param {number[]} queryVec - 查询向量
   * @param {number} topK - 返回条目数
   * @param {object} filters - 可选过滤 { fileId, minStage, maxLenRatio }
   * @returns {Array<{ item, score }>}
   */
  async searchSimilar(projectId, queryVec, topK = 15, filters = {}) {
    const items = await this.getItemsWithEmbedding(projectId);
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
  async clearProject(projectId) {
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
  }
};
