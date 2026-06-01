/* @vitest-environment jsdom */

import { beforeEach, describe, expect, it } from 'vitest';
import { initRouter } from './router.js';

describe('initRouter', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="app-container">
        <header id="header">
          <h1 id="logo">ParaTranz AI</h1>
          <nav>
            <a href="#/projects" class="nav-link">项目</a>
            <a href="#/glossary" class="nav-link">个人知识库</a>
            <a href="#/settings" class="nav-link">设置</a>
            <button id="theme-toggle"><i class="fas fa-sun"></i></button>
          </nav>
        </header>
        <main id="router-view"></main>
      </div>
    `;
    window.location.hash = '#/unknown';
  });

  it('preserves the app shell controls that main.js expects', () => {
    initRouter();

    expect(document.getElementById('theme-toggle')).not.toBeNull();
    expect(document.querySelector('a[href="#/glossary"]')).not.toBeNull();
  });
});
