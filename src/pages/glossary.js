import { Storage } from '../utils/storage.js';
import { showToast } from '../components/toast.js';

export function render(container) {
  renderLayout(container);
  renderTermList();
}

function renderLayout(container) {
  container.innerHTML = `
    <div class="glass-panel" style="max-width: 800px; margin: 0 auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h2>个人知识库 (本地术语)</h2>
        <div style="display: flex; gap: 0.5rem;">
          <button id="btn-import-json" class="btn btn-sm">导入 JSON</button>
          <button id="btn-export-json" class="btn btn-sm">导出 JSON</button>
        </div>
      </div>

      <div class="glass-panel" style="background: rgba(255,255,255,0.03); margin-bottom: 2rem; padding: 1.5rem;">
        <h4 style="margin-bottom: 1rem;">添加新规则/术语</h4>
        <div style="display: grid; grid-template-columns: 1fr 1.5fr auto; gap: 1rem; align-items: end;">
          <div>
            <label style="display:block; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.4rem;">原文/匹配词</label>
            <input type="text" id="new-term-key" placeholder="如: Tear" />
          </div>
          <div>
            <label style="display:block; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.4rem;">译文/规则说明</label>
            <input type="text" id="new-term-val" placeholder="如: 裂化 (西幻风格)" />
          </div>
          <button id="btn-add-local-term" class="btn btn-primary">添加</button>
        </div>
      </div>

      <div id="local-term-list" style="display: flex; flex-direction: column; gap: 0.8rem;">
        <!-- 列表内容 -->
      </div>
    </div>

    <!-- 隐藏的隐藏文件输入 -->
    <input type="file" id="file-import-json" style="display: none;" accept=".json" />
  `;

  document.getElementById('btn-add-local-term').addEventListener('click', () => {
    const key = document.getElementById('new-term-key').value.trim();
    const val = document.getElementById('new-term-val').value.trim();
    if (!key || !val) return;

    Storage.addLocalTerm(key, val);
    document.getElementById('new-term-key').value = '';
    document.getElementById('new-term-val').value = '';
    renderTermList();
    showToast('已添加到本地知识库', 'success');
  });

  document.getElementById('btn-export-json').addEventListener('click', () => {
    const data = Storage.getLocalGlossary();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my_glossary_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToast('已开始导出', 'success');
  });

  document.getElementById('btn-import-json').addEventListener('click', () => {
    document.getElementById('file-import-json').click();
  });

  document.getElementById('file-import-json').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (Array.isArray(json)) {
          Storage.saveLocalGlossary(json);
          renderTermList();
          showToast('导入成功', 'success');
        } else {
          showToast('JSON 格式不正确，应为数组', 'error');
        }
      } catch {
        showToast('JSON 解析失败', 'error');
      }
    };
    reader.readAsText(file);
  });
}

function renderTermList() {
  const listEl = document.getElementById('local-term-list');
  const terms = Storage.getLocalGlossary();

  if (terms.length === 0) {
    listEl.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 2rem;">本地知识库目前为空</div>';
    return;
  }

  listEl.innerHTML = terms.map((t, idx) => `
    <div class="glass-panel" style="display: flex; justify-content: space-between; align-items: center; padding: 0.8rem 1.2rem; background: rgba(255,255,255,0.02);">
      <div style="display: flex; gap: 1.5rem; flex: 1;">
        <div style="font-weight: 600; color: var(--accent-color); min-width: 100px;">${escapeHtml(t.term)}</div>
        <div style="color: var(--text-primary);">${escapeHtml(t.translation)}</div>
      </div>
      <button class="btn-remove-term" data-term="${t.term}" style="background: transparent; border: none; color: var(--danger-color); cursor: pointer; opacity: 0.6;">&times;</button>
    </div>
  `).join('');

  listEl.querySelectorAll('.btn-remove-term').forEach(btn => {
    btn.addEventListener('click', () => {
      Storage.removeLocalTerm(btn.dataset.term);
      renderTermList();
    });
  });
}

function escapeHtml(unsafe) {
  return (unsafe || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
