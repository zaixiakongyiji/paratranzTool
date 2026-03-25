export const QdrantClient = {
  getHeaders(apiKey) {
    const headers = { 'Content-Type': 'application/json' };
    if (apiKey) headers['api-key'] = apiKey;
    return headers;
  },

  async ensureCollection(baseUrl, apiKey, vectorSize) {
    const url = `${baseUrl.replace(/\/$/, '')}/collections/paratranz_rag`;
    const headers = this.getHeaders(apiKey);
    
    const res = await fetch(url, { headers });
    
    if (res.ok) {
        // 集合已存在，校验维度是否一致
        const data = await res.json();
        const existingSize = data.result?.config?.params?.vectors?.size;
        if (existingSize && existingSize !== vectorSize) {
            throw new Error(`向量维度不匹配: 当前模型生成维度为 ${vectorSize}，但 Qdrant 集合预设维度为 ${existingSize}。由于 Qdrant 不支持修改已有集合的维度，请点击“清空语料库”按钮重置数据（或手动删除 paratranz_rag 集合）。`);
        }
        return true;
    }
    
    if (res.status === 404) {
      const createRes = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          vectors: {
            size: vectorSize,
            distance: 'Cosine'
          }
        })
      });
      if (!createRes.ok) throw new Error(`创建 Qdrant Collection 失败: ${await createRes.text()}`);
      return true;
    }
    throw new Error(`连接 Qdrant 失败: HTTP ${res.status}`);
  },

  async deleteCollection(baseUrl, apiKey) {
    const url = `${baseUrl.replace(/\/$/, '')}/collections/paratranz_rag`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(apiKey)
    });
    return res.ok || res.status === 404;
  },

  async getExistingIds(baseUrl, apiKey, ids) {
    if (!ids || ids.length === 0) return new Set();
    const url = `${baseUrl.replace(/\/$/, '')}/collections/paratranz_rag/points`;
    
    const res = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(apiKey),
      body: JSON.stringify({
        ids: ids,
        with_payload: false,
        with_vector: false
      })
    });
    
    if (res.status === 404) return new Set(); // Collection hasn't been created yet
    if (!res.ok) throw new Error(`检查存储点失败: ${await res.text()}`);
    
    const data = await res.json();
    return new Set((data.result || []).map(p => p.id));
  },

  async upsertPoints(baseUrl, apiKey, points) {
    if (!points || points.length === 0) return;
    const vectorSize = points[0].vector.length;
    await this.ensureCollection(baseUrl, apiKey, vectorSize);
    
    const url = `${baseUrl.replace(/\/$/, '')}/collections/paratranz_rag/points?wait=true`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(apiKey),
      body: JSON.stringify({
        points: points.map(p => ({
          id: p.id,
          vector: p.vector,
          payload: {
            ...p.payload,
            projectId: String(p.payload.projectId) // 统一转换为字符串便于精确匹配
          }
        }))
      })
    });
    
    if (!res.ok) throw new Error(`写入 Qdrant 失败: ${await res.text()}`);
  },

  async search(baseUrl, apiKey, projectId, vector, limit = 30) {
    const url = `${baseUrl.replace(/\/$/, '')}/collections/paratranz_rag/points/search`;
    
    const res = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(apiKey),
      body: JSON.stringify({
        vector: vector,
        filter: {
          must: [{
            key: "projectId",
            match: { value: String(projectId) }
          }]
        },
        limit: limit,
        with_payload: true
      })
    });
    
    if (res.status === 404) return []; // Collection not created
    if (!res.ok) throw new Error(`Qdrant 检索失败: ${await res.text()}`);
    
    const data = await res.json();
    return data.result || [];
  },

  async deletePointsByProjectId(baseUrl, apiKey, projectId) {
    const url = `${baseUrl.replace(/\/$/, '')}/collections/paratranz_rag/points/delete?wait=true`;
    
    // 不要抛出 404 错误，考虑到可能该 Collection 还未建立
    const res = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(apiKey),
      body: JSON.stringify({
        filter: {
          must: [{
            key: "projectId",
            match: { value: String(projectId) }
          }]
        }
      })
    });
    
    if (res.status === 404) return true; // Collection not created
    if (!res.ok) throw new Error(`Qdrant 清理失败: ${await res.text()}`);
    return true;
  }
};
