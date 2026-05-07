# OfferPilot

> AI 辅助的大模型算法岗面试训练平台 —— 从八股到手撕，从简历到综合模拟，一站式备战。

## 简介

OfferPilot 是一个面向大模型算法/开发实习岗位的 AI 面试教练。与传统的刷题平台不同，它聚焦于**大模型后训练、多模态、RAG、Agent** 等前沿方向的专项考察，并提供基于简历与项目的个性化追问能力。

## 核心功能

| 赛道 | 说明 |
|------|------|
| 📚 大模型八股 | 后训练/多模态/RAG/Agent 四专题知识考察，AI 出题+评分+参考答案 |
| ⚙️ LeetCode 算法 | AI 出题+原站链接，回传代码后 AI 评判复杂度与边界处理 |
| 🔥 手撕代码 | PyTorch 核心实现（Attention/LoRA/CLIP 等），集成 Monaco 在线编辑器，AI 逐行审查 |
| 📋 简历专项 | 上传简历 PDF+项目详情，AI 基于真实经历进行深度追问 |
| 📊 面试复盘 | 上传真实面试录音，Whisper 转录+AI 表现诊断 |
| ⭐ 收藏反馈 | 面试中收藏卡壳问题，AI 生成参考答案，点赞/点踩驱动迭代 |

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Next.js 16 + React 19 |
| 语言 | TypeScript (strict) |
| 样式 | CSS Modules + CSS 自定义属性（暖纸主题） |
| 状态管理 | Zustand |
| 数据库 | SQLite (better-sqlite3 + Drizzle ORM) |
| AI | Vercel AI SDK + OpenAI/Claude API |
| 编辑器 | Monaco Editor（手撕代码赛道） |
| 语音 | Web Speech API + Whisper |
| 缓存 | 本地文件系统 `.offerpilot_cache/` |

## 快速开始

### 环境要求

- Node.js ≥ 18
- OpenAI API Key（或其他兼容 API）

### 安装与运行

```bash
# 克隆项目
git clone https://github.com/wangqianxu7/OfferPilot.git
cd OfferPilot

# 安装依赖
npm install

# 配置 API Key
echo "OPENAI_API_KEY=sk-your-key" > .env.local

# 初始化数据库
npx drizzle-kit push

# 启动开发服务器
npm run dev
```

浏览器打开 `http://localhost:3000`，上传简历或直接选择赛道开始训练。

### 目录结构

```
offerpilot/
├── app/                    # Next.js App Router（页面+API）
│   ├── tracks/             # 赛道页面
│   │   ├── basics/         # 大模型八股
│   │   ├── leetcode/       # LeetCode 算法
│   │   ├── torchcode/      # 手撕代码
│   │   └── resume/         # 简历专项
│   └── api/                # API Routes
│       ├── cache/          # 文件缓存接口
│       └── tracks/         # 各赛道 AI 接口
├── components/             # React 组件
│   ├── tracks/             # 赛道共享组件（Monaco、审查面板）
│   ├── interview/          # 面试对话组件
│   └── ui/                 # 基础 UI 组件
├── lib/                    # 核心逻辑
│   ├── ai/tracks/          # 各赛道 prompt 引擎
│   ├── cache/              # 本地文件缓存
│   └── db/                 # 数据库 schema + 连接
├── stores/                 # Zustand 状态管理
├── shared/types.ts         # 全局 TypeScript 类型
└── .offerpilot_cache/      # 本地缓存目录（gitignore）
```

## 设计理念

本项目始于对现有 AI 面试产品的调研——反馈塑料感、题库老化、实习场景空缺、缺乏真正的个性化追问。OfferPilot 的核心设计原则：

- **简历+项目双驱动**：AI 面试官了解候选人的项目实现细节，追问不再模板化
- **赛道插件式架构**：每个训练模式独立目录，新增赛道不影响已有逻辑
- **本地优先**：SQLite + 文件系统缓存，数据不上传第三方
- **反馈闭环**：收藏 / 点赞 / 点踩机制使 AI 回答质量持续进化

## 许可证

Apache License 2.0
