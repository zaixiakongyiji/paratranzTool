import { paraTranzApi } from '../api/paratranz.js';
import { Storage } from '../utils/storage.js';
import { navigate } from '../router.js';
import { showToast } from '../components/toast.js';

export async function render(container) {
  renderLayout(container);
  renderProjectList();
}

function renderLayout(container) {
  container.innerHTML = `
    <div style="max-width: 1000px; margin: 0 auto;">
      <div style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
        <h2 style="font-size: 1.25rem;">我的项目</h2>
        <div style="display: flex; gap: 0.5rem;">
          <input type="number" id="input-add-project-id" placeholder="项目 ID" style="width: 140px; font-size: 0.9rem;" />
          <button id="btn-add-project" class="btn btn-primary btn-sm">添加项目</button>
        </div>
      </div>
      <div id="project-list-container" class="projects-grid">
        <div style="text-align:center; padding: 2rem; color: var(--text-secondary);">加载中...</div>
      </div>
    </div>
  `;

  document.getElementById('btn-add-project').addEventListener('click', async () => {
    const idInput = document.getElementById('input-add-project-id');
    const projectId = idInput.value.trim();
    if (!projectId) return;

    const btn = document.getElementById('btn-add-project');
    btn.disabled = true;
    btn.innerText = '验证中...';

    try {
      const project = await paraTranzApi.getProject(projectId);
      if (project && project.id) {
        Storage.addMyProject({
          id: project.id,
          name: project.name || `项目 ${project.id}`
        });
        showToast('项目管理成功', 'success');
        idInput.value = '';
        renderProjectList();
      }
    } catch (e) {
      showToast('无法找到该项目，请检查 ID 或 Token 权限', 'error');
    } finally {
      btn.disabled = false;
      btn.innerText = '添加项目';
    }
  });
}

function renderProjectList() {
  const listContainer = document.getElementById('project-list-container');
  const myProjects = Storage.getMyProjects();

  if (myProjects.length === 0) {
    listContainer.innerHTML = `
      <div class="glass-panel text-center" style="grid-column: 1/-1; padding: 3rem;">
        <p style="color: var(--text-secondary); margin-bottom: 1rem;">暂无项目，请在右上角输入项目 ID 添加。</p>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = myProjects.map((p, index) => `
    <div class="glass-panel project-card" data-id="${p.id}" style="margin-bottom: 1rem; cursor: pointer; transition: transform 0.2s; position: relative;">
      <h3 style="margin-bottom: 0.5rem;">${escapeHtml(p.name)}</h3>
      <p style="color: var(--text-secondary); font-size: 0.9rem;">ID: ${p.id}</p>
      <button class="btn-remove" data-id="${p.id}" style="position: absolute; top: 10px; right: 10px; background: transparent; border: none; color: var(--danger-color); cursor: pointer; font-size: 1.2rem;">&times;</button>
    </div>
  `).join('');

  // 绑定点击跳转
  listContainer.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', () => card.style.transform = 'translateY(-2px)');
    card.addEventListener('mouseleave', () => card.style.transform = 'translateY(0)');
    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-remove')) {
        e.stopPropagation();
        Storage.removeMyProject(e.target.getAttribute('data-id'));
        renderProjectList();
        return;
      }
      const projectId = card.getAttribute('data-id');
      navigate(`/files?projectId=${projectId}`);
    });
  });
}

function escapeHtml(unsafe) {
  return (unsafe || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
