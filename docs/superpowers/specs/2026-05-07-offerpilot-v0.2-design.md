# OfferPilot v0.2 产品设计方案

> 多赛道面试训练平台：从八股到手撕，从简历到综合模拟，一个地方练透大模型算法岗

---

## 1. 背景

v0.1 建立了基础链路：简历上传 → AI解析 → 模拟面试 → 收藏反馈 → 录音复盘。但只有"基于简历的综合面试"一种模式，覆盖面太窄。

v0.2 的核心变化：**从单一的面试模拟器，变成多赛道的面试训练平台。** 新增四个专项训练赛道 + 本地文件系统缓存。

---

## 2. 产品架构

### 2.1 赛道总览

```
OfferPilot v0.2
├── 🏠 仪表盘
│   ├── 已缓存档案列表（简历、项目、录音）
│   ├── 历史面试记录
│   └── 新建训练入口
│
├── 📋 简历专项（v0.1 增强）
│   └── 上传简历 → 项目详情 → 基于简历的追问面试
│
├── 📚 大模型八股（新增）
│   └── 后训练 / 多模态 / RAG / Agent 四专题
│
├── ⚙️ LeetCode算法（新增）
│   └── AI出题 + 原站链接 + 回传代码AI评判
│
├── 🔥 大模型手撕代码（新增）
│   └── TorchCode风格 + Monaco编辑器 + AI逐行审查
│
├── 🎯 综合模拟（增强）
│   └── 四赛道混合出题池
│
├── 💾 本地缓存系统（新增）
│   └── .offerpilot_cache/ 文件系统
│
└── ⭐ 收藏夹 + 📊 复盘（v0.1 保留）
```

### 2.2 各赛道交互模式

| 赛道 | 出题方式 | 作答方式 | 评判方式 | 编辑器 |
|------|---------|---------|---------|--------|
| 大模型八股 | AI按专题出文本题 | 文本输入 | AI评分+参考答案 | 无，纯文本 |
| LeetCode算法 | AI出题+LC链接 | 去LC做题，回传代码 | AI评判复杂度/边界 | 无编辑器 |
| 手撕代码 | AI出Torch实现题 | 在线编写+提交 | AI逐行审查+建议 | Monaco |
| 简历专项 | 基于简历+项目追问 | 文本/语音 | AI反馈 | 无，对话模式 |
| 综合模拟 | 混合池随机出题 | 按题目类型切换 | 各类型分别评判 | Monaco/文本切换 |

### 2.3 手撕代码专题方向

聚焦大模型算法核心技术栈：

- **后训练 (Post-Training)**：LoRA实现、SFT数据构造、DPO/RLHF loss、reward model训练
- **多模态 (Multimodal)**：CLIP对比损失、ViT实现、cross-attention融合、视觉编码器
- **RAG**：向量检索pipeline、chunk策略、rerank、hybrid search
- **Agent**：ReAct循环、tool calling、memory管理、多agent协作

---

## 3. 技术架构

### 3.1 技术栈更新

| 层 | v0.1 | v0.2 |
|---|---|---|
| 编辑器 | 无 | Monaco Editor (`@monaco-editor/react`) |
| 文件缓存 | localStorage | Node.js `fs` + `.offerpilot_cache/` |
| 题库 | AI即时生成 | AI生成 + 本地JSON题库缓存 |
| 页面 | 3个页面 | 增加多个track页面 + 仪表盘 |

### 3.2 项目结构变更

```
新增/变更文件：

offerpilot/
├── app/
│   ├── page.tsx                    # 改为仪表盘
│   ├── tracks/                     # 新增：赛道页面路由
│   │   ├── basics/                 # 大模型八股
│   │   │   └── page.tsx
│   │   ├── leetcode/               # LeetCode算法
│   │   │   └── page.tsx
│   │   ├── torchcode/              # 手撕代码
│   │   │   └── page.tsx
│   │   ├── resume/                 # 简历专项（原interview改名）
│   │   │   └── page.tsx
│   │   └── comprehensive/          # 综合模拟
│   │       └── page.tsx
│   └── api/
│       ├── tracks/                  # 新增：各赛道API
│       │   ├── basics/route.ts      # 八股出题+评判
│       │   ├── leetcode/route.ts    # LC出题+评判
│       │   ├── torchcode/route.ts   # 手撕出题+审查
│       │   └── comprehensive/route.ts # 综合出题
│       ├── cache/                   # 新增：文件缓存API
│       │   ├── list/route.ts        # 列出缓存档案
│       │   ├── load/route.ts        # 加载指定档案
│       │   └── save/route.ts        # 保存档案
│       └── interview/               # 保留
│           └── ...
│
├── components/
│   ├── dashboard/                   # 新增：仪表盘组件
│   │   ├── CacheList.tsx
│   │   ├── TrackCards.tsx
│   │   └── Dashboard.module.css
│   ├── tracks/                      # 新增：各赛道组件
│   │   ├── TrackLayout.tsx          # 赛道通用布局
│   │   ├── TrackLayout.module.css
│   │   ├── BasicsChat.tsx           # 八股对话
│   │   ├── LeetCodePanel.tsx        # LC题目面板
│   │   ├── CodeEditor.tsx           # Monaco封装
│   │   └── CodeReview.tsx           # 代码审查结果展示
│   ├── interview/                   # 保留增强
│   │   ├── InterviewChat.tsx
│   │   ├── TrackSelector.tsx        # 新增：赛道选择器
│   │   └── ...
│   └── ui/                          # 保留增强
│       └── ...
│
├── lib/
│   ├── cache/                       # 新增：缓存系统
│   │   ├── fs-cache.ts             # 文件系统缓存核心
│   │   └── cache-types.ts          # 缓存数据结构
│   ├── ai/
│   │   ├── tracks/                  # 新增：各赛道prompt
│   │   │   ├── basics.ts           # 八股出题+评判
│   │   │   ├── leetcode.ts         # LC评判
│   │   │   ├── torchcode.ts       # 手撕审查
│   │   │   └── comprehensive.ts   # 综合出题
│   │   └── ...                     # 保留
│   └── ...
│
└── .offerpilot_cache/               # 新增：本地缓存目录（gitignore）
    ├── resumes/                     # PDF原文件
    ├── parsed/                      # AI解析结果JSON
    ├── history/                     # 面试记录
    └── answers/                     # 手撕代码存档
```

