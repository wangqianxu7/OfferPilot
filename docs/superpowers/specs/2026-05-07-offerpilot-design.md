# OfferPilot v0.1 产品设计方案

> 专为大模型算法/开发岗实习生打造的AI面试教练
> 不只刷题，是帮你把"我"讲好的私人教练

---

## 1. 背景与竞品分析

### 1.1 现有产品的问题

| 痛点 | 现状 | 根因 |
|------|------|------|
| 反馈塑料感 | AI总说你很棒，像打棉花 | 没有基于用户真实项目做追问 |
| 刷题 != 面试 | 本质上是对着题库背答案 | 缺失动态追问能力 |
| 实习场景空档 | 没产品专门做实习面试辅导 | "项目少、经验浅"的痛点没人解 |
| 上下文断裂 | AI不会基于简历持续追问 | 追问模板化、与上文无关 |
| 无长进感 | 练完不知道进步在哪 | 缺少追踪和反馈闭环 |
| 题库老化 | 牛客/面试鸭靠历史真题 | 跟不上MoE/长上下文等新方向 |

### 1.2 核心差异化

- **简历+项目细节双驱动**：AI面试官知道你的项目具体实现，追问问到点子上
- **热点论文驱动题库**：追踪最新ArXiv论文，自动生成紧跟前沿的面试题
- **真实面试录音复盘**：上传录音，分析个人表现+沉淀公司面试画像
- **反馈闭环**：收藏夹+点赞/点踩，AI回答质量持续进化

---

## 2. 目标用户与场景

### 2.1 用户画像

- 大学生/应届生找大模型算法岗、后端开发岗实习
- 简历上有1-3个项目，但对"怎么把项目讲好"没把握
- 需要针对性的模拟面试，不是泛泛的刷题

### 2.2 核心使用场景

1. **面试前准备**：上传简历+项目详情，AI解析后生成个性化面试题，开始模拟面试
2. **面试后复盘**：上传真实面试录音，AI分析表现弱项，沉淀到知识库
3. **碎片查漏**：浏览收藏夹，复习之前卡壳的问题和AI迭代过的参考答案

---

## 3. 产品架构

### 3.1 功能模块总览

```
┌───────────────────────────────────────────────────────┐
│                    OfferPilot                          │
├───────────────────────────────────────────────────────┤
│                                                         │
│  📋 简历&项目引擎                                        │
│  ├── 简历上传 (PDF) → AI解析 → 提取项目列表、技术栈       │
│  ├── 项目详情输入 (Markdown) → 记录技术决策、难点、架构    │
│  ├── 论文/技术报告关联 (可选) → 关联前沿方向              │
│  └── 输出：故事库 + 深问点清单 + 回答参考                  │
│                                                         │
│  🎯 面试模拟引擎                                          │
│  ├── 角色设定：基于简历+项目生成面试官人格                 │
│  ├── 对话模式：面试官文本发问 / 用户文本或语音回答         │
│  ├── 动态追问：基于项目细节生成针对性追问                  │
│  └── 即时反馈：每轮回答给出评分和改进建议                   │
│                                                         │
│  📊 面试复盘                                              │
│  ├── 真实面试录音上传 → Whisper转录                       │
│  ├── 个人表现诊断：语速、停顿、逻辑、答非所问点             │
│  ├── 公司画像沉淀：面试风格、追问模式、考察侧重             │
│  └── 输出：诊断报告 + 改进清单                             │
│                                                         │
│  ⭐ 收藏夹 & 反馈环                                        │
│  ├── 面试中一键收藏卡壳问题                                │
│  ├── AI生成参考答案 + 👍/👎 反馈                          │
│  └── 高质量回答模式沉淀，Ai持续进化                         │
│                                                         │
│  📚 热点题库引擎 (v0.2)                                    │
│  ├── ArXiv论文追踪 → 自动生成面试题                        │
│  └── 专题分类：MoE / RLHF / Long Context / Agent 等       │
│                                                         │
│  📈 进步追踪 (v0.2)                                       │
│  ├── 多轮面试记录 → 弱项识别                               │
│  └── 成长曲线可视化                                        │
└───────────────────────────────────────────────────────┘
```

### 3.2 MVP范围（v0.1）

| 模块 | 内容 |
|------|------|
| 简历&项目引擎 | PDF上传+解析，项目详情Markdown输入，AI提取关键信息 |
| 面试模拟 | 文本对话模式，基于简历+项目动态追问，即时反馈 |
| 收藏夹 | 面试中收藏，AI参考答案，点赞/点踩 |
| 面试复盘 | 录音上传，Whisper转录，个人表现诊断 |

热点题库、公司画像、进步追踪留到v0.2。

---

## 4. 技术架构

### 4.1 技术栈

