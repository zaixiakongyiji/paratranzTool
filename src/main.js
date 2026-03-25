import './style.css';

document.querySelector('#app').innerHTML = `
  <div class="app-container">
    <header id="header" class="glass-panel" style="margin-bottom: 2rem; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
      <h1 style="font-size: 1.5rem; color: var(--accent-color); margin: 0; cursor: pointer;" id="logo">ParaTranz AI</h1>
      <nav style="display: flex; gap: 1.5rem; align-items: center;">
        <a href="#/projects" class="nav-link">项目</a>
        <a href="#/glossary" class="nav-link">个人知识库</a>
        <a href="#/settings" class="nav-link">设置</a>
        <button id="theme-toggle" class="btn btn-sm" style="background: transparent; border: none; font-size: 1.2rem; padding: 0; color: var(--text-primary);" title="切换主题">
          <i class="fas fa-moon"></i>
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
  
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  themeToggleBtn.addEventListener('click', () => {
    let currentTheme = document.documentElement.getAttribute('data-theme');
    let targetTheme = 'light';

    if (currentTheme === 'light') {
      targetTheme = 'dark';
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
    } else {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
    }

    document.documentElement.setAttribute('data-theme', targetTheme);
    localStorage.setItem('theme', targetTheme);
  });
});
