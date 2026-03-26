import { paraTranzApi } from '../api/paratranz.js';
import { navigate } from '../router.js';

export async function render(container, query) {
  const projectId = query.get('projectId');
  if (!projectId) {
    container.innerHTML = `<div class="glass-panel">缺少项目 ID 参数。</div>`;
    return;
  }

  container.innerHTML = `<div style="text-align:center; padding: 2rem;">加载项目与文件列表中...</div>`;
  try {
    const [project, files] = await Promise.all([
      paraTranzApi.getProject(projectId).catch(() => ({ name: '未知项目' })),
      paraTranzApi.getFiles(projectId)
    ]);
    
    if (!files || files.length === 0) {
      container.innerHTML = `<div class="glass-panel">该项目下没有文件。</div>`;
      return;
    }

    // 0. 预计算每个文件的完成状态
    const enriched = files.map((f, index) => {
      const total = f.total || 0;
      const translated = f.translated || 0;
      const hidden = f.hidden || 0;
      const reviewed = f.reviewed || 0;
      const untranslated = Math.max(0, total - translated - hidden);
      const finishedCount = translated + hidden;
      const percent = total > 0 ? Math.min(100, Math.round((finishedCount / total) * 100)) : 0;
      const isDone = finishedCount >= total && total > 0;
      return { ...f, index, total, translated, hidden, reviewed, untranslated, finishedCount, percent, isDone };
    });

    // 1. 数据预处理：聚合目录
    const groupMap = new Map();
    enriched.forEach(f => {
      // 提取目录前缀 (以最后一个 / 为界)
      const parts = f.name.split('/');
      const dir = parts.length > 1 ? parts.slice(0, -1).join('/') + '/' : '/';
      
      if (!groupMap.has(dir)) {
        groupMap.set(dir, {
          name: dir,
          files: [],
          total: 0,
          translated: 0,
          hidden: 0,
          reviewed: 0,
          percent: 0
        });
      }
      const g = groupMap.get(dir);
      g.files.push(f);
      g.total += f.total;
      g.translated += f.translated;
      g.hidden += f.hidden;
      g.reviewed += f.reviewed;
    });

    // 计算各组百分比
    groupMap.forEach(g => {
      const finished = g.translated + g.hidden;
      g.percent = g.total > 0 ? Math.min(100, Math.round((finished / g.total) * 100)) : 0;
    });

    const groups = Array.from(groupMap.values());
    let currentFilter = 'all';

    function renderPage() {
      container.innerHTML = `
        <div style="max-width: 1000px; margin: 0 auto; display: flex; gap: 1.5rem; align-items: flex-start;">
          <!-- 左侧 TODO 侧边栏 (固定宽度，跟随滚动) -->
          <div class="glass-panel" style="width: 180px; flex-shrink: 0; display: flex; flex-direction: column; gap: 0.8rem; padding: 1rem; position: sticky; top: 1rem;">
            <div style="font-weight: 600; color: var(--text-secondary); font-size: 0.8rem; margin-bottom: 0.5rem;">TODO 概览</div>
            <div class="nav-item active" style="padding: 0.6rem; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.6rem; background: var(--accent-color); color: white;">
              <i class="fas fa-file-alt"></i> 文件列表
            </div>
            <div class="nav-item" style="padding: 0.6rem; border-radius: 6px; cursor: not-allowed; display: flex; align-items: center; gap: 0.6rem; opacity: 0.5;">
              <i class="fas fa-chart-pie"></i> 统计 (待办)
            </div>
            <div class="nav-item" style="padding: 0.6rem; border-radius: 6px; cursor: not-allowed; display: flex; align-items: center; gap: 0.6rem; opacity: 0.5;">
              <i class="fas fa-history"></i> 历史 (待办)
            </div>
          </div>

          <!-- 右侧主内容 (主容器自然滚动) -->
          <div style="flex: 1; min-width: 0; display: flex; flex-direction: column;">
            <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; flex-shrink: 0;">
              <div style="display: flex; align-items: center; gap: 0.8rem;">
                <button id="btn-back-header" class="btn btn-sm" title="返回项目列表" style="padding: 0.4rem 0.6rem;"><i class="fas fa-arrow-left"></i> 返回</button>
                <h2 style="font-size: 1.1rem; margin: 0;">${project.name || '未知项目'} <span style="font-size: 0.85rem; color: var(--text-secondary); font-weight: normal;">(ID: ${projectId})</span></h2>
              </div>
              <div style="display: flex; gap: 0.5rem;">
                <button id="btn-sync-rag" class="btn btn-sm" title="同步语料库"><i class="fas fa-sync-alt"></i> 同步</button>
                <button id="btn-clear-rag" class="btn btn-sm" style="color: var(--danger-color); border-color: var(--danger-color);" title="清空语料库"><i class="fas fa-trash-alt"></i> 清空</button>
              </div>
            </div>

            <!-- 筛选栏 -->
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-shrink: 0;">
              <button class="btn btn-sm filter-btn ${currentFilter === 'all' ? 'btn-primary' : ''}" data-filter="all">全部</button>
              <button class="btn btn-sm filter-btn ${currentFilter === 'todo' ? 'btn-primary' : ''}" data-filter="todo">待处理</button>
              <button class="btn btn-sm filter-btn ${currentFilter === 'done' ? 'btn-primary' : ''}" data-filter="done">已完成</button>
            </div>

            <div id="file-list-content" style="display: flex; flex-direction: column; gap: 0.6rem; padding-bottom: 2rem;">
              ${groups.map((g, gi) => {
                const filteredFiles = g.files.filter(f => {
                  if (currentFilter === 'done') return f.isDone;
                  if (currentFilter === 'todo') return !f.isDone;
                  return true;
                });
                if (filteredFiles.length === 0) return '';
                
                return `
                <div class="folder-group glass-panel" style="padding: 0; border: 1px solid var(--border-color); overflow: hidden; border-radius: 8px;">
                  <div class="folder-header" style="padding: 0.6rem 1rem; cursor: pointer; display: flex; align-items: center; background: rgba(255,255,255,0.02); hover: background: rgba(255,255,255,0.04);">
                    <i class="fas fa-chevron-right folder-arrow" style="margin-right: 0.6rem; transition: transform 0.2s; font-size: 0.75rem; color: var(--text-secondary); ${(currentFilter !== 'all') ? 'transform: rotate(90deg);' : ''}"></i>
                    <div style="flex: 1; font-weight: 500; font-size: 0.9rem;">${g.name} <span style="font-weight: normal; font-size: 0.8rem; color: var(--text-secondary); margin-left: 0.4rem;">${filteredFiles.length}</span></div>
                    <div style="display: flex; align-items: center; gap: 0.8rem;">
                      <div class="mini-progress" style="width: 50px; height: 3px; background: var(--bg-color); border-radius: 2px; overflow: hidden;">
                        <div style="width: ${g.percent}%; height: 100%; background: var(--accent-color);"></div>
                      </div>
                      <span style="font-size: 0.75rem; color: var(--text-secondary); min-width: 30px; text-align: right;">${g.percent}%</span>
                    </div>
                  </div>
                  <!-- 面板内部独立滚动，并限制最大高度，防止撑开外层导致排版挤压 -->
                  <div class="folder-content" style="display: ${(currentFilter !== 'all') ? 'block' : 'none'}; max-height: 400px; overflow-y: auto; border-top: 1px solid var(--border-color); background: rgba(0,0,0,0.05);">
                    ${filteredFiles.map(f => `
                      <div class="file-row" data-id="${f.id}" style="padding: 0.5rem 1rem 0.5rem 2.4rem; border-bottom: 1px solid rgba(255,255,255,0.02); display: flex; align-items: center; cursor: pointer; position: relative;">
                        <div style="flex: 1; min-width: 0;">
                          <div style="font-size: 0.8rem; display: flex; align-items: center; gap: 0.4rem;">
                            <i class="far fa-file-code" style="color: var(--text-secondary); font-size: 0.75rem;"></i>
                            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${f.name.split('/').pop()}</span>
                            ${f.isDone ? '<i class="fas fa-check-circle" style="color: var(--success-color); font-size: 0.75rem;"></i>' : ''}
                          </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.8rem; margin-left: 1rem; font-size: 0.75rem; color: var(--text-secondary);">
                          <div style="min-width: 70px; text-align: right;">${f.translated}/${f.total}</div>
                          <button class="btn btn-sm btn-action" style="padding: 1px 6px; font-size: 0.7rem; min-width: 44px;">${f.isDone ? '查看' : '翻译'}</button>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `}).join('')}
            </div>
          </div>
        </div>
      `;



      const goBack = () => navigate('/projects');
      const btnBack = document.getElementById('btn-back');
      if (btnBack) btnBack.addEventListener('click', goBack);
      
      const btnBackHeader = document.getElementById('btn-back-header');
      if (btnBackHeader) btnBackHeader.addEventListener('click', goBack);

      // 绑定筛选点击
      container.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          currentFilter = btn.dataset.filter;
          renderPage();
        });
      });

      // 绑定折叠逻辑
      container.querySelectorAll('.folder-header').forEach(header => {
        header.addEventListener('click', () => {
          const content = header.nextElementSibling;
          const arrow = header.querySelector('.folder-arrow');
          const isHidden = content.style.display === 'none';
          
          content.style.display = isHidden ? 'block' : 'none';
          arrow.style.transform = isHidden ? 'rotate(90deg)' : 'rotate(0deg)';
        });
      });

      // 绑定文件跳转逻辑
      container.querySelectorAll('.file-row').forEach(row => {
        row.addEventListener('click', (e) => {
          const fileId = row.dataset.id;
          const isDone = row.querySelector('.fa-check-circle') !== null;
          navigate(`/translate?projectId=${projectId}&fileId=${fileId}${isDone ? '&stage=all' : ''}`);
        });
      });

      // RAG 同步与清空按钮（维持原有逻辑）
      const btnSync = document.getElementById('btn-sync-rag');
      if (btnSync) {
        btnSync.addEventListener('click', async () => {
          const { Storage } = await import('../utils/storage.js');
          const settings = Storage.getSettings();
          if (!settings.embeddingEnabled) {
            const { showToast } = await import('../components/toast.js');
            showToast('请先在配置页开启向量化模型', 'warning');
            return;
          }
          btnSync.disabled = true;
          btnSync.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 同步中...';
          try {
            const { RAG } = await import('../utils/rag.js');
            const { showToast } = await import('../components/toast.js');
            await RAG.syncCorpus(projectId, (status, detail) => {
              const type = (status === 'warning' || status === 'error') ? status : 'info';
              showToast(detail, type);
            });
            showToast('项目语料库同步流程结束', 'success');
          } catch (e) {
            const { showToast } = await import('../components/toast.js');
            showToast('同步失败: ' + e.message, 'error');
          } finally {
            btnSync.disabled = false;
            btnSync.innerHTML = '<i class="fas fa-sync-alt"></i> 同步';
          }
        });
      }

      const btnClear = document.getElementById('btn-clear-rag');
      if (btnClear) {
        btnClear.addEventListener('click', async () => {
          if (!confirm('确定要清空该项目所有的本地语料缓存以及远端 Qdrant 向量数据吗？')) return;
          btnClear.disabled = true;
          btnClear.innerHTML = '<i class="fas fa-spinner fa-spin"></i>...';
          try {
            const { VectorStore } = await import('../utils/vectorStore.js');
            await VectorStore.deleteProjectData(projectId);
            const { showToast } = await import('../components/toast.js');
            showToast('语料数据已成功清空！', 'success');
          } catch (e) {
            const { showToast } = await import('../components/toast.js');
            showToast('清空失败: ' + e.message, 'error');
          } finally {
            btnClear.disabled = false;
            btnClear.innerHTML = '<i class="fas fa-trash-alt"></i> 清空';
          }
        });
      }
    }
    renderPage();
  } catch (error) {
    container.innerHTML = `<div class="glass-panel" style="color: var(--danger-color)">加载文件失败: ${error.message}</div>`;
  }
}
