# Progress — 2026-07-15T12:46:00+08:00

Last visited: 2026-07-15T12:46:00+08:00

## 进度追踪 (里程碑 3)
- [x] 任务 1: 重构 VectorStore (src/utils/vectorStore.js)
  - [x] 步骤 1: 升级版本号与新增仓库 (DB_VERSION 升为 2，新增 `translation_memory` 表)
  - [x] 步骤 2: 实现批量向量保存接口 `setEmbeddingsBatch(list)`
  - [x] 步骤 3: 实现 TM 数据接口与 localStorage 迁移 (`saveTM`, `searchTM`, `getAllTM`, `migrateTMToIndexedDB`)
- [x] 任务 2: 重构 Storage (src/utils/storage.js)
  - [x] 步骤 1: 维护 `tmCache` 内存缓存与预加载逻辑 (`preloadTM`)
  - [x] 步骤 2: 改造 `saveTM`、`searchTM` 和 `getTM`
- [x] 任务 3: 自动迁移触发与应用入口注入
  - [x] 步骤 1: 在 `src/main.js` 头部引入并安全运行 `migrateTMToIndexedDB`
  - [x] 步骤 2: 在 `src/pages/translate.js` 中 `render` 时 `await Storage.preloadTM(projectId)`
- [x] 任务 4: 编写与丰富测试
  - [x] 步骤 1: 增加批量向量写入测试
  - [x] 步骤 2: 增加新表 TM 读写和数据迁移测试
  - [x] 步骤 3: 运行 Vitest 测试 100% 通过且 build 成功
