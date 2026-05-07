# OfferPilot 项目上下文

> 快速开发指引 — 每次新会话在此目录下启动 Claude Code 时自动加载

## 项目简介

OfferPilot 是一个 AI 辅助的大模型算法岗面试训练平台，Next.js 16 全栈 Web 应用。

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Next.js 16 + React 19 + TypeScript (strict) |
| 样式 | CSS Modules + CSS 自定义属性（暖纸主题，参考 openhanako） |
| 状态 | Zustand（4 个 store：candidate / interview / bookmark / review / track） |
| 数据库 | SQLite (better-sqlite3 + Drizzle ORM)，数据库文件 `offerpilot.db` |
| AI | DeepSeek v4-flash/pro（主要）+ OpenAI Whisper（仅语音转录） |
| AI SDK | `ai` (v5) + `@ai-sdk/openai` (v3)，统一客户端在 `lib/ai/client.ts` |
| 编辑器 | Monaco Editor (`@monaco-editor/react`) |
| 缓存 | 本地文件系统 `.offerpilot_cache/` |

## AI 模型配置

- **DeepSeek v4-flash**：轻量任务（出题、解析、评分、参考答案生成）→ `lib/ai/client.ts` 中的 `FLASH`
- **DeepSeek v4-pro**：重度任务（流式对话、代码审查、答案评判）→ `lib/ai/client.ts` 中的 `PRO`
- **Whisper-1**：仅语音转录 → 保留 OpenAI 直连/代理
- API Key 从 `~/.zshrc` 的 `ANTHROPIC_AUTH_TOKEN`（DeepSeek）和 `OPENAI_API_KEY`（Whisper）读取
- **关键**：DeepSeek 用 `deepseek.chat('model')` 而非 `deepseek('model')`，后者走 responses API 会 404

## 启动命令

```bash
npm run dev           # 启动开发服务器 → http://localhost:3000
npm run build         # 构建检查
npx drizzle-kit push  # 数据库 schema 同步
```

## 目录结构速览

```
app/
├── page.tsx                   # 仪表盘首页
├── tracks/                    # 赛道页面
│   ├── basics/page.tsx        # 大模型八股
│   ├── leetcode/page.tsx      # LeetCode 算法
│   ├── torchcode/page.tsx     # 手撕代码（Monaco 编辑器）
│   └── resume/page.tsx        # 简历专项
├── collection/page.tsx        # 收藏夹
├── review/page.tsx            # 面试复盘
├── interview/page.tsx         # 旧面试页（保留，待迁移）
└── api/                       # API Routes
    ├── tracks/                # 各赛道 AI 接口
    ├── cache/                 # 文件缓存接口
    ├── interview/             # 面试对话接口
    ├── bookmarks/             # 收藏接口
    └── review/                # 复盘接口
components/
├── tracks/                    # 赛道共享组件（Editor / Review / Chat）
├── interview/                 # 面试对话组件
├── dashboard/                 # 仪表盘组件
├── resume/                    # 简历上传/编辑组件
├── layout/                    # TopBar / Sidebar / ClientLayout
└── ui/                        # Button / Card / Textarea / FileUpload
lib/
├── ai/                        # AI Prompt 引擎
│   ├── client.ts              # 统一 AI 客户端（关键文件）
│   └── tracks/                # 各赛道 prompt
├── cache/                     # 本地文件缓存
├── db/                        # Drizzle schema + 连接
└── utils/pdf.ts               # PDF 文本提取
stores/                        # Zustand 状态管理
shared/types.ts                # 全局 TypeScript 类型
```

## 已知问题 / 注意事项

- `pdf-parse` v3 用 `import { PDFParse } from 'pdf-parse'; new PDFParse({ data: buf }); await parser.getText()` API
- `.offerpilot_cache/` 中的 WAL 临时文件（*.db-shm, *.db-wal）已加入 .gitignore
- Monaco Editor 用 `next/dynamic` 懒加载以避免 SSR 问题
- 侧边栏 Session 历史用 localStorage，刷新不丢
- `.env.local` 不含 API Key，Key 从 shell 环境变量自动读取
- DeepSeek 不支持 OpenAI 新版 responses API，必须用 `.chat()` 方法走 `/chat/completions`
- `.claude/` 目录（Claude Code 配置）已跟踪，不要提交含 Key 的文件

## 设计规范

- 色彩：暖纸底 `#F7F4ED` + 墨色 5 档 + 印章青蓝 `#4A7C96` 为唯一强调色
- 字体：正文宋体（Noto Serif SC）+ UI 无衬线（PingFang SC）+ 代码等宽（JetBrains Mono）
- 圆角：极小（2-4px），边框 0.5px
- 动效：`cubic-bezier(0.16, 1, 0.3, 1)` 0.3s
