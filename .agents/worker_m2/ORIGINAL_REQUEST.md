## 2026-07-15T04:40:43Z

请执行重构优化计划中的里程碑 2：重构术语高亮匹配逻辑 (占位符还原法)。你的工作目录是 c:\Users\31029\Documents\GitHub\paratranzTool\.agents\worker_m2\。

请完成以下具体开发和测试任务：
1. 重构 src/pages/translate.js 中的 highlightTerms(text, terms) 函数：
   - 采用“占位符还原法”对术语高亮进行全新实现：
     - 正则匹配到术语后，不要直接替换为带样式的 HTML（如 span、style 等属性）。
     - 先将其替换成非冲突的 Unicode 非字符或特定的唯一安全占位串（如 `\uFDD0_{i}`，其中 i 为索引），并在变量列表中记录该占位符对应的 HTML 替换值。
     - 等所有术语均完成一遍正则扫描与替换之后，再遍历记录的占位符列表，用 replaceAll/replaceAll 批量反向替换回真正的 HTML。
     - 确保该占位符匹配依然能够完整保留大小写敏感度与大小写变体（例如保留匹配到的 matched 原文字符）。
2. 编写与丰富测试：
   - 在适当位置（例如 src/pages/translate.test.js 中，如果该测试文件不存在，你可以创建它）编写测试。
   - 增加术语高亮损坏测试：在 terms 数组中增加诸如 'style', 'color', 'span', 'title' 等术语。输入一段原文字符："The style color is red, please span the word."。调用 highlightTerms(text, terms) 确认返回的高亮 HTML 标签结构完好、各 span 属性完整，不存在嵌套崩坏和破坏。
3. 运行已有的所有测试以及新编写的测试，确保 100% 通过。
4. 运行 npm run build 进行打包编译测试。
5. 完成后，请在你的工作目录下创建 handoff.md，记录你修改的文件、新增的测试以及测试运行结果。
