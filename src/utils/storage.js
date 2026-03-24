// 本地数据存储与翻译记忆(TM)封装

export const Storage = {
  // --- 系统配置 ---
  getSettings() {
    try {
      const data = localStorage.getItem('pt_settings');
      return data ? JSON.parse(data) : {
        ptToken: '',             // ParaTranz API Token
        ptUsername: '',          // ParaTranz 用户名
        ptEmail: '',             // ParaTranz 邮箱
        aiApiFormat: 'openai',   // 'openai' 或 'gemini'
        aiBaseUrl: 'https://api.openai.com/v1', // AI Base URL
        aiApiKey: '',            // AI API Key
        aiModel: 'gpt-3.5-turbo',// AI 模型名称
        aiPrompt: '你是一个专业游戏翻译，请将以下文本翻译为简体中文。请参考提供的术语表。' // 默认提示词
      };
    } catch { return {}; }
  },

  saveSettings(settings) {
    localStorage.setItem('pt_settings', JSON.stringify(settings));
  },

  // --- 翻译记忆 TM ---
  // TM结构: { [original]: { translation, lastUpdated } }
  getTM(projectId) {
    try {
      const key = `pt_tm_${projectId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : {};
    } catch { return {}; }
  },

  saveTM(projectId, original, translation) {
    const tm = this.getTM(projectId);
    tm[original] = {
      translation: translation,
      lastUpdated: Date.now()
    };
    localStorage.setItem(`pt_tm_${projectId}`, JSON.stringify(tm));
  },

  searchTM(projectId, original) {
    const tm = this.getTM(projectId);
    return tm[original] ? tm[original].translation : null;
  },

  // --- 手动项目管理 ---
  getMyProjects() {
    try {
      const data = localStorage.getItem('pt_my_projects');
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },

  addMyProject(project) {
    // project: { id, name }
    const projects = this.getMyProjects();
    if (!projects.find(p => p.id === project.id)) {
      projects.push(project);
      localStorage.setItem('pt_my_projects', JSON.stringify(projects));
    }
  },

  removeMyProject(projectId) {
    let projects = this.getMyProjects();
    projects = projects.filter(p => p.id !== projectId);
    localStorage.setItem('pt_my_projects', JSON.stringify(projects));
  },

  // --- 本地术语库 (知识库) ---
  getLocalGlossary() {
    try {
      const data = localStorage.getItem('pt_local_glossary');
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },

  saveLocalGlossary(list) {
    localStorage.setItem('pt_local_glossary', JSON.stringify(list));
  },

  addLocalTerm(term, translation) {
    const list = this.getLocalGlossary();
    // 如果已存在则更新，不存在则添加
    const existing = list.find(t => t.term === term);
    if (existing) {
      existing.translation = translation;
    } else {
      list.push({ term, translation });
    }
    this.saveLocalGlossary(list);
  },

  removeLocalTerm(term) {
    let list = this.getLocalGlossary();
    list = list.filter(t => t.term !== term);
    this.saveLocalGlossary(list);
  }
};