### 3.3 数据模型更新

```typescript
// ===== 赛道定义 =====
type TrainingTrack =
  | 'basics'          // 大模型八股
  | 'leetcode'        // LeetCode算法
  | 'torchcode'       // 手撕代码
  | 'resume'          // 简历专项
  | 'comprehensive';  // 综合模拟

// ===== 八股子专题 =====
type BasicsTopic =
  | 'post-training'   // 后训练
  | 'multimodal'      // 多模态
  | 'rag'             // RAG
  | 'agent';          // Agent

// ===== 面试消息增强 =====
interface TrackMessage extends InterviewMessage {
  track: TrainingTrack;
  topic?: BasicsTopic;           // 八股的子专题
  leetcodeUrl?: string;          // LC原站链接
  codeContent?: string;          // 用户提交的代码
  codeReview?: CodeReviewResult; // 代码审查结果
}

interface CodeReviewResult {
  correctness: string;      // 逻辑正确性评价
  complexity: string;       // 时间/空间复杂度分析
  style: string[];          // 代码风格建议
  improvements: {           // 改进建议
    line: number;
    issue: string;
    suggestion: string;
  }[];
  score: number;            // 1-10
}

// ===== 缓存数据结构 =====
interface CachedResume {
  id: string;
  fileName: string;
  pdfPath: string;          // .offerpilot_cache/resumes/xxx.pdf
  parsed: ResumeParsed;
  projects: ProjectDetail[];
  createdAt: string;
  updatedAt: string;
}

interface CachedSession {
  id: string;
  track: TrainingTrack;
  topic?: BasicsTopic;
  date: string;
  messages: TrackMessage[];
  summary?: string;         // AI生成的面试小结
}
```

### 3.4 缓存系统设计

```
.offerpilot_cache/
├── index.json              # 全局索引 { resumes: [...], sessions: [...] }
├── resumes/
│   └── {id}.pdf
├── parsed/
│   └── {id}.json           # CachedResume 结构
├── history/
│   └── {date}_{track}.json # CachedSession 结构
└── answers/
    └── {date}_{question}.py
```

核心API：
- `GET /api/cache/list` — 读取 `index.json` 返回所有档案列表
- `POST /api/cache/load` — 加载指定简历档案的完整数据
- `POST /api/cache/save` — 保存简历解析结果、面试记录
- `POST /api/cache/save-answer` — 保存手撕代码到 `.py` 文件

仪表盘加载流程：
```
打开首页 → 读缓存index → 展示档案列表
→ 用户点击某档案 → 加载完整数据到Zustand → 选择赛道 → 开始训练
```

---

## 4. 视觉设计

### 4.1 仪表盘布局

```
┌──────────────────────────────────────────────────────┐
│  📋 OfferPilot                             [设置]    │
├──────────┬───────────────────────────────────────────┤
│          │                                          │
│  📁 导航  │   📊 训练档案                             │
│          │   ┌────────┐ ┌────────┐ ┌─────────────┐ │
│  🏠 首页  │   │ 📄 字节 │ │ 📄 快手 │ │ 📄 百度     │ │
│          │   │ 3/14   │ │ 3/12   │ │ 3/16       │ │
│  ⭐ 收藏  │   └────────┘ └────────┘ └─────────────┘ │
│          │                                          │
│  📊 复盘  │   🎯 新建训练                               │
│          │   ┌───────────┐ ┌──────────────┐         │
│  ──────  │   │ 📚 大模型  │ │ ⚙️ LeetCode  │         │
│          │   │   八股     │ │   算法       │         │
│  训练记录│   ├───────────┤ ├──────────────┤         │
│  · 05/07 │   │ 🔥 手撕    │ │ 📋 简历      │         │
│    八股   │   │   代码     │ │   专项       │         │
│          │   ├───────────┤ ├──────────────┤         │
│  · 05/06 │   │                │  🎯 综合模拟 │         │
│    综合   │   │                │              │         │
│          │   └────────────────┴──────────────┘        │
└──────────┴───────────────────────────────────────────┘
```

