# 重构与优化执行计划

## 第一阶段：里程碑 1 - 路由生命周期与事件解绑
- 目标：解决 `window.resize`、`document.keydown`、`document.click` 事件监听器在切换页面或关闭弹窗时没有卸载的问题。
- 执行方案：
  - 指派 `teamwork_preview_worker` 执行。
  - 修改 `src/router.js`，保存上一个页面引用的 `module` 并触发其 `destroy` 方法。
  - 在 `src/pages/translate.js` 中增加 `destroy` 接口并移除 `resize` 监听器。
  - 在 `src/pages/settings.js` 中增加 `destroy` 接口并移除所有动态注册 of `click` 监听器。
  - 在 `src/components/validationModal.js` 中的 `cleanup` 方法里，无论通过何种方式关闭弹窗，都必须调用 `removeEventListener('keydown', handleEsc)`。
  - 编写 `src/router.test.js` 或新增测试来验证连续切换页面 10 次以上，window 和 document 上的事件监听器没有泄漏，且 `validationModal` 的 keydown 被注销。
- 验收指标：运行测试全过；手动来回切换页面，全局监听器数量正常。

## 第二阶段：里程碑 2 - 术语高亮匹配逻辑重构 (占位符还原法)
- 目标：重新实现 `highlightTerms`，使用中性的 Unicode 非字元（如 `\uFDD0_{i}`）做替换占位，替换完成后统一还原 HTML。
- 执行方案：
  - 指派 `teamwork_preview_worker` 执行。
  - 修改 `src/pages/translate.js` 中的 `highlightTerms` 函数。
  - 编写针对该高亮逻辑的单元测试，并在测试中加入包含 style、color、span、title 等作为术语名称的用例，确保生成的 DOM 不会崩坏。
- 验收指标：测试通过；特异术语高亮后 DOM 结构完好。

## 第三阶段：里程碑 3 - IndexedDB 批量保存向量与翻译记忆库优化
- 目标：将 TM 迁移至 IndexedDB，避免 localStorage 容量爆满；实现单事务的向量批量保存 `setEmbeddingsBatch`，并合并 Qdrant 上传请求。
- 执行方案：
  - 指派 `teamwork_preview_worker` 执行。
  - 修改 `src/utils/vectorStore.js` 中的数据库初始化（`openDB`），将版本号升级为 2，并添加 `translation_memory` 表。
  - 实现 `setEmbeddingsBatch(list)` API。
  - 实现 `saveTM`、`searchTM` 和 `migrateTMToIndexedDB` 逻辑。
  - 在 `src/utils/storage.js` 中，重构 `getTM` 和 `saveTM` 逻辑，改为调用 IndexedDB 接口，并在系统初始化（如 `src/main.js` 或相关地方）自动调用迁移。
  - 编写或更新对应的单元测试。
- 验收指标：迁移测试及批量保存测试通过；localStorage 释放。

## 第四阶段：里程碑 4 - 支持全量同步术语
- 目标：解除 `getTerms` 单页 500 条的限制，支持自动分页拉取。
- 执行方案：
  - 指派 `teamwork_preview_worker` 执行。
  - 重构 `src/api/paratranz.js` 的 `getTerms` 方法，加入 `while` 循环分页。
  - 编写测试用例验证分页逻辑正常（模拟返回多页数据，验证能够拉取完全）。
- 验收指标：测试通过；大于500条术语的项目拉取成功。

## 第五阶段：全量集成与 E2E 验证 (Milestone 5)
- 目标：整体回归测试，并运行 Forensic Audit 确保存真与质量。
- 执行方案：
  - 运行 `npm test`。
  - 启动 Challenger 测试。
  - 启动 Forensic Auditor 审计。
- 验收指标：测试全绿，审计 verdicts 正常。
