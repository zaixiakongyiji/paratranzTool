import './style.css';

document.querySelector('#app').innerHTML = `
  <div class="app-container">
    <header id="header" class="glass-panel" style="margin-bottom: 2rem; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center;">
      <h1 style="font-size: 1.5rem; color: var(--accent-color); margin: 0; cursor: pointer;" id="logo">ParaTranz AI</h1>
      <nav style="display: flex; gap: 1.5rem;">
        <a href="#/projects" class="nav-link">项目</a>
        <a href="#/glossary" class="nav-link">个人知识库</a>
        <a href="#/settings" class="nav-link">设置</a>
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
});
