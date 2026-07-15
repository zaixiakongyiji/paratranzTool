# 里程碑 3：IndexedDB 批量保存向量与翻译记忆库优化 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 优化 IndexedDB 存储，将翻译记忆库 (TM) 从 localStorage 迁移到 IndexedDB，实现向量的批量保存以提高系统写入性能和网络传输效率。

**Architecture:** 
1. 升级 IndexedDB `DB_VERSION` 到 2，并新增 `translation_memory` 表，使用 `${projectId}::${original}` 作为联合键。
2. 批量向量保存 `setEmbeddingsBatch` 采用单事务读、单批次上传 Qdrant、单事务写。
3. `Storage` 内部维护一个 `tmCache` 内存缓存，在翻译页面初始化时预加载当前项目的 TM 以保障同步读取的高效性，并在 `saveTM` 时进行同步更新内存和异步回写 IndexedDB。
4. 在应用生命周期早期静默运行 `migrateTMToIndexedDB` 自动将 localStorage 里的历史 TM 搬迁到 IndexedDB 中。

**Tech Stack:** Vanilla JS, IndexedDB API, Vitest

---

### 任务 1: 重构 VectorStore (src/utils/vectorStore.js)
**Files:**
- Modify: `src/utils/vectorStore.js`
- Test: `src/utils/vectorStore.test.js`

- [ ] **步骤 1: 升级版本号与新增仓库**
  - 将 `DB_VERSION` 升级为 2。
  - 在 `openDB()` 的 `request.onupgradeneeded` 中，新增名为 `translation_memory` 的 Object Store，主键（`keyPath`）设为 `id`。

- [ ] **步骤 2: 实现批量向量保存接口 `setEmbeddingsBatch(list)`**
  - 使用 readonly 事务批量获取已存在的 items 并记录在 Map 中。
  - 校验 Qdrant 配置，若开启则把 items 和 vector 构建点（points）单请求 upsert 进 Qdrant。
  - 使用 readwrite 事务把更新了向量的 items 批量 `put` 写入 IndexedDB。

- [ ] **步骤 3: 实现 TM 数据接口与 localStorage 迁移**
  - 实现并导出 `saveTM(projectId, original, translation)` 和 `searchTM(projectId, original)` 操作 `translation_memory` 表。
  - 新增并导出 `getAllTM(projectId)` 辅助读取整个项目的 TM（基于 `IDBKeyRange.bound`）。
  - 实现并导出 `migrateTMToIndexedDB()` 用于扫描 localStorage `pt_tm_*` 键，将旧数据批量存入 `translation_memory` 并删除旧键。

---

### 任务 2: 重构 Storage (src/utils/storage.js)
**Files:**
- Modify: `src/utils/storage.js`

- [ ] **步骤 1: 维护 `tmCache` 内存缓存与预加载逻辑**
  - 在 `Storage` 中增加 `tmCache = new Map()` 作为翻译记忆的内存缓存。
  - 新增并导出 `async preloadTM(projectId)` 接口，加载 IndexedDB 中属于该项目的 TM 存入缓存中。

- [ ] **步骤 2: 改造 `saveTM`、`searchTM` 和 `getTM`**
  - 重写 `getTM(projectId)`，若内存中有则返回，若没有则同步返回 `{}` 并尝试后台异步加载（或在测试环境下兼容）。
  - 重写 `searchTM(projectId, original)`，同步从内存 `tmCache` 读取，若匹配则返回 translation。
  - 重载 `saveTM(projectId, original, translation)`，同步写入内存 `tmCache`，并异步后台回写数据库 `VectorStore.saveTM`。

---

### 任务 3: 自动迁移触发与应用入口注入
**Files:**
- Modify: `src/main.js`

- [ ] **步骤 1: 页面生命周期早期调用迁移函数**
  - 在 `src/main.js` 头部引入 `migrateTMToIndexedDB`。
  - 在主程序启动/初始化逻辑中安全调用 `migrateTMToIndexedDB()`，捕获并忽略任何潜在错误，保持静默和非阻塞。

- [ ] **步骤 2: 翻译页面渲染预加载 TM**
  - 在 `src/pages/translate.js` 的 `render` 方法加载数据时，引入并调用 `await Storage.preloadTM(projectId)`，保证工作台中的同步 `searchTM` 总是能命中缓存。

---

### 任务 4: 编写与丰富测试
**Files:**
- Modify: `src/utils/vectorStore.test.js`

- [ ] **步骤 1: 增加批量向量写入的测试用例**
  - 编写测试用例验证 `setEmbeddingsBatch` 能将本地 IndexedDB 更新，并与 mock Qdrant 客户端批量交互成功。
  - 对比批量写入事务和单条写入事务的时间（使用性能打点）。

- [ ] **步骤 2: 增加新表 TM 读写和数据迁移测试用例**
  - 编写测试用例验证新表的 `saveTM` 和 `searchTM` 读写。
  - 验证 `migrateTMToIndexedDB()` 能正确解析 `pt_tm_*` 键，将数据存入数据库并清空 localStorage。

- [ ] **步骤 3: 运行测试**
  - 执行 `npm run test` 以确保 100% 成功，没有 regressions。
  - 执行 `npm run build` 确保打包没有问题。
