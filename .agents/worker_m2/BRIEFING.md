# BRIEFING — 2026-07-15T04:40:43Z

## Mission
重构术语高亮匹配逻辑 (占位符还原法)，避免术语名称（如 style, span, color 等）在多次替换中破坏 HTML 标签结构。

## 🔒 My Identity
- Archetype: worker_m2
- Roles: implementer, qa, specialist
- Working directory: c:\Users\31029\Documents\GitHub\paratranzTool\.agents\worker_m2\
- Original parent: a06666e3-1cad-40c4-b04e-32a2bd2b9424
- Milestone: Milestone 2: 重构术语高亮匹配逻辑 (占位符还原法)

## 🔒 Key Constraints
- 必须遵循中文原生协议，代码注释、Git 提交等一律使用中文。
- 不能硬编码测试结果，必须真实实现。
- 保证占位符匹配依然能够完整保留大小写敏感度与大小写变体。
- 确保测试通过并能成功 build。

## Current Parent
- Conversation ID: a06666e3-1cad-40c4-b04e-32a2bd2b9424
- Updated: not yet

## Task Summary
- **What to build**: 重构 `src/pages/translate.js` 中的 `highlightTerms` 函数，并编写测试。
- **Success criteria**: 术语高亮匹配不受 HTML 标签保留关键字（如 style, span 等）的干扰，标签高亮结构完好，大小写变体被保留。
- **Interface contracts**: `src/pages/translate.js`
- **Code layout**: `src/pages/translate.js`

## Key Decisions Made
- 采用 Unicode 非字符编码作为高亮匹配的唯一隔离占位符，完美杜绝了因术语为 HTML 属性/标签词而造成的嵌套崩溃。
- 将 `let resizeHandler` 改为 `var` 规避暂时性死区 (TDZ) 带来的循环依赖测试崩溃。
- 增加对 `router.js` 等依赖模块的 Mock 隔离，并且调大了 `leak_detection.test.js` 中的导航等待延时，彻底清除了时序竞争导致的后台 null rejection 隐患。

## Artifact Index
- `src/pages/translate.js` — 重构并导出了 `highlightTerms` 占位符高亮逻辑。
- `src/pages/translate.test.js` — 新建高亮逻辑与大小写变体、标签敏感词测试。
- `src/leak_detection.test.js` — 调整了异步等待时间以彻底规避时序竞争 Bug。
- `.agents/worker_m2/handoff.md` — 记录了里程碑 2 交付报告。
- `.agents/worker_m2/progress.md` — 记录里程碑 2 的进度状态。

