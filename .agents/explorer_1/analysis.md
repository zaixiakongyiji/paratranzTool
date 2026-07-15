# ParaTranz AI 工作台重构需求调查报告

本报告全面调查了 ParaTranz AI 工作台目前的重构需求。我们通过源码阅读与测试运行，分析了系统目前的内存泄漏隐患、HTML 渲染污染问题、本地存储容量危机与 API 分页限制，并针对每个问题给出了具体的重构设计方案。

---

## 1. 测试运行结果记录

在项目根目录（`c:\Users\31029\Documents\GitHub\paratranzTool`）下运行了 `npm run test`，测试使用 Vitest 框架。

### 1.1 测试运行输出
```text
> paratranz-tool@0.0.0 test
> vitest run


 RUN  v4.1.7 C:/Users/31029/Documents/GitHub/paratranzTool

 ✓ src/utils/validation.test.js (19 tests) 22ms
 ✓ src/api/paratranz.test.js (2 tests) 10ms
 ✓ src/router.test.js (1 test) 51ms
stderr | src/utils/vectorStore.test.js > VectorStore > falls back to local embeddings when Qdrant search fails
Qdrant 检索失败: Error: qdrant down
    at C:/Users/31029/Documents/GitHub/paratranzTool/src/utils/vectorStore.test.js:48:47
    at file:///C:/Users/31029/Documents/GitHub/paratranzTool/node_modules/@vitest/runner/dist/chunk-artifact.js:1903:20

 ✓ src/utils/vectorStore.test.js (1 test) 55ms
 ✓ src/utils/rag.test.js (1 test) 82ms
 ✓ src/pages/files.test.js (1 test) 141ms

 Test Files  6 passed (6)
      Tests  25 passed (25)
   Start at  12:35:51
   Duration  4.64s (transform 357ms, setup 0ms, import 682ms, tests 360ms, environment 19.18s)
```

### 1.2 结果分析
- **测试覆盖**：共 6 个测试文件，25 个测试用例，全部顺利通过（`100% Pass Rate`）。
- **运行日志分析**：在运行 `src/utils/vectorStore.test.js` 时，有一条 stderr 输出 `Qdrant 检索失败: Error: qdrant down`，这属于预期的降级测试用例（测试在 Qdrant 挂掉时是否能回退到本地向量库检索），并非实际报错。

---

## 2. 路由与事件解绑分析

在单页应用（SPA）中，由于 `window` 和 `document` 是全局唯一的，如果在页面渲染时往其上绑定了监听器，而未在离开页面时进行解绑，就会产生严重的内存泄漏。

### 2.1 全局事件监听器现状与泄漏点定位

调查发现，目前有 3 处核心的全局事件泄漏点：

#### 泄漏点 1：`src/pages/translate.js` — `window.resize` 泄漏
在翻译页面初始化时，为输入框的自适应高度绑定了 resize 事件：
```javascript
// src/pages/translate.js Line 438
window.addEventListener('resize', () => autoResizeTextarea(textTranslation));
```
- **原因**：切换到其他路由（如 `/settings`）时，该监听器仍然附加在 `window` 对象上。由于闭包内引用了 `textTranslation`（旧页面的 DOM 节点），垃圾回收器（GC）无法回收该节点及其关联的整个翻译页面作用域，导致严重内存泄漏。

#### 泄漏点 2：`src/components/validationModal.js` — `document.keydown` 泄漏
在保存翻译前的校验弹窗中，为支持 ESC 键关闭，绑定了 keydown 事件：
```javascript
// src/components/validationModal.js Line 164
const handleEsc = (e) => {
  if (e.key === 'Escape') {
    document.removeEventListener('keydown', handleEsc);
    cleanup(false);
  }
};
document.addEventListener('keydown', handleEsc);
```
- **原因**：当用户通过点击弹窗上的按钮（“确定”、“取消”等）来关闭弹窗时，触发的是第 141 行的 `cleanup` 函数：
```javascript
const cleanup = (result) => {
  overlay.style.opacity = '0';
  overlay.style.transition = 'opacity 0.15s ease';
  setTimeout(() => overlay.remove(), 150);
  resolve(result);
};
```
在 `cleanup` 内部**没有**调用 `document.removeEventListener('keydown', handleEsc)`。这导致只要用户不是按 `ESC` 键关闭弹窗，该 `handleEsc` 监听器就会永久残留在 `document` 上。当弹窗反复被打开、关闭，残留的监听器将会不断累加。

