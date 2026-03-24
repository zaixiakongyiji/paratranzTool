import { Storage } from '../utils/storage.js';

export function render(container) {
  const currentSettings = Storage.getSettings();

  container.innerHTML = `
    <div class="glass-panel" style="max-width: 600px; margin: 0 auto;">
      <h2 style="margin-bottom: 2rem;">系统设置</h2>
      
      <div style="margin-bottom: 1.5rem;">
        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary);">
          ParaTranz API Token
        </label>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <input type="password" id="input-pt-token" placeholder="你的 ParaTranz 身份验证 token" value="${currentSettings.ptToken || ''}" />
          ${currentSettings.ptUsername ? `<span style="color: var(--success-color); font-size: 0.85rem; white-space: nowrap; padding: 0.3rem 0.6rem; background: rgba(16, 185, 129, 0.1); border-radius: 4px;"><i class="fas fa-user-check"></i> ${currentSettings.ptUsername}</span>` : ''}
        </div>
        <small style="color: var(--text-secondary); display: block; margin-top: 0.4rem;">此凭据用于访问你在 ParaTranz 上的项目和词条。在 <a href="https://paratranz.cn/users/my" target="_blank" style="color: var(--accent-color);">https://paratranz.cn/users/my</a> 设置处获取。</small>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary);">
          AI 接口通信格式
        </label>
        <select id="select-ai-format" style="padding: 0.6rem;">
          <option value="openai" ${(!currentSettings.aiApiFormat || currentSettings.aiApiFormat === 'openai') ? 'selected' : ''}>OpenAI 兼容格式</option>
          <option value="gemini" ${currentSettings.aiApiFormat === 'gemini' ? 'selected' : ''}>Google Gemini 原生格式</option>
        </select>
        <small style="color: var(--text-secondary); display: block; margin-top: 0.25rem;">如果你使用 DeepSeek、通义千问等中转 API 或硅基流动，通常选择 OpenAI 兼容格式。</small>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary);">
          AI 接口服务地址 (Base URL)
        </label>
        <input type="text" id="input-ai-url" placeholder="如 https://api.openai.com/v1" value="${currentSettings.aiBaseUrl || ''}" />
      </div>

      <div style="margin-bottom: 1.5rem;">
        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary);">
          AI API Key
        </label>
        <input type="password" id="input-ai-key" placeholder="你的 AI 密钥" value="${currentSettings.aiApiKey || ''}" />
      </div>

      <div style="margin-bottom: 1.5rem;">
        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary);">
          AI 模型名称
        </label>
        <div style="display: flex; gap: 0.5rem; position: relative;">
          <div style="flex: 1; position: relative;" id="model-input-wrapper">
            <input type="text" id="input-ai-model" placeholder="如 gpt-3.5-turbo (点右获取或输入筛选)" value="${currentSettings.aiModel || ''}" style="width: 100%;" autocomplete="off" />
            
            <!-- 自定义下拉列表 -->
            <div id="model-dropdown" class="glass-panel" style="display: none; position: absolute; top: calc(100% + 4px); left: 0; right: 0; max-height: 250px; overflow-y: auto; z-index: 1000; padding: 0.5rem 0; border: 1px solid var(--border-color); box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
            </div>
          </div>
          <button id="btn-fetch-models" type="button" class="btn" style="white-space: nowrap;"><i class="fas fa-sync-alt"></i> 获取列表</button>
        </div>
      </div>

      <div style="margin-bottom: 2rem;">
        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary);">
          全局系统提示词 (System Prompt)
        </label>
        <textarea id="input-ai-prompt" rows="10" placeholder="你是一个专业游戏翻译，请将以下文本翻译为简体中文。请参考提供的术语表。">${currentSettings.aiPrompt || ''}</textarea>
      </div>

      <button id="btn-save-settings" class="btn btn-primary" style="width: 100%;">保存设置</button>
      <div id="save-msg" style="margin-top: 1rem; color: var(--success-color); display: none; text-align: center;">已保存！</div>
    </div>
  `;

  document.getElementById('btn-save-settings').addEventListener('click', async () => {
    const btn = document.getElementById('btn-save-settings');
    btn.disabled = true;
    btn.innerText = '正在保存并验证 Token...';

    const newSettings = {
      ptToken: document.getElementById('input-pt-token').value.trim(),
      ptUsername: currentSettings.ptUsername || '',
      ptEmail: currentSettings.ptEmail || '',
      aiApiFormat: document.getElementById('select-ai-format').value,
      aiBaseUrl: document.getElementById('input-ai-url').value.trim(),
      aiApiKey: document.getElementById('input-ai-key').value.trim(),
      aiModel: document.getElementById('input-ai-model').value.trim(),
      aiPrompt: document.getElementById('input-ai-prompt').value.trim()
    };
    
    // 先保存基础配置以供实例化 API 对象时读取 token
    Storage.saveSettings(newSettings);

    try {
      if (newSettings.ptToken) {
        const { paraTranzApi } = await import('../api/paratranz.js');
        const profile = await paraTranzApi.getProfile();
        if (profile) {
          newSettings.ptUsername = profile.username || profile.name || newSettings.ptUsername;
          newSettings.ptEmail = profile.email || newSettings.ptEmail;
          Storage.saveSettings(newSettings);
        }
      }
      
      const msg = document.getElementById('save-msg');
      msg.style.display = 'block';
      setTimeout(async () => {
        msg.style.display = 'none';
        // 刷新一下页面重新渲染带用户名的UI
        const { navigate } = await import('../router.js');
        navigate('/settings');
      }, 1000);
    } catch (e) {
      alert("配置已部分保存，但在验证 Token 时发生网络错误: " + e.message);
    } finally {
      btn.disabled = false;
      btn.innerText = '保存设置';
    }
  });

  document.getElementById('btn-fetch-models').addEventListener('click', async () => {
    const btn = document.getElementById('btn-fetch-models');
    const baseUrl = document.getElementById('input-ai-url').value.trim();
    const apiKey = document.getElementById('input-ai-key').value.trim();
    const apiFormat = document.getElementById('select-ai-format').value;
    
    if (!baseUrl || !apiKey) {
      alert("请先填写并确保上方的 '服务地址 (Base URL)' 和 'API Key' 均不为空。");
      return;
    }

    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '获取中...';
    
    try {
      const { AIClient } = await import('../api/ai.js');
      const models = await AIClient.getModels({ baseUrl, apiKey, apiFormat });
      
      if (Array.isArray(models)) {
        const dropdown = document.getElementById('model-dropdown');
        dropdown.innerHTML = '';
        models.forEach(m => {
          const val = m.id || m.name || (typeof m === 'string' ? m : JSON.stringify(m));
          const opt = document.createElement('div');
          opt.style.cssText = 'padding: 0.6rem 1rem; cursor: pointer; transition: background 0.2s; font-size: 0.95rem;';
          opt.innerText = val;
          opt.onmouseenter = () => opt.style.background = 'var(--bg-surface-hover)';
          opt.onmouseleave = () => opt.style.background = 'transparent';
          opt.onclick = () => {
            document.getElementById('input-ai-model').value = val;
            dropdown.style.display = 'none';
          };
          dropdown.appendChild(opt);
        });
        
        const input = document.getElementById('input-ai-model');
        
        // 绑定输入过滤逻辑
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

        // 点击外部关闭下拉列表
        document.addEventListener('click', (e) => {
          const wrapper = document.getElementById('model-input-wrapper');
          if (wrapper && !wrapper.contains(e.target)) {
            dropdown.style.display = 'none';
          }
        }, { once: false }); // 确保不会无限重复绑定但此处每次获取会重新覆盖一次内容不影响
        
        dropdown.style.display = 'block';
        input.focus();
        
        const { showToast } = await import('../components/toast.js');
        showToast('模型列表获取成功，可在输入框中键入筛选。', 'success');
      } else {
         throw new Error('未知的模型列表数据格式返回');
      }
    } catch (e) {
      const { showToast } = await import('../components/toast.js');
      showToast(e.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  });
}
