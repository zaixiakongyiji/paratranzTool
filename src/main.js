import './style.css';

document.querySelector('#app').innerHTML = `
  <div class="app-container">
    <header id="header" class="glass-panel" style="margin-bottom: 2rem; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
      <h1 style="font-size: 1.5rem; color: var(--accent-color); margin: 0; cursor: pointer;" id="logo">ParaTranz AI</h1>
      <nav style="display: flex; gap: 1.5rem; align-items: center;">
        <a href="#/projects" class="nav-link">项目</a>
        <a href="#/glossary" class="nav-link">个人知识库</a>
        <a href="#/settings" class="nav-link" style="margin-right: 0.5rem;">设置</a>
        <button id="theme-toggle" class="btn btn-sm" style="background: var(--bg-surface-hover); border: 1px solid var(--border-color); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-primary);" title="切换主题">
          <i class="fas fa-sun"></i>
        </button>
      </nav>
    </header>
    <main id="router-view">
      <div class="loading-state">应用初始化中...</div>
    </main>
  </div>
`;

// 简单的路由初始化
import { initRouter } from './router.js';
window.addEventListener('DOMContentLoaded', () => {
  initRouter();

  // 主题切换逻辑
  const themeToggleBtn = document.getElementById('theme-toggle');
  const icon = themeToggleBtn.querySelector('i');
  
  const updateIcon = (theme) => {
    if (theme === 'dark') {
      icon.className = 'fas fa-moon';
    } else {
      icon.className = 'fas fa-sun';
    }
  };

  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  updateIcon(currentTheme);

  themeToggleBtn.addEventListener('click', () => {
    const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateIcon(theme);
  });
});