| 层 | 选型 | 理由 |
|---|---|---|
| 框架 | Next.js 14 (App Router) + React 19 | 全栈一体，API Routes处理后端逻辑 |
| 语言 | TypeScript | 全栈类型安全 |
| 样式 | CSS Modules + CSS自定义属性 | 参考openhanako变量体系，主题可切换 |
| 状态管理 | Zustand 5 | 轻量，无模板地狱 |
| 数据库 | better-sqlite3 (WAL模式) | 本地开发零配置，后续可迁pg |
| ORM | Drizzle ORM | 类型安全，SQL-like |
| 语音 | Web Speech API (STT) + Whisper (录音转录) | 前者免费用，后者精确 |
| AI | Vercel AI SDK + Claude API / OpenAI兼容 | 多模型可切换 |
| 部署 | Vercel / 本地开发 | 自用阶段本地即可 |

### 4.2 项目结构

```
offerpilot/
├── app/                    # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx            # 首页（仪表盘）
│   ├── interview/           # 面试模拟页
│   │   └── page.tsx
│   ├── review/              # 面试复盘页
│   │   └── page.tsx
│   ├── collection/          # 收藏夹页
│   │   └── page.tsx
│   └── api/                 # API Routes
│       ├── resume/          # 简历上传+解析
│       ├── interview/       # 面试对话接口
│       ├── review/          # 录音分析
│       └── collection/      # 收藏+反馈
├── components/              # React组件
│   ├── ui/                  # 基础UI（按钮、卡片、输入框）
│   ├── resume/              # 简历相关组件
│   ├── interview/           # 面试界面组件
│   ├── review/              # 复盘分析组件
│   └── collection/          # 收藏夹组件
├── lib/                     # 核心逻辑
│   ├── ai/                  # AI调用封装
│   ├── db/                  # 数据库操作
│   ├── speech/              # 语音处理
│   └── utils/               # 工具函数
├── stores/                  # Zustand stores
├── shared/                  # 共享类型、常量
├── public/                  # 静态资源
└── docs/                    # 文档
```

### 4.3 数据模型

```typescript
// 用户知识库
interface Candidate {
  id: string;
  name: string;
  resumeText: string;       // 简历全文
  resumeParsed: {            // AI解析后的结构化数据
    skills: string[];
    projects: ProjectSummary[];
    education: string;
  };
  createdAt: Date;
}

interface ProjectDetail {
  id: string;
  candidateId: string;
  name: string;
  content: string;          // Markdown，用户自由描述
  keyDecisions: string[];   // AI提取的关键技术决策
  painPoints: string[];     // AI提取的难点
  createdAt: Date;
}

// 面试会话
interface InterviewSession {
  id: string;
  candidateId: string;
  status: 'active' | 'completed';
  messages: InterviewMessage[];
  startedAt: Date;
  endedAt?: Date;
}

interface InterviewMessage {
  id: string;
  role: 'interviewer' | 'candidate';
  content: string;
  timestamp: Date;
  voiceUrl?: string;        // 用户语音回答的音频URL
  feedback?: {              // AI给用户的反馈
    score: number;
    strengths: string[];
    improvements: string[];
  };
}

// 收藏夹
interface Bookmark {
  id: string;
  sessionId: string;
  question: string;          // 面试官的问题
  userAnswer: string;        // 用户当时的回答
  aiAnswer: string;          // AI生成的参考答案
  aiAnswerVersion: number;   // 参考答案版本号（点踩后重新生成）
  votes: { up: number; down: number };
  userVote?: 'up' | 'down';  // 当前用户的投票
  createdAt: Date;
}

// 面试复盘
interface ReviewReport {
  id: string;
  sessionId: string;
  audioUrl: string;
  transcript: string;        // Whisper转录全文
  analysis: {
    pace: string;            // 语速分析
    fillerWords: string[];   // 填充词统计
    weakPoints: {            // 弱项识别
      question: string;
      issue: string;
      suggestion: string;
    }[];
    overallScore: number;
  };
  createdAt: Date;
}
```

---

## 5. 视觉设计

### 5.1 设计语言

延续 OpenHanako "纸本世界"的视觉语言，但加入面试训练产品的独特气质：

**核心理念**：暖纸 + 墨色 + 安静。面试准备是压力场景，界面应该让人想坐下来。

### 5.2 CSS自定义属性

```css
:root {
  /* 纸张 */
  --bg:           #F7F4ED;
  --bg-card:      #FCFAF5;
  --bg-glass:     rgba(252, 250, 245, 0.92);
  --sidebar-bg:   #EFE9DA;

  /* 墨色 5档 */
  --text:         #2D2926;    /* 浓墨 */
  --text-light:   #5B5550;    /* 二级 */
  --text-muted:   #8B8478;    /* 说明文字 */

  /* 印章/强调色 */
  --accent:       #4A7C96;    /* 深青蓝 */
  --accent-hover: #3D657A;
  --accent-light: rgba(74, 124, 150, 0.08);
  --accent-rgb:   74, 124, 150;

  /* 语义色 */
  --success:      #5B8C5A;    /* 通过 */
  --warning:      #C4884B;    /* 待改进 */
  --danger:       #B8554F;    /* 严重 */

  /* 面试专属 */
  --interviewer-bg:    rgba(74, 124, 150, 0.06);
  --candidate-bg:      rgba(0, 0, 0, 0.04);
  --interviewer-text:  #2D2926;
  --feedback-bg:       rgba(91, 140, 90, 0.06);

  /* 结构与动效 */
  --radius-sm: 2px;
  --radius-md: 3px;
  --radius-lg: 4px;
  --border-width: 0.5px;
  --border: #D8CFBE;
  --shadow: rgba(45, 41, 38, 0.04);

  /* 字体 */
  --font-serif: 'Noto Serif SC', 'Songti SC', serif;
  --font-ui: -apple-system, 'PingFang SC', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* 动效 */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --duration: 0.3s;
}
```

