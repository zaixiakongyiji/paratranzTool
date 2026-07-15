# BRIEFING — 2026-07-15T12:45:00+08:00

## Mission
执行重构优化计划中的里程碑 3：IndexedDB 批量保存向量与翻译记忆库优化，提高写入性能和离线数据可用性。

## 🔒 My Identity
- Archetype: implementer
- Roles: implementer, qa, specialist
- Working directory: c:\Users\31029\Documents\GitHub\paratranzTool\.agents\worker_m3\
- Original parent: a06666e3-1cad-40c4-b04e-32a2bd2b9424
- Milestone: 里程碑 3：IndexedDB 批量保存向量与翻译记忆库优化

## 🔒 Key Constraints
- 中文优先原则（解释、分析、建议、计划、代码注释、git提交信息均用中文）
- 禁止主动执行任何 git commit/push 操作
- 复杂任务在执行前必须制定计划并等待用户确认，修改代码前须说明修改意图并征得用户同意
- 计划文件统一生成至 `/docs/plan` 或 `/docs/task` 目录下
- 严禁作弊（DO NOT CHEAT），所有实现必须真实有效，禁止硬编码测试结果

## Current Parent
- Conversation ID: a06666e3-1cad-40c4-b04e-32a2bd2b9424
- Updated: not yet

## Task Summary
- **What to build**: 
  - 升级 IndexedDB 数据库版本至 2，新增 `translation_memory` 仓库，使用联合键 `id`（格式为 `${projectId}::${original}`）。
  - 新增批量向量保存 API `setEmbeddingsBatch(list)`，优化 IndexedDB 写事务以及单请求批量上传 Qdrant 接口。
  - 实现新表的 `saveTM(projectId, original, translation)` 和 `searchTM(projectId, original)` 接口。
  - 实现并导出 `migrateTMToIndexedDB()` 用于 localStorage 旧翻译记忆数据迁移至 IndexedDB。
  - 重构 `src/utils/storage.js` 中的 `getTM` 和 `saveTM` 逻辑，适配 IndexedDB 异步特性或在内存中维护同步 `tmCache`。
  - 在页面生命周期早期（如 `src/main.js`）触发自动迁移逻辑。
  - 编写/运行测试并确保 100% 通过，测试需要验证批量写入性能提升、新表 API 读写、数据迁移。
- **Success criteria**:
  - 所有测试用例 100% 通过。
  - 打包测试 `npm run build` 成功。
  - 重构后的系统行为真实、健壮。
- **Interface contracts**: `c:\Users\31029\Documents\GitHub\paratranzTool\AGENTS.md`
- **Code layout**: `c:\Users\31029\Documents\GitHub\paratranzTool\AGENTS.md`

## Key Decisions Made
- 1. 使用 `IDBKeyRange.bound` 在联合键主键上直接范围查询属于项目的前缀，避免为 `translation_memory` 表建立冗余索引，保持数据库轻量化。
- 2. 在 `Storage` 模块中维护私有内存缓存 `tmCache`，既能保持在 UI 视图组件中的同步读取和极佳性能，又极大地减少了对系统其他模块的侵入性。
- 3. 在应用早期初始化阶段（`main.js`）以异步非阻塞方式调用数据迁移，在翻译工作台（`translate.js`）中将 TM 缓存预加载与网络请求并行，最大程度地提升首屏渲染速度。

## Artifact Index
- `docs/plan/milestone_3_plan.md` — 实施计划文件
- `src/utils/vectorStore.js` — 升级数据库、实现批量保存、TM 新表及迁移
- `src/utils/storage.js` — 实现内存缓存 `tmCache` 与同步降级读取
- `src/main.js` — 静默迁移触发点
- `src/pages/translate.js` — 预加载调用点
- `src/utils/vectorStore.test.js` — 性能及功能测试

## Change Tracker
- **Files modified**: 
  - `src/utils/vectorStore.js` (升级数据库，添加批量向量保存、TM 数据 API 及 localStorage 自动迁移逻辑)
  - `src/utils/storage.js` (声明 `tmCache` 内存缓存，更新 `getTM`/`saveTM`/`searchTM` 为同步写内存并异步回写 IndexedDB，新增 `preloadTM` 异步加载方法)
  - `src/main.js` (应用初始化后静默执行 `migrateTMToIndexedDB`)
  - `src/pages/translate.js` (页面 render 流程并行引入 `Storage.preloadTM` 预热缓存)
  - `src/utils/vectorStore.test.js` (修复 mock 重置逻辑，新增 3 个针对批量保存、新表读写、自动迁移功能与性能的单元测试)
- **Build status**: pass (构建打包成功)
- **Pending issues**: [无]

## Quality Status
- **Build/test result**: pass (所有 34 个测试用例 100% 成功跑通)
- **Lint status**: 0 violations
- **Tests added/modified**: 新增批量保存与 mock Qdrant 交互测试、TM 独立数据库读写测试、旧 LocalStorage 缓存自动化迁移测试。

## Loaded Skills
- **Source**: C:\Users\31029\.gemini\config\plugins\superpowers\skills\writing-plans\SKILL.md
- **Local copy**: C:\Users\31029\.gemini\config\plugins\superpowers\skills\writing-plans\SKILL.md
- **Core methodology**: 复杂任务编写细化步骤和检查点的计划。
- **Source**: C:\Users\31029\.gemini\config\plugins\superpowers\skills\verification-before-completion\SKILL.md
- **Local copy**: C:\Users\31029\.gemini\config\plugins\superpowers\skills\verification-before-completion\SKILL.md
- **Core methodology**: 完成前使用特定命令运行测试并核对结果，确保无硬编码欺骗。
