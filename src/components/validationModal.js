/**
 * 保存前检查 - 模态弹窗组件
 * 展示 validateTranslation 返回的校验结果，由用户决定是否继续保存
 */

/**
 * HTML 转义，防止标签内容被浏览器解析
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * 类别图标映射
 */
const CATEGORY_ICONS = {
  lineCount: 'fas fa-align-left',
  missingTags: 'fas fa-tag',
  extraTags: 'fas fa-exclamation-triangle',
  whitespace: 'fas fa-paragraph',
};

/**
 * 显示保存前检查弹窗
 * @param {object[]} issues - validateTranslation 返回的问题数组
 * @returns {Promise<boolean>} true=用户选择"继续"保存，false=用户选择"再检查一下"
 */
export function showValidationModal(issues) {
  return new Promise((resolve) => {
    // 移除可能残留的旧弹窗
    const existing = document.getElementById('validation-modal-overlay');
    if (existing) existing.remove();

    // 构建问题列表 HTML
    const issuesHtml = issues.map(issue => {
      const iconClass = CATEGORY_ICONS[issue.category] || 'fas fa-info-circle';
      const detailsHtml = issue.details.length > 0
        ? `<ul style="margin: 0.4rem 0 0 1.2rem; padding: 0; list-style: disc;">
            ${issue.details.map(d => `<li style="margin-bottom: 0.2rem; word-break: break-all; font-family: 'Consolas', 'Monaco', monospace; font-size: 0.85rem;">${escapeHtml(d)}</li>`).join('')}
           </ul>`
        : '';

      return `
        <div style="margin-bottom: 0.8rem;">
          <div style="display: flex; align-items: flex-start; gap: 0.5rem; cursor: pointer;" class="validation-issue-header">
            <span style="color: var(--warning-color); flex-shrink: 0; margin-top: 2px;">
              <i class="${iconClass}"></i>
            </span>
            <div style="flex: 1;">
              <div style="font-weight: 600; font-size: 0.95rem; display: flex; align-items: center; gap: 0.4rem;">
                ▼ ${escapeHtml(issue.title)}
              </div>
              <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.2rem;">
                ${escapeHtml(issue.message)}
              </div>
              ${detailsHtml}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // 创建遮罩层和弹窗
    const overlay = document.createElement('div');
    overlay.id = 'validation-modal-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 10000;
      background: rgba(0, 0, 0, 0.5);
      display: flex; align-items: center; justify-content: center;
      animation: validationFadeIn 0.15s ease;
    `;

    overlay.innerHTML = `
      <style>
        @keyframes validationFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes validationSlideIn {
          from { opacity: 0; transform: translateY(-10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      </style>
      <div style="
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        width: 480px;
        max-width: 90vw;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.3);
        animation: validationSlideIn 0.2s ease;
      ">
        <!-- 标题栏 -->
        <div style="
          display: flex; justify-content: space-between; align-items: center;
          padding: 1rem 1.2rem;
          border-bottom: 1px solid var(--border-color);
          flex-shrink: 0;
        ">
          <h3 style="margin: 0; font-size: 1.05rem; font-weight: 600;">保存前检查</h3>
          <button id="validation-modal-close" style="
            background: transparent; border: none; color: var(--text-secondary);
            cursor: pointer; font-size: 1.3rem; padding: 0 4px; line-height: 1;
          ">&times;</button>
        </div>

        <!-- 检查结果 -->
        <div style="
          padding: 1rem 1.2rem;
          overflow-y: auto;
          flex: 1;
        ">
          ${issuesHtml}
        </div>

        <!-- 操作按钮 -->
        <div style="
          display: flex; justify-content: flex-end; gap: 0.6rem;
          padding: 0.8rem 1.2rem;
          border-top: 1px solid var(--border-color);
          flex-shrink: 0;
        ">
          <button id="validation-btn-recheck" class="btn btn-primary" style="font-size: 0.9rem; padding: 0.4rem 1rem;">
            再检查一下
          </button>
          <button id="validation-btn-continue" class="btn" style="font-size: 0.9rem; padding: 0.4rem 1rem;">
            继续
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // 绑定事件
    const cleanup = (result) => {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.15s ease';
      setTimeout(() => overlay.remove(), 150);
      resolve(result);
    };

    document.getElementById('validation-btn-recheck').addEventListener('click', () => cleanup(false));
    document.getElementById('validation-btn-continue').addEventListener('click', () => cleanup(true));
    document.getElementById('validation-modal-close').addEventListener('click', () => cleanup(false));

    // 点击遮罩层关闭（等同于"再检查一下"）
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cleanup(false);
    });

    // ESC 键关闭
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        document.removeEventListener('keydown', handleEsc);
        cleanup(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
  });
}
