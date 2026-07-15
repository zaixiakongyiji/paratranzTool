## 2026-07-15T04:35:39Z

请全面调查 ParaTranz AI 工作台的重构需求。你的工作目录是 c:\Users\31029\Documents\GitHub\paratranzTool\.agents\explorer_1\。
请通过分析代码和运行测试，在工作目录下生成 analysis.md 报告，涵盖以下内容：
1. 路由与事件解绑分析：分析 src/router.js 以及各个页面（src/pages/ 下的项目、文件、翻译、设置、术语等页面）中事件监听的现状。指出在 window, document 上注册了哪些事件（例如 resize, click, validationModal keydown），以及切换路由时为何产生泄漏，提出生命周期销毁钩子设计方案。
2. 术语高亮逻辑分析：分析 src/pages/translate.js 中当前的高亮正则匹配是如何导致 HTML 二次污染/标签损坏的。针对原文包含 style, color, span 等属性字眼被正则替换的情况，设计占位符还原法。
3. IndexedDB 批量保存与 TM 迁移：分析 src/utils/vectorStore.js 的写入事务，设计批量写入 API；分析 src/utils/storage.js 中 Translation Memory (TM) 的现有实现，提出迁移到 IndexedDB 的方案。
4. 全量同步术语：分析 src/api/paratranz.js 和术语同步页面/逻辑中拉取术语的 500 条分页限制，设计分页循环拉取方案。
5. 运行测试：请在 Cwd 下运行 npm run test，详细记录当前的测试运行结果和覆盖率（若有）。如果某些测试失败，请记录。

请在 analysis.md 中完整呈现你的研究结果、代码段引用和具体重构方案建议。完成后向 parent 汇报。
