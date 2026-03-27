import { Storage } from '../utils/storage.js';

// 生成一个模型配置面板的 HTML 片段
function renderModelPanel(id, title, icon, settings, prefix, options = {}) {
  const { isOptional = false, hasPrompt = false, hasRefCount = false } = options;
  const enabled = isOptional ? settings[`${prefix}Enabled`] : true;
  const format = settings[`${prefix}ApiFormat`] || settings.aiApiFormat || 'openai';
  const baseUrl = settings[`${prefix}BaseUrl`] || '';
  const apiKey = settings[`${prefix}ApiKey`] || '';
  const model = settings[`${prefix}Model`] || '';
  const prompt = hasPrompt ? (settings[`${prefix}Prompt`] || '') : '';
  const refCount = hasRefCount ? (settings[`${prefix}RefCount`] || 3) : 3;

  return `
    <div class="glass-panel" style="margin-bottom: 1.2rem; overflow: hidden;">
      <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" data-panel-toggle="${id}">
        <h3 style="margin: 0; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <i class="${icon}" style="color: var(--accent-color);"></i> ${title}
          ${!isOptional ? '<span style="font-size: 0.7rem; background: var(--accent-color); color: #fff; padding: 1px 6px; border-radius: 4px;">必填</span>' : ''}
        </h3>
        <div style="display: flex; align-items: center; gap: 0.8rem;">
          ${isOptional ? `
            <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: var(--text-secondary); cursor: pointer;" onclick="event.stopPropagation()">
              <input type="checkbox" id="chk-${id}-enabled" ${enabled ? 'checked' : ''} style="accent-color: var(--accent-color); width: 16px; height: 16px;" />
              启用
            </label>
          ` : ''}
          <i class="fas fa-chevron-down" id="icon-${id}" style="color: var(--text-secondary); transition: transform 0.2s; font-size: 0.8rem;"></i>
        </div>
      </div>
      
      <div id="panel-${id}" style="display: ${(isOptional && !enabled) ? 'none' : 'block'}; margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div>
            <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">API 格式</label>
            <select id="sel-${id}-format" style="padding: 0.5rem; width: 100%;">
              <option value="openai" ${format === 'openai' ? 'selected' : ''}>OpenAI 兼容</option>
              <option value="gemini" ${format === 'gemini' ? 'selected' : ''}>Gemini 原生</option>
            </select>
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">模型名称</label>
            <div style="display: flex; gap: 0.4rem; position: relative;" id="model-wrapper-${id}">
              <input type="text" id="inp-${id}-model" placeholder="模型名称" value="${model}" style="flex: 1;" autocomplete="off" />
              <button type="button" class="btn" id="btn-fetch-${id}" style="padding: 0 0.6rem; white-space: nowrap; font-size: 0.8rem;" title="获取模型列表"><i class="fas fa-sync-alt"></i></button>
              <div id="dropdown-${id}" class="glass-panel" style="display: none; position: absolute; top: calc(100% + 4px); left: 0; right: 0; max-height: 200px; overflow-y: auto; z-index: 1000; padding: 0.4rem 0; border: 1px solid var(--border-color); box-shadow: 0 4px 12px rgba(0,0,0,0.5);"></div>
            </div>
          </div>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">Base URL</label>
          <input type="text" id="inp-${id}-url" placeholder="API 服务地址" value="${baseUrl}" />
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">API Key</label>
          <input type="password" id="inp-${id}-key" placeholder="密钥" value="${apiKey}" />
        </div>
        
        ${hasRefCount ? `
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">注入参考条数</label>
            <select id="sel-${id}-refcount" style="padding: 0.5rem; width: auto;">
              ${[1,2,3,4,5].map(n => `<option value="${n}" ${refCount === n ? 'selected' : ''}>${n} 条</option>`).join('')}
            </select>
          </div>
        ` : ''}
        
        ${hasPrompt ? `
          <div>
            <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">提示词</label>
            <textarea id="inp-${id}-prompt" rows="4" style="font-size: 0.9rem;">${prompt}</textarea>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

export function render(container) {
  const s = Storage.getSettings();

  container.innerHTML = `
    <div style="flex: 1; overflow-y: auto; padding-bottom: 2rem;">
      <div style="max-width: 700px; margin: 0 auto;">
        <h2 style="margin-bottom: 1.5rem;">系统设置</h2>
      
      <!-- ParaTranz Token -->
      <div class="glass-panel" style="margin-bottom: 1.2rem;">
        <h3 style="margin: 0 0 1rem 0; font-size: 1rem;"><i class="fas fa-key" style="color: var(--accent-color);"></i> ParaTranz 凭据</h3>
        <div style="display: flex; flex-direction: column; gap: 0.8rem;">
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <input type="password" id="input-pt-token" placeholder="ParaTranz API Token" value="${s.ptToken || ''}" style="flex: 1;" />
            ${s.ptUsername ? `<span style="color: var(--success-color); font-size: 0.85rem; white-space: nowrap; padding: 0.3rem 0.6rem; background: rgba(16, 185, 129, 0.1); border-radius: 4px;"><i class="fas fa-user-check"></i> ${s.ptUsername}</span>` : ''}
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">API Base URL (默认为 /api 使用本地分发或代理)</label>
            <input type="text" id="input-pt-baseurl" placeholder="/api" value="${s.ptBaseUrl || '/api'}" />
          </div>
        </div>
        <small style="color: var(--text-secondary); display: block; margin-top: 0.4rem;">在 <a href="https://paratranz.cn/users/my" target="_blank" style="color: var(--accent-color);">paratranz.cn</a> 获取。</small>
      </div>

      <!-- 翻译主模型 -->
      ${renderModelPanel('main', '翻译主模型', 'fas fa-robot', {
        mainApiFormat: s.aiApiFormat,
        mainBaseUrl: s.aiBaseUrl,
        mainApiKey: s.aiApiKey,
        mainModel: s.aiModel,
        mainPrompt: s.aiPrompt
      }, 'main', { isOptional: false, hasPrompt: true })}

      <!-- 向量化模型 -->
      ${renderModelPanel('embed', '向量化模型 (Embedding)', 'fas fa-project-diagram', s, 'embedding', { isOptional: true, hasRefCount: true })}

      <!-- 过滤模型 -->
      ${renderModelPanel('filter', '过滤模型', 'fas fa-filter', s, 'filter', { isOptional: true, hasPrompt: true })}

      <!-- 重排序模型 -->
      ${renderModelPanel('rerank', '重排序模型', 'fas fa-sort-amount-down', s, 'rerank', { isOptional: true })}

      <!-- 数据库存储介质配置 -->
      <div style="margin-top: 2rem; margin-bottom: 0.8rem;">
        <h2 style="margin: 0; font-size: 1.2rem;">🗄️ 向量数据库存储介质</h2>
        <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary);">IndexedDB 存在本地浏览器（适合轻量使用），Qdrant 为专业外置服务（适合团队或重度使用）。</p>
      </div>
      <div class="glass-panel" style="padding: 1rem; border-radius: 8px; margin-bottom: 2rem; border-left: 4px solid var(--accent-color);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: 600;">启用 Qdrant 专业版引擎</div>
            <div style="font-size: 0.85rem; color: var(--text-secondary);">开启后每次检索与语料同步均采用 Payload 与 projectId 严格隔离的方式存入 Qdrant</div>
          </div>
          <label class="switch">
            <input type="checkbox" id="chk-qdrant-enabled" ${s.qdrantEnabled ? 'checked' : ''} />
            <span class="slider"></span>
          </label>
        </div>
        
        <div id="panel-qdrant" style="display: ${s.qdrantEnabled ? 'block' : 'none'}; border-top: 1px solid var(--border-color); padding-top: 1rem; margin-top: 1rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">Qdrant API URL</label>
              <input type="text" id="inp-qdrant-url" placeholder="如 http://localhost:6333" value="${s.qdrantUrl || 'http://localhost:6333'}" style="width: 100%;" />
            </div>
            <div>
              <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary); font-size: 0.85rem;">Qdrant API Key (无须鉴权留空)</label>
              <input type="password" id="inp-qdrant-key" placeholder="API Key" value="${s.qdrantApiKey || ''}" style="width: 100%;" />
            </div>
          </div>
          <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed var(--border-color); display: flex; justify-content: flex-end;">
            <button id="btn-reset-qdrant" class="btn btn-sm" style="background: none; border: 1px solid var(--danger-color); color: var(--danger-color);" title="当更换 Embedding 模型导致维度报错时，使用此功能清空远端集合并重置本地状态">
              <i class="fas fa-exclamation-triangle"></i> 重置 Qdrant 架构
            </button>
          </div>
        </div>
      </div>

      <button id="btn-save-settings" class="btn btn-primary" style="width: 100%; margin-top: 0.5rem;">保存所有设置</button>
      <div id="save-msg" style="margin-top: 1rem; color: var(--success-color); display: none; text-align: center;">已保存！</div>
      </div>
    </div>
  `;

  // --- 折叠面板交互 ---
  document.querySelectorAll('[data-panel-toggle]').forEach(header => {
    header.addEventListener('click', () => {
      const id = header.dataset.panelToggle;
      const panel = document.getElementById(`panel-${id}`);
      const icon = document.getElementById(`icon-${id}`);
      if (panel.style.display === 'none') {
        panel.style.display = 'block';
        icon.style.transform = 'rotate(180deg)';
      } else {
        panel.style.display = 'none';
        icon.style.transform = 'rotate(0deg)';
      }
    });
  });

  // --- 开关联动：开关控制面板展开/折叠 ---
  ['embed', 'filter', 'rerank'].forEach(id => {
    const chk = document.getElementById(`chk-${id}-enabled`);
    if (chk) {
      chk.addEventListener('change', () => {
        const panel = document.getElementById(`panel-${id}`);
        panel.style.display = chk.checked ? 'block' : 'none';
      });
    }
  });

  // --- Qdrant 开关联动 ---
  const chkQdrant = document.getElementById('chk-qdrant-enabled');
  if (chkQdrant) {
    chkQdrant.addEventListener('change', () => {
      document.getElementById('panel-qdrant').style.display = chkQdrant.checked ? 'block' : 'none';
    });
  }

  // --- 重置 Qdrant 架构 ---
  const btnReset = document.getElementById('btn-reset-qdrant');
  if (btnReset) {
    btnReset.addEventListener('click', async () => {
      const ok = confirm('【警告：不可逆操作】\n检测到向量维度冲突或更换模型时，需要执行此重置。\n操作将：\n1. 永久删除 Qdrant 上的 paratranz_rag 集合(包含所有项目数据)；\n2. 重置本地所有词条的“已向量化”标记。\n\n是否继续？');
      if (!ok) return;

      btnReset.disabled = true;
      btnReset.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在重置...';

      try {
        const { VectorStore } = await import('../utils/vectorStore.js');
        await VectorStore.resetQdrantCollection();
        const { showToast } = await import('../components/toast.js');
        showToast('Qdrant 架构与本地状态已成功重置！', 'success');
        setTimeout(() => { location.reload(); }, 1500);
      } catch (e) {
        console.error(e);
        const { showToast } = await import('../components/toast.js');
        showToast('重置失败: ' + e.message, 'error');
        btnReset.disabled = false;
        btnReset.innerHTML = '<i class="fas fa-exclamation-triangle"></i> 重置 Qdrant 架构';
      }
    });
  }

  // --- 保存逻辑 ---
  document.getElementById('btn-save-settings').addEventListener('click', async () => {
    const btn = document.getElementById('btn-save-settings');
    btn.disabled = true;
    btn.innerText = '正在保存...';

    const newSettings = {
      // ParaTranz
      ptToken: document.getElementById('input-pt-token').value.trim(),
      ptBaseUrl: document.getElementById('input-pt-baseurl').value.trim() || '/api',
      ptUsername: s.ptUsername || '',
      ptEmail: s.ptEmail || '',

      // 翻译主模型
      aiApiFormat: document.getElementById('sel-main-format').value,
      aiBaseUrl: document.getElementById('inp-main-url').value.trim(),
      aiApiKey: document.getElementById('inp-main-key').value.trim(),
      aiModel: document.getElementById('inp-main-model').value.trim(),
      aiPrompt: document.getElementById('inp-main-prompt').value.trim(),

      // 向量化模型
      embeddingEnabled: document.getElementById('chk-embed-enabled')?.checked || false,
      embeddingApiFormat: document.getElementById('sel-embed-format').value,
      embeddingBaseUrl: document.getElementById('inp-embed-url').value.trim(),
      embeddingApiKey: document.getElementById('inp-embed-key').value.trim(),
      embeddingModel: document.getElementById('inp-embed-model').value.trim(),
      embeddingRefCount: parseInt(document.getElementById('sel-embed-refcount')?.value || '3'),

      // 过滤模型
      filterEnabled: document.getElementById('chk-filter-enabled')?.checked || false,
      filterApiFormat: document.getElementById('sel-filter-format').value,
      filterBaseUrl: document.getElementById('inp-filter-url').value.trim(),
      filterApiKey: document.getElementById('inp-filter-key').value.trim(),
      filterModel: document.getElementById('inp-filter-model').value.trim(),
      filterPrompt: document.getElementById('inp-filter-prompt')?.value.trim() || '',

      // 重排序模型
      rerankEnabled: document.getElementById('chk-rerank-enabled')?.checked || false,
      rerankApiFormat: document.getElementById('sel-rerank-format').value,
      rerankBaseUrl: document.getElementById('inp-rerank-url').value.trim(),
      rerankApiKey: document.getElementById('inp-rerank-key').value.trim(),
      rerankModel: document.getElementById('inp-rerank-model').value.trim(),

      // Qdrant 存储介质
      qdrantEnabled: document.getElementById('chk-qdrant-enabled')?.checked || false,
      qdrantUrl: document.getElementById('inp-qdrant-url')?.value.trim() || '',
      qdrantApiKey: document.getElementById('inp-qdrant-key')?.value.trim() || ''
    };

    Storage.saveSettings(newSettings);

    const msg = document.getElementById('save-msg');
    msg.style.display = 'block';
    
    setTimeout(async () => {
      msg.style.display = 'none';
      const { navigate } = await import('../router.js');
      navigate('/settings');
    }, 1000);

    btn.disabled = false;
    btn.innerText = '保存所有设置';
  });

  // --- 通用获取模型列表逻辑（所有面板共用） ---
  ['main', 'embed', 'filter', 'rerank'].forEach(id => {
    const fetchBtn = document.getElementById(`btn-fetch-${id}`);
    if (!fetchBtn) return;
    
    fetchBtn.addEventListener('click', async () => {
      const baseUrl = document.getElementById(`inp-${id}-url`).value.trim();
      const apiKey = document.getElementById(`inp-${id}-key`).value.trim();
      const apiFormat = document.getElementById(`sel-${id}-format`).value;
      
      if (!baseUrl || !apiKey) {
        const { showToast } = await import('../components/toast.js');
        showToast('请先填写该面板的 Base URL 和 API Key', 'warning');
        return;
      }
      
      const originalHTML = fetchBtn.innerHTML;
      fetchBtn.disabled = true;
      fetchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      
      try {
        const { AIClient } = await import('../api/ai.js');
        const models = await AIClient.getModels({ baseUrl, apiKey, apiFormat });
        
        if (Array.isArray(models)) {
          const dropdown = document.getElementById(`dropdown-${id}`);
          const input = document.getElementById(`inp-${id}-model`);
          dropdown.innerHTML = '';
          
          models.forEach(m => {
            const val = m.id || m.name || (typeof m === 'string' ? m : JSON.stringify(m));
            const opt = document.createElement('div');
            opt.style.cssText = 'padding: 0.5rem 0.8rem; cursor: pointer; transition: background 0.2s; font-size: 0.85rem;';
            opt.innerText = val;
            opt.onmouseenter = () => opt.style.background = 'var(--bg-surface-hover)';
            opt.onmouseleave = () => opt.style.background = 'transparent';
            opt.onclick = () => {
              input.value = val;
              dropdown.style.display = 'none';
            };
            dropdown.appendChild(opt);
          });
          
          // 绑定输入筛选
          input.onfocus = () => { if (dropdown.children.length > 0) dropdown.style.display = 'block'; };
          input.oninput = () => {
            const filter = input.value.toLowerCase();
            let hasVisible = false;
            Array.from(dropdown.children).forEach(child => {
              const isMatch = child.innerText.toLowerCase().includes(filter);
              child.style.display = isMatch ? 'block' : 'none';
              if (isMatch) hasVisible = true;
            });
            dropdown.style.display = hasVisible ? 'block' : 'none';
          };
          
          // 点击外部关闭
          document.addEventListener('click', (e) => {
            const wrapper = document.getElementById(`model-wrapper-${id}`);
            if (wrapper && !wrapper.contains(e.target)) dropdown.style.display = 'none';
          });
          
          dropdown.style.display = 'block';
          input.focus();
          
          const { showToast } = await import('../components/toast.js');
          showToast(`已获取 ${models.length} 个模型，可输入筛选`, 'success');
        }
      } catch (e) {
        const { showToast } = await import('../components/toast.js');
        showToast('获取失败: ' + e.message, 'error');
      } finally {
        fetchBtn.disabled = false;
        fetchBtn.innerHTML = originalHTML;
      }
    });
  });
}