#### 泄漏点 3：`src/pages/settings.js` — `document.click` 泄漏
在系统设置页中，用于点击下拉菜单外部关闭模型选择：
```javascript
// src/pages/settings.js Line 347
document.addEventListener('click', (e) => {
  const wrapper = document.getElementById(`model-wrapper-${id}`);
  if (wrapper && !wrapper.contains(e.target)) dropdown.style.display = 'none';
});
```
- **原因**：如果在离开设置页面或者反复点击“获取模型”按钮生成新下拉菜单时，没有主动移除该点击监听器，就会不断在 `document` 上注册相同的回调，且由于闭包引用了 `dropdown` DOM，导致 DOM 无法释放。

---

### 2.2 重构方案：生命周期销毁钩子设计

为了解决跨页面和组件的事件泄漏，需要在路由中引入页面级生命周期销毁钩子。

#### 1. 改造 `src/router.js` 以支持 `destroy`
在 `navigate` 切换页面时，记录并调用上一个页面的 `destroy` 函数：

```javascript
// src/router.js
let currentPageModule = null; // 记录当前页面的模块引用

export async function navigate(path, fromHashChange = false) {
  if (location.hash.slice(1) !== path && !fromHashChange) {
    location.hash = path;
    return;
  }

  const [pathname, queryString] = path.split('?');
  const query = new URLSearchParams(queryString || '');
  
  // 1. 在渲染新页面前，触发上一个页面的销毁钩子
  if (currentPageModule && typeof currentPageModule.destroy === 'function') {
    try {
      currentPageModule.destroy();
    } catch (e) {
      console.error('页面销毁失败:', e);
    }
  }

  document.body.classList.remove('translate-mode');
  const routerView = document.getElementById('router-view');
  routerView.innerHTML = `<div style="text-align:center; padding: 2rem;">加载中...</div>`;
  
  const routes = {
    '/projects': { load: () => import('./pages/projects.js') },
    '/files': { load: () => import('./pages/files.js') },
    '/translate': { load: () => import('./pages/translate.js') },
    '/terms': { load: () => import('./pages/terms.js') },
    '/glossary': { load: () => import('./pages/glossary.js') },
    '/settings': { load: () => import('./pages/settings.js') }
  };

  const route = routes[pathname];
  if (route) {
    try {
      const module = await route.load();
      currentPageModule = module; // 保存引用
      module.render(routerView, query);
    } catch (e) {
      routerView.innerHTML = `<h2>加载失败</h2><p>${e.message}</p>`;
    }
  } else {
    currentPageModule = null;
    routerView.innerHTML = `<h2>404</h2><p>未找到页面: ${path}</p>`;
  }
}
```

#### 2. 实现各页面的 `destroy` 钩子

- **`src/pages/translate.js` 改造**：
```javascript
let resizeHandler = null;

export async function render(container, query) {
  // ...
  const textTranslation = document.getElementById('text-translation');
  
  // 保存处理函数引用
  resizeHandler = () => autoResizeTextarea(textTranslation);
  window.addEventListener('resize', resizeHandler);
}

// 暴露出 destroy 钩子
export function destroy() {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
    resizeHandler = null;
  }
}
```

