/* @vitest-environment jsdom */
import { describe, expect, it, vi, beforeAll, afterAll, beforeEach } from 'vitest';

// mock API 层和存储层，避免真实网络请求和本地存储读写报错
vi.mock('./api/paratranz.js', () => ({
  paraTranzApi: {
    getTerms: vi.fn().mockResolvedValue([]),
    getStrings: vi.fn().mockResolvedValue([
      { id: 1, original: 'test_original', translation: 'test_translation', stage: 0 }
    ])
  }
}));

vi.mock('./api/ai.js', () => ({
  AIClient: {
    getModels: vi.fn().mockResolvedValue([
      { id: 'model-1', name: 'Model 1' },
      { id: 'model-2', name: 'Model 2' }
    ])
  }
}));

vi.mock('./utils/storage.js', () => ({
  Storage: {
    getLocalGlossary: vi.fn().mockReturnValue([]),
    getSettings: vi.fn().mockReturnValue({
      ptToken: 'test-token',
      ptBaseUrl: '/api',
      aiApiFormat: 'openai',
      aiBaseUrl: 'http://localhost',
      aiApiKey: 'test-key',
      aiModel: 'test-model',
      embeddingEnabled: true,
      embeddingRefCount: 3,
      filterEnabled: true,
      rerankEnabled: true,
      qdrantEnabled: false
    }),
    saveSettings: vi.fn(),
    searchTM: vi.fn().mockReturnValue(null)
  }
}));

import { initRouter, navigate } from './router.js';
import { showValidationModal } from './components/validationModal.js';

