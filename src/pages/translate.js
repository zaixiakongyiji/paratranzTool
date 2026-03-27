import { paraTranzApi } from '../api/paratranz.js';
import { AIClient } from '../api/ai.js';
import { Storage } from '../utils/storage.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';

export async function render(container, query) {
  const projectId = query.get('projectId');
  const fileId = query.get('fileId');

  if (!projectId || !fileId) {
    container.innerHTML = `<div class="glass-panel text-center">缺少 projectId 或 fileId</div>`;
    return;
  }

    const currentStage = query.get('stage') || '0';
    container.innerHTML = `<div style="text-align:center; padding: 2rem;">加载词条数据中...</div>`;

    try {
      let [ptTerms, strings] = await Promise.all([
        paraTranzApi.getTerms(projectId).catch(() => []), 
        paraTranzApi.getStrings(projectId, fileId, currentStage === 'all' ? null : currentStage)
      ]);
    const localTerms = Storage.getLocalGlossary();
    
    // 合并术语，本地知识库优先
    const termsMap = new Map();
    ptTerms.forEach(t => termsMap.set(t.term, t));
    localTerms.forEach(t => termsMap.set(t.term, Object.assign({}, termsMap.get(t.term), t)));
    
    // 转换为对象数组，并提取需要的字段
    const terms = Array.from(termsMap.values()).map(t => ({ 
      term: t.term, 
      translation: t.translation,
      caseSensitive: t.caseSensitive || false,
      variants: Array.isArray(t.variants) ? t.variants : (t.variants ? String(t.variants).split(/[|,\n]+/).map(s=>s.trim()).filter(Boolean) : [])
    }));

    strings = strings || [];
    
    // 进入工作台，添加特定类名以启用三列独立布局布局
    document.body.classList.add('translate-mode');
    
    renderWorkbench(container, projectId, fileId, strings, terms, currentStage);
  } catch (error) {
    document.body.classList.remove('translate-mode');
    container.innerHTML = `<div class="glass-panel" style="color: var(--danger-color)">初始化失败 ${error.message}</div>`;
  }
}

