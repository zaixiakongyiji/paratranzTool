import { paraTranzApi } from '../api/paratranz.js';
import { navigate } from '../router.js';

export async function render(container, query) {
  const projectId = query.get('projectId');
  if (!projectId) {
    container.innerHTML = `<div class="glass-panel">要求指定 projectId 参数方可获取术语。</div>`;
    return;
  }

  container.innerHTML = `<div style="text-align:center; padding: 2rem;">加载术语表中...</div>`;
  try {
    const terms = await paraTranzApi.getTerms(projectId);
    const list = Array.isArray(terms) ? terms : (terms.results || []);

    if (list.length === 0) {
      container.innerHTML = `<div class="glass-panel">当前项目暂无术语</div>`;
      return;
    }

    const tableHtml = list.map(t => {
      return `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding: 0.8rem;">${escapeHtml(t.term)}</td>
          <td style="padding: 0.8rem;">${escapeHtml(t.translation)}</td>
          <td style="padding: 0.8rem; color: var(--text-secondary);">${escapeHtml(t.pos || '')}</td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h2>术语管理 (项目 ${projectId})</h2>
        <button id="btn-back" class="btn">返回词条浏览</button>
      </div>
      <div class="glass-panel" style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="background: var(--bg-surface-hover);">
              <th style="padding: 0.8rem;">原文 (Term)</th>
              <th style="padding: 0.8rem;">译文 (Translation)</th>
              <th style="padding: 0.8rem;">词性 (POS)</th>
            </tr>
          </thead>
          <tbody>
            ${tableHtml}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('btn-back').addEventListener('click', () => {
      window.history.back();
    });

  } catch (err) {
    container.innerHTML = `<div class="glass-panel" style="color: var(--danger-color)">加载数据失败: ${err.message}</div>`;
  }
}

function escapeHtml(unsafe) {
  return (unsafe || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
