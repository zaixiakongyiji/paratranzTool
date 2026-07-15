# Handoff Report — Milestone 1: Page Lifecycle & Event Unbinding

## 1. Observation
经过对代码库的分析，我直接观察并修改了以下文件中的关键逻辑：

### 1.1 `src/router.js`
- 引入了模块级变量 `currentPageModule = null` 用以追踪当前的页面模块。
- 在 `navigate` 方法的前期（第20-29行）增加了销毁逻辑：
  ```javascript
  if (currentPageModule && typeof currentPageModule.destroy === 'function') {
    try {
      currentPageModule.destroy();
    } catch (e) {
      console.error('Error destroying page module:', e);
    }
    currentPageModule = null;
  }
  ```
- 改造了 `routes` 内的所有 `render` 调用，使用 `then(m => { currentPageModule = m; return m.render(c, q); })` 来同步保存当前渲染的模块。

### 1.2 `src/pages/translate.js`
- 将原有的 `window.addEventListener('resize', () => autoResizeTextarea(textTranslation))` 重构为使用模块变量 `resizeHandler` 追踪。
- 在 `initWorkbenchLogic` 中，如果 `resizeHandler` 已经存在，则会先注销以防止在同一页面周期内重复注册。
- 实现并导出了 `destroy()` 函数：
  ```javascript
  export function destroy() {
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler);
      resizeHandler = null;
    }
  }
  ```

### 1.3 `src/pages/settings.js`
- 引入模块级对象 `activeClickListeners = {}`，映射面板 `id` 到对应的点击处理器。
- 改造“获取模型列表”后的外部点击处理逻辑，在注册前先移除该面板原有的外部点击监听器以防止累加，并将其保存到 `activeClickListeners`。
- 实现并导出了 `destroy()` 函数，用于迭代销毁所有面板的外部点击监听器：
  ```javascript
  export function destroy() {
    Object.keys(activeClickListeners).forEach(id => {
      document.removeEventListener('click', activeClickListeners[id]);
    });
    for (const id in activeClickListeners) {
      delete activeClickListeners[id];
    }
  }
  ```

### 1.4 `src/components/validationModal.js`
- 重构了 `handleEsc` 监听器的作用域，并在 `cleanup(result)` 方法中添加了对 `keydown` 监听器的移除操作。
- 使得在弹窗无论以任何途径关闭（点击再检查、继续、关闭 X 按钮、点击遮罩或按 Escape 键）时，都会执行 `document.removeEventListener('keydown', handleEsc)`。

### 1.5 新增测试 `src/leak_detection.test.js`
- 包含 3 个专项单元测试用例：
  1. 模拟来回导航 `translate` 和 `settings` 页面 12 次，验证 `window.resize` 监听器无无限累加且最终正确归零。
  2. 模拟在 settings 页面中多次获取各个面板的模型列表，并在切换页面后验证 `document.click` 监听器无残留。
  3. 模拟校验弹窗的 5 种不同关闭路径（按钮、遮罩、ESC等），验证 `document.keydown` 监听器均得到解绑且无残留。

### 1.6 测试运行结果
运行 `npm test` 结果如下：
```
✓ src/utils/validation.test.js (19 tests) 14ms
✓ src/router.test.js (1 test) 36ms
✓ src/api/paratranz.test.js (2 tests) 9ms
✓ src/utils/rag.test.js (1 test) 91ms
✓ src/pages/files.test.js (1 test) 118ms
✓ src/utils/vectorStore.test.js (1 test) 21ms
✓ src/leak_detection.test.js (3 tests) 2196ms
    ✓ 模拟来回切换 translate 和 settings 页面 10 次以上，验证 resize 监听器没有持续增长且最终能清空  959ms
    ✓ 在 settings 页面中多次获取模型列表（产生 document 外部 click 监听器），切换页面后验证无残留 226ms
    ✓ 关闭校验弹窗：测试“再检查一下”、“继续”、“X”按钮、点击遮罩、按 ESC，所有路径下 document.keydown 均不泄露  1100ms

Test Files  7 passed (7)
     Tests  28 passed (28)
```

## 2. Logic Chain
基于以上观察，逻辑推理过程如下：
1. **原有的全局事件监听器未注销**：例如，在 `translate.js` 中离开页面时没有对 `window.resize` 解绑，以及在 `validationModal.js` 中点击关闭或继续时没有移除 `document.keydown`。
2. **构建生命周期销毁机制**：通过在 `router.js` 切换渲染新模块前调用 `currentPageModule.destroy()`，为所有页面开辟了统一的清理通道。
3. **针对性解绑**：
   - 提取原本的匿名函数，使用模块级的状态变量（如 `resizeHandler` 与 `activeClickListeners`）持有所注册事件监听器的引用。
   - 在 `destroy()` 时调用对应的 `removeEventListener` 并传入相同的函数引用，从而在引擎层面实现成功的解绑。
4. **通过单元测试确认**：在单元测试中重写/代理了 `window.addEventListener` / `removeEventListener` 以及 `document` 上的相同 API。拦截器记录了特定事件类型的绑定与移除事件。测试结果显示，经过多次切换和关闭弹窗后，活跃监听器的计数皆恢复到初始计数值，证明已彻底解决监听器泄露的问题。

## 3. Caveats
- **依赖缓存机制**：我们假设通过 Vite 动态导入的 `import('./pages/translate.js')` 指向同一个单例模块实例（共享同一模块作用域的 `resizeHandler` 变量）。如果在其他的非缓存打包环境（如非单例模块系统）中运行，模块重新加载，模块级变量的作用域可能隔离，但即使如此，当前路由销毁机制依然能在销毁前调用那一次导出的 `destroy()`，依然可正确解绑事件监听器。
- **页面未全部注册 destroy**：并非所有页面都在本次重构中导出了 `destroy()` 方法（目前仅对有明确泄漏隐患的 settings 和 translate 导出了它）。未来的新页面若也注册了全局监听器，需要遵循相同的接口规范，主动导出 `destroy` 并在其中注销监听器。

## 4. Conclusion
里程碑 1 的开发与测试任务已圆满完成：
- 页面切换时会安全地触发上个页面的 `destroy` 生命周期方法。
- `translate.js` 的 `window.resize` 监听器被正确提取和注销。
- `settings.js` 的 `document.click` 监听器被安全追踪和清理。
- `validationModal.js` 在所有可能关闭弹窗的场景下均会清退 `document.keydown` 监听器。
- 所有的既有测试与新写的泄漏专项测试均已 100% 通过。

## 5. Verification Method
要独立运行和验证本次修改：
1. 在项目根目录下运行测试命令：
   ```bash
   npm test
   ```
   应观察到包含 `src/leak_detection.test.js` 在内的 7 个测试文件全部通过，无任何失败日志。
2. 在项目根目录下运行打包命令：
   ```bash
   npm run build
   ```
   应观察到 Vite 打包顺利通过，无编译/打包语法错误。