function renderWorkbench(container, projectId, fileId, strings, terms, currentStage) {
  let currentIndex = -1;
  let sortOrder = 'none'; // 'none', 'asc', 'desc'
  let currentReferences = []; // RAG 检索到的参考翻译
  let lastAiResponse = ''; // 追踪当前词条最近一次 AI 原始响应逻辑

  function renderPage() {
    container.innerHTML = `
      <div style="display: flex; flex: 1; min-height: 0; gap: 1.2rem; width: 100%;">
        <!-- 左侧：词条列表 -->
        <div class="glass-panel" style="width: 300px; flex-shrink: 0; display: flex; flex-direction: column; min-width: 0;">
          <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-size: 1.1rem;">词条列表</h3>
            <div style="display: flex; gap: 0.3rem;">
              <button id="btn-sort" class="btn btn-sm" title="按更新时间排序">
                <i class="fas fa-sort"></i> ${sortOrder === 'none' ? '' : (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button id="btn-back" class="btn btn-sm">返回</button>
            </div>
          </div>
  
          <div style="display: flex; background: rgba(0,0,0,0.2); border-radius: 4px; padding: 2px; margin-bottom: 1rem;">
            <button class="stage-tab ${currentStage === '0' ? 'active' : ''}" data-stage="0" style="flex:1; border:none; background:transparent; color: var(--text-secondary); padding: 5px; cursor:pointer; font-size: 0.8rem;">未翻</button>
            <button class="stage-tab ${currentStage === '1' ? 'active' : ''}" data-stage="1" style="flex:1; border:none; background:transparent; color: var(--text-secondary); padding: 5px; cursor:pointer; font-size: 0.8rem;">已翻</button>
            <button class="stage-tab ${currentStage === 'all' ? 'active' : ''}" data-stage="all" style="flex:1; border:none; background:transparent; color: var(--text-secondary); padding: 5px; cursor:pointer; font-size: 0.8rem;">全部</button>
          </div>
  
          <div id="string-list" style="flex: 1; overflow-y: auto; padding-right: 0.5rem;"></div>
        </div>

        <!-- 中间：编辑器 (核心自适应区) -->
        <div class="glass-panel" style="flex: 1; min-width: 0; display: flex; flex-direction: column; overflow-y: auto; padding-right: 0.8rem;">
          <h3 style="margin-bottom: 1rem; font-size: 1.1rem; flex-shrink: 0;">工作台</h3>
          <div style="display: flex; flex-direction: column; gap: 1rem; flex-shrink: 0; padding-bottom: 1rem;">
            <div style="display: flex; flex-direction: column;">
              <label style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; display:block;">原文</label>
              <div id="text-original" style="background: var(--bg-color); padding: 1rem; border-radius: 6px; border: 1px solid var(--border-color); font-size: 1.1rem; line-height: 1.6; white-space: pre-wrap;"></div>
            </div>
            
            <div style="display: flex; gap: 0.6rem; flex-wrap: wrap; flex-shrink: 0;">
              <button id="btn-ai-translate" class="btn btn-primary" style="flex: 1; min-width: 110px;"><i class="fas fa-robot"></i> AI 翻译</button>
              <button id="btn-get-rag" class="btn" style="white-space: nowrap; flex: 0.5;" title="手动从本地语料库检索参考"><i class="fas fa-search"></i> 检索参考</button>
              <button id="btn-tm-match" class="btn" style="white-space: nowrap; flex: 0.5;"><i class="fas fa-database"></i> 记忆库</button>
              <button id="btn-toggle-candidates" class="btn" style="padding: 0 0.8rem;" title="展开/收起 AI 候选面板"><i class="fas fa-layer-group"></i> 已有候选</button>
              <button id="btn-ai-suggest" class="btn" style="padding: 0 0.8rem;" title="提供修改建议重新生成"><i class="fas fa-comment-dots"></i> 修改建议</button>
            </div>
            
            <div id="ai-suggest-panel" style="display: none; border: 1px solid var(--border-color); border-radius: 8px; padding: 0.8rem; background: var(--bg-surface); flex-shrink: 0;">
              <label style="color: var(--text-secondary); font-size: 0.85rem; font-weight: 600; display: block; margin-bottom: 0.5rem;">给 AI 提供修改建议</label>
              <div style="display: flex; gap: 0.5rem;">
                <input type="text" id="input-ai-suggest" style="flex: 1; padding: 0.5rem; font-size: 0.9rem; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-color); color: var(--text-color);" placeholder="输入希望调整的方向或注意点..." />
                <button id="btn-submit-suggest" class="btn btn-primary" style="white-space: nowrap;"><i class="fas fa-paper-plane"></i> 重新生成</button>
              </div>
            </div>

            <div id="ai-candidates-panel" style="display: none; flex-direction: column; max-height: 35vh; border: 1px solid var(--border-color); border-radius: 8px; padding: 0.8rem; background: var(--bg-color); flex-shrink: 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-shrink: 0;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <label style="color: var(--accent-color); font-size: 0.85rem; font-weight: 600;">AI 候选译文</label>
                  <div style="display: inline-flex; border: 1px solid var(--border-color); border-radius: 4px; overflow: hidden; font-size: 0.75rem;">
                    <button class="ai-mode-btn active" data-mode="overwrite" style="padding: 2px 8px; border: none; cursor: pointer; background: var(--accent-color); color: #fff;">覆盖</button>
                    <button class="ai-mode-btn" data-mode="append" style="padding: 2px 8px; border: none; cursor: pointer; background: transparent; color: var(--text-secondary);">追加</button>
                  </div>
                </div>
                <div style="display: flex; gap: 0.3rem;">
                  <button id="btn-show-prev" style="background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); cursor: pointer; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; display: none;">上一轮</button>
                  <button id="btn-close-candidates" style="background: transparent; border: none; color: var(--text-secondary); cursor: pointer; font-size: 1rem;">&times;</button>
                </div>
              </div>
              <div id="ai-candidates-list" style="display: flex; flex-direction: column; gap: 0.5rem; overflow-y: auto; flex: 1; padding-right: 0.3rem;"></div>
              <div id="ai-prev-list" style="display: none; flex-direction: column; margin-top: 0.8rem; border-top: 1px dashed var(--border-color); padding-top: 0.5rem; flex-shrink: 0; max-height: 30%; overflow-y: auto;">
                <label style="font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 0.3rem; display: block;">上一轮候选:</label>
                <div id="ai-prev-items" style="display: flex; flex-direction: column; gap: 0.3rem;"></div>
              </div>
            </div>

            <div id="rag-ref-panel" style="display: none; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-surface); flex-shrink: 0; overflow: hidden;">
              <div id="rag-ref-header" style="display: flex; justify-content: space-between; align-items: center; padding: 0.8rem; cursor: pointer; user-select: none; background: rgba(255,255,255,0.02);">
                <label style="color: var(--accent-color); font-size: 0.85rem; font-weight: 600; cursor: pointer;"><i class="fas fa-project-diagram"></i> RAG 参考翻译 <span id="rag-ref-count" style="font-weight: normal; opacity: 0.7;"></span></label>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                  <i id="rag-ref-chevron" class="fas fa-chevron-down" style="font-size: 0.8rem; color: var(--text-secondary); transition: transform 0.2s;"></i>
                  <button id="btn-close-rag" style="background: transparent; border: none; color: var(--text-secondary); cursor: pointer; font-size: 1.1rem; padding: 0 4px;">&times;</button>
                </div>
              </div>
              <div id="rag-ref-list" style="display: none; flex-direction: column; gap: 0.4rem; font-size: 0.85rem; max-height: 250px; overflow-y: auto; padding: 0 0.8rem 0.8rem 0.8rem; border-top: 1px solid var(--border-color);"></div>
            </div>

            <div style="display: flex; flex-direction: column; flex-shrink: 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-shrink: 0;">
                <label style="color: var(--text-secondary); font-size: 0.9rem;">译文 (支持手动编辑)</label>
                <button id="btn-submit" class="btn btn-primary btn-sm" style="padding: 0.3rem 1rem; font-size: 0.85rem;">提交至服务器并保存 (下一条)</button>
              </div>
              <textarea id="text-translation" placeholder="输入译文..." style="min-height: 120px; resize: none; overflow-y: hidden; font-size: 1.1rem; line-height: 1.6; padding: 1rem; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-color); color: var(--text-color); transition: height 0.1s ease;"></textarea>
            </div>
          </div>
        </div>

        <!-- 右侧：术语管理栏 (内联常驻) -->
        <div class="glass-panel" id="term-sidebar" style="width: 320px; flex-shrink: 0; display: flex; flex-direction: column; min-width: 0; padding: 0; overflow: hidden;">
          <div style="padding: 1rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;"><i class="fas fa-book" style="color: var(--accent-color);"></i> 术语管理</h3>
            <div style="display: flex; gap: 0.3rem;">
              <button id="btn-terms" class="btn btn-sm" title="管理项目全量术语"><i class="fas fa-external-link-alt"></i></button>
              <button id="btn-add-term-toggle" class="btn btn-sm" title="显示/隐藏新增表单"><i class="fas fa-plus"></i></button>
            </div>
          </div>
          
          <!-- 新增表单 (默认折叠) -->
          <div id="inline-term-add" style="display: none; padding: 1rem; border-bottom: 1px solid var(--border-color); background: rgba(255,255,255,0.02); animation: slideDown 0.2s ease;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.8rem;">
              <select id="inline-term-type" style="padding: 0.4rem; font-size: 0.8rem;">
                <option value="1">名词</option><option value="2">动词</option><option value="3">形容词</option><option value="4">副词</option><option value="0">其他</option>
              </select>
              <label style="display: flex; align-items: center; font-size: 0.75rem; color: var(--text-secondary); cursor:pointer;">
                <input type="checkbox" id="inline-term-cs" style="margin-right: 3px;" /> 区分大小写
              </label>
            </div>
            <input type="text" id="inline-term-ori" placeholder="原文" style="width: 100%; padding: 0.5rem; margin-bottom: 0.5rem; font-size: 0.85rem;" />
            <input type="text" id="inline-term-tran" placeholder="译文" style="width: 100%; padding: 0.5rem; margin-bottom: 0.5rem; font-size: 0.85rem;" />
            <input type="text" id="inline-term-vars" placeholder="变体 (用 | 分割)" style="width: 100%; padding: 0.5rem; margin-bottom: 0.8rem; font-size: 0.85rem;" />
            <button id="btn-inline-add-term" class="btn btn-primary btn-sm" style="width: 100%;">确定添加</button>
          </div>

          <!-- 搜索与列表 -->
          <div style="padding: 0.8rem; border-bottom: 1px solid var(--border-color);">
            <div style="position: relative;">
              <i class="fas fa-search" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-secondary); font-size: 0.8rem;"></i>
              <input type="text" id="inline-term-search" placeholder="在库中检索..." style="width: 100%; padding: 0.4rem 0.6rem 0.4rem 2rem; font-size: 0.85rem;" />
            </div>
          </div>

          <div id="inline-term-list" style="flex: 1; overflow-y: auto; padding: 0.8rem; display: flex; flex-direction: column; gap: 0.6rem;">
            <!-- 术语条目将渲染在此 -->
          </div>
        </div>
      </div>
    `;


    bindHeaderEvents();
    renderStringList();
    initWorkbenchLogic(); 
    if (strings.length > 0) selectString(0);
  }

  function renderStringList() {
    const listEl = document.getElementById('string-list');
    
    if (strings.length === 0) {
      listEl.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--text-secondary); font-size: 0.9rem;">当前状态下暂无词条</div>`;
      return;
    }
    
    // 准备排序后的索引数组或直接克隆排序
    let displayList = [...strings].map((s, i) => ({ ...s, originalIndex: i }));
    
    if (sortOrder === 'asc') {
      displayList.sort((a, b) => new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0));
    } else if (sortOrder === 'desc') {
      displayList.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    }

    listEl.innerHTML = displayList.map(item => {
      const isFinished = item.stage === 1;
      return `
        <div class="string-item" data-idx="${item.originalIndex}" style="padding: 0.8rem; border-bottom: 1px solid var(--border-color); cursor: pointer; border-radius: 4px; ${isFinished ? 'opacity: 0.6' : ''}">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
            <span style="font-size: 0.75rem; color: var(--text-secondary);">ID: ${item.id}</span>
            ${isFinished ? '<span style="color: var(--success-color); font-size: 0.7rem;">✔</span>' : ''}
          </div>
          <div style="font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; ${isFinished ? 'text-decoration: line-through;' : ''}">${escapeHtml(item.original)}</div>
          ${item.updatedAt ? `<div style="font-size: 0.65rem; color: var(--text-secondary); margin-top: 0.2rem;">${new Date(item.updatedAt).toLocaleString()}</div>` : ''}
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('.string-item').forEach(el => {
      el.addEventListener('click', () => selectString(parseInt(el.dataset.idx)));
    });
  }

  function bindHeaderEvents() {
    document.getElementById('btn-back').addEventListener('click', () => {
      document.body.style.overflow = '';
      document.querySelector('.app-container').style.height = '';
      navigate(`/files?projectId=${projectId}`);
    });
    document.getElementById('btn-terms').addEventListener('click', () => navigate(`/terms?projectId=${projectId}`));
    
    document.getElementById('btn-sort').addEventListener('click', () => {
      if (sortOrder === 'none') sortOrder = 'asc';
      else if (sortOrder === 'asc') sortOrder = 'desc';
      else sortOrder = 'none';
      renderPage();
    });

    container.querySelectorAll('.stage-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        navigate(`/translate?projectId=${projectId}&fileId=${fileId}&stage=${tab.dataset.stage}`);
      });
    });
  }

  function selectString(index) {
    if (index < 0 || index >= strings.length) return;
    currentIndex = index;
    const str = strings[index];
    
    document.querySelectorAll('.string-item').forEach(el => {
      el.classList.remove('active');
      el.style.background = 'transparent';
    });
    const currentEl = container.querySelector(`.string-item[data-idx="${index}"]`);
    if (currentEl) {
      currentEl.classList.add('active');
      currentEl.style.background = 'var(--bg-surface-hover)';
      currentEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    document.getElementById('text-original').innerHTML = highlightTerms(str.original, terms);
    document.getElementById('text-translation').value = str.translation || '';
    autoResizeTextarea(document.getElementById('text-translation'));

    const matched = Storage.searchTM(projectId, str.original);
    if (matched && !document.getElementById('text-translation').value) {
      document.getElementById('text-translation').value = matched;
      autoResizeTextarea(document.getElementById('text-translation'));
    }

    // 切换文件时重置AI候选面板
    const candidatesPanel = document.getElementById('ai-candidates-panel');
    if (candidatesPanel) candidatesPanel.style.display = 'none';
    const candidatesList = document.getElementById('ai-candidates-list');
    if (candidatesList) candidatesList.innerHTML = '';
    
    // 切换文件时重置AI修改建议面板
    const suggestPanel = document.getElementById('ai-suggest-panel');
    const suggestInput = document.getElementById('input-ai-suggest');
    if (suggestPanel) suggestPanel.style.display = 'none';
    if (suggestInput) suggestInput.value = '';
    
    // 切换文件或词条时，重置上一轮 AI 响应，确保“第一轮”原则
    lastAiResponse = '';

    // 重置 RAG 参考面板（不在这里自动检索，等用户手动点击大按钮时检索）
    currentReferences = [];
    const ragPanel = document.getElementById('rag-ref-panel');
    const ragList = document.getElementById('rag-ref-list');
    const ragChevron = document.getElementById('rag-ref-chevron');
    if (ragPanel) ragPanel.style.display = 'none';
    if (ragList) ragList.style.display = 'none';
    if (ragChevron) ragChevron.style.transform = 'rotate(0deg)';

    // 已审核防互触保护
    const isReviewed = str.stage === 2;
    const translationArea = document.getElementById('text-translation');
    const btnSubmit = document.getElementById('btn-submit');
    const btnAi = document.getElementById('btn-ai-translate');
    const btnTm = document.getElementById('btn-tm-match');
    const btnToggle = document.getElementById('btn-toggle-candidates');

    if (isReviewed) {
      translationArea.disabled = true;
      translationArea.style.background = 'var(--bg-surface)';
      translationArea.placeholder = '当前词条已审核通过，已锁定，禁止修改';
      
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<i class="fas fa-lock"></i> 词条已审核，禁止修改';
      btnSubmit.style.background = 'var(--bg-surface)';
      btnSubmit.style.borderColor = 'var(--border-color)';
      btnSubmit.style.color = 'var(--text-secondary)';
      
      [btnAi, btnTm, btnToggle, document.getElementById('btn-ai-suggest')].forEach(btn => {
        if (btn) {
          btn.disabled = true;
          btn.style.opacity = '0.5';
          btn.style.cursor = 'not-allowed';
        }
      });
    } else {
      translationArea.disabled = false;
      translationArea.style.background = 'var(--bg-color)';
      translationArea.placeholder = '';
      
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = '提交至服务器并保存 TM 记录 (下一条)';
      btnSubmit.style.background = '';
      btnSubmit.style.borderColor = '';
      btnSubmit.style.color = '';
      
      [btnAi, btnTm, btnToggle, document.getElementById('btn-ai-suggest')].forEach(btn => {
        if (btn) {
          btn.disabled = false;
          btn.style.opacity = '1';
          btn.style.cursor = 'pointer';
        }
      });
    }
  }

  function renderInlineTermList(keyword = '') {
    const listEl = document.getElementById('inline-term-list');
    if (!listEl) return;

    const filtered = terms.filter(t => 
      (t.term || '').toLowerCase().includes(keyword.toLowerCase()) || 
      (t.translation || '').toLowerCase().includes(keyword.toLowerCase())
    );

    listEl.innerHTML = filtered.map(t => `
      <div class="glass-panel" style="padding: 0.6rem; border: 1px solid var(--border-color); background: rgba(255,255,255,0.02); display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.85rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <span style="font-weight: 600; color: var(--text-color);">${escapeHtml(t.term)}</span>
          ${t.caseSensitive ? '<span style="font-size: 0.7rem; color: var(--warning-color); border: 1px solid var(--warning-color); padding: 0 4px; border-radius: 3px;">大小写</span>' : ''}
        </div>
        <div style="color: var(--accent-color); font-weight: 500;">${escapeHtml(t.translation)}</div>
        ${t.variants && t.variants.length ? `<div style="font-size: 0.75rem; color: var(--text-secondary); opacity: 0.8;">变体: ${escapeHtml(t.variants.join(', '))}</div>` : ''}
      </div>
    `).join('') || '<div style="text-align:center; color: var(--text-secondary); padding: 1rem; font-size: 0.85rem;">未找到相关术语</div>';
  }

  function autoResizeTextarea(el) {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = (el.scrollHeight) + 'px';
  }

  function initWorkbenchLogic() {
    const textTranslation = document.getElementById('text-translation');
    
    textTranslation.addEventListener('input', () => autoResizeTextarea(textTranslation));
    window.addEventListener('resize', () => autoResizeTextarea(textTranslation));

    // 初始渲染侧边栏术语
    renderInlineTermList();

    // 术语搜索逻辑
    document.getElementById('inline-term-search').addEventListener('input', (e) => {
      renderInlineTermList(e.target.value);
    });

    // 术语新增表单切换
    document.getElementById('btn-add-term-toggle').addEventListener('click', () => {
      const form = document.getElementById('inline-term-add');
      form.style.display = form.style.display === 'none' ? 'block' : 'none';
    });

    // 执行术语添加
    document.getElementById('btn-inline-add-term').addEventListener('click', async () => {
      const term = document.getElementById('inline-term-ori').value.trim();
      const translation = document.getElementById('inline-term-tran').value.trim();
      if (!term || !translation) {
        const { showToast } = await import('../components/toast.js');
        showToast('原文和译文不能为空', 'warning');
        return;
      }

      const btn = document.getElementById('btn-inline-add-term');
      btn.disabled = true;
      btn.innerText = '提交中...';

      try {
        const variantsInput = document.getElementById('inline-term-vars').value.trim();
        const variants = variantsInput ? variantsInput.split(/[|,\n]+/).map(s => s.trim()).filter(Boolean) : [];
        
        const termData = {
          term,
          translation,
          type: parseInt(document.getElementById('inline-term-type').value),
          caseSensitive: document.getElementById('inline-term-cs').checked,
          variants: variants,
          description: '' // 侧边栏简化版暂不传 description
        };
        
        const { paraTranzApi } = await import('../api/paratranz.js');
        await paraTranzApi.createTerm(projectId, termData);
        
        terms.unshift(termData);
        const { showToast } = await import('../components/toast.js');
        showToast('术语创建成功', 'success');
        
        // 重置表单
        document.getElementById('inline-term-ori').value = '';
        document.getElementById('inline-term-tran').value = '';
        document.getElementById('inline-term-vars').value = '';
        document.getElementById('inline-term-add').style.display = 'none';

        // 刷新列表与原文高亮
        renderInlineTermList(document.getElementById('inline-term-search').value);
        if (currentIndex !== -1) selectString(currentIndex);
      } catch (e) {
        const { showToast } = await import('../components/toast.js');
        showToast('创建失败: ' + e.message, 'error');
      } finally {
        btn.disabled = false;
        btn.innerText = '确定添加';
      }
    });

    document.getElementById('btn-tm-match').addEventListener('click', () => {
      if (currentIndex === -1) return;
      const str = strings[currentIndex];
      const match = Storage.searchTM(projectId, str.original);
      if (match) {
        textTranslation.value = match;
        autoResizeTextarea(textTranslation);
        showToast('完成记忆回显', 'success');
      } else {
        showToast('记忆库无匹配内容', 'warning');
      }
    });

    let aiInsertMode = 'overwrite';
    let prevCandidates = [];

    document.getElementById('btn-close-candidates').addEventListener('click', () => {
      document.getElementById('ai-candidates-panel').style.display = 'none';
    });

    document.querySelectorAll('.ai-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        aiInsertMode = btn.dataset.mode;
        document.querySelectorAll('.ai-mode-btn').forEach(b => {
          b.style.background = 'transparent';
          b.style.color = 'var(--text-secondary)';
        });
        btn.style.background = 'var(--accent-color)';
        btn.style.color = '#fff';
      });
    });

    document.getElementById('btn-show-prev').addEventListener('click', () => {
      const prevSection = document.getElementById('ai-prev-list');
      prevSection.style.display = prevSection.style.display === 'none' ? 'flex' : 'none';
    });

    function renderCandidateCards(containerEl, candidates) {
      containerEl.innerHTML = candidates.map((text, i) => `
        <div class="ai-card" data-ci="${i}" style="padding: 0.6rem; border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; transition: all 0.15s;">
          <span style="color: var(--accent-color); font-weight:600;">#${i+1}</span> ${escapeHtml(text)}
        </div>
      `).join('');
      containerEl.querySelectorAll('.ai-card').forEach((card, i) => {
        card.addEventListener('click', () => {
          if (aiInsertMode === 'append') {
            textTranslation.value += (textTranslation.value ? '\n' : '') + candidates[i];
          } else {
            textTranslation.value = candidates[i];
          }
          autoResizeTextarea(textTranslation);
          containerEl.querySelectorAll('.ai-card').forEach(c => {
            c.style.borderColor = 'var(--border-color)';
            c.style.background = 'transparent';
          });
          card.style.borderColor = 'var(--accent-color)';
          card.style.background = 'rgba(99, 102, 241, 0.1)';
          showToast(`已${aiInsertMode === 'append' ? '追加' : '选择'}版本 #${i+1}`, 'success');
          // 选择后自动关闭面板
          document.getElementById('ai-candidates-panel').style.display = 'none';
        });
      });
    }

    // 绑定展开/收起候选面板按钮
    document.getElementById('btn-toggle-candidates').addEventListener('click', () => {
      const panel = document.getElementById('ai-candidates-panel');
      const listEl = document.getElementById('ai-candidates-list');
      if (listEl.innerHTML.trim() === '') {
        showToast('当前没有候选文本，请先执行 AI 翻译', 'warning');
        return;
      }
      panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
    });

    // RAG 面板切换折叠逻辑
    document.getElementById('rag-ref-header').addEventListener('click', (e) => {
      if (e.target.id === 'btn-close-rag') return;
      const list = document.getElementById('rag-ref-list');
      const chevron = document.getElementById('rag-ref-chevron');
      const isHidden = list.style.display === 'none';
      list.style.display = isHidden ? 'flex' : 'none';
      chevron.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
    });

    // 关闭 RAG 参考面板
    document.getElementById('btn-close-rag').addEventListener('click', () => {
      document.getElementById('rag-ref-panel').style.display = 'none';
    });

    // 手动获取 RAG 参考
    async function doFetchRag() {
      if (currentIndex === -1) return false;
      const str = strings[currentIndex];
      const settings = Storage.getSettings();
      if (!settings.embeddingEnabled) {
        showToast('未开启向量化模型，无法检索', 'warning');
        return false;
      }
      
      const btnRag = document.getElementById('btn-get-rag');
      if (btnRag) {
        btnRag.disabled = true;
        btnRag.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 检索中...';
      }
      
      try {
        const { RAG } = await import('../utils/rag.js');
        const refs = await RAG.retrieveReferences(projectId, str.original, { fileId });
        currentReferences = refs;
        if (refs.length > 0) {
          const ragPanel = document.getElementById('rag-ref-panel');
          const ragList = document.getElementById('rag-ref-list');
          const ragCount = document.getElementById('rag-ref-count');
          ragCount.innerText = `(${refs.length})`;
          ragList.innerHTML = refs.map((ref, i) =>
            `<div style="padding: 0.6rem; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-color); margin-top: 0.4rem;">
              <div style="color: var(--text-secondary); font-size: 0.75rem; margin-bottom: 0.3rem; display: flex; justify-content: space-between;">
                <span>相似度: ${(ref.score * 100).toFixed(1)}%</span>
                <span>${ref.fileName}</span>
              </div>
              <div style="font-size: 0.85rem; line-height: 1.4; margin-bottom: 0.4rem; color: var(--text-secondary);"><strong>原:</strong> ${escapeHtml(ref.original)}</div>
              <div style="font-size: 0.85rem; line-height: 1.4; color: var(--success-color);"><strong>译:</strong> ${escapeHtml(ref.translation)}</div>
            </div>`
          ).join('');
          ragPanel.style.display = 'block';
          // 检索成功后默认也保持折叠，或者如果你希望检索到就展示，可以设为 flex
          // 这里遵循“默认折叠”原则
          ragList.style.display = 'none';
          document.getElementById('rag-ref-chevron').style.transform = 'rotate(0deg)';
          return true;
        } else {
          showToast('未找到高相关历史参考', 'info');
          return false;
        }
      } catch (e) {
        showToast('RAG 检索失败: ' + e.message, 'error');
        return false;
      } finally {
        if (btnRag) {
          btnRag.disabled = false;
          btnRag.innerHTML = '<i class="fas fa-search"></i> 检索参考';
        }
      }
    }

    document.getElementById('btn-get-rag').addEventListener('click', doFetchRag);

    async function doAiTranslate(suggestion = null) {
      if (currentIndex === -1) return;
      const str = strings[currentIndex];
      const btn = document.getElementById('btn-ai-translate');
      const panel = document.getElementById('ai-candidates-panel');
      const listEl = document.getElementById('ai-candidates-list');
      const prevBtn = document.getElementById('btn-show-prev');
      const prevItemsEl = document.getElementById('ai-prev-items');
      
      // 如果还没查参考，顺手查一下
      const settings = Storage.getSettings();
      if (settings.embeddingEnabled && currentReferences.length === 0) {
        await doFetchRag();
      }

      btn.disabled = true;
      btn.innerText = suggestion ? '获取建议修改中...' : 'AI 翻译中...';
      const textTranslation = document.getElementById('text-translation');
      
      // 过滤术语表：只将真正在当前原文中出现的术语传递给 AI，防止全字典下发带来 token 爆炸和多义词干扰
      const matchedTerms = terms.filter(t => {
        const regex = buildTermRegex(t);
        if (!regex) return false;
        return regex.test(str.original);
      });
      
      try {
        const result = await AIClient.translateSingle({ 
          original: str.original, 
          terms: matchedTerms, 
          suggestion, 
          references: currentReferences,
          previousResponse: suggestion ? lastAiResponse : null 
        });
        
        lastAiResponse = result; // 记录原始响应，供下一轮纠错（修改建议）使用
        
        let candidates = [];
        // 正则提取所有被【】包裹的内容，支持跨行提取 (s flag)
        const matches = [...result.matchAll(/【(.*?)】/gs)];
        
        if (matches.length > 0) {
          candidates = matches.map(m => m[1].trim())
                               .filter(s => s.length > 0 && !/^译文\\d*$/.test(s) && !/^版本\\d*$/.test(s) && !/^选项\\d*$/.test(s));
        } else {
          // 降级容错：如果 AI 没有用【】，则按换行符拆分
          if (result.includes('\\n')) {
             candidates = result.split('\\n').filter(s => s.trim().length > 0).map(s => s.replace(/^[-*0-9.]+\\s*/, '').trim());
          } else {
             candidates = [result.trim()];
          }
        }
        
        if (candidates.length === 0) candidates = [result];
        
        if (candidates.length <= 1) {
          textTranslation.value = candidates[0] || result;
          autoResizeTextarea(textTranslation);
        } else {
          if (listEl.querySelectorAll('.ai-card').length > 0) {
            prevCandidates = Array.from(listEl.querySelectorAll('.ai-card')).map(c => c.textContent.replace(/^#\\d+\\s*/, '').trim());
            renderCandidateCards(prevItemsEl, prevCandidates);
            prevBtn.style.display = 'inline-block';
          }
          document.getElementById('ai-prev-list').style.display = 'none';
          renderCandidateCards(listEl, candidates);
          panel.style.display = 'flex';
        }
      } catch (e) {
        showToast(e.message, 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-robot"></i> AI 执行翻译';
      }
    }

    document.getElementById('btn-ai-translate').addEventListener('click', () => doAiTranslate(null));

    document.getElementById('btn-ai-suggest').addEventListener('click', () => {
      if (currentIndex === -1) return;
      const suggestPanel = document.getElementById('ai-suggest-panel');
      const suggestInput = document.getElementById('input-ai-suggest');
      
      if (suggestPanel.style.display === 'none') {
        suggestPanel.style.display = 'block';
        suggestInput.focus();
      } else {
        suggestPanel.style.display = 'none';
        suggestInput.value = '';
      }
    });

    document.getElementById('btn-submit-suggest').addEventListener('click', () => {
      const suggestInput = document.getElementById('input-ai-suggest');
      const suggestion = suggestInput.value.trim();
      if (!suggestion) return showToast('修改建议不能为空', 'warning');
      doAiTranslate(suggestion);
    });

    document.getElementById('input-ai-suggest').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('btn-submit-suggest').click();
      }
    });

    document.getElementById('btn-submit').addEventListener('click', async () => {
      if (currentIndex === -1) return;
      const str = strings[currentIndex];
      const translated = textTranslation.value.trim();
      if (!translated) return showToast('翻译不能为空', 'error');

      const btn = document.getElementById('btn-submit');
      btn.disabled = true;
      try {
        await paraTranzApi.updateString(projectId, str.id, translated, 1);
        Storage.saveTM(projectId, str.original, translated);
        strings[currentIndex].stage = 1;
        strings[currentIndex].translation = translated;
        strings[currentIndex].updatedAt = new Date().toISOString();
        showToast('保存成功', 'success');
        renderStringList();
        selectString(currentIndex + 1);
      } catch (e) {
        showToast(e.message, 'error');
      } finally {
        btn.disabled = false;
      }
    });
  }

  renderPage();
}

