# Handoff Report — ParaTranz AI 工作台重构需求调查

## 1. Observation (直接观察)

通过静态代码分析与测试执行，获得了以下确切的运行及代码现状观察：

- **测试运行**：在 `c:\Users\31029\Documents\GitHub\paratranzTool` 运行 `npm run test`，输出包含：
  > `Test Files  6 passed (6)`
  > `Tests  25 passed (25)`
  全部用例通过。

- **全局事件监听泄漏**：
  - `src/pages/translate.js` 第 438 行：`window.addEventListener('resize', () => autoResizeTextarea(textTranslation));` 随着页面切换未卸载。
  - `src/components/validationModal.js` 第 164 行：`document.addEventListener('keydown', handleEsc);` 而在点击关闭按钮的 141 行 `cleanup` 内部仅删除了 DOM 覆盖层，并未移除该 `keydown` 全局事件监听。
  - `src/pages/settings.js` 第 347 行：在动态请求模型并生成下拉菜单时绑定了 `document.addEventListener('click', (e) => { ... })`，没有反绑定及回收机制。

- **高亮二次匹配污染**：
  - `src/pages/translate.js` 第 866 行：
    `res = res.replace(termExp, \`<span style="color: var(--accent-color); font-weight: 500; cursor: help; border-bottom: 1px dashed var(--accent-color);" title="\${escapeHtml(t.translation||'')}">\$&</span>\`);`
    其中直接生成了含有 HTML 属性词（如 `span`, `style`, `color`）的文本。

- **本地存储与 TM (翻译记忆) 机制**：
  - `src/utils/storage.js` 第 83 行：
    `const key = \`pt_tm_\${projectId}\`; const data = localStorage.getItem(key);`
    `src/utils/storage.js` 第 95 行：
    `localStorage.setItem(\`pt_tm_\${projectId}\`, JSON.stringify(tm));`
    TM 存储依然存放在 `localStorage`（受 5MB 的物理空间上限限制，并且大体积 JSON 序列化极易引起长任务卡顿）。

- **API 术语拉取硬编码限制**：
  - `src/api/paratranz.js` 第 85 行：
    `const res = await this._request(\`/projects/\${projectId}/terms?page=1&pageSize=500\`); return res.results;`
    硬编码拉取第一页及 500 条最大限制。

---

## 2. Logic Chain (逻辑链)

1. **路由切换与全局泄漏**：由于单页应用中 `window` 与 `document` 在路由发生哈希切换时不会销毁，页面重新渲染时绑定的旧全局事件监听器就会发生残留（由 Observation 中的行号可确切定位），导致闭包引用了旧页面的 DOM 变量，令垃圾回收器（GC）无法释放旧页面的内存。所以，**必须在路由切换逻辑中引入生命周期销毁（destroy/unmount）钩子，并在全局弹窗关闭时即刻自我解绑**。
2. **术语高亮损坏 HTML 标签**：在 `highlightTerms` 中，若按顺序先后匹配多个术语，先匹配生成的带有 `style="color: var(--accent-color);"` 属性的 span 标签中必然包含 `style`, `color`, `span` 等单词。若后面的术语包含上述属性名，其对应的正则将直接匹配并修改已生成的属性串（如 Observation 中第 866 行），导致 HTML 标签的属性损坏、嵌套失效。所以，**必须在匹配阶段采用中性的非敏感占位符（如 Unicode 非字符 `\uFDD0_{i}`）做占位过渡，待术语正则完全匹配后再反向一次性还原 HTML**。
3. **localStorage 容量危机与 IndexedDB 批量事务**：由于 `localStorage` 具有 5MB 上限限制，随着 TM 条目的增加，极易触发 `QuotaExceededError` 引发系统崩溃（如 Observation 中 storage.js 的读取与写入逻辑所示）。由于 IndexedDB 读写事务开启有较明显的 I/O 开销，且 Qdrant 批量上传可极大加速同步过程，因此需要：
   - 将 TM 数据迁移到 IndexedDB（定义 `translation_memory` 表，使用 `${projectId}::${original}` 联合主键）；
   - 在 `VectorStore` 中增加 `setEmbeddingsBatch` 批量处理 API，将原来 `N` 次写入事务和网络请求优化为 1 次，保证性能。
4. **全量术语分页逻辑**：硬编码的 500 条限制（如 Observation 中 `paratranz.js` 第 85 行）导致长术语表的后续术语全部无法同步。为此需借鉴已验证通过的 `getStrings` 循环分页机制，以 `results.length < pageSize` 为终止条件，通过 `while` 循环拉取所有页的术语并返回。

---

## 3. Caveats (注意事项)

- **网络连接**：本调查在 CODE_ONLY 模式下进行，未对 Qdrant 远端向量服务的真实并发性能进行极限压测。
- **存储向后兼容**：localStorage 的 TM 数据迁移必须是一次性且安全的，迁移后立即删除旧 key 防重复迁移，必须保证迁移时数据类型的转换正确。

---

## 4. Conclusion (结论)

ParaTranz AI 工作台目前处于功能完备状态（25 项测试全通），但存在数个致命的健壮性隐患（全局事件泄漏导致的 DOM 挂载溢出、HTML 正则属性污染导致 DOM 树崩溃、localStorage 空间不足导致 TM 丢失或奔溃、术语表只截取前 500 条）。

本重构分析给出了全面的、可落地的重构设计代码（参见 analysis.md）。重构后将极大提升系统在大型游戏项目中的翻译稳定性、术语准确度及内存健康度。

---

## 5. Verification Method (验证方法)

1. **测试运行验证**：
   在重构完成后，在根目录下运行：
   `npm run test`
   检查所有的 6 个测试文件、25 个测试用例以及新增的测试用例是否顺利通过，是否存在回归缺陷。
2. **内存泄漏验证**：
   - 在 Chrome 开发者工具的 `Performance` 或 `Memory` 中，反复在 `/projects` 和 `/translate`、`/settings` 等页面来回切换 20 次以上，拍摄 `Heap Snapshot`。
   - 过滤搜索是否有残留的 `HTMLTextAreaElement` (针对 `textTranslation` 泄漏) 或 `HTMLDivElement`，以证明 `destroy` 钩子已成功注销 `resize` 和 `click` 等全局监听器。
3. **HTML 污染测试用例**：
   - 在术语表中加入 "style"、"color" 和 "span" 等三个术语。
   - 打开翻译工作台，输入待翻文本："The style color is bright, please span it."
   - 验证高亮后，原文区域是否正确高亮了这三个单词，且 DOM 节点结构完全正确（不存在破碎、属性值嵌套污染或显示错乱的问题）。
