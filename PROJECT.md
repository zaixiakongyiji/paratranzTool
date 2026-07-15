# Project: ParaTranz AI 工作台重构与优化

## Architecture
- 核心框架：Vanilla JS + Vite + Vitest + JSDOM。
- 路由系统：基于 Hash 路由拦截（src/router.js），动态 import 渲染页面。
- 存储设计：localStorage（小数据配置） + IndexedDB（本地向量库 vector_store 与 翻译记忆 translation_memory）。

## Code Layout
- `src/router.js`: 路由与生命周期管理
- `src/pages/`: 页面组件，包括 `translate.js`（翻译工作台）、`settings.js`（设置）
- `src/components/validationModal.js`: 校验弹窗组件
- `src/utils/vectorStore.js`: 本地 IndexedDB 向量库与 TM 库
- `src/utils/storage.js`: 系统配置与本地临时存储
- `src/api/paratranz.js`: ParaTranz 官方 API 通信封装

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | 路由生命周期与事件解绑 | 修改 `router.js`，在 `translate.js`、`settings.js` 及 `validationModal.js` 中实现 `destroy` 与事件解绑。编写测试验证事件注销。 | None | DONE |
| 2 | 术语高亮匹配逻辑重构 | 重构 `translate.js` 中的高亮匹配，采用占位符还原法。编写测试验证当术语包含 style、color、span 等属性词时高亮无污染。 | None | DONE |
| 3 | IndexedDB 批量保存与 TM 迁移 | 数据库版本升级，增加 `translation_memory` 表，实现 `setEmbeddingsBatch` 批量 API，实现 `migrateTMToIndexedDB` 并在 `storage.js` 中接入。编写测试。 | None | DONE |
| 4 | 全量同步术语 | 改造 `getTerms` 方法支持分页循环，移除 500 条单页上限。编写测试。 | None | DONE |
| 5 | 全量集成与 E2E 验证 | 运行全部测试，进行 Challenger 健壮性审查与 Forensic Audit。 | M1, M2, M3, M4 | DONE |

## Interface Contracts
### `src/router.js`
- `currentPageModule.destroy()`: 在路由导航 `navigate` 切换之前被触发。
### `src/utils/vectorStore.js`
- `VectorStore.setEmbeddingsBatch(list)`: 批量保存向量到本地及 Qdrant。
- `VectorStore.saveTM(projectId, original, translation)`: 保存翻译记忆。
- `VectorStore.searchTM(projectId, original)`: 检索翻译记忆。
- `migrateTMToIndexedDB()`: 自动迁移 localStorage 中的 `pt_tm_*` 历史数据。
### `src/api/paratranz.js`
- `ParatranzAPI.getTerms(projectId)`: 返回分页循环拉取合并后的全量术语列表。
