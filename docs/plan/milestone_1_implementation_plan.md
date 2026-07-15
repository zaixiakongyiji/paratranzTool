# 里程碑 1：引入页面生命周期销毁机制与全局事件解绑 实施计划

## 1. 任务背景
在 ParaTranz AI 工作台运行期间，由于部分页面和组件注册了全局事件监听器（如 `window.resize`、`document.click`、`document.keydown`），在切换页面或关闭弹窗后未进行解绑，导致内存泄漏及潜在的逻辑错误。本计划旨在改造路由、页面与组件，引入销毁机制并进行彻底解绑。

## 2. 详细改造方案

### 2.1 改造路由生命周期 (`src/router.js`)
- **意图**：当页面切换时，能够自动调用上一个页面的清理函数（如果存在）。
- **具体做法**：
  - 定义模块级别的变量 `currentPageModule` 用于保存当前页面模块引用。
  - 在 `navigate` 函数中，加载新路由内容前，判断 `currentPageModule` 是否存在且包含 `destroy` 方法，如果包含则调用 `currentPageModule.destroy()`。
  - 改造 `routes` 中每个路由的 `render` 函数，在其 Promise 的 `then` 链中保存当前加载的页面模块实例（`currentPageModule = m`）。

### 2.2 改造翻译页面的事件清理 (`src/pages/translate.js`)
- **意图**：解绑在 `window` 上注册的 `resize` 自适应监听器，防止其在页面离开后残留。
- **具体做法**：
  - 提取 `window.resize` 监听器为一个模块作用域变量 `resizeHandler`。
  - 每次执行页面渲染和工作台初始化时，若已存在 `resizeHandler`，则先用 `window.removeEventListener` 进行注销，然后重新定义并绑定（防止在同一页面生命周期内多次绑定导致累加）。
  - 实现并导出 `destroy` 方法，在其中执行 `window.removeEventListener('resize', resizeHandler)` 并将 `resizeHandler` 置空。

### 2.3 改造设置页面的事件清理 (`src/pages/settings.js`)
- **意图**：解绑在 `document` 上为了关闭下拉菜单而动态绑定的 `click` 监听器。
- **具体做法**：
  - 使用模块级别对象 `activeClickListeners`（键为面板 `id`，值为对应的 click 监听器函数）来追踪各个面板在 `document` 上注册的 click 监听器。
  - 每次注册新 click 监听器前，先从 `document` 移除该面板已注册的监听器，避免累加。
  - 实现并导出 `destroy` 方法，在其中遍历并注销 `activeClickListeners` 中所有监听器，并清空对象。

### 2.4 修复校验弹窗组件的事件清理 (`src/components/validationModal.js`)
- **意图**：保证在任何关闭弹窗路径下都彻底解绑在 `document` 上绑定的 `keydown` (ESC) 监听器。
- **具体做法**：
  - 将 `handleEsc` 监听器函数的作用域调整至能被 `cleanup` 函数访问。
  - 在 `cleanup` 函数中，无论是因为点击确定、取消、关闭按钮、点击遮罩层还是按 ESC 键，统一执行 `document.removeEventListener('keydown', handleEsc)`。

## 3. 测试与验证计划

### 3.1 基础功能验证
- 运行 `npm test`，确保现有的单元测试无退化，全部通过。

### 3.2 泄露与解绑专项单元测试
- 新增单元测试文件 `src/pages/leak_detection.test.js`（或在 `src/router.test.js` 中增加专项测试），使用拦截 `window.addEventListener` / `window.removeEventListener` 以及 `document` 上的相同 API 的方式：
  - 模拟连续切换 translate 页面和 settings 页面 10 次以上，验证 `window.resize` 和 `document.click` 监听器的注册数量最终归零（或不会无限累加）。
  - 模拟多次显示并以不同方式（如按钮点击、遮罩点击、ESC 键等）关闭 `validationModal`，验证 `document.keydown` 监听器最终正确解绑且无残留。

---
请审核以上实施计划。如果同意，请确认，我将开始代码编写与测试开发。
