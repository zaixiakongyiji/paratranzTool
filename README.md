# ParaTranz AI

基于 Vanilla JS + Vite 从零搭建的 ParaTranz 增强翻译工作台。通过 RAG（检索增强生成）系统，在 AI 翻译时注入项目历史译文作为参考，解决游戏汉化中风格一致性的核心痛点。

## 功能

- **RAG 翻译增强**：将项目全部历史译文向量化后索引，每翻一条新词条时检索最相似的历史翻译，注入 AI prompt 作为风格参考
- **多模型可插拔**：翻译主模型、向量化模型、过滤模型、重排序模型各自独立配置，全部兼容 OpenAI 和 Gemini 双协议
- **双向量存储介质**：轻量场景用浏览器本地 IndexedDB，团队场景可切到自建 Qdrant 向量数据库，无缝切换
- **翻译工作台**：三栏布局（词条列表 / 原文编辑 / 术语管理），AI 翻译支持四候选版本选择，支持覆盖/追加模式
- **术语管理**：项目级术语从 ParaTranz 同步，个人术语库支持 JSON 导入导出，翻译时自动高亮匹配术语
- **翻译记忆**：基于 localStorage 的精确匹配 TM，提交译文时自动记录
- **亮暗双主题**：跟随系统或手动切换

## 技术栈

纯 Vanilla JS，零 UI 框架依赖。构建工具 Vite，SPA 靠 hash 路由 + 动态 import 做页面级代码分割。数据层 localStorage（配置/TM/术语）+ IndexedDB（向量库）+ Qdrant（远端向量库）三层存储。

## 快速开始

```bash
npm install
npm run dev
```

浏览器打开 `http://localhost:5173`，进入设置页面完成以下配置：

### 必填

1. **ParaTranz Token**：在 [paratranz.cn](https://paratranz.cn/users/my) 获取 API Token
2. **翻译主模型**：填写 AI 模型的 Base URL / API Key / 模型名称（如 `gpt-4o` 或 `deepseek-chat`）

### 可选（启动 RAG 功能）

3. **向量化模型**：开启后填写 Embedding 模型的接口信息（如 `text-embedding-3-small`），即可使用 RAG 检索。首次使用需在项目页点击「同步」拉取历史语料并向量化
4. **Qdrant**：如需团队共享或大数据量场景，自行部署 Qdrant 后填入地址即可切换存储介质
5. **过滤模型 / 重排序模型**：进一步开启后可对 RAG 检索结果做 AI 精排

## RAG 管线

```
ParaTranz API → 拉取已翻译词条 → IndexedDB 存储
     ↓
Embedding 模型 → 逐条/批量生成向量 → 写入 IndexedDB 或 Qdrant
     ↓
待翻原文 → 生成查询向量 → Top-K 余弦检索 (K=15)
     ↓
元数据规则微调（同文件加权，长度过滤）
     ↓
[可选] AI 过滤模型 → 筛选相关性
     ↓
[可选] AI 重排序模型 → 按参考价值重排
     ↓
取 Top-N → 拼入 AI 翻译的 system prompt
```

每个环节都有降级回退：向量化异常触发熔断、过滤/重排失败回退到规则排序、检索结果为空不影响翻译流程。

## 项目结构

```
src/
├── main.js              # 入口，初始化页面框架和主题
├── router.js            # hash 路由
├── api/
│   ├── paratranz.js     # ParaTranz API 封装
│   ├── ai.js            # AI 翻译请求
│   ├── embedding.js     # Embedding 向量化（OpenAI/Gemini）
│   └── qdrant.js        # Qdrant 向量数据库客户端
├── utils/
│   ├── rag.js           # RAG 管线编排（同步→向量化→检索→过滤→重排）
│   ├── vectorStore.js   # IndexedDB 向量存储封装
│   └── storage.js       # localStorage 配置/TM/术语管理
├── pages/
│   ├── projects.js      # 项目管理页
│   ├── files.js         # 文件浏览页（目录分组、进度条、同步/清空语料）
│   ├── translate.js     # 翻译工作台（RAG 检索、AI 翻译、术语栏）
│   ├── settings.js      # 设置页（五套模型配置 + Qdrant 配置）
│   ├── glossary.js      # 个人知识库
│   └── terms.js         # 项目术语管理
└── components/
    └── toast.js         # Toast 通知组件
```

## 代理配置

开发环境下 `/api` 请求通过 Vite proxy 转发到 `https://paratranz.cn`，解决跨域问题。生产构建需自行处理 API 代理或直连。