function highlightTerms(text, terms) {
  if (!terms || terms.length === 0) return escapeHtml(text);
  let res = escapeHtml(text);
  
  // 按照术语长度从长到短排序，防止短词优先替换导致长词被破坏（例如先匹配 sword 再匹配 word）
  const sortedTerms = [...terms].sort((a, b) => (b.term || '').length - (a.term || '').length);
  
  sortedTerms.forEach(t => {
    const termExp = buildTermRegex(t);
    if (!termExp) return;
    
    // 使用 $& 保留原文的大小写，而不是用 t.term 强制替换为术语表的大小写
    res = res.replace(termExp, `<span style="color: var(--accent-color); font-weight: 500; cursor: help; border-bottom: 1px dashed var(--accent-color);" title="${escapeHtml(t.translation||'')}">$&</span>`);
  });
  return res;
}

function escapeHtml(unsafe) {
  return (unsafe||'').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&'); 
}

/**
 * 构造用于匹配原串的正则表达式，支持：大小写敏感(caseSensitive) 和 变体匹配(variants)
 */
function buildTermRegex(termObj) {
  if (!termObj || !termObj.term) return null;
  
  // 搜集主词和所有的变体
  const words = [termObj.term];
  if (Array.isArray(termObj.variants)) {
    words.push(...termObj.variants);
  }
  
  // 对每一个词语转义以防特殊字符破坏正则
  const escapedWords = words.map(w => escapeRegExp(w));
  // 拼接成 (词1|词2|变体1...) 格式
  const coreRegex = escapedWords.length > 1 ? `(${escapedWords.join('|')})` : escapedWords[0];
  
  // 判定单词边界（只要主词首尾是英文字母即可）
  const prefix = /^\w/.test(termObj.term) ? '\\b' : '';
  const suffix = /\w$/.test(termObj.term) ? '\\b' : '';
  
  // 利用 API 返回的 caseSensitive 决定是否应用大小写忽略旗标 i
  const flags = termObj.caseSensitive ? 'g' : 'gi';
  
  return new RegExp(prefix + coreRegex + suffix, flags);
}
