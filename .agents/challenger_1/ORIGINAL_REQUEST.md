## 2026-07-15T04:48:33Z

请对本项目在 M1, M2, M3, M4 重构后的代码执行对抗性测试和健壮性验证（Milestone 5）。你的工作目录是 c:\Users\31029\Documents\GitHub\paratranzTool\.agents\challenger_1\。

请执行以下任务：
1. 分析当前的代码实现：
   - 全局事件解绑：`src/router.js`、`src/pages/translate.js`、`src/pages/settings.js`、`src/components/validationModal.js`。
   - 占位符高亮匹配：`src/pages/translate.js`。
   - IndexedDB 批量保存与 TM 迁移：`src/utils/vectorStore.js`、`src/utils/storage.js`。
   - API 术语同步：`src/api/paratranz.js`。
2. 寻找和设计极端的、边界的或者对抗性的用例（Tier 5 级别的健壮性测试），尝试使代码失败。例如：
   - 【高亮对抗】：如果术语中包含相互嵌套 of 子词，比如同时有术语 "color", "or", "span", "an"。若待翻译文本是 "Color the span."，高亮替换会产生什么情况？是否能正确防范二次高亮造成的破坏？
   - 【存储迁移异常】：如果 LocalStorage 中的旧翻译记忆数据损坏（不是合法的 JSON），在自动迁移时是否能够优雅降级、不阻塞应用启动，或者迁移能安全跳过损坏的条目？
   - 【批量保存临界值】：在批量向量保存时，如果传入一个包含 0 条记录的 list，或者传入非常大的 list，代码是否表现正常？Qdrant 上传是否能稳妥地处理异常网络降级？
   - 【API 分页临界值】：如果术语刚好是 500 条、1000 条等整倍数，或者网络请求第二页返回空数据/空数组，循环拉取逻辑是否能在第二页安全退出？
3. 将上述对抗测试写入相应的测试文件中（比如新增对抗性测试套件 `src/pages/adversarial.test.js`）。
4. 运行已有的 35 个测试和你新写的对抗测试，确保 100% 成功。
5. 打包编译验证：`npm run build`。
6. 完成后，在你的工作目录下生成 handoff.md 报告，列出对抗测试设计的用例、代码更改（若有）以及全部测试的输出结果。

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