### 4.2 手撕代码页布局

```
┌──────────────────────────────────────────────────┐
│  🔥 手撕代码                        [后训练 ▼]   │
├────────────────────┬─────────────────────────────┤
│                    │                              │
│  题目面板           │        Monaco 编辑器          │
│                    │                              │
│  实现 Multi-Head   │  class MultiHeadAttention:   │
│  Attention 的前向   │    def __init__(self, ...):  │
│  传播，要求：        │                              │
│  - 支持mask        │    def forward(self, Q, K,   │
│  - 处理d_k缩放      │              V, mask=None):  │
│  - batch-first     │        ...                   │
│                    │                              │
│  [提交审查 →]       │                              │
│                    │                              │
├────────────────────┴─────────────────────────────┤
│  📋 AI审查结果                                    │
│  ✅ 逻辑正确 · ⚠️ mask处理有遗漏 · 💡 可加dropout │
│  复杂度：O(n²d) · 评分：7/10                       │
└──────────────────────────────────────────────────┘
```

---

## 5. 核心交互流程

### 5.1 仪表盘 → 赛道选择

```
打开首页
  → 扫描 .offerpilot_cache/index.json
  → 展示已缓存档案列表（可点击加载到当前会话）
  → 展示五个赛道入口卡片
  → 用户选择赛道（部分赛道需先加载简历档案）
  → 进入对应训练页面
```

### 5.2 大模型八股流程

```
选择专题（后训练/多模态/RAG/Agent）
  → AI出文本题
  → 用户文本回答
  → AI评分 + 参考答案
  → 可选收藏
  → 下一题
  → 可随时切换专题
```

### 5.3 LeetCode算法流程

```
AI出题 + 显示LC原站链接
  → 用户去LC做题、调试
  → 回到OfferPilot粘贴代码
  → AI评判（复杂度分析、边界处理、代码风格）
  → 给出改进建议
  → 可选收藏
```

### 5.4 手撕代码流程

```
选择专题（后训练/多模态/RAG/Agent）
  → AI出Torch实现题
  → 用户在线Monaco编辑器写代码
  → 提交审查
  → AI逐行分析 + 逻辑正确性 + 改进建议
  → 代码存档到 .offerpilot_cache/answers/
```

### 5.5 综合模拟流程

```
确认使用哪个简历档案
  → AI从混合池出题
     分配比例：50%简历项目追问 + 20%八股 + 20%手撕 + 10%算法
  → 根据题目类型切换交互模式
     - 文本题 → 文本回答
     - 代码题 → Monaco编辑器
  → 各类型分别评判
```

---

## 6. MVP范围

本次v0.2分两个迭代：

### v0.2-1：缓存系统 + 四个专项赛道（不含综合模拟）

| 模块 | 内容 |
|------|------|
| 文件缓存系统 | .offerpilot_cache/ 创建、读写、索引 |
| 仪表盘重设计 | 档案列表 + 赛道入口卡片 |
| 大模型八股 | 四专题出题+评判 |
| LeetCode算法 | 出题+链接+代码评判 |
| 手撕代码 | Monaco编辑器+AI代码审查 |
| 简历专项 | v0.1已有功能，接入缓存系统 |

### v0.2-2：综合模拟 + 题库缓存

| 模块 | 内容 |
|------|------|
| 综合模拟 | 混合出题池+多模式切换 |
| 题库本地缓存 | 高频题JSON本地化，减少AI调用 |

---

## 7. 非功能需求

### 7.1 性能
- Monaco 编辑器首次加载 < 2s（CDN + lazy load）
- 缓存文件读取 < 100ms（本地文件系统）
- AI评判响应同 v0.1（流式输出，< 3s首字）

### 7.2 安全
- `.offerpilot_cache/` 加入 gitignore
- 缓存文件仅本地可读

### 7.3 可扩展
- 赛道为插件式设计（`tracks/` 下每个赛道独立目录）
- 新增赛道 = 新增 `lib/ai/tracks/xxx.ts` + `app/tracks/xxx/page.tsx` + `app/api/tracks/xxx/route.ts`

---

## 8. 自审清单

- [x] 五个赛道定义明确，交互模式各不同
- [x] 缓存系统结构清晰，本地文件系统方案
- [x] Monaco 编辑器用于手撕代码赛道
- [x] 数据模型覆盖所有新增类型
- [x] 项目结构变更具体到文件路径
- [x] MVP 分两迭代，降低复杂度
- [x] 无 TBD/TODO 占位符
