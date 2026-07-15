# BRIEFING — 2026-07-15T12:41:00+08:00

## Mission
引入页面生命周期销毁机制与全局事件解绑，优化全局监听器泄露问题。

## 🔒 My Identity
- Archetype: implementer, qa, specialist
- Roles: implementer, qa, specialist
- Working directory: c:\Users\31029\Documents\GitHub\paratranzTool\.agents\worker_m1\
- Original parent: a06666e3-1cad-40c4-b04e-32a2bd2b9424
- Milestone: Milestone 1 - Page Lifecycle Destroy & Global Event Unbinding

## 🔒 Key Constraints
- 遵循中文优先原则（中文原生协议）。
- 所有规划、思考、提示输出、代码注释、Git Commit 必须严格使用中文。
- 禁止主动执行任何 git commit/push 操作，提交操作由用户手动触发。
- 禁止主动做出任何影响代码库的决策，所有关键决策必须明确告知用户并等待确认。
- 制定计划后必须等待用户确认再执行，开始修改代码前先说明修改的意图并征得用户同意。
- 保证测试彻底，无 hardcode/cheating 行为。

## Current Parent
- Conversation ID: a06666e3-1cad-40c4-b04e-32a2bd2b9424
- Updated: 2026-07-15T12:38:27Z (得到 parent 的实施批准)

## Task Summary
- **What to build**: 
  1. 改造 `src/router.js` 以支持页面生命周期 `destroy` 方法。
  2. 改造 `src/pages/translate.js` 以注销 `window.resize` 事件。
  3. 改造 `src/pages/settings.js` 以注销 `document` 点击事件。
  4. 修复 `src/components/validationModal.js`，确保在任何关闭弹窗路径下注销 `document` 上的 `keydown` 监听器。
  5. 编写并运行单元测试以确保无泄露并验证旧测试全部通过。
- **Success criteria**: 切换路由和关闭弹窗后，全局监听器（window.resize, document.keydown, document.click）无残留或累积增长。
- **Interface contracts**: 页面模块导出 `destroy` 函数。
- **Code layout**: `src/router.js`, `src/pages/translate.js`, `src/pages/settings.js`, `src/components/validationModal.js`。

## Key Decisions Made
- 将 `leak_detection.test.js` 中的路由导航改造为直接使用 `navigate(path, true)`（设置 `fromHashChange = true`），避免在 JSDOM 中由于 location.hash 异步派发 hashchange 事件而引起的并发导航，从而保证单元测试运行结果是精确可预测的。

## Artifact Index
- c:\Users\31029\Documents\GitHub\paratranzTool\.agents\worker_m1\handoff.md — 任务移交与验证报告

## Change Tracker
- **Files modified**:
  - `src/router.js` — 支持记录当前页面模块并在切换前执行 `destroy` 方法
  - `src/pages/translate.js` — 提取 resize 处理器并导出 `destroy` 方法以解绑 `window.resize`
  - `src/pages/settings.js` — 追踪各个面板获取模型后在 document 上绑定的外部点击事件，并在 `destroy` 中解绑
  - `src/components/validationModal.js` — 确保在所有关闭途径下都在 document 上解绑 keydown (Escape) 监听器
  - `src/leak_detection.test.js` — 新建的泄露检测专项单元测试
- **Build status**: pass
- **Pending issues**: none

## Quality Status
- **Build/test result**: pass (7 test files, 28 tests passed)
- **Lint status**: 0 violations (Vite build passed successfully)
- **Tests added/modified**: 新增了 `src/leak_detection.test.js` 覆盖了 resize 监听器泄露检测、外部 click 监听器泄露检测、以及校验弹窗所有关闭路径的 keydown 监听器泄露检测。

## Loaded Skills
- systematic-debugging — 系统化调试
- test-driven-development — 测试驱动开发
- verification-before-completion — 完成前验证
