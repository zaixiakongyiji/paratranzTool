// 本地数据存储与翻译记忆(TM)封装

const tmCache = new Map();

export const Storage = {
  // --- 系统配置 ---
  getSettings() {
    const defaults = {
        ptToken: '',             // ParaTranz API Token
        ptUsername: '',          // ParaTranz 用户名
        ptEmail: '',             // ParaTranz 邮箱
        aiApiFormat: 'openai',   // 'openai' 或 'gemini'
        aiBaseUrl: 'https://api.openai.com/v1', // AI Base URL
        aiApiKey: '',            // AI API Key
        aiModel: 'gpt-3.5-turbo',// AI 模型名称
        aiPrompt: '你是一个专业游戏翻译，请将以下文本翻译为简体中文。请参考提供的术语表。', // 翻译提示词
        ptBaseUrl: '/api',       // ParaTranz API Base URL (默认为相对路径以触发代理)

        // --- RAG: 向量化模型（可选） ---
        embeddingEnabled: false,
        embeddingApiFormat: 'openai',
        embeddingBaseUrl: 'https://api.siliconflow.cn/v1/embeddings',
        embeddingApiKey: '',
        embeddingModel: 'Qwen/Qwen3-Embedding-8B',
        embeddingRefCount: 3,     // 注入参考条数
        
        // --- 存储介质设置 ---
        qdrantEnabled: false,
        qdrantUrl: 'http://localhost:6333',
        qdrantApiKey: '',

        // --- RAG: 过滤模型（可选） ---
        filterEnabled: false,
        filterApiFormat: 'openai',
        filterBaseUrl: 'https://api.openai.com/v1',
        filterApiKey: '',
        filterModel: 'gpt-4o-mini',
        filterPrompt: '你是一个游戏翻译参考分析助手。请分析以下候选参考翻译与待翻原文的相关性。\n\n考虑以下因素：\n- 语境相似度（同一角色的说话风格、同一游戏机制的描述方式）\n- 术语一致性（是否使用了相同的游戏专有名词）\n- 内容类型匹配（对话/UI文本/物品描述/战斗文本/系统提示）\n\n只保留最有参考价值的条目，返回 JSON 数组格式：\n[{"index": 条目序号, "reason": "保留理由"}]',

        // --- RAG: 重排序模型（可选） ---
        rerankEnabled: false,
        rerankApiFormat: 'openai',
        rerankBaseUrl: 'https://api.siliconflow.cn/v1/rerank',
        rerankApiKey: '',
        rerankModel: 'Qwen/Qwen3-Reranker-8B',

        // --- 自动化工作流 ---
        autoTranslate: false,
        autoSave: false
    };

    try {
      const data = localStorage.getItem('pt_settings');
      if (!data) return defaults;
      
      const stored = JSON.parse(data);
      // 将存储的值合并到默认值上
      const merged = Object.assign({}, defaults, stored);
      
      // 特殊处理：如果本地存的是空值（由于之前未配置过或保存过空表单），则回退到默认地址和模型
      const fieldsToCheck = [
        'aiBaseUrl', 'embeddingBaseUrl', 'filterBaseUrl', 'rerankBaseUrl',
        'embeddingModel', 'filterModel', 'rerankModel', 'qdrantUrl', 'ptBaseUrl'
      ];
      fieldsToCheck.forEach(key => {
        if (!merged[key] || merged[key].trim() === '') {
          merged[key] = defaults[key];
        }
      });
      
      return merged;
    } catch { 
      return defaults; 
    }
  },

  saveSettings(settings) {
    localStorage.setItem('pt_settings', JSON.stringify(settings));
  },

  // --- 翻译记忆 TM ---
  // TM结构: { [original]: { translation, lastUpdated } }
  async preloadTM(projectId) {
    if (!projectId) return;
    const pId = String(projectId);
    try {
      const { VectorStore } = await import('./vectorStore.js');
      const items = await VectorStore.getAllTM(projectId);
      const projectMap = new Map();
      for (const item of items) {
        projectMap.set(item.original, {
          translation: item.translation,
          lastUpdated: item.lastUpdated
        });
      }
      tmCache.set(pId, projectMap);
    } catch (e) {
      console.error("预加载 TM 失败:", e);
    }
  },

  getTM(projectId) {
    const pId = String(projectId);
    if (!tmCache.has(pId)) {
      try {
        const key = `pt_tm_${pId}`;
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          const projectMap = new Map();
          for (const [k, v] of Object.entries(parsed)) {
            if (v && typeof v === 'object') {
              projectMap.set(k, {
                translation: v.translation || '',
                lastUpdated: v.lastUpdated || Date.now()
              });
            } else {
              projectMap.set(k, {
                translation: String(v),
                lastUpdated: Date.now()
              });
            }
          }
          tmCache.set(pId, projectMap);
        } else {
          tmCache.set(pId, new Map());
        }
      } catch {
        tmCache.set(pId, new Map());
      }
    }
    const projectMap = tmCache.get(pId);
    const obj = {};
    for (const [k, v] of projectMap.entries()) {
      obj[k] = v;
    }
    return obj;
  },

  saveTM(projectId, original, translation) {
    const pId = String(projectId);
    if (!tmCache.has(pId)) {
      this.getTM(projectId);
    }
    const projectMap = tmCache.get(pId);
    const lastUpdated = Date.now();
    projectMap.set(original, {
      translation: translation,
      lastUpdated: lastUpdated
    });

    import('./vectorStore.js').then(({ VectorStore }) => {
      VectorStore.saveTM(projectId, original, translation).catch(err => {
        console.error("异步保存 TM 到 IndexedDB 失败:", err);
      });
    });
  },

  searchTM(projectId, original) {
    const pId = String(projectId);
    if (!tmCache.has(pId)) {
      this.getTM(projectId);
    }
    const projectMap = tmCache.get(pId);
    const record = projectMap.get(original);
    return record ? record.translation : null;
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
    // 使用 String 转换以处理 Number/String 类型不一致问题
    projects = projects.filter(p => String(p.id) !== String(projectId));
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
