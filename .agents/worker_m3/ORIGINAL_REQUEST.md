## 2026-07-15T04:44:26Z
请执行重构优化计划中的里程碑 3：IndexedDB 批量保存向量与翻译记忆库优化。你的工作目录是 c:\Users\31029\Documents\GitHub\paratranzTool\.agents\worker_m3\。

请完成以下具体开发和测试任务：
1. 重构 src/utils/vectorStore.js 中的数据库存储与写入接口：
   - 升级版本号：将 DB_VERSION 升为 2。
   - 新增存储仓库：在 openDB() 的 upgradeneeded 回调中，新增 Object Store 仓库 `translation_memory`，以联合键 `id`（格式为 `${projectId}::${original}`）作为 keyPath。
   - 新增批量向量保存 API `setEmbeddingsBatch(list)`：
     - 在一个 readonly 事务中批量读取出已存在的项目对象；
     - 如果启用了 Qdrant 且 Qdrant配置完整，将所有待向量化项的 vector 及 payload 打包构建点（points），在 src/api/qdrant.js 中新增/复用批量 upsert 接口，实现**单次网络请求批量上传 Qdrant**；
     - 在一个 readwrite 事务中，遍历 list 将每个项目的向量和模型名称回写至本地，实现**单个写事务批量 put 写入 IndexedDB**，避免多次事务开销。
   - 新增 TM 数据 API：实现 `saveTM(projectId, original, translation)` 和 `searchTM(projectId, original)` 接口以操作新表。
   - 实现 localStorage 自动迁移逻辑：实现并导出 `migrateTMToIndexedDB()`。遍历 localStorage 中的所有键，把开头为 `pt_tm_` 的历史翻译记忆提取解析，批量异步存入新表 `translation_memory`。成功迁移完毕后即刻从 localStorage 中移除该 key，防止下次重启重复触发。
2. 重构 src/utils/storage.js：
   - 重构 `getTM` 和 `saveTM`。注意：因为原有的 `getTM`/`saveTM` 可能是同步调用的，而 IndexedDB操作必须是异步的。请先全局检查并修改它们的调用点，如果无法全局修改为异步，你可以选择在内存中维护一份 `tmCache` 供同步读取，且每次后台异步回写同步本地数据库，或者全面将调用点适配为异步。请确保修改后系统的整体健壮性和调用逻辑是通的。
3. 自动迁移触发：
   - 在页面或模块的生命周期早期（如 src/main.js 或 app 初始化点）注入 `migrateTMToIndexedDB()` 调用，使其静默安全迁移。
4. 编写并丰富测试：
   - 在已有的 `src/utils/vectorStore.test.js` 中增加测试用例：
     - 验证 `setEmbeddingsBatch` 在本地 IndexedDB 以及对接 mock Qdrant 时的批量正确写入，统计事务时间（应明显低于单事务逐条写入）。
     - 验证新表 `translation_memory` 的 `saveTM` 和 `searchTM` 写入和读取功能。
     - 验证 `migrateTMToIndexedDB()` 的迁移逻辑，并在测试中验证 localStorage 的旧 `pt_tm_*` 键被清空且数据已存入数据库中。
5. 运行已有的所有测试及新测试，确保 100% 通过。
6. 打包测试：`npm run build`。
7. 完成后在工作目录下创建 handoff.md 提交。

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## 2026-07-15T04:45:24Z
[Message] sender=a06666e3-1cad-40c4-b04e-32a2bd2b9424
**Context**: 里程碑 3 实施计划批准。
**Content**: 你的重构计划非常巧妙。特别是为了解决原有同步调用和 IndexedDB 异步特性冲突而设计的 `tmCache` 内存预加载机制，既能够确保本地读取性能，又极大地减少了代码侵入性，值得肯定。
请立即开始具体的编码实现和测试开发。注意：
1. 本地迁移 localStorage 的 `pt_tm_*` 历史数据时，请进行严密的类型检查和解析异常捕获，确保不会影响现有的已运行项目。
2. 批量向量写入 `setEmbeddingsBatch` 应当实现本地单个写事务批量 `put` 提升 I/O 效率。
3. 请严格遵守 MANDATORY INTEGRITY WARNING，编写真实的测试。

**Action**: 请开始执行具体代码修改并开发相应的测试，完成后跑通全部测试并向我提交 handoff 报告。