- **`src/pages/settings.js` 改造**：
```javascript
const activeClickHandlers = new Set();

// 每次绑定 document 点击事件时：
const handler = (e) => {
  const wrapper = document.getElementById(`model-wrapper-${id}`);
  if (wrapper && !wrapper.contains(e.target)) dropdown.style.display = 'none';
};
document.addEventListener('click', handler);
activeClickHandlers.add(handler);

// 暴露出 destroy 钩子
export function destroy() {
  activeClickHandlers.forEach(handler => {
    document.removeEventListener('click', handler);
  });
  activeClickHandlers.clear();
}
```

#### 3. 修复 `src/components/validationModal.js`
直接在内部的 `cleanup` 中完成自我清理，因为弹窗的生命周期是短暂的：
```javascript
export function showValidationModal(issues) {
  return new Promise((resolve) => {
    // ...
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        cleanup(false);
      }
    };
    document.addEventListener('keydown', handleEsc);

    const cleanup = (result) => {
      // 必须在这里卸载 keydown 监听器！
      document.removeEventListener('keydown', handleEsc);
      
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.15s ease';
      setTimeout(() => overlay.remove(), 150);
      resolve(result);
    };
    
    // ...
  });
}
```

---

## 3. 术语高亮逻辑分析

### 3.1 渲染污染与标签损坏漏洞分析

在 `src/pages/translate.js` 中，匹配术语并高亮呈现的逻辑如下：
```javascript
// src/pages/translate.js Line 854
function highlightTerms(text, terms) {
  if (!terms || terms.length === 0) return escapeHtml(text);
  let res = escapeHtml(text);
  
  const sortedTerms = [...terms].sort((a, b) => (b.term || '').length - (a.term || '').length);
  
  sortedTerms.forEach(t => {
    const termExp = buildTermRegex(t);
    if (!termExp) return;
    
    // 漏洞所在：直接将匹配词替换为带有 HTML 标签的内容
    res = res.replace(termExp, `<span style="color: var(--accent-color); font-weight: 500; cursor: help; border-bottom: 1px dashed var(--accent-color);" title="${escapeHtml(t.translation||'')}">$&</span>`);
  });
  return res;
}
```
- **漏洞表现**：
  如果第一个术语被替换成了 HTML 标签之后，生成的标签中包含了属性如 `style="..."`, `color`, `span`。
  当循环进入下一个术语时，如果下一个术语恰好包含 `"style"`、`"span"` 或 `"color"` 等单词，正则表达式就会错误地匹配并替换**上一次循环生成的 HTML 属性字眼**。
  - *示例*：原文包含 `"style"` 这一术语。替换第一个术语后文本为 `<span style="color:...">word</span>`。第二次循环匹配 `"style"`，文本将被污染为：`<span <span style="... (高亮嵌套) ...">style</span>="color:...">word</span>`，导致页面 DOM 彻底崩溃，样式破坏，展示混乱。

---

### 3.2 重构方案：占位符还原法

占位符还原法的核心思路为：
1. **替换为特有占位符**：匹配术语时，先不生成 HTML，而是用一个不包含任何敏感英文字母的特有字符串占位（如 `\uFDD0_{index}` 或 `[__TERM_PLACEHOLDER_${index}__]`），并在闭包中记录匹配到的原文。
2. **反向批量替换**：在所有术语完成匹配后，再将这些特有的占位符一次性替换成带样式的 HTML，避开匹配器的干扰。

```javascript
function highlightTerms(text, terms) {
  if (!terms || terms.length === 0) return escapeHtml(text);
  let res = escapeHtml(text);
  
  // 1. 按照术语长度从长到短排序，防止长词被截断
  const sortedTerms = [...terms].sort((a, b) => (b.term || '').length - (a.term || '').length);
  
  const replacements = [];
  
  sortedTerms.forEach((t, i) => {
    const termExp = buildTermRegex(t);
    if (!termExp) return;
    
    res = res.replace(termExp, (matched) => {
      const placeholder = `\uFDD0_${replacements.length}`; // \uFDD0 为非字符（Noncharacter），安全无冲突
      const html = `<span style="color: var(--accent-color); font-weight: 500; cursor: help; border-bottom: 1px dashed var(--accent-color);" title="${escapeHtml(t.translation || '')}">${escapeHtml(matched)}</span>`;
      
      replacements.push({ placeholder, html });
      return placeholder;
    });
  });
  
  // 2. 全部匹配处理完成后，进行反向还原
  replacements.forEach(r => {
    res = res.replaceAll(r.placeholder, r.html);
  });
  
  return res;
}
```

