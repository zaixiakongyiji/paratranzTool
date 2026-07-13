# ParaTranz AI - 项目核心上下文

## 1. 项目基本信息
- **项目名称**：ParaTranz AI
- **定位**：基于 Vanilla JS + Vite 从零搭建的 ParaTranz 增强翻译工作台。
- **核心功能**：通过 RAG（检索增强生成）系统，在 AI 翻译时注入项目历史译文作为参考，解决游戏汉化中风格一致性的痛点。
- **存储机制**：localStorage（配置/TM翻译记忆/术语） + IndexedDB（轻量级本地向量库） + Qdrant（远端团队向量库）。

## 2. 技术栈架构
- **前端框架**：纯原生 JavaScript (Vanilla JS)，零 UI 框架依赖。
- **构建工具**：Vite。开发环境通过 Vite proxy 代理解决跨域问题。
- **路由管理**：基于 Hash 路由 + 动态 `import` 实现页面级的代码分割（`src/router.js`）。
- **UI & 样式**：自定义 Vanilla CSS (`src/style.css`)，支持亮暗双主题跟随系统或手动切换。
- **测试框架**：Vitest + JSDOM。

## 3. 核心目录与文件树
### `src/` (源码根目录)
- **`main.js`**: 页面入口，负责初始化页面框架和全局主题。
- **`router.js`**: 路由核心逻辑，负责拦截 hash 变化，动态渲染对应页面。
- **`style.css`**: 全局及核心样式文件。

### `src/api/` (网络与外部服务层)
- **`paratranz.js`**: 封装 ParaTranz 官方 API 的所有请求逻辑。
- **`ai.js`**: 处理大模型文本生成请求（全面兼容 OpenAI / Gemini 格式）。
- **`embedding.js`**: 处理文本 Embedding 向量化请求。
- **`qdrant.js`**: 远端 Qdrant 向量数据库的 API 客户端封装。

### `src/utils/` (核心业务逻辑层)
- **`rag.js`**: RAG 管线编排核心（负责编排语料同步 → 向量化 → 检索 → 过滤 → 重排）。
- **`vectorStore.js`**: 浏览器本地 IndexedDB 向量存储的底层封装。
- **`storage.js`**: 处理 `localStorage` 相关的持久化存储逻辑（包含用户配置项、Translation Memory 翻译记忆、术语数据管理）。

### `src/pages/` (视图页面层)
- **`projects.js`**: 项目选择与管理页面。
- **`files.js`**: 文件浏览页，包含文件列表、翻译进度展示、以及触发 RAG 历史语料的同步和清空功能。
- **`translate.js`**: 核心翻译工作台。集成 RAG 检索结果展示、AI 翻译多版本候选生成、术语栏及高亮匹配、原文编辑功能。
- **`settings.js`**: 系统设置页面（管理 API Keys、主翻译/向量化/过滤/重排模型等五套模型配置，以及 Qdrant 远端配置）。
- **`glossary.js`**: 个人本地知识库管理页面，支持 JSON 导入导出。
- **`terms.js`**: 项目术语管理页面，展示和同步来自 ParaTranz 的团队术语。

### `src/components/` (公共组件层)
- **`toast.js`**: 全局轻量级 Toast 通知组件。

## 4. 关键业务流程 (RAG 管线)
在核心工作台处理翻译时的底层管线逻辑：
1. **数据拉取**：从 ParaTranz API 获取已翻译的历史词条，存入本地 IndexedDB。
2. **向量化**：通过 Embedding 模型（可配置 OpenAI/Gemini 兼容接口）将文本转化为向量，写入 IndexedDB（单人）或 Qdrant（团队）。
3. **检索增强**：翻译新原文时，生成查询向量，在对应向量库中执行 Top-K 余弦相似度检索 (默认 K=15)。
4. **元数据过滤**：结合同文件加权规则和长度匹配规则对初步检索结果进行微调。
5. **AI 精排 (可选)**：若配置了对应模型，则调用过滤模型筛选上下文相关性，并调用重排模型 (Rerank) 按参考价值重新排序。
6. **最终翻译生成**：取 Top-N 结果，拼装至 AI 翻译主模型的 System Prompt 中进行请求生成。
**容灾机制**：每个环节都有降级回退策略。例如向量化异常会触发熔断，过滤/重排失败则回退至规则排序，检索结果为空也不影响最终的普通翻译流程。

## 5. 开发规范与要求 (AI Agent 行动准则)
- **代码风格优先纯原生**：使用原生 JavaScript (Vanilla JS)。操作 DOM、注册事件监听器等不应当引入任何第三方框架（如 React/Vue/jQuery），尽量保持最少依赖。
- **高度模块化**：严格遵守 ES Modules 规范进行拆分，不同页面的逻辑应完全解耦，利用动态导入优化性能。
- **多模型兼容性**：在涉及大模型交互的 `src/api` 和 `src/utils` 中，时刻确保底层接口同时兼容 OpenAI 与 Gemini 规范，且对失败处理和超时需具备极强的健壮性。
- **存储操作规范**：
  - 核心持久化结构简单的信息优先考虑 `localStorage` (`src/utils/storage.js`)。
  - 需要执行向量检索的场景走 `IndexedDB` (`src/utils/vectorStore.js`)。
  - 对于涉及到网络存储的情况仅限 `Qdrant` 模块和 `ParaTranz` 官方同步。
- **语言强制要求**：所有的规划、思考、提示输出、代码注释、Git Commit 必须严格使用**中文**。
- **更新文档**：对业务架构及核心机制有修改时，请主动维护此文件及 `README.md`，保持同步。
