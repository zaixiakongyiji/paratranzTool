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
    ptTerms.forEach(t => termsMap.set(t.term, t.translation));
    localTerms.forEach(t => termsMap.set(t.term, t.translation));
    
    const terms = Array.from(termsMap.entries()).map(([term, translation]) => ({ term, translation }));

    strings = strings || [];

    renderWorkbench(container, projectId, fileId, strings, terms, currentStage);
  } catch (error) {
    container.innerHTML = `<div class="glass-panel" style="color: var(--danger-color)">初始化失败 ${error.message}</div>`;
  }
}

function renderWorkbench(container, projectId, fileId, strings, terms, currentStage) {
  let currentIndex = -1;
  let sortOrder = 'none'; // 'none', 'asc', 'desc'

  function renderPage() {
    container.innerHTML = `
      <div style="display: flex; height: calc(100vh - 120px); gap: 1.5rem;">
        <div class="glass-panel" style="width: 320px; display: flex; flex-direction: column;">
          <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0;">词条列表</h3>
            <div style="display: flex; gap: 0.3rem;">
              <button id="btn-sort" class="btn btn-sm" title="按更新时间排序">
                <i class="fas fa-sort"></i> ${sortOrder === 'none' ? '' : (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button id="btn-terms" class="btn btn-sm" title="查看术语表">📖</button>
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

        <div class="glass-panel" style="flex: 1; display: flex; flex-direction: column;">
          <h3 style="margin-bottom: 1rem;">工作台</h3>
          <div style="flex: 1; display: flex; flex-direction: column; gap: 1rem;">
            <div style="flex: 1; display: flex; flex-direction: column;">
              <label style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; display:block;">原文</label>
              <div id="text-original" style="flex: 1; background: var(--bg-color); padding: 1rem; border-radius: 6px; border: 1px solid var(--border-color); overflow-y: auto; font-size: 1.1rem; line-height: 1.6;"></div>
            </div>
            
            <div style="display: flex; gap: 0.8rem;">
              <button id="btn-ai-translate" class="btn btn-primary" style="flex: 1"><i class="fas fa-robot"></i> AI 执行翻译</button>
              <button id="btn-ai-suggest" class="btn" style="padding: 0 0.8rem;" title="提供修改建议重新生成"><i class="fas fa-comment-dots"></i> 修改建议</button>
              <button id="btn-toggle-candidates" class="btn" style="padding: 0 0.8rem;" title="展开/收起 AI 候选面板"><i class="fas fa-layer-group"></i> 已有候选</button>
              <button id="btn-tm-match" class="btn" style="flex: 1"><i class="fas fa-database"></i> 重新匹配 TM</button>
            </div>
            
            <div id="ai-suggest-panel" style="display: none; margin-top: 0.8rem; border: 1px solid var(--border-color); border-radius: 8px; padding: 0.8rem; background: var(--bg-surface);">
              <label style="color: var(--text-secondary); font-size: 0.85rem; font-weight: 600; display: block; margin-bottom: 0.5rem;">给 AI 提供修改建议</label>
              <div style="display: flex; gap: 0.5rem;">
                <input type="text" id="input-ai-suggest" style="flex: 1; padding: 0.5rem; font-size: 0.9rem; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-color); color: var(--text-color);" placeholder="输入希望调整的方向或注意点..." />
                <button id="btn-submit-suggest" class="btn btn-primary" style="white-space: nowrap;"><i class="fas fa-paper-plane"></i> 重新生成</button>
              </div>
            </div>

            <div id="ai-candidates-panel" style="display: none; border: 1px solid var(--border-color); border-radius: 8px; padding: 0.8rem; background: var(--bg-color);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
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
              <div id="ai-candidates-list" style="display: flex; flex-direction: column; gap: 0.5rem;"></div>
              <div id="ai-prev-list" style="display: none; margin-top: 0.8rem; border-top: 1px dashed var(--border-color); padding-top: 0.5rem;">
                <label style="font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 0.3rem; display: block;">上一轮候选:</label>
                <div id="ai-prev-items" style="display: flex; flex-direction: column; gap: 0.3rem;"></div>
              </div>
            </div>

            <div style="flex: 1; display: flex; flex-direction: column;">
              <label style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; display:block;">译文 (支持手动编辑)</label>
              <textarea id="text-translation" style="flex: 1; resize: none; font-size: 1.1rem; line-height: 1.6; padding: 1rem;"></textarea>
            </div>
          </div>

          <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 1rem;">
            <button id="btn-submit" class="btn btn-primary" style="padding: 0.6rem 2rem; font-size: 1rem;">提交至服务器并保存 TM 记录 (下一条)</button>
          </div>
        </div>
      </div>
    `;

    bindHeaderEvents();
    renderStringList();
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
    document.getElementById('btn-back').addEventListener('click', () => navigate(`/files?projectId=${projectId}`));
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

    initWorkbenchLogic();
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

    const matched = Storage.searchTM(projectId, str.original);
    if (matched && !document.getElementById('text-translation').value) {
      document.getElementById('text-translation').value = matched;
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

    // 已审核防误触保护
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

  function initWorkbenchLogic() {
    const textTranslation = document.getElementById('text-translation');

    document.getElementById('btn-tm-match').addEventListener('click', () => {
      if (currentIndex === -1) return;
      const str = strings[currentIndex];
      const match = Storage.searchTM(projectId, str.original);
      if (match) {
        textTranslation.value = match;
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
      prevSection.style.display = prevSection.style.display === 'none' ? 'block' : 'none';
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
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });

    async function doAiTranslate(suggestion = null) {
      if (currentIndex === -1) return;
      const str = strings[currentIndex];
      const btn = document.getElementById('btn-ai-translate');
      const panel = document.getElementById('ai-candidates-panel');
      const listEl = document.getElementById('ai-candidates-list');
      const prevBtn = document.getElementById('btn-show-prev');
      const prevItemsEl = document.getElementById('ai-prev-items');
      
      btn.disabled = true;
      btn.innerText = suggestion ? '获取建议修改中...' : 'AI 翻译中...';
      const textTranslation = document.getElementById('text-translation');
      
      try {
        const result = await AIClient.translateSingle({ original: str.original, terms: terms, suggestion });
        
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
        } else {
          if (listEl.querySelectorAll('.ai-card').length > 0) {
            prevCandidates = Array.from(listEl.querySelectorAll('.ai-card')).map(c => c.textContent.replace(/^#\\d+\\s*/, '').trim());
            renderCandidateCards(prevItemsEl, prevCandidates);
            prevBtn.style.display = 'inline-block';
          }
          document.getElementById('ai-prev-list').style.display = 'none';
          renderCandidateCards(listEl, candidates);
          panel.style.display = 'block';
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
  terms.forEach(t => {
    if(!t.term) return;
    const termExp = new RegExp(escapeRegExp(t.term), 'gi');
    res = res.replace(termExp, `<span style="color: var(--accent-color); font-weight: 500; cursor: help; border-bottom: 1px dashed var(--accent-color);" title="${escapeHtml(t.translation||'')}">${t.term}</span>`);
  });
  return res;
}

function escapeHtml(unsafe) {
  return (unsafe||'').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&'); 
}