---

## 4. IndexedDB 批量保存与 TM 迁移

### 4.1 批量写入向量 API 设计

在 `vectorStore.js` 中，原有的 `setEmbedding` 是单条写入的，它包含了对 Qdrant 的网络通信和对 IndexedDB 写事务的开启：
```javascript
// 单条写入在面对 1000+ 条同步数据时，会造成 1000 次 HTTP 请求和 1000 次 IndexedDB 事务提交，性能极差
async setEmbedding(id, embedding, modelName) { ... }
```

我们设计了批量更新 API `setEmbeddingsBatch`，以减少 I/O 损耗：

```javascript
// src/utils/vectorStore.js 新增
export const VectorStore = {
  // ...
  async setEmbeddingsBatch(list) {
    if (!list || list.length === 0) return;
    const settings = Storage.getSettings();
    const db = await openDB();

    // 1. 批量读取出数据库中的现有条目，使用只读事务
    const txRead = db.transaction(STORE_NAME, 'readonly');
    const storeRead = txRead.objectStore(STORE_NAME);
    const itemsMap = new Map();
    
    await Promise.all(list.map(item => {
      return new Promise((resolve, reject) => {
        const req = storeRead.get(item.id);
        req.onsuccess = () => {
          if (req.result) itemsMap.set(item.id, req.result);
          resolve();
        };
        req.onerror = () => reject(req.error);
      });
    }));

    // 2. Qdrant 批量上传（极其重要：合并为一次网络请求）
    if (settings.qdrantEnabled && settings.qdrantUrl) {
      const { QdrantClient } = await import('../api/qdrant.js');
      const points = [];
      
      for (const reqItem of list) {
        const item = itemsMap.get(reqItem.id);
        if (item) {
          points.push({
            id: item.id,
            vector: Array.from(reqItem.embedding),
            payload: {
              projectId: item.projectId,
              fileId: item.fileId,
              fileName: item.fileName,
              original: item.original,
              translation: item.translation,
              stage: item.stage
            }
          });
        }
      }

      if (points.length > 0) {
        try {
          await QdrantClient.upsertPoints(settings.qdrantUrl, settings.qdrantApiKey, points);
        } catch (e) {
          console.error("Qdrant 批量写入失败:", e);
          throw e;
        }
      }
    }

    // 3. 本地批量写入事务
    const txWrite = db.transaction(STORE_NAME, 'readwrite');
    const storeWrite = txWrite.objectStore(STORE_NAME);
    
    for (const reqItem of list) {
      const item = itemsMap.get(reqItem.id);
      if (item) {
        item.embedding = Array.from(reqItem.embedding);
        item.embeddingModel = reqItem.modelName;
        item.hasEmbedding = 1;
        storeWrite.put(item);
      }
    }

    await new Promise((resolve, reject) => {
      txWrite.oncomplete = resolve;
      txWrite.onerror = () => reject(txWrite.error);
    });
  }
};
```

---

### 4.2 翻译记忆（TM）迁移方案

目前 `Storage.js` 中的 TM 采用 `localStorage` 进行直接持久化，随着项目和词条增多，会很容易逼近 `5MB` 浏览器上限，并可能阻塞 JS 主线程。