### 5.3 页面结构

```
┌─────────────────────────────────────────────┐
│  📋 OfferPilot                     [设置]   │  ← 顶栏，极简
├──────────┬──────────────────────────────────┤
│          │                                  │
│  📁 会话  │                                  │
│  列表    │       面试对话区域                 │
│          │                                  │
│  · 3/14  │    ┌─────────────────────────┐   │
│    字节   │    │ 面试官：你提到了用LoRA    │   │
│    实习   │    │ 微调，能具体说一下...     │   │
│          │    └─────────────────────────┘   │
│  · 3/12  │                                  │
│    快手   │    ┌─────────────────────────┐   │
│    算法   │    │ 你：我当时用了PEFT库...   │   │
│          │    └─────────────────────────┘   │
│          │                                  │
│          │    ┌── AI反馈 ──────────────┐    │
│          │    │ 👍 结构清晰             │    │
│          │    │ ⚠️ 可以补充rank选择依据  │    │
│          │    │ ⭐ 收藏  📋 参考答案     │    │
│          │    └────────────────────────┘    │
│          │                                  │
│          ├──────────────────────────────────┤
│          │  [🎤 语音输入]  ________________  │  ← 底部输入区
│          │                  [发送 →]        │
├──────────┴──────────────────────────────────┤
│  ⭐ 收藏 | 📊 复盘 | 📋 简历 | 📚 题库       │  ← 底部导航
└─────────────────────────────────────────────┘
```

---

## 6. 核心交互流程

### 6.1 首次使用流程

```
打开应用
  → 上传简历 (PDF)
  → AI解析：提取项目列表、技术栈
  → 填写项目详情（每个项目一个Markdown输入框）
  → AI解析：提取关键技术决策、难点
  → 生成"你的故事库" + 面试题预览
  → 进入首次面试模拟
```

### 6.2 面试模拟流程

```
选择面试类型（技术面/综合面）
  → AI面试官发起第一个问题（基于简历生成）
  → 用户文字/语音回答
  → AI给出即时反馈（评分 + 改进建议）
  → AI基于上一个回答 + 项目详情发起追问
  → 循环直到用户主动结束或达到设定轮次
  → 生成面试总结报告
```

### 6.3 收藏+反馈流程

```
面试中遇到卡壳问题
  → 点击 ⭐ 收藏
  → AI自动生成参考答案
  → 用户看到参考答案，点击 👍 或 👎
  → 👍: 该回答模式被标记为高质量
  → 👎: 触发AI重新生成答案，新版本覆盖旧版本
  → 所有收藏可在收藏夹页面集中浏览
```

### 6.4 录音复盘流程

```
上传面试录音 (mp3/wav/m4a)
  → Whisper转录为文字
  → AI分析：
      ├── 语速：过快/过慢的时间段
      ├── 填充词："然后""那个"等出现频率
      ├── 弱项：哪些问题答得不好，具体哪里不好
      └── 改进建议：下次遇到类似问题怎么说
  → 生成诊断报告
```

---

## 7. 非功能需求

### 7.1 性能

- 面试对话延迟：AI回复 < 3秒（流式输出）
- 语音转文字延迟：Web Speech API 实时级别
- 录音转录延迟：< 录音时长的 1/3

### 7.2 安全

- 简历、项目详情、面试录音均为用户敏感数据
- 本地SQLite存储，不上传第三方
- 大模型API调用仅传输当前对话上下文，不传输完整简历

### 7.3 可扩展

- 模型可切换（Claude / OpenAI / 国产模型）
- 数据库可迁移（SQLite → PostgreSQL）
- 后续可加小程序端

---

## 8. v0.2 规划（不纳入MVP）

- 📚 热点题库引擎：ArXiv追踪 + 自动生成面试题
- 🕷️ 面经爬取：爬取牛客/知乎/脉脉等网站的面经，结构化入库，扩充通用题库
- 📈 进步追踪：弱项变化可视化
- 🏢 公司面试画像：多次录音积累的面试风格知识库
- 🎤 全语音模式：AI面试官语音发问
- 🌐 分享功能：面经分享链接

---

## 9. 自审清单

- [x] 无 TBD/TODO 占位符
- [x] 模块边界清晰：简历引擎 / 面试模拟 / 复盘 / 收藏反馈环 各自独立
- [x] MVP范围明确：四个核心模块 + 两种交互模式
- [x] 技术选型有理由：Next.js全栈 + SQLite本地 + Zustand轻量状态
- [x] 视觉设计有完整Token定义，参考了openhanako但保持了独立性
- [x] 数据模型覆盖了所有核心流程
- [x] 竞品分析覆盖了企业端、求职者端、海外产品三个维度
