## 2026-07-15T04:37:33Z
请执行重构优化计划中的里程碑 1：引入页面生命周期销毁机制与全局事件解绑。你的工作目录是 c:\Users\31029\Documents\GitHub\paratranzTool\.agents\worker_m1\。

请完成以下具体开发和测试任务：
1. 改造 src/router.js：
   - 保存当前页面模块引用，在渲染新路由内容前，如果存在上个页面模块且具有 destroy 方法，调用该方法。
2. 改造 src/pages/translate.js：
   - 提取 window.resize 事件处理函数。
   - 实现并导出 destroy 函数，在其中通过 removeEventListener 注销 window 的 resize 监听器。
3. 改造 src/pages/settings.js：
   - 追踪在 document 上注册的动态 click 监听器。
   - 实现并导出 destroy 函数，在其中注销所有已注册 of document click 监听器。
4. 修复 src/components/validationModal.js：
   - 在 cleanup 函数里，无论以何种方式（ESC 键、确认/取消按钮、点击遮罩等）关闭弹窗，都必须调用 removeEventListener 注销 document 上的 keydown 事件监听器，彻底防止监听器泄露。
5. 编写并运行测试：
   - 运行 npm test 确保已有测试全过。
   - 在合适的地方（例如 src/router.test.js 中，或者新建针对解绑的测试）编写单元测试，模拟连续路由切换（例如来回切换 translate 和 settings 页面 10 次以上）以及关闭校验弹窗，并验证全局监听器（window.resize, document.keydown, document.click）没有持续增长或残留。可以使用 spy 或拦截 addEventListener/removeEventListener 进行计数验证。
6. 完成后，请在你的工作目录下创建 handoff.md，记录你修改的文件、新增的测试以及测试运行结果。

## 2026-07-15T04:38:27Z
Parent Approval:
- 意图已征得同意。
- 允许开始具体代码修改并开发相应的泄漏检测测试。
