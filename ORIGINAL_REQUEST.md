# Original User Request

## Initial Request — 2026-07-15T12:34:52+08:00

重构并优化现有的 ParaTranz AI 增强翻译工作台，修复路由切换带来的全局事件监听器内存泄露、术语替换导致 HTML 标签被二次污染损坏的风险，并提升批量向量化 IndexedDB 写入的性能，解除术语拉取 500 条的分页限制。

Working directory: c:/Users/31029/Documents/GitHub/paratranzTool
Integrity mode: development

## Requirements

### R1. 引入页面生命周期销毁机制与全局事件解绑
- 路由组件支持注册销毁钩子，并在路由切换时卸载上个页面的所有全局事件绑定（包括 window 的 resize、document 的 click 以及 validationModal 弹窗的 keydown 监听器）。

### R2. 重构术语高亮匹配逻辑 (占位符还原法)
- 实现一个稳健的术语高亮逻辑，避免在已有的 HTML 字符串上用正则进行二次匹配。通过占位符先占位、转义后再还原的形式防止 HTML 实体或标签属性被破坏，且完美支持大小写敏感/不敏感以及变体匹配。

### R3. IndexedDB 批量保存向量与翻译记忆库优化
- 在 IndexedDB 中实现批量保存向量的单事务接口，提升 RAG 向量同步回写效率；提供完整的翻译记忆 (TM) 数据迁移到本地 IndexedDB，避免 localStorage 容量爆满。

### R4. 支持全量同步术语
- 支持分页拉取术语，解除单次 500 条的限制。

## Acceptance Criteria

### 内存释放与事件注销
- [ ] 连续来回切换页面 10 次以上，window 和 document 上的 resize 和 click 监听器数量不应该持续增长。
- [ ] 无论以何种方式（按 ESC 键、点击继续、点击取消、点击外部遮罩）关闭保存检查弹窗，其在 document 上注册 of keydown 监听器必须被正确注销。

### 术语高亮正确性
- [ ] 原文中如果带有 style、color、span、title 等作为术语或包含特殊字符时，高亮后 HTML DOM 结构必须保持完好，不得出现嵌套破坏。

### 向量同步与 TM 存储
- [ ] 向量化回写测试通过，不再逐个开启 IndexedDB 写事务，同步耗时显著下降。
- [ ] 翻译记忆 (TM) 成功使用 IndexedDB 持久化并可检索，不引起 localStorage 配额超出。
