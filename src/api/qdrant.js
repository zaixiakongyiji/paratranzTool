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
    if (res.ok) return true; // Exists
    
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
  }
};