describe('里程碑 1：事件监听器泄露检测与销毁机制验证', () => {
  let activeWindowResizeListeners = 0;
  let activeDocumentClickListeners = 0;
  let activeDocumentKeydownListeners = 0;

  const originalWindowAdd = window.addEventListener;
  const originalWindowRemove = window.removeEventListener;
  const originalDocAdd = document.addEventListener;
  const originalDocRemove = document.removeEventListener;

  beforeAll(() => {
    // 补齐 JSDOM 中缺失的 scrollIntoView 方法，防止 translate.js 抛错
    Element.prototype.scrollIntoView = vi.fn();

    // 拦截 window.addEventListener/removeEventListener，专门计数 resize 监听器
    window.addEventListener = function(type, listener, options) {
      if (type === 'resize') {
        activeWindowResizeListeners++;
      }
      originalWindowAdd.call(window, type, listener, options);
    };
    window.removeEventListener = function(type, listener, options) {
      if (type === 'resize') {
        activeWindowResizeListeners--;
      }
      originalWindowRemove.call(window, type, listener, options);
    };

    // 拦截 document.addEventListener/removeEventListener，计数 click 和 keydown 监听器
    document.addEventListener = function(type, listener, options) {
      if (type === 'click') {
        activeDocumentClickListeners++;
      }
      if (type === 'keydown') {
        activeDocumentKeydownListeners++;
      }
      originalDocAdd.call(document, type, listener, options);
    };
    document.removeEventListener = function(type, listener, options) {
      if (type === 'click') {
        activeDocumentClickListeners--;
      }
      if (type === 'keydown') {
        activeDocumentKeydownListeners--;
      }
      originalDocRemove.call(document, type, listener, options);
    };
  });

  afterAll(() => {
    // 恢复原始方法，防止污染全局
    window.addEventListener = originalWindowAdd;
    window.removeEventListener = originalWindowRemove;
    document.addEventListener = originalDocAdd;
    document.removeEventListener = originalDocRemove;
  });

  beforeEach(() => {
    // 每次测试前准备好 router 渲染需要的 DOM 节点
    document.body.innerHTML = `
      <div class="app-container">
        <header id="header">
          <h1 id="logo">ParaTranz AI</h1>
        </header>
        <main id="router-view"></main>
      </div>
    `;
  });

  const wait = (ms = 50) => new Promise(resolve => setTimeout(resolve, ms));

  it('模拟来回切换 translate 和 settings 页面 10 次以上，验证 resize 监听器没有持续增长且最终能清空', async () => {
    const initialResizeCount = activeWindowResizeListeners;

    // 模拟多次来回导航
    for (let i = 0; i < 12; i++) {
      navigate('/translate?projectId=99&fileId=123', true);
      await wait(100);
      
      // resize 监听器应当被添加（或保持最新的 1 个）
      expect(activeWindowResizeListeners).toBeLessThanOrEqual(initialResizeCount + 1);

      navigate('/settings', true);
      await wait(100);
      
      // 导航到 settings 后，translate 页面应被销毁，resize 监听器应归零/恢复到初始状态
      expect(activeWindowResizeListeners).toBe(initialResizeCount);
    }
  });

  it('在 settings 页面中多次获取模型列表（产生 document 外部 click 监听器），切换页面后验证无残留', async () => {
    const initialClickCount = activeDocumentClickListeners;

    navigate('/settings', true);
    await wait(100);

    // 此时应该还没有触发 document click 监听器（未点击获取模型列表）
    expect(activeDocumentClickListeners).toBe(initialClickCount);

    // 模拟多次触发“获取模型列表”点击（分别在四个面板）
    const ids = ['main', 'embed', 'filter', 'rerank'];
    for (const id of ids) {
      const fetchBtn = document.getElementById(`btn-fetch-${id}`);
      if (fetchBtn) {
        fetchBtn.click();
        await wait(10);
      }
    }

    // 每一个面板获取成功后，都会在 document 上绑定一个外部 click 监听器
    // 理论上此时 active click 监听器数量应该增加了
    const peakClickCount = activeDocumentClickListeners;
    expect(peakClickCount).toBeGreaterThan(initialClickCount);

    // 再次点击同一个面板，不应该无限累加
    const firstFetchBtn = document.getElementById('btn-fetch-main');
    if (firstFetchBtn) {
      firstFetchBtn.click();
      await wait(10);
    }
    expect(activeDocumentClickListeners).toBe(peakClickCount); // 数量应保持一致，不应累加

    // 导航走（触发销毁）
    navigate('/translate?projectId=99&fileId=123', true);
    await wait(100);

    // 验证所有的 document click 监听器已被全部销毁，恢复到初始计数
    expect(activeDocumentClickListeners).toBe(initialClickCount);
  });

  it('关闭校验弹窗：测试“再检查一下”、“继续”、“X”按钮、点击遮罩、按 ESC，所有路径下 document.keydown 均不泄露', async () => {
    const initialKeydownCount = activeDocumentKeydownListeners;
    const dummyIssues = [{ title: '测试问题', message: '内容', details: [], category: 'whitespace' }];

    // 1. 路径 A：点击“再检查一下”按钮关闭
    let promise = showValidationModal(dummyIssues);
    expect(activeDocumentKeydownListeners).toBe(initialKeydownCount + 1);
    document.getElementById('validation-btn-recheck').click();
    await promise;
    await wait(200); // 弹窗有 150ms 延迟淡出和 remove
    expect(activeDocumentKeydownListeners).toBe(initialKeydownCount);

    // 2. 路径 B：点击“继续”按钮关闭
    promise = showValidationModal(dummyIssues);
    expect(activeDocumentKeydownListeners).toBe(initialKeydownCount + 1);
    document.getElementById('validation-btn-continue').click();
    await promise;
    await wait(200);
    expect(activeDocumentKeydownListeners).toBe(initialKeydownCount);

    // 3. 路径 C：点击右上方“X”关闭
    promise = showValidationModal(dummyIssues);
    expect(activeDocumentKeydownListeners).toBe(initialKeydownCount + 1);
    document.getElementById('validation-modal-close').click();
    await promise;
    await wait(200);
    expect(activeDocumentKeydownListeners).toBe(initialKeydownCount);

    // 4. 路径 D：点击遮罩层关闭
    promise = showValidationModal(dummyIssues);
    expect(activeDocumentKeydownListeners).toBe(initialKeydownCount + 1);
    const overlay = document.getElementById('validation-modal-overlay');
    overlay.click();
    await promise;
    await wait(200);
    expect(activeDocumentKeydownListeners).toBe(initialKeydownCount);

    // 5. 路径 E：按下 ESC 键关闭
    promise = showValidationModal(dummyIssues);
    expect(activeDocumentKeydownListeners).toBe(initialKeydownCount + 1);
    const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(escEvent);
    await promise;
    await wait(200);
    expect(activeDocumentKeydownListeners).toBe(initialKeydownCount);
  });
});
