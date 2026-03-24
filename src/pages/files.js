import { paraTranzApi } from '../api/paratranz.js';
import { navigate } from '../router.js';

export async function render(container, query) {
  const projectId = query.get('projectId');
  if (!projectId) {
    container.innerHTML = `<div class="glass-panel">缺少项目 ID 参数。</div>`;
    return;
  }

  container.innerHTML = `<div style="text-align:center; padding: 2rem;">加载文件列表中...</div>`;
  try {
    const files = await paraTranzApi.getFiles(projectId);
    
    if (!files || files.length === 0) {
      container.innerHTML = `<div class="glass-panel">该项目下没有文件。</div>`;
      return;
    }

    // 预计算每个文件的完成状态
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

    let currentFilter = 'all';

    function renderPage() {
      const doneCount = enriched.filter(f => f.isDone).length;
      const todoCount = enriched.length - doneCount;

      container.innerHTML = `
        <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h2>文件列表 (Project ID: ${projectId})</h2>
          <div>
            <button id="btn-sync-rag" class="btn" style="margin-right: 0.5rem;" title="从该项目拉取最新已翻/通过词条"><i class="fas fa-sync-alt"></i> 同步语料库</button>
            <button id="btn-back" class="btn">返回项目</button>
          </div>
        </div>

        <!-- 筛选栏 -->
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem;">
          <button class="btn filter-btn ${currentFilter === 'all' ? 'btn-primary' : ''}" data-filter="all">全部 (${enriched.length})</button>
          <button class="btn filter-btn ${currentFilter === 'todo' ? 'btn-primary' : ''}" data-filter="todo">未完成 (${todoCount})</button>
          <button class="btn filter-btn ${currentFilter === 'done' ? 'btn-primary' : ''}" data-filter="done">已完成 (${doneCount})</button>
        </div>

        <div id="file-list-container"></div>
      `;

      document.getElementById('btn-back').addEventListener('click', () => navigate('/projects'));

      container.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          currentFilter = btn.dataset.filter;
          renderPage();
        });
      });

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
              showToast(detail, 'info');
            });
            showToast('全项目语料库同步完成！', 'success');
          } catch (e) {
            const { showToast } = await import('../components/toast.js');
            showToast('同步失败: ' + e.message, 'error');
          } finally {
            btnSync.disabled = false;
            btnSync.innerHTML = '<i class="fas fa-sync-alt"></i> 同步语料库';
          }
        });
      }

      renderFileList();
    }

    function renderFileList() {
      const listContainer = document.getElementById('file-list-container');
      
      const filtered = enriched.filter(f => {
        if (currentFilter === 'done') return f.isDone;
        if (currentFilter === 'todo') return !f.isDone;
        return true;
      });

      if (filtered.length === 0) {
        listContainer.innerHTML = `<div class="glass-panel" style="text-align: center; color: var(--text-secondary); padding: 2rem;">当前筛选条件下没有文件。</div>`;
        return;
      }

      listContainer.innerHTML = filtered.map(f => `
        <div class="glass-panel file-item" data-index="${f.index}" style="margin-bottom: 0.8rem; cursor: pointer; display: flex; flex-direction: column; gap: 0.8rem; ${f.isDone ? 'border-left: 4px solid var(--success-color);' : ''}">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="flex: 1;">
              <h4 style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                ${f.name}
                ${f.isDone ? '<span style="font-size: 0.7rem; background: var(--success-color); color: #fff; padding: 1px 6px; border-radius: 10px;">已完成</span>' : ''}
              </h4>
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 0.5rem; font-size: 0.8rem;">
                <div title="总词条数"><span style="color: var(--text-secondary)">总计:</span> ${f.total}</div>
                <div title="已翻译入库" style="color: var(--accent-color)"><span style="color: var(--text-secondary)">已填:</span> ${f.translated}</div>
                <div title="隐藏/无需翻译" style="color: #888;"><span style="color: var(--text-secondary)">隐藏:</span> ${f.hidden}</div>
                <div title="待处理" style="${f.untranslated > 0 ? 'color: var(--danger-color); font-weight: bold;' : 'color: var(--text-secondary);'}">
                  <span style="color: var(--text-secondary); font-weight: normal;">待办:</span> ${f.untranslated}
                </div>
                <div title="已审核/发布"><span style="color: var(--text-secondary)">审核:</span> ${f.reviewed}</div>
              </div>
            </div>
            <button class="btn ${f.isDone ? '' : 'btn-primary'} btn-sm" style="margin-left: 1rem;">${f.isDone ? '查看' : '去翻译'}</button>
          </div>
          <div style="width: 100%; height: 6px; background: var(--bg-color); border-radius: 3px; overflow: hidden; border: 1px solid var(--border-color); position: relative;">
            <div style="width: ${f.percent}%; height: 100%; background: ${f.isDone ? 'var(--success-color)' : 'var(--accent-color)'}; transition: width 0.3s ease;"></div>
          </div>
        </div>
      `).join('');

      listContainer.querySelectorAll('.file-item').forEach(item => {
        item.addEventListener('click', () => {
          const fIndex = item.getAttribute('data-index');
          const file = enriched[fIndex];
          navigate(`/translate?projectId=${projectId}&fileId=${file.id}${file.isDone ? '&stage=all' : ''}`);
        });
      });
    }

    renderPage();

  } catch (error) {
    container.innerHTML = `<div class="glass-panel" style="color: var(--danger-color)">加载文件失败: ${error.message}</div>`;
  }
}

