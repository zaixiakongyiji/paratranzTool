import { Storage } from '../utils/storage.js';

class ParaTranzClient {
  constructor() {
    this.baseUrl = 'https://paratranz.cn/api';
  }

  getHeaders() {
    const settings = Storage.getSettings();
    if (!settings.ptToken) {
      throw new Error('未配置 ParaTranz API Token。请前往设置页面配置。');
    }
    return {
      'Authorization': `Bearer ${settings.ptToken}`,
      'Content-Type': 'application/json'
    };
  }

  async _request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: { ...this.getHeaders(), ...(options.headers || {}) }
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}`;
      try { errorMessage = JSON.parse(errorText).message || errorMessage; } catch (e) {}
      throw new Error(`ParaTranz API 请求失败: ${errorMessage}`);
    }
    if (response.status === 204) return null;
    return await response.json();
  }

  async getProfile() { 
    return await this._request('/users/me').catch(e => {
      console.warn("无法获取用户信息", e);
      return null;
    }); 
  }
  async getProjects() { return await this._request('/projects?page=1&pageSize=50'); }
  async getProject(projectId) { return await this._request(`/projects/${projectId}`); }
  async getFiles(projectId) { return await this._request(`/projects/${projectId}/files`); }
  async getStrings(projectId, fileId = null, stage = 0) {
    let url = `/projects/${projectId}/strings?stage=${stage}&pageSize=100`;
    if (fileId) url += `&file=${fileId}`;
    const res = await this._request(url);
    return res.results || [];
  }
  async updateString(projectId, stringId, translation, stage = 1) {
    return await this._request(`/projects/${projectId}/strings/${stringId}`, {
      method: 'PUT',
      body: JSON.stringify({ translation, stage })
    });
  }
  async batchUpdateStrings(projectId, stringsUpdates) {
    return await this._concurrentUpdate(projectId, stringsUpdates);
  }
  async getTerms(projectId) {
    const res = await this._request(`/projects/${projectId}/terms?page=1&pageSize=500`);
    return res.results;
  }
  async createTerm(projectId, termData) {
    return await this._request(`/projects/${projectId}/terms`, {
      method: 'POST',
      body: JSON.stringify(termData)
    });
  }

  async _concurrentUpdate(projectId, updates, limit = 5) {
    const results = [], executing = [];
    for (const update of updates) {
      const p = this.updateString(projectId, update.id, update.translation, update.stage);
      results.push(p);
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= limit) await Promise.race(executing);
    }
    return Promise.all(results);
  }
}

export const paraTranzApi = new ParaTranzClient();
