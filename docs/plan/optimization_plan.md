# ParaTranz AI 项目代码审查与优化建议报告

通过对项目全局代码库的审查，我们发现了几处影响**系统性能**、**内存安全**以及**页面渲染正确性**的关键隐患与待优化点。以下是详细的代码审查分析与优化方案设计。

---

## 1. 核心问题分析与危害

### 🚨 问题 1: 全局事件绑定泄露导致内存严重流失 (Memory Leak)
* **位置**：
  * [src/pages/translate.js](file:///c:/Users/31029/Documents/GitHub/paratranzTool/src/pages/translate.js#L438)：`window.addEventListener('resize', () => autoResizeTextarea(textTranslation))`
  * [src/pages/settings.js](file:///c:/Users/31029/Documents/GitHub/paratranzTool/src/pages/settings.js#L347-L350)：`document.addEventListener('click', (e) => { ... })`
  * [src/components/validationModal.js](file:///c:/Users/31029/Documents/GitHub/paratranzTool/src/components/validationModal.js#L164)：`document.addEventListener('keydown', handleEsc)`
* **危害分析**：
  * 本项目采用 Vanilla JS + Hash 路由的无刷新单页架构。当路由发生切换时，原页面的 DOM 节点被销毁，但在 `window` 和 `document` 上绑定的匿名事件监听器并未解绑，导致老页面的 DOM 树因闭包引用无法被垃圾回收 (GC) 释放。
  * 特别是 `validationModal` 中，每次点击按钮关闭弹窗，均没有移除键盘 ESC 的 `keydown` 监听器，随着弹窗反复打开关闭，`keydown` 监听器会无限累积，造成严重内存流失。

### 🚨 问题 2: 术语匹配高亮机制存在破坏 HTML 标记的隐患
* **位置**：[src/pages/translate.js](file:///c:/Users/31029/Documents/GitHub/paratranzTool/src/pages/translate.js#L854-L868) 中的 `highlightTerms` 函数。
* **危害分析**：
  * 当前实现逻辑为：先将原文 `escapeHtml` 得到 HTML 字符串，接着按顺序对每个术语应用正则，将其替换为包含 `<span style="..." title="...">...</span>` 的标签片段。
  * **风险**：如果术语库中包含常见的 HTML 属性名称（如 `style`, `span`, `color`, `weight`, `title`），或者如果术语本身包含 `&`、`<` 等已转义实体字符，后面的匹配规则就会把前面已经被包装过的 HTML 标记字符串**再次二次匹配和替换**，导致生成的 HTML 损坏，页面渲染崩溃或展示错乱。

### 🚨 问题 3: 批量向量同步时 IndexedDB 事务过于频繁，性能极低
* **位置**：[src/utils/rag.js](file:///c:/Users/31029/Documents/GitHub/paratranzTool/src/utils/rag.js#L131-L135) 在同步处理向量时逐条调用 `VectorStore.setEmbedding`。
* **危害分析**：
  * 在 RAG 同步阶段，一次向量化多达上百甚至上千个词条。当前代码在循环里逐条 `await VectorStore.setEmbedding(id, ...)`。而此函数每次执行都会发起一次独立的 IndexedDB 写事务 (`readwrite`)，导致在单线程的 JS 主线程中产生严重的 I/O 阻塞，用户界面会在同步期间产生明显的顿卡。

### 🚨 问题 4: 翻译记忆库 (TM) 使用 localStorage 面临 5MB 容量上限
* **位置**：[src/utils/storage.js](file:///c:/Users/31029/Documents/GitHub/paratranzTool/src/utils/storage.js#L80-L101) 
* **危害分析**：
  * 翻译记忆库的数据量（原文到译文的映射）会随着用户的操作不断膨胀。`localStorage` 有 5MB 限制。对于长线大型汉化项目，TM 的大小极易突破限额，触发浏览器的 `QuotaExceededError` 异常，进而导致所有系统配置丢失且无法保存任何新配置。

### ⚠️ 问题 5: 本地向量相似度检索没有移入 Web Worker
* **位置**：[src/utils/vectorStore.js](file:///c:/Users/31029/Documents/GitHub/paratranzTool/src/utils/vectorStore.js#L301-L321) 的 `searchLocalSimilar`。
* **危害分析**：
  * 本地相似度计算采用 JavaScript 的 for 循环进行余弦计算并全部排序。当本地累积词条达到 5000+ 条以上时，高达几千维度向量的频繁浮点数乘加计算会导致主线程瞬间卡顿（几十到上百毫秒），用户输入和界面响应产生明显的不跟手。

### ⚠️ 问题 6: 术语同步只拉取第一页 (限制了 500 条)
* **位置**：[src/api/paratranz.js](file:///c:/Users/31029/Documents/GitHub/paratranzTool/src/api/paratranz.js#L84-L87) 的 `getTerms` 方法。
* **危害分析**：
  * 固定的 `pageSize=500` 限制了在大型项目中超出 500 条以上的术语无法被加载和展示。

---

## 2. 优化方案设计

### 🛠 方案 1: 为路由及页面引入生命周期销毁机制 (Page Destroy Hook)
1. **路由重构**：修改 [src/router.js](file:///c:/Users/31029/Documents/GitHub/paratranzTool/src/router.js#L28-L46)，支持跟踪 `render` 返回的卸载/清理回调函数（`destroy`）。在每次切换新页面时，自动执行上一个页面的 `destroy`。
2. **页面重构**：
   * 让 `translate.js` 和 `settings.js` 的 `render` 函数返回一个 `destroy` 清理函数。
   * 在销毁函数中注销全局监听器，例如：`window.removeEventListener('resize', resizeHandler)` 和 `document.removeEventListener('click', clickHandler)`。
3. **弹窗修复**：在 `validationModal.js` 的 `cleanup` 中强制执行 `document.removeEventListener('keydown', handleEsc)`。

### 🛠 方案 2: 基于占位符还原法的术语匹配高亮算法 (Placeholder-Based Term Highlighter)
1. **替换为占位符**：匹配时不再直接生成 `<span ...>` 标记，而是用类似于 `\x00__TERM_${i}__\x01` 的二进制特殊边界字符标记替换原文中的术语。
2. **安全转义**：对含有占位符的文本进行常规的 `escapeHtml` 替换（占位符不包含 HTML 特殊字符，所以不会被转义破坏）。
3. **逆向还原**：转义完成后，将所有的占位符 `\x00__TERM_${i}__\x01` 批量还原替换为高亮 HTML 片段 `<span style="..." title="${translation}">${originalMatchedText}</span>`。
4. 这样术语匹配高亮阶段永远不会污染自身，完全避免 HTML 标签二次匹配。

### 🛠 方案 3: 新增 IndexedDB 批量保存向量和批量保存 TM 的机制
1. **IndexedDB 拓展**：在 `VectorStore` 中增加 `setEmbeddingsBatch(items)` 批量写入接口。在同一个 `readwrite` 事务中遍历更新所有向量，将多次写事务合并为单次，极大提升 RAG 同步速度。
2. **翻译记忆 TM 迁移**：在 IndexedDB 中增加 `tm_store` 数据库仓库。将 `storage.js` 中的 TM 读写逻辑全面替换为对该仓库的异步访问，彻底解决容量超出限制的隐患。

### 🛠 方案 4: 术语分页同步与文件并发同步
1. 优化 `getTerms` 方法，让其支持像 `getStrings` 那样通过循环拉取所有页码的术语。
2. 优化 `syncCorpus` 文件拉取，在不突破 API 频控上限的前提下引入 `Promise.all` + 批并发限制机制。

---

## 3. 推荐实施计划与验证方案

我们准备首先解决最急迫的**内存泄露、弹窗死锁漏洞以及术语高亮破坏 HTML 结构**问题，随后升级 **IndexedDB 批量写与 TM 仓库迁移**。

### 自动测试计划
- 运行 Vitest 单元测试：`npm run test` / `npx vitest`
- 针对 `validationModal` 的 `keydown` 移除添加单元测试。
- 针对 `highlightTerms` 多轮嵌套匹配场景（例如当词条包含 `style`、`color` 时）编写新测试，确保 HTML 标签不被污染破坏。

### 手动验证计划
- 连续来回切换“设置页”、“翻译工作台”、“项目页” 10 次，在浏览器开发者工具 (Performance/Memory) 的 "JS Heap" 中监视堆大小，确认无 DOM 节点残留。
- 打开带有 LQA 警告的翻译并关闭，多次按键并查看 document listeners 控制台，确认 keydown 监听数不增长。
