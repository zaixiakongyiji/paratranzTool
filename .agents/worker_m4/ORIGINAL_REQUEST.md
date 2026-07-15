## 2026-07-15T12:47:15Z

请执行重构优化计划中的里程碑 4：支持全量同步术语 (解除单次 500 条的分页限制)。你的工作目录是 c:\Users\31029\Documents\GitHub\paratranzTool\.agents\worker_m4\。

请完成以下具体开发和测试任务：
1. 重构 src/api/paratranz.js 中的 getTerms(projectId) 函数：
   - 现有的实现只拉取 `page=1&pageSize=500`。
   - 请加入 `while` 循环分页逻辑。设定初始 `page = 1` 且单页拉取大小 `pageSize = 500`。
   - 循环调用底层的 `this._request`，获取每页的术语列表，将其解包并 `push` 到最终的合并 `results` 数组中。
   - 终止条件：如果当前请求回来的 `results` 数组长度小于 `pageSize`（例如返回 200 条，或者 0 条），说明已经到达最后一页。跳出循环并返回最终汇总数组。
2. 单元测试编写与丰富：
   - 重构并丰富已有的测试文件（如 `src/api/paratranz.test.js`）。
   - 新增一个单元测试用例，mock 对 `/projects/${projectId}/terms` 的网络响应，模拟项目有 2 页以上的术语（例如第一页返回 500 条数据，第二页返回 100 条数据）。
   - 调用并执行 `getTerms`，验证函数确实发起了 2 次分页网络请求，最终正确接收并合并了全部 600 条数据。
3. 运行已有的所有测试及新测试，确保 100% 成功。
4. 打包测试：`npm run build`。
5. 完成后在工作目录下创建 handoff.md 提交。

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