#### 1. IndexedDB 增加新存储仓库 `translation_memory`
提升数据库版本号 `DB_VERSION = 2`，在升级回调中创建 Store：
```javascript
// src/utils/vectorStore.js - openDB()
request.onupgradeneeded = (event) => {
  const db = event.target.result;
  
  if (!db.objectStoreNames.contains('translation_memory')) {
    // 联合唯一 key 格式：`${projectId}::${original}` 作为 id 保证无冲突
    db.createObjectStore('translation_memory', { keyPath: 'id' });
  }
};
```

#### 2. 在 `VectorStore` 实现对应的 TM 读写 API
```javascript
export const VectorStore = {
  // ...
  async saveTM(projectId, original, translation) {
    const db = await openDB();
    const tx = db.transaction('translation_memory', 'readwrite');
    const store = tx.objectStore('translation_memory');
    
    const id = `${projectId}::${original}`;
    store.put({
      id,
      projectId: String(projectId),
      original,
      translation,
      lastUpdated: Date.now()
    });
    
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async searchTM(projectId, original) {
    const db = await openDB();
    const tx = db.transaction('translation_memory', 'readonly');
    const store = tx.objectStore('translation_memory');
    
    const id = `${projectId}::${original}`;
    return new Promise((resolve, reject) => {
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result ? req.result.translation : null);
      req.onerror = () => reject(req.error);
    });
  }
};
```

#### 3. localStorage 历史数据自动迁移逻辑
系统初始化时，自动读取本地 `localStorage`，找出以 `pt_tm_` 开头的数据，迁移至 IndexedDB 后将其删除：

```javascript
// src/utils/vectorStore.js
export async function migrateTMToIndexedDB() {
  const keysToMigrate = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('pt_tm_')) {
      keysToMigrate.push(key);
    }
  }

  if (keysToMigrate.length === 0) return;

  const db = await openDB();
  for (const key of keysToMigrate) {
    const projectId = key.replace('pt_tm_', '');
    try {
      const storedData = localStorage.getItem(key);
      if (!storedData) continue;
      
      const tm = JSON.parse(storedData);
      const tx = db.transaction('translation_memory', 'readwrite');
      const store = tx.objectStore('translation_memory');
      
      for (const [original, record] of Object.entries(tm)) {
        const id = `${projectId}::${original}`;
        store.put({
          id,
          projectId: String(projectId),
          original,
          translation: record.translation,
          lastUpdated: record.lastUpdated || Date.now()
        });
      }
      
      await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });

      // 迁移成功后移除，防重复触发
      localStorage.removeItem(key);
      console.log(`项目 ${projectId} 的 TM 数据迁移完成。`);
    } catch (e) {
      console.error(`项目 ${projectId} TM 数据迁移失败:`, e);
    }
  }
}
```

---

## 5. 全量同步术语

目前在 `src/api/paratranz.js` 中拉取术语的方法硬编码了 500 条分页大小，不支持自动分页：
```javascript
// 原实现
async getTerms(projectId) {
  const res = await this._request(`/projects/${projectId}/terms?page=1&pageSize=500`);
  return res.results;
}
```
当项目的术语超过 500 条时，这会导致后文的所有术语漏拉，大幅削弱术语的识别率。

### 5.1 解决方案：分页循环拉取

我们应该利用 `while` 循环不断递增 `page` 并将结果合并返回，直到拉取回的结果长度小于单页最大上限（`pageSize = 500`），从而实现全量拉取。

```javascript
// src/api/paratranz.js 重构方案
async getTerms(projectId) {
  const pageSize = 500;
  const results = [];
  let page = 1;

  while (true) {
    const res = await this._request(`/projects/${projectId}/terms?page=${page}&pageSize=${pageSize}`);
    const pageResults = res.results || [];
    results.push(...pageResults);

    // 如果当前页返回的结果少于 pageSize，说明已经是最后一页，跳出循环
    if (pageResults.length < pageSize) {
      break;
    }
    page += 1;
  }

  return results;
}
```
该方案与已验证通过的 `getStrings` 全量同步逻辑一致，可以保证代码的健壮性。
