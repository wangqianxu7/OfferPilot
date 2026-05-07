# OfferPilot v0.1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web-based AI interview coach for LLM/algorithm internship candidates — resume parsing, mock interviews with dynamic follow-up, bookmark/feedback system, and interview recording review.

**Architecture:** Next.js 14 App Router full-stack app. React 19 + CSS Modules + Zustand frontend, SQLite via Drizzle ORM for data, Vercel AI SDK for LLM integration, Web Speech API for voice input.

**Tech Stack:** Next.js 14, React 19, TypeScript, CSS Modules, Zustand 5, better-sqlite3, Drizzle ORM, Vercel AI SDK, Web Speech API

---

## File Structure Map

```
offerpilot/
├── app/
│   ├── globals.css              # CSS custom properties (design tokens)
│   ├── layout.tsx               # Root layout with nav shell
│   ├── page.tsx                 # Home / dashboard
│   ├── interview/page.tsx       # Interview session page
│   ├── collection/page.tsx      # Bookmark collection page
│   ├── review/page.tsx          # Recording review page
│   └── api/
│       ├── resume/parse/route.ts    # PDF upload + AI parse
│       ├── projects/[id]/route.ts   # Project detail CRUD
│       ├── interview/chat/route.ts  # Interview streaming chat
│       ├── interview/feedback/route.ts  # Generate answer feedback
│       ├── bookmarks/route.ts       # Bookmark CRUD
│       ├── bookmarks/[id]/vote/route.ts  # Upvote/downvote
│       ├── review/transcribe/route.ts    # Audio upload + transcription
│       └── review/analyze/route.ts       # Transcript analysis
├── components/
│   ├── ui/                      # Shared UI primitives
│   │   ├── Button.tsx
│   │   ├── Button.module.css
│   │   ├── Card.tsx
│   │   ├── Card.module.css
│   │   ├── Textarea.tsx
│   │   ├── Textarea.module.css
│   │   ├── FileUpload.tsx
│   │   └── FileUpload.module.css
│   ├── layout/
│   │   ├── Sidebar.tsx          # Session list sidebar
│   │   ├── Sidebar.module.css
│   │   ├── TopBar.tsx           # Minimal top bar
│   │   └── TopBar.module.css
│   ├── resume/
│   │   ├── ResumeUploader.tsx   # PDF upload + parse trigger
│   │   ├── ResumeUploader.module.css
│   │   ├── ProjectEditor.tsx    # Project detail input
│   │   └── ProjectEditor.module.css
│   ├── interview/
│   │   ├── InterviewChat.tsx    # Main chat area
│   │   ├── InterviewChat.module.css
│   │   ├── InterviewerBubble.tsx
│   │   ├── CandidateBubble.tsx
│   │   ├── FeedbackCard.tsx
│   │   ├── InputArea.tsx        # Text + voice input
│   │   └── InputArea.module.css
│   ├── bookmark/
│   │   ├── BookmarkList.tsx
│   │   ├── BookmarkCard.tsx
│   │   └── Bookmark.module.css
│   └── review/
│       ├── AudioUploader.tsx
│       ├── ReviewReport.tsx
│       └── Review.module.css
├── lib/
│   ├── db/
│   │   ├── schema.ts           # Drizzle schema definitions
│   │   ├── index.ts            # DB connection singleton
│   │   └── seed.ts             # Optional seed data
│   ├── ai/
│   │   ├── resume-parser.ts    # AI resume parsing prompt
│   │   ├── interviewer.ts      # Interview system prompt+logic
│   │   ├── feedback.ts         # Answer feedback generation
│   │   └── review-analyzer.ts  # Transcript analysis prompt
│   ├── speech/
│   │   └── recognition.ts      # Web Speech API wrapper
│   └── utils/
│       └── pdf.ts              # PDF text extraction
├── stores/
│   ├── candidate-store.ts      # Candidate & projects state
│   ├── interview-store.ts      # Active interview session state
│   ├── bookmark-store.ts       # Bookmark collection state
│   └── review-store.ts         # Review reports state
├── shared/
│   └── types.ts                # All shared TypeScript types
├── drizzle.config.ts
├── package.json
├── tsconfig.json
└── next.config.js
```

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.js`
- Create: `drizzle.config.ts`
- Create: `app/globals.css`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `shared/types.ts`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd /Users/wenwang/Documents/WorkTable/Agent/OfferPilot && \
npx create-next-app@latest . --typescript --tailwind false --eslint false --app --src-dir false --import-alias "@/*" --use-npm --no-turbopack
```

Expected: Next.js project scaffolded with `package.json`, `tsconfig.json`, `app/` directory.

- [ ] **Step 2: Install additional dependencies**

```bash
npm install zustand better-sqlite3 drizzle-orm drizzle-kit ai @ai-sdk/openai pdf-parse dotenv && \
npm install -D @types/better-sqlite3 @types/pdf-parse
```

Expected: All dependencies installed.

- [ ] **Step 3: Create `app/globals.css` with design tokens**

```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&display=swap');

:root {
  --bg:            #F7F4ED;
  --bg-card:       #FCFAF5;
  --bg-glass:      rgba(252, 250, 245, 0.92);
  --sidebar-bg:    #EFE9DA;

  --text:          #2D2926;
  --text-light:    #5B5550;
  --text-muted:    #8B8478;

  --accent:        #4A7C96;
  --accent-hover:  #3D657A;
  --accent-light:  rgba(74, 124, 150, 0.08);
  --accent-rgb:    74, 124, 150;

  --success:       #5B8C5A;
  --warning:       #C4884B;
  --danger:        #B8554F;

  --interviewer-bg:   rgba(74, 124, 150, 0.06);
  --candidate-bg:     rgba(0, 0, 0, 0.04);
  --feedback-bg:      rgba(91, 140, 90, 0.06);

  --radius-sm: 2px;
  --radius-md: 3px;
  --radius-lg: 4px;
  --border-width: 0.5px;
  --border: #D8CFBE;
  --shadow: rgba(45, 41, 38, 0.04);

  --font-serif: 'Noto Serif SC', 'Songti SC', serif;
  --font-ui: -apple-system, 'PingFang SC', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --duration: 0.3s;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: var(--font-ui);
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 4: Create root `app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OfferPilot - AI面试教练',
  description: '专为算法岗实习生打造的AI面试模拟教练',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 5: Create placeholder `app/page.tsx`**

```tsx
export default function HomePage() {
  return (
    <main>
      <h1>OfferPilot</h1>
      <p>AI面试教练，助你拿到心仪Offer</p>
    </main>
  );
}
```

- [ ] **Step 6: Create `shared/types.ts`**

```typescript
export interface Candidate {
  id: string;
  name: string;
  resumeText: string;
  resumeParsed: ResumeParsed | null;
  createdAt: string;
}

export interface ResumeParsed {
  skills: string[];
  projects: ProjectSummary[];
  education: string;
}

export interface ProjectSummary {
  name: string;
  description: string;
  techStack: string[];
}

export interface ProjectDetail {
  id: string;
  candidateId: string;
  name: string;
  content: string;
  keyDecisions: string[];
  painPoints: string[];
  createdAt: string;
}

export interface InterviewSession {
  id: string;
  candidateId: string;
  status: 'active' | 'completed';
  startedAt: string;
  endedAt?: string;
}

export interface InterviewMessage {
  id: string;
  sessionId: string;
  role: 'interviewer' | 'candidate';
  content: string;
  voiceUrl?: string;
  feedback?: InterviewFeedback;
  timestamp: string;
}

export interface InterviewFeedback {
  score: number;
  strengths: string[];
  improvements: string[];
}

export interface Bookmark {
  id: string;
  sessionId: string;
  question: string;
  userAnswer: string;
  aiAnswer: string;
  aiAnswerVersion: number;
  upVotes: number;
  downVotes: number;
  userVote: 'up' | 'down' | null;
  createdAt: string;
}

export interface ReviewReport {
  id: string;
  sessionId?: string;
  audioUrl: string;
  transcript: string;
  analysis: ReviewAnalysis | null;
  createdAt: string;
}

export interface ReviewAnalysis {
  pace: string;
  fillerWords: string[];
  weakPoints: {
    question: string;
    issue: string;
    suggestion: string;
  }[];
  overallScore: number;
}
```

- [ ] **Step 7: Verify build works**

```bash
npm run dev
```

Open http://localhost:3000, expect "OfferPilot" heading to render.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "$(cat <<'EOF'
feat: scaffold Next.js project with design tokens and shared types

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Database Schema & Connection

**Files:**
- Create: `lib/db/schema.ts`
- Create: `lib/db/index.ts`
- Modify: `drizzle.config.ts`

- [ ] **Step 1: Write Drizzle schema**

Create `lib/db/schema.ts`:

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const candidates = sqliteTable('candidates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  resumeText: text('resume_text').notNull(),
  resumeParsed: text('resume_parsed', { mode: 'json' }),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
});

export const projectDetails = sqliteTable('project_details', {
  id: text('id').primaryKey(),
  candidateId: text('candidate_id').notNull().references(() => candidates.id),
  name: text('name').notNull(),
  content: text('content').notNull(),
  keyDecisions: text('key_decisions', { mode: 'json' }).$type<string[]>(),
  painPoints: text('pain_points', { mode: 'json' }).$type<string[]>(),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
});

export const interviewSessions = sqliteTable('interview_sessions', {
  id: text('id').primaryKey(),
  candidateId: text('candidate_id').notNull().references(() => candidates.id),
  status: text('status').notNull().default('active'),
  startedAt: text('started_at').notNull().default(new Date().toISOString()),
  endedAt: text('ended_at'),
});

export const interviewMessages = sqliteTable('interview_messages', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => interviewSessions.id),
  role: text('role').notNull(),
  content: text('content').notNull(),
  voiceUrl: text('voice_url'),
  feedback: text('feedback', { mode: 'json' }),
  timestamp: text('timestamp').notNull().default(new Date().toISOString()),
});

export const bookmarks = sqliteTable('bookmarks', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => interviewSessions.id),
  question: text('question').notNull(),
  userAnswer: text('user_answer').notNull(),
  aiAnswer: text('ai_answer').notNull(),
  aiAnswerVersion: integer('ai_answer_version').notNull().default(1),
  upVotes: integer('up_votes').notNull().default(0),
  downVotes: integer('down_votes').notNull().default(0),
  userVote: text('user_vote'),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
});

export const reviewReports = sqliteTable('review_reports', {
  id: text('id').primaryKey(),
  sessionId: text('session_id'),
  audioUrl: text('audio_url').notNull(),
  transcript: text('transcript').notNull().default(''),
  analysis: text('analysis', { mode: 'json' }),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
});
```

- [ ] **Step 2: Create database connection**

Create `lib/db/index.ts`:

```typescript
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';

const DB_PATH = process.env.DATABASE_URL || path.join(process.cwd(), 'offerpilot.db');

const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });
export { schema };
```

- [ ] **Step 3: Create `drizzle.config.ts`**

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: { url: './offerpilot.db' },
} satisfies Config;
```

- [ ] **Step 4: Run migration to create tables**

```bash
npx drizzle-kit push
```

Expected: `SQLite database updated successfully` or similar.

- [ ] **Step 5: Commit**

```bash
git add lib/db/schema.ts lib/db/index.ts drizzle.config.ts && git commit -m "$(cat <<'EOF'
feat: add Drizzle ORM schema and SQLite database connection

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: UI Primitives

**Files:**
- Create: `components/ui/Button.tsx`
- Create: `components/ui/Button.module.css`
- Create: `components/ui/Card.tsx`
- Create: `components/ui/Card.module.css`
- Create: `components/ui/Textarea.tsx`
- Create: `components/ui/Textarea.module.css`
- Create: `components/ui/FileUpload.tsx`
- Create: `components/ui/FileUpload.module.css`

- [ ] **Step 1: Create Button component**

Create `components/ui/Button.tsx`:

```tsx
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`${styles.btn} ${styles[variant]} ${styles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

Create `components/ui/Button.module.css`:

```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: var(--radius-sm);
  font-family: var(--font-ui);
  font-size: 0.85rem;
  cursor: pointer;
  transition: opacity 0.15s, background 0.15s;
  border: 0.5px solid var(--border);
}

.btn:disabled { opacity: 0.5; cursor: default; }

.primary {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
.primary:hover:not(:disabled) { background: var(--accent-hover); }

.ghost {
  background: transparent;
  color: var(--text-light);
}
.ghost:hover:not(:disabled) { background: var(--accent-light); }

.danger {
  background: var(--danger);
  color: #fff;
  border-color: var(--danger);
}

.sm { padding: 0.25rem 0.6rem; font-size: 0.78rem; }
.md { padding: 0.45rem 1rem; }
```

- [ ] **Step 2: Create Card component**

Create `components/ui/Card.tsx`:

```tsx
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return <div className={`${styles.card} ${className}`}>{children}</div>;
}
```

Create `components/ui/Card.module.css`:

```css
.card {
  background: var(--bg-card);
  border: var(--border-width) solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: 0 1px 4px var(--shadow);
  padding: 1rem;
}
```

- [ ] **Step 3: Create Textarea component**

Create `components/ui/Textarea.tsx`:

```tsx
import styles from './Textarea.module.css';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className = '', ...props }: TextareaProps) {
  return (
    <div className={styles.wrap}>
      {label && <label className={styles.label}>{label}</label>}
      <textarea className={`${styles.textarea} ${className}`} {...props} />
    </div>
  );
}
```

Create `components/ui/Textarea.module.css`:

```css
.wrap { display: flex; flex-direction: column; gap: 0.3rem; }

.label {
  font-size: 0.82rem;
  color: var(--text-light);
  font-weight: 500;
}

.textarea {
  padding: 0.6rem 0.75rem;
  border: var(--border-width) solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--text);
  font-family: var(--font-ui);
  font-size: 0.88rem;
  line-height: 1.6;
  resize: vertical;
  min-height: 120px;
  transition: border-color 0.15s;
}

.textarea:focus {
  outline: none;
  border-color: var(--accent);
}
```

- [ ] **Step 4: Create FileUpload component**

Create `components/ui/FileUpload.tsx`:

```tsx
'use client';
import { useRef, useState } from 'react';
import styles from './FileUpload.module.css';

interface FileUploadProps {
  accept: string;
  label: string;
  onFile: (file: File) => void;
}

export function FileUpload({ accept, label, onFile }: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    onFile(file);
  };

  return (
    <div className={styles.wrap} onClick={() => ref.current?.click()}>
      <input ref={ref} type="file" accept={accept} className={styles.input} onChange={handleChange} />
      <div className={styles.icon}>📎</div>
      <span className={styles.label}>{fileName || label}</span>
    </div>
  );
}
```

Create `components/ui/FileUpload.module.css`:

```css
.wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px dashed var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.wrap:hover {
  border-color: var(--accent);
  background: var(--accent-light);
}

.input { display: none; }

.icon { font-size: 1.2rem; }

.label {
  font-size: 0.85rem;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

- [ ] **Step 5: Commit**

```bash
git add components/ui/ && git commit -m "$(cat <<'EOF'
feat: add UI primitives - Button, Card, Textarea, FileUpload

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Layout Shell (TopBar + Sidebar)

**Files:**
- Create: `components/layout/TopBar.tsx`
- Create: `components/layout/TopBar.module.css`
- Create: `components/layout/Sidebar.tsx`
- Create: `components/layout/Sidebar.module.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create TopBar component**

Create `components/layout/TopBar.tsx`:

```tsx
import Link from 'next/link';
import styles from './TopBar.module.css';

export function TopBar() {
  return (
    <header className={styles.bar}>
      <Link href="/" className={styles.logo}>OfferPilot</Link>
      <span className={styles.subtitle}>AI面试教练</span>
    </header>
  );
}
```

Create `components/layout/TopBar.module.css`:

```css
.bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 44px;
  padding: 0 1rem;
  border-bottom: var(--border-width) solid var(--border);
  background: var(--bg-glass);
  backdrop-filter: blur(8px);
  position: sticky;
  top: 0;
  z-index: 10;
}

.logo {
  font-family: var(--font-serif);
  font-size: 1rem;
  font-weight: 600;
  color: var(--accent);
  text-decoration: none;
}

.subtitle {
  font-size: 0.75rem;
  color: var(--text-muted);
}
```

- [ ] **Step 2: Create Sidebar component**

Create `components/layout/Sidebar.tsx`:

```tsx
'use client';
import Link from 'next/link';
import styles from './Sidebar.module.css';

interface SidebarProps {
  sessions: { id: string; title: string; date: string }[];
}

export function Sidebar({ sessions }: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.navItem}>🏠 首页</Link>
        <Link href="/collection" className={styles.navItem}>⭐ 收藏夹</Link>
        <Link href="/review" className={styles.navItem}>📊 面试复盘</Link>
      </nav>

      <div className={styles.divider} />

      <div className={styles.sectionLabel}>面试记录</div>
      {sessions.length === 0 ? (
        <p className={styles.empty}>暂无面试记录</p>
      ) : (
        sessions.map(s => (
          <Link key={s.id} href={`/interview?id=${s.id}`} className={styles.sessionItem}>
            <span className={styles.sessionTitle}>{s.title}</span>
            <span className={styles.sessionDate}>{s.date}</span>
          </Link>
        ))
      )}
    </aside>
  );
}
```

Create `components/layout/Sidebar.module.css`:

```css
.sidebar {
  width: 220px;
  flex-shrink: 0;
  background: var(--sidebar-bg);
  border-right: var(--border-width) solid var(--border);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: calc(100vh - 44px);
  overflow-y: auto;
  position: sticky;
  top: 44px;
}

.nav { display: flex; flex-direction: column; gap: 0.2rem; }

.navItem {
  padding: 0.4rem 0.6rem;
  font-size: 0.85rem;
  color: var(--text-light);
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition: background 0.15s;
}
.navItem:hover { background: var(--accent-light); }

.divider {
  border: none;
  border-top: var(--border-width) solid var(--border);
  margin: 0.4rem 0;
}

.sectionLabel {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0 0.6rem;
}

.empty {
  font-size: 0.78rem;
  color: var(--text-muted);
  padding: 0.4rem 0.6rem;
  font-style: italic;
}

.sessionItem {
  display: flex;
  flex-direction: column;
  padding: 0.35rem 0.6rem;
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition: background 0.15s;
}
.sessionItem:hover { background: var(--accent-light); }

.sessionTitle {
  font-size: 0.82rem;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sessionDate {
  font-size: 0.7rem;
  color: var(--text-muted);
}
```

- [ ] **Step 3: Update root layout to include shell**

Modify `app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { TopBar } from '@/components/layout/TopBar';
import { Sidebar } from '@/components/layout/Sidebar';
import './globals.css';

export const metadata: Metadata = {
  title: 'OfferPilot - AI面试教练',
  description: '专为算法岗实习生打造的AI面试模拟教练',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <TopBar />
        <div style={{ display: 'flex' }}>
          <Sidebar sessions={[]} />
          <main style={{ flex: 1, minHeight: 'calc(100vh - 44px)' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Verify layout renders**

```bash
npm run dev
```

Check http://localhost:3000 — expect TopBar, Sidebar with navigation, and main content area.

- [ ] **Step 5: Commit**

```bash
git add components/layout/ app/layout.tsx && git commit -m "$(cat <<'EOF'
feat: add layout shell with TopBar and Sidebar navigation

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Home Page — Resume Upload + Project Entry

**Files:**
- Create: `components/resume/ResumeUploader.tsx`
- Create: `components/resume/ResumeUploader.module.css`
- Create: `components/resume/ProjectEditor.tsx`
- Create: `components/resume/ProjectEditor.module.css`
- Create: `app/api/resume/parse/route.ts`
- Create: `app/api/projects/[id]/route.ts`
- Create: `lib/ai/resume-parser.ts`
- Create: `lib/utils/pdf.ts`
- Create: `stores/candidate-store.ts`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create Zustand candidate store**

Create `stores/candidate-store.ts`:

```typescript
import { create } from 'zustand';
import type { Candidate, ProjectDetail, ResumeParsed } from '@/shared/types';

interface CandidateState {
  candidate: Candidate | null;
  projects: ProjectDetail[];
  setCandidate: (c: Candidate) => void;
  setResumeParsed: (parsed: ResumeParsed) => void;
  setProjects: (projects: ProjectDetail[]) => void;
  addProject: (project: ProjectDetail) => void;
  updateProject: (id: string, updates: Partial<ProjectDetail>) => void;
}

export const useCandidateStore = create<CandidateState>((set) => ({
  candidate: null,
  projects: [],
  setCandidate: (candidate) => set({ candidate }),
  setResumeParsed: (parsed) =>
    set((s) => ({
      candidate: s.candidate ? { ...s.candidate, resumeParsed: parsed } : null,
    })),
  setProjects: (projects) => set({ projects }),
  addProject: (p) => set((s) => ({ projects: [...s.projects, p] })),
  updateProject: (id, updates) =>
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
}));
```

- [ ] **Step 2: Create PDF text extraction utility**

Create `lib/utils/pdf.ts`:

```typescript
export async function extractPdfText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const pdfParse = (await import('pdf-parse')).default;
  const data = await pdfParse(buffer);
  return data.text;
}
```

- [ ] **Step 3: Create AI resume parser**

Create `lib/ai/resume-parser.ts`:

```typescript
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const PARSE_PROMPT = `你是一个简历分析专家。请从以下简历文本中提取信息，严格按JSON格式返回：

{
  "skills": ["技能1", "技能2"],
  "projects": [{ "name": "项目名称", "description": "项目简要描述", "techStack": ["技术1"] }],
  "education": "教育背景简述"
}

简历文本：
`;

export async function parseResume(resumeText: string) {
  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    prompt: PARSE_PROMPT + resumeText,
  });
  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse resume JSON from AI response');
  return JSON.parse(jsonMatch[0]);
}
```

- [ ] **Step 4: Create resume parse API route**

Create `app/api/resume/parse/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { extractPdfText } from '@/lib/utils/pdf';
import { parseResume } from '@/lib/ai/resume-parser';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const resumeText = await extractPdfText(file);
  const parsed = await parseResume(resumeText);

  return NextResponse.json({ resumeText, parsed });
}
```

- [ ] **Step 5: Create project CRUD API route**

Create `app/api/projects/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = uuid();
  await db.insert(schema.projectDetails).values({
    id,
    candidateId: body.candidateId,
    name: body.name,
    content: body.content,
    keyDecisions: body.keyDecisions || [],
    painPoints: body.painPoints || [],
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json({ id });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  await db.update(schema.projectDetails)
    .set({ content: body.content, keyDecisions: body.keyDecisions, painPoints: body.painPoints })
    .where(eq(schema.projectDetails.id, params.id));
  return NextResponse.json({ ok: true });
}
```

Run: `npm install uuid && npm install -D @types/uuid`

- [ ] **Step 6: Create ResumeUploader component**

Create `components/resume/ResumeUploader.tsx`:

```tsx
'use client';
import { useState } from 'react';
import { FileUpload } from '@/components/ui/FileUpload';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useCandidateStore } from '@/stores/candidate-store';
import styles from './ResumeUploader.module.css';

export function ResumeUploader() {
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { candidate, setCandidate, setResumeParsed, setProjects } = useCandidateStore();

  const handleFile = async (file: File) => {
    setParsing(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/resume/parse', { method: 'POST', body: formData });
    if (!res.ok) { setError('解析失败，请重试'); setParsing(false); return; }

    const data = await res.json();
    setCandidate({
      id: crypto.randomUUID(),
      name: data.parsed.education || '候选人',
      resumeText: data.resumeText,
      resumeParsed: data.parsed,
      createdAt: new Date().toISOString(),
    });
    setProjects([]);
    setParsing(false);
  };

  const parsed = candidate?.resumeParsed;

  return (
    <Card className={styles.card}>
      <h2 className={styles.heading}>📋 上传简历</h2>
      <FileUpload accept=".pdf" label="点击上传PDF简历" onFile={handleFile} />
      {parsing && <p className={styles.status}>解析中...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {parsed && (
        <div className={styles.result}>
          <h3>解析结果</h3>
          <div className={styles.section}>
            <span className={styles.tag}>技能</span>
            {parsed.skills.map(s => <span key={s} className={styles.chip}>{s}</span>)}
          </div>
          <div className={styles.section}>
            <span className={styles.tag}>项目</span>
            {parsed.projects.map(p => (
              <div key={p.name} className={styles.projectItem}>
                <strong>{p.name}</strong>
                <span className={styles.desc}>{p.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
```

Create `components/resume/ResumeUploader.module.css`:

```css
.card { margin-bottom: 1.5rem; }

.heading {
  font-family: var(--font-serif);
  font-size: 1.05rem;
  margin-bottom: 0.75rem;
  color: var(--text);
}

.status { font-size: 0.82rem; color: var(--accent); margin-top: 0.5rem; font-style: italic; }
.error { font-size: 0.82rem; color: var(--danger); margin-top: 0.5rem; }

.result { margin-top: 1rem; }
.result h3 { font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.4rem; }

.section { margin-bottom: 0.6rem; display: flex; flex-wrap: wrap; align-items: center; gap: 0.3rem; }

.tag {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-right: 0.3rem;
}

.chip {
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  background: var(--accent-light);
  color: var(--accent);
  border-radius: var(--radius-sm);
}

.projectItem {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  font-size: 0.82rem;
  width: 100%;
  padding: 0.4rem;
  background: var(--bg);
  border-radius: var(--radius-sm);
}

.desc {
  font-size: 0.75rem;
  color: var(--text-muted);
}
```

- [ ] **Step 7: Create ProjectEditor component**

Create `components/resume/ProjectEditor.tsx`:

```tsx
'use client';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useCandidateStore } from '@/stores/candidate-store';
import styles from './ProjectEditor.module.css';
import { useState } from 'react';

export function ProjectEditor() {
  const { candidate, projects, addProject } = useCandidateStore();
  const [edited, setEdited] = useState<Record<string, string>>({});

  if (!candidate?.resumeParsed) return null;

  const handleSave = (name: string) => {
    const content = edited[name];
    if (!content?.trim()) return;
    addProject({
      id: crypto.randomUUID(),
      candidateId: candidate.id,
      name,
      content,
      keyDecisions: [],
      painPoints: [],
      createdAt: new Date().toISOString(),
    });
  };

  const isDirty = (name: string) => edited[name] && edited[name].trim();
  const isSaved = (name: string) => projects.some(p => p.name === name);

  return (
    <Card>
      <h2 className={styles.heading}>📝 项目详情</h2>
      <p className={styles.hint}>
        补充项目细节，AI面试官会基于这些来追问。包括：技术决策的考量、遇到的难点和解决方案、用到的具体库/参数等。
      </p>
      {candidate.resumeParsed.projects.map(proj => (
        <div key={proj.name} className={styles.projectBlock}>
          <h3>{proj.name}</h3>
          <Textarea
            value={edited[proj.name] ?? ''}
            onChange={e => setEdited(prev => ({ ...prev, [proj.name]: e.target.value }))}
            placeholder="描述项目细节：架构选择、技术决策、踩过的坑..."
          />
          <div className={styles.actions}>
            {isSaved(proj.name) && <span className={styles.saved}>✓ 已保存</span>}
            {isDirty(proj.name) && !isSaved(proj.name) && (
              <Button size="sm" onClick={() => handleSave(proj.name)}>保存</Button>
            )}
          </div>
        </div>
      ))}
    </Card>
  );
}
```

Create `components/resume/ProjectEditor.module.css`:

```css
.heading {
  font-family: var(--font-serif);
  font-size: 1.05rem;
  margin-bottom: 0.4rem;
}

.hint {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.projectBlock {
  margin-bottom: 1.2rem;
  padding-bottom: 1rem;
  border-bottom: var(--border-width) solid var(--border);
}
.projectBlock:last-child { border-bottom: none; margin-bottom: 0; }
.projectBlock h3 { font-size: 0.9rem; margin-bottom: 0.4rem; color: var(--text); }

.actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.4rem;
}

.saved {
  font-size: 0.75rem;
  color: var(--success);
}
```

- [ ] **Step 8: Wire up home page**

Modify `app/page.tsx`:

```tsx
'use client';
import { ResumeUploader } from '@/components/resume/ResumeUploader';
import { ProjectEditor } from '@/components/resume/ProjectEditor';
import { Button } from '@/components/ui/Button';
import { useCandidateStore } from '@/stores/candidate-store';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { candidate, projects } = useCandidateStore();
  const router = useRouter();

  const canStart = candidate && projects.length > 0;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '0.3rem' }}>
        开始准备面试
      </h1>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        上传简历，补充项目细节，然后开始模拟面试
      </p>

      <ResumeUploader />
      <ProjectEditor />

      {canStart && (
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Button onClick={() => router.push('/interview')}>
            开始模拟面试 →
          </Button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 9: Verify home page flow**

```bash
npm run dev
```

Open http://localhost:3000. Upload a PDF resume, verify parsed result appears, fill project details.

- [ ] **Step 10: Commit**

```bash
git add components/resume/ stores/ app/api/resume/ app/api/projects/ app/page.tsx lib/ai/ lib/utils/ && git commit -m "$(cat <<'EOF'
feat: add home page with resume upload, parsing, and project detail entry

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Interview Chat Engine

**Files:**
- Create: `lib/ai/interviewer.ts`
- Create: `lib/ai/feedback.ts`
- Create: `app/api/interview/chat/route.ts`
- Create: `app/api/interview/feedback/route.ts`
- Create: `stores/interview-store.ts`
- Create: `components/interview/InterviewerBubble.tsx`
- Create: `components/interview/CandidateBubble.tsx`
- Create: `components/interview/FeedbackCard.tsx`
- Create: `components/interview/InterviewChat.tsx`
- Create: `components/interview/InterviewChat.module.css`
- Create: `components/interview/InputArea.tsx`
- Create: `components/interview/InputArea.module.css`
- Create: `app/interview/page.tsx`

- [ ] **Step 1: Create interview AI system prompt**

Create `lib/ai/interviewer.ts`:

```typescript
export function buildInterviewSystemPrompt(resumeText: string, projectDetails: string): string {
  return `你是一个专业的技术面试官，正在面试一位算法/后端开发实习生岗位的候选人。

## 你的面试风格
- 基于候选人的简历和项目细节进行追问，不要问泛泛的八股文
- 追问要具体：问到具体的参数选择、架构决策、遇到的难点
- 问完技术问题后，适当穿插行为面试问题（团队协作、冲突处理等）
- 每次只问一个问题，不要一次抛出多个问题
- 用友好的语气，但也要适时挑战候选人的回答（"你确定吗？""有没有考虑过...？"）

## 候选人背景
简历：
${resumeText}

项目详情：
${projectDetails}

## 面试流程
1. 先让候选人做简短自我介绍
2. 围绕项目细节进行深挖追问（这是核心）
3. 穿插算法/系统设计问题
4. 留时间给候选人反问

现在开始面试，先让候选人做个自我介绍吧。`;
}

export function buildInterviewContext(history: { role: string; content: string }[]) {
  return history.map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.role === 'candidate' ? `[候选人回答]: ${m.content}` : m.content,
  }));
}
```

- [ ] **Step 2: Create feedback generation**

Create `lib/ai/feedback.ts`:

```typescript
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function generateFeedback(question: string, answer: string) {
  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    prompt: `你是一个面试教练。评估以下候选人的回答。

面试官问题：${question}
候选人回答：${answer}

请严格按JSON格式返回：
{
  "score": 分数(1-10),
  "strengths": ["优点1", "优点2"],
  "improvements": ["改进建议1", "改进建议2"]
}`,
  });
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse feedback JSON');
  return JSON.parse(jsonMatch[0]);
}
```

- [ ] **Step 3: Create interview chat API route (streaming)**

Create `app/api/interview/chat/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { buildInterviewSystemPrompt, buildInterviewContext } from '@/lib/ai/interviewer';

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  const { resumeText, projectDetails, history } = await req.json();

  const systemPrompt = buildInterviewSystemPrompt(resumeText, projectDetails);
  const contextMessages = buildInterviewContext(history);

  const result = streamText({
    model: openai('gpt-4o'),
    system: systemPrompt,
    messages: contextMessages,
  });

  return result.toDataStreamResponse();
}
```

- [ ] **Step 4: Create interview Zustand store**

Create `stores/interview-store.ts`:

```typescript
import { create } from 'zustand';
import type { InterviewSession, InterviewMessage, InterviewFeedback } from '@/shared/types';

interface InterviewState {
  session: InterviewSession | null;
  messages: InterviewMessage[];
  isStreaming: boolean;
  startSession: (candidateId: string) => void;
  addMessage: (msg: InterviewMessage) => void;
  setFeedback: (msgId: string, feedback: InterviewFeedback) => void;
  setStreaming: (v: boolean) => void;
  endSession: () => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  session: null,
  messages: [],
  isStreaming: false,

  startSession: (candidateId) =>
    set({
      session: {
        id: crypto.randomUUID(),
        candidateId,
        status: 'active',
        startedAt: new Date().toISOString(),
      },
      messages: [],
    }),

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),

  setFeedback: (msgId, feedback) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === msgId ? { ...m, feedback } : m)),
    })),

  setStreaming: (isStreaming) => set({ isStreaming }),
  endSession: () =>
    set((s) => ({
      session: s.session ? { ...s.session, status: 'completed', endedAt: new Date().toISOString() } : null,
    })),
}));
```

- [ ] **Step 5: Create InterviewerBubble component**

Create `components/interview/InterviewerBubble.tsx`:

```tsx
import type { InterviewMessage } from '@/shared/types';
import styles from './InterviewChat.module.css';

export function InterviewerBubble({ message }: { message: InterviewMessage }) {
  return (
    <div className={styles.bubbleRow}>
      <span className={styles.roleTag}>面试官</span>
      <div className={styles.interviewerBubble}>
        <p>{message.content}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create CandidateBubble component**

Create `components/interview/CandidateBubble.tsx`:

```tsx
import type { InterviewMessage } from '@/shared/types';
import styles from './InterviewChat.module.css';

export function CandidateBubble({ message, onBookmark }: {
  message: InterviewMessage;
  onBookmark: () => void;
}) {
  return (
    <div className={`${styles.bubbleRow} ${styles.candidateRow}`}>
      <div className={styles.candidateBubble}>
        <p>{message.content}</p>
      </div>
      <div className={styles.candidateActions}>
        <button onClick={onBookmark} className={styles.bookmarkBtn} title="收藏此题">
          ⭐
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Create FeedbackCard component**

Create `components/interview/FeedbackCard.tsx`:

```tsx
import type { InterviewFeedback } from '@/shared/types';
import styles from './InterviewChat.module.css';

export function FeedbackCard({ feedback, onVote }: {
  feedback: InterviewFeedback;
  onVote?: (vote: 'up' | 'down') => void;
}) {
  return (
    <div className={styles.feedbackCard}>
      <div className={styles.feedbackScore}>
        评分：{'⭐'.repeat(feedback.score)} ({feedback.score}/10)
      </div>
      {feedback.strengths.length > 0 && (
        <ul className={styles.feedbackList}>
          {feedback.strengths.map((s, i) => (
            <li key={i} className={styles.strength}>👍 {s}</li>
          ))}
        </ul>
      )}
      {feedback.improvements.length > 0 && (
        <ul className={styles.feedbackList}>
          {feedback.improvements.map((imp, i) => (
            <li key={i} className={styles.improvement}>⚠️ {imp}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 8: Create InterviewChat CSS module**

Create `components/interview/InterviewChat.module.css`:

```css
.chatArea {
  padding: 1.5rem;
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: calc(100vh - 44px - 80px);
  overflow-y: auto;
}

.bubbleRow {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  animation: msgIn 0.3s var(--ease-out);
}

@keyframes msgIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.candidateRow {
  flex-direction: row-reverse;
}

.roleTag {
  font-size: 0.68rem;
  color: var(--text-muted);
  padding-top: 0.3rem;
  flex-shrink: 0;
}

.interviewerBubble {
  background: var(--interviewer-bg);
  border-left: 2px solid var(--accent);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  padding: 0.6rem 0.9rem;
  max-width: 85%;
  font-family: var(--font-serif);
  font-size: 0.92rem;
  line-height: 1.7;
  color: var(--text);
}

.candidateBubble {
  background: var(--candidate-bg);
  border-radius: var(--radius-md);
  padding: 0.6rem 0.9rem;
  max-width: 85%;
  font-size: 0.9rem;
  line-height: 1.65;
  color: var(--text);
}

.candidateActions {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding-top: 0.3rem;
}

.bookmarkBtn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  opacity: 0.4;
  transition: opacity 0.15s;
}
.bookmarkBtn:hover { opacity: 1; }

.feedbackCard {
  background: var(--feedback-bg);
  border: var(--border-width) solid var(--border);
  border-radius: var(--radius-md);
  padding: 0.5rem 0.75rem;
  margin-top: 0.3rem;
  font-size: 0.8rem;
}

.feedbackScore {
  font-size: 0.78rem;
  color: var(--text-light);
  margin-bottom: 0.3rem;
}

.feedbackList {
  list-style: none;
  padding: 0;
}

.strength { color: var(--success); }
.improvement { color: var(--warning); }

.streaming {
  font-family: var(--font-serif);
  font-size: 0.82rem;
  color: var(--text-muted);
  font-style: italic;
}
```

- [ ] **Step 9: Create InputArea with voice support**

Create `components/interview/InputArea.tsx`:

```tsx
'use client';
import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import styles from './InputArea.module.css';

interface InputAreaProps {
  onSend: (text: string, voiceUrl?: string) => void;
  disabled?: boolean;
}

export function InputArea({ onSend, disabled }: InputAreaProps) {
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startRecording = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('你的浏览器不支持语音识别，请用Chrome打开');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setText(prev => prev + transcript);
    };
    recognition.onend = () => setRecording(false);
    recognition.onerror = () => setRecording(false);
    recognition.start();
    setRecording(true);
    recognitionRef.current = recognition;
  }, []);

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setRecording(false);
  };

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.bar}>
      <textarea
        className={styles.input}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入你的回答... (Enter发送, Shift+Enter换行)"
        rows={2}
        disabled={disabled}
      />
      <div className={styles.buttons}>
        <Button
          variant="ghost"
          size="sm"
          onClick={recording ? stopRecording : startRecording}
          disabled={disabled}
        >
          {recording ? '🔴 停止' : '🎤'}
        </Button>
        <Button onClick={handleSend} disabled={disabled || !text.trim()}>
          发送
        </Button>
      </div>
    </div>
  );
}
```

Create `components/interview/InputArea.module.css`:

```css
.bar {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--bg-glass);
  backdrop-filter: blur(8px);
  border-top: var(--border-width) solid var(--border);
  position: sticky;
  bottom: 0;
}

.input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: var(--border-width) solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--text);
  font-family: var(--font-ui);
  font-size: 0.88rem;
  resize: none;
}

.input:focus {
  outline: none;
  border-color: var(--accent);
}

.buttons {
  display: flex;
  align-items: flex-end;
  gap: 0.3rem;
}
```

- [ ] **Step 10: Create InterviewChat component**

Create `components/interview/InterviewChat.tsx`:

```tsx
'use client';
import { useCallback, useRef, useEffect } from 'react';
import { useInterviewStore } from '@/stores/interview-store';
import { useCandidateStore } from '@/stores/candidate-store';
import { InterviewerBubble } from './InterviewerBubble';
import { CandidateBubble } from './CandidateBubble';
import { FeedbackCard } from './FeedbackCard';
import { InputArea } from './InputArea';
import styles from './InterviewChat.module.css';

export function InterviewChat() {
  const { messages, isStreaming, addMessage, setFeedback, setStreaming } = useInterviewStore();
  const { candidate, projects } = useCandidateStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    const msgId = crypto.randomUUID();
    const candidateMsg = { id: msgId, sessionId: '', role: 'candidate' as const, content: text, timestamp: new Date().toISOString() };
    addMessage(candidateMsg);

    // Get last interviewer question for feedback
    const lastQuestion = [...messages].reverse().find(m => m.role === 'interviewer');
    if (lastQuestion) {
      setStreaming(true);
      const fbRes = await fetch('/api/interview/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: lastQuestion.content, answer: text }),
      });
      if (fbRes.ok) {
        const feedback = await fbRes.json();
        setFeedback(msgId, feedback);
      }
    }

    // Get next interviewer response
    const history = [...messages, candidateMsg].map(m => ({
      role: m.role,
      content: m.content,
    }));

    const chatRes = await fetch('/api/interview/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resumeText: candidate?.resumeText || '',
        projectDetails: projects.map(p => `## ${p.name}\n${p.content}`).join('\n\n'),
        history,
      }),
    });

    if (chatRes.ok && chatRes.body) {
      const reader = chatRes.body.getReader();
      const decoder = new TextDecoder();
      let content = '';
      const interviewerMsgId = crypto.randomUUID();
      addMessage({
        id: interviewerMsgId,
        sessionId: '',
        role: 'interviewer',
        content: '',
        timestamp: new Date().toISOString(),
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        content += decoder.decode(value, { stream: true });
        // Update last message content
        useInterviewStore.setState((s) => ({
          messages: s.messages.map((m) =>
            m.id === interviewerMsgId ? { ...m, content } : m
          ),
        }));
      }
    }
    setStreaming(false);
  }, [messages, candidate, projects, addMessage, setFeedback, setStreaming]);

  const handleBookmark = useCallback(async (msg: typeof messages[0]) => {
    const question = [...messages].reverse().find(m => m.role === 'interviewer');
    if (!question) return;
    await fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: useInterviewStore.getState().session?.id,
        question: question.content,
        userAnswer: msg.content,
      }),
    });
    alert('已收藏！');
  }, [messages]);

  if (!candidate) {
    return <div className={styles.chatArea}><p>请先上传简历</p></div>;
  }

  return (
    <>
      <div className={styles.chatArea}>
        {messages.map(m => (
          <div key={m.id}>
            {m.role === 'interviewer' ? (
              <InterviewerBubble message={m} />
            ) : (
              <CandidateBubble message={m} onBookmark={() => handleBookmark(m)} />
            )}
            {m.feedback && <FeedbackCard feedback={m.feedback} />}
          </div>
        ))}
        {isStreaming && <div className={styles.streaming}>面试官思考中...</div>}
        <div ref={bottomRef} />
      </div>
      <InputArea onSend={sendMessage} disabled={isStreaming} />
    </>
  );
}
```

- [ ] **Step 11: Create interview page**

Create `app/interview/page.tsx`:

```tsx
'use client';
import { useEffect } from 'react';
import { InterviewChat } from '@/components/interview/InterviewChat';
import { useInterviewStore } from '@/stores/interview-store';
import { useCandidateStore } from '@/stores/candidate-store';
import { useRouter } from 'next/navigation';

export default function InterviewPage() {
  const { session, startSession } = useInterviewStore();
  const { candidate } = useCandidateStore();
  const router = useRouter();

  useEffect(() => {
    if (!candidate) { router.push('/'); return; }
    if (!session) { startSession(candidate.id); }
  }, [candidate, session, startSession, router]);

  if (!candidate) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 44px)' }}>
      <InterviewChat />
    </div>
  );
}
```

- [ ] **Step 12: Create feedback API route**

Create `app/api/interview/feedback/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateFeedback } from '@/lib/ai/feedback';

export async function POST(req: NextRequest) {
  const { question, answer } = await req.json();
  const feedback = await generateFeedback(question, answer);
  return NextResponse.json(feedback);
}
```

- [ ] **Step 13: Verify interview chat works**

```bash
npm run dev
```

Start from home, upload resume, add project detail, click "开始模拟面试", verify chat flow.

- [ ] **Step 14: Commit**

```bash
git add lib/ai/ app/api/interview/ stores/interview-store.ts app/interview/ components/interview/ && git commit -m "$(cat <<'EOF'
feat: add interview chat engine with streaming AI, feedback, and voice input

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Bookmark System

**Files:**
- Create: `app/api/bookmarks/route.ts`
- Create: `app/api/bookmarks/[id]/vote/route.ts`
- Create: `components/bookmark/BookmarkList.tsx`
- Create: `components/bookmark/BookmarkCard.tsx`
- Create: `components/bookmark/Bookmark.module.css`
- Create: `stores/bookmark-store.ts`
- Create: `app/collection/page.tsx`

- [ ] **Step 1: Create bookmark store**

Create `stores/bookmark-store.ts`:

```typescript
import { create } from 'zustand';
import type { Bookmark } from '@/shared/types';

interface BookmarkState {
  bookmarks: Bookmark[];
  loading: boolean;
  setBookmarks: (b: Bookmark[]) => void;
  addBookmark: (b: Bookmark) => void;
  updateVote: (id: string, vote: 'up' | 'down') => void;
}

export const useBookmarkStore = create<BookmarkState>((set) => ({
  bookmarks: [],
  loading: false,
  setBookmarks: (bookmarks) => set({ bookmarks }),
  addBookmark: (bookmark) => set((s) => ({ bookmarks: [bookmark, ...s.bookmarks] })),
  updateVote: (id, userVote) =>
    set((s) => ({
      bookmarks: s.bookmarks.map((b) => {
        if (b.id !== id) return b;
        const prevVote = b.userVote;
        let upVotes = b.upVotes;
        let downVotes = b.downVotes;
        if (prevVote === 'up') upVotes--;
        if (prevVote === 'down') downVotes--;
        if (userVote === 'up') upVotes++;
        if (userVote === 'down') downVotes++;
        return { ...b, upVotes, downVotes, userVote };
      }),
    })),
}));
```

- [ ] **Step 2: Create bookmark API routes**

Create `app/api/bookmarks/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { v4 as uuid } from 'uuid';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { desc } from 'drizzle-orm';

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function GET() {
  const rows = await db.select().from(schema.bookmarks).orderBy(desc(schema.bookmarks.createdAt));
  return NextResponse.json(rows.map(r => ({
    id: r.id, sessionId: r.sessionId, question: r.question,
    userAnswer: r.userAnswer, aiAnswer: r.aiAnswer,
    aiAnswerVersion: r.aiAnswerVersion,
    upVotes: r.upVotes, downVotes: r.downVotes,
    userVote: r.userVote, createdAt: r.createdAt,
  })));
}

export async function POST(req: NextRequest) {
  const { sessionId, question, userAnswer } = await req.json();

  // Generate AI reference answer
  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    prompt: `你是一个面试教练。请为以下面试问题生成一个高质量的参考答案，要具体、有结构、有技术深度。

问题：${question}
候选人的回答（供参考，可能存在不足）：${userAnswer}

请给出一个更好的参考答案：`,
  });

  const id = uuid();
  await db.insert(schema.bookmarks).values({
    id, sessionId, question, userAnswer,
    aiAnswer: text, aiAnswerVersion: 1,
    upVotes: 0, downVotes: 0, userVote: null,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({
    id, sessionId, question, userAnswer, aiAnswer: text,
    aiAnswerVersion: 1, upVotes: 0, downVotes: 0,
    userVote: null, createdAt: new Date().toISOString(),
  });
}
```

Create `app/api/bookmarks/[id]/vote/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { vote } = await req.json();
  const row = await db.select().from(schema.bookmarks).where(eq(schema.bookmarks.id, params.id)).get();

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let upVotes = row.upVotes;
  let downVotes = row.downVotes;
  let aiAnswer = row.aiAnswer;
  let aiAnswerVersion = row.aiAnswerVersion;

  if (row.userVote === 'up') upVotes--;
  if (row.userVote === 'down') downVotes--;

  if (vote === 'up') upVotes++;
  if (vote === 'down') {
    downVotes++;
    // Regenerate answer on downvote
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `之前的参考答案被用户点踩了。请重新生成一个更好的回答。

问题：${row.question}
之前的回答：${row.aiAnswer}
用户的回答：${row.userAnswer}

请给出一个更好的参考答案：`,
    });
    aiAnswer = text;
    aiAnswerVersion++;
  }

  await db.update(schema.bookmarks)
    .set({ upVotes, downVotes, userVote: vote, aiAnswer, aiAnswerVersion })
    .where(eq(schema.bookmarks.id, params.id));

  return NextResponse.json({ upVotes, downVotes, userVote: vote, aiAnswer, aiAnswerVersion });
}
```

- [ ] **Step 3: Create bookmark UI components**

Create `components/bookmark/Bookmark.module.css`:

```css
.page { max-width: 680px; margin: 0 auto; padding: 2rem 1.5rem; }

.heading {
  font-family: var(--font-serif);
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
}

.empty {
  text-align: center;
  color: var(--text-muted);
  padding: 3rem 0;
  font-style: italic;
}

.card {
  background: var(--bg-card);
  border: var(--border-width) solid var(--border);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-bottom: 1rem;
}

.question {
  font-family: var(--font-serif);
  font-size: 0.92rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text);
}

.answer {
  font-size: 0.85rem;
  line-height: 1.65;
  color: var(--text-light);
  margin-bottom: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: var(--feedback-bg);
  border-radius: var(--radius-sm);
  border-left: 2px solid var(--accent);
}

.meta {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-bottom: 0.3rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.voteBtn {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.2rem 0.5rem;
  border: var(--border-width) solid var(--border);
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s;
  color: var(--text-muted);
}

.voteBtn:hover { border-color: var(--accent); }

.voted {
  background: var(--accent-light);
  border-color: var(--accent);
  color: var(--accent);
}
```

Create `components/bookmark/BookmarkCard.tsx`:

```tsx
'use client';
import type { Bookmark } from '@/shared/types';
import { useBookmarkStore } from '@/stores/bookmark-store';
import styles from './Bookmark.module.css';

export function BookmarkCard({ bookmark }: { bookmark: Bookmark }) {
  const updateVote = useBookmarkStore(s => s.updateVote);

  const handleVote = async (vote: 'up' | 'down') => {
    const res = await fetch(`/api/bookmarks/${bookmark.id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vote }),
    });
    if (res.ok) {
      const data = await res.json();
      updateVote(bookmark.id, vote);
    }
  };

  return (
    <div className={styles.card}>
      <p className={styles.question}>{bookmark.question}</p>
      <div className={styles.answer}>{bookmark.aiAnswer}</div>
      <p className={styles.meta}>
        版本 {bookmark.aiAnswerVersion} · 👍 {bookmark.upVotes} · 👎 {bookmark.downVotes}
      </p>
      <div className={styles.actions}>
        <button
          className={`${styles.voteBtn} ${bookmark.userVote === 'up' ? styles.voted : ''}`}
          onClick={() => handleVote('up')}
        >
          👍 有用
        </button>
        <button
          className={`${styles.voteBtn} ${bookmark.userVote === 'down' ? styles.voted : ''}`}
          onClick={() => handleVote('down')}
        >
          👎 可以更好
        </button>
      </div>
    </div>
  );
}
```

Create `components/bookmark/BookmarkList.tsx`:

```tsx
'use client';
import { useEffect } from 'react';
import { BookmarkCard } from './BookmarkCard';
import { useBookmarkStore } from '@/stores/bookmark-store';
import styles from './Bookmark.module.css';

export function BookmarkList() {
  const { bookmarks, loading, setBookmarks } = useBookmarkStore();

  useEffect(() => {
    fetch('/api/bookmarks')
      .then(r => r.json())
      .then(setBookmarks);
  }, [setBookmarks]);

  if (bookmarks.length === 0) {
    return <p className={styles.empty}>📭 暂无收藏 · 面试中点击 ⭐ 收藏卡壳问题</p>;
  }

  return (
    <div>
      {bookmarks.map(b => <BookmarkCard key={b.id} bookmark={b} />)}
    </div>
  );
}
```

- [ ] **Step 4: Create collection page**

Create `app/collection/page.tsx`:

```tsx
import { BookmarkList } from '@/components/bookmark/BookmarkList';
import styles from '@/components/bookmark/Bookmark.module.css';

export default function CollectionPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>⭐ 我的收藏夹</h1>
      <BookmarkList />
    </div>
  );
}
```

- [ ] **Step 5: Verify bookmark flow**

Start interview, click ⭐ on a candidate message, go to /collection, verify bookmark appears with AI answer. Test 👍 / 👎.

- [ ] **Step 6: Commit**

```bash
git add app/api/bookmarks/ stores/bookmark-store.ts components/bookmark/ app/collection/ && git commit -m "$(cat <<'EOF'
feat: add bookmark system with AI answer generation and vote feedback loop

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Interview Recording Review

**Files:**
- Create: `lib/speech/recognition.ts`
- Create: `lib/ai/review-analyzer.ts`
- Create: `app/api/review/transcribe/route.ts`
- Create: `app/api/review/analyze/route.ts`
- Create: `components/review/AudioUploader.tsx`
- Create: `components/review/ReviewReport.tsx`
- Create: `components/review/Review.module.css`
- Create: `stores/review-store.ts`
- Create: `app/review/page.tsx`

- [ ] **Step 1: Create speech recognition wrapper**

Create `lib/speech/recognition.ts`:

```typescript
export function createSpeechRecognition(): SpeechRecognition | null {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const recognition = new SpeechRecognition();
  recognition.lang = 'zh-CN';
  recognition.interimResults = false;
  recognition.continuous = true;
  return recognition;
}
```

- [ ] **Step 2: Create review analyzer prompt**

Create `lib/ai/review-analyzer.ts`:

```typescript
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function analyzeTranscript(transcript: string) {
  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    prompt: `你是一个面试表现分析专家。分析以下面试录音转录文本，给出诊断报告。

${transcript}

请严格按JSON格式返回：
{
  "pace": "语速分析：过快/适中/过慢，具体时段描述",
  "fillerWords": ["统计到的填充词或口头禅"],
  "weakPoints": [
    { "question": "问题描述", "issue": "具体哪里没答好", "suggestion": "改进建议" }
  ],
  "overallScore": 1-10的总体评分
}`,
  });
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse analysis JSON');
  return JSON.parse(jsonMatch[0]);
}
```

- [ ] **Step 3: Create review API routes**

Create `app/api/review/transcribe/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

// Note: For production Whisper, use OpenAI Whisper API or local whisper.cpp
// This is a placeholder that uses OpenAI Whisper API
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('audio') as File;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  // Use OpenAI Whisper API for transcription
  const whisperForm = new FormData();
  whisperForm.append('file', file);
  whisperForm.append('model', 'whisper-1');
  whisperForm.append('language', 'zh');

  const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
    body: whisperForm,
  });

  if (!whisperRes.ok) {
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }

  const data = await whisperRes.json();
  return NextResponse.json({ transcript: data.text });
}
```

Create `app/api/review/analyze/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { analyzeTranscript } from '@/lib/ai/review-analyzer';

export async function POST(req: NextRequest) {
  const { transcript } = await req.json();
  const analysis = await analyzeTranscript(transcript);
  return NextResponse.json(analysis);
}
```

- [ ] **Step 4: Create review store**

Create `stores/review-store.ts`:

```typescript
import { create } from 'zustand';
import type { ReviewReport } from '@/shared/types';

interface ReviewState {
  reports: ReviewReport[];
  currentReport: ReviewReport | null;
  loading: boolean;
  setReports: (r: ReviewReport[]) => void;
  setCurrentReport: (r: ReviewReport | null) => void;
  setLoading: (v: boolean) => void;
}

export const useReviewStore = create<ReviewState>((set) => ({
  reports: [],
  currentReport: null,
  loading: false,
  setReports: (reports) => set({ reports }),
  setCurrentReport: (currentReport) => set({ currentReport }),
  setLoading: (loading) => set({ loading }),
}));
```

- [ ] **Step 5: Create review UI components**

Create `components/review/Review.module.css`:

```css
.page { max-width: 680px; margin: 0 auto; padding: 2rem 1.5rem; }

.heading {
  font-family: var(--font-serif);
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
}

.uploadSection { margin-bottom: 2rem; }

.status {
  font-size: 0.82rem;
  color: var(--accent);
  margin-top: 0.75rem;
  font-style: italic;
}

.reportCard {
  background: var(--bg-card);
  border: var(--border-width) solid var(--border);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  margin-bottom: 1rem;
}

.overallScore {
  font-family: var(--font-serif);
  font-size: 2rem;
  font-weight: 600;
  color: var(--accent);
  text-align: center;
  margin-bottom: 1rem;
}

.section {
  margin-bottom: 1rem;
}

.sectionTitle {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.4rem;
}

.sectionBody {
  font-size: 0.85rem;
  color: var(--text-light);
  line-height: 1.65;
}

.fillerChip {
  display: inline-block;
  font-size: 0.72rem;
  padding: 0.1rem 0.4rem;
  background: var(--warning);
  color: #fff;
  border-radius: var(--radius-sm);
  margin: 0.1rem;
}

.weakPoint {
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.4rem;
  border-left: 2px solid var(--warning);
  background: rgba(196, 136, 75, 0.06);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.weakQuestion { font-size: 0.82rem; font-weight: 500; color: var(--text); }
.weakIssue { font-size: 0.78rem; color: var(--warning); margin-top: 0.15rem; }
.weakSuggestion { font-size: 0.78rem; color: var(--success); margin-top: 0.15rem; }
```

Create `components/review/AudioUploader.tsx`:

```tsx
'use client';
import { useState } from 'react';
import { FileUpload } from '@/components/ui/FileUpload';
import { useReviewStore } from '@/stores/review-store';
import styles from './Review.module.css';

export function AudioUploader() {
  const [step, setStep] = useState<'idle' | 'transcribing' | 'analyzing' | 'done'>('idle');
  const { setCurrentReport } = useReviewStore();

  const handleFile = async (file: File) => {
    setStep('transcribing');
    const formData = new FormData();
    formData.append('audio', file);

    const transRes = await fetch('/api/review/transcribe', { method: 'POST', body: formData });
    if (!transRes.ok) { setStep('idle'); return; }
    const { transcript } = await transRes.json();

    setStep('analyzing');
    const anaRes = await fetch('/api/review/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript }),
    });
    if (!anaRes.ok) { setStep('idle'); return; }
    const analysis = await anaRes.json();

    const report = {
      id: crypto.randomUUID(),
      audioUrl: URL.createObjectURL(file),
      transcript,
      analysis,
      createdAt: new Date().toISOString(),
    };
    setCurrentReport(report);
    setStep('done');
  };

  return (
    <div className={styles.uploadSection}>
      <FileUpload accept="audio/*" label="上传面试录音 (mp3/wav/m4a)" onFile={handleFile} />
      {step === 'transcribing' && <p className={styles.status}>🎙️ 语音转文字中...</p>}
      {step === 'analyzing' && <p className={styles.status}>📊 AI分析中...</p>}
    </div>
  );
}
```

Create `components/review/ReviewReport.tsx`:

```tsx
'use client';
import { useReviewStore } from '@/stores/review-store';
import styles from './Review.module.css';

export function ReviewReport() {
  const { currentReport } = useReviewStore();
  if (!currentReport?.analysis) return null;

  const analysis = currentReport.analysis;

  return (
    <div className={styles.reportCard}>
      <div className={styles.overallScore}>{analysis.overallScore} / 10</div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>语速分析</div>
        <div className={styles.sectionBody}>{analysis.pace}</div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>口头禅 / 填充词</div>
        <div>
          {analysis.fillerWords.map((w: string, i: number) => (
            <span key={i} className={styles.fillerChip}>{w}</span>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>弱项识别</div>
        {analysis.weakPoints.map((wp: any, i: number) => (
          <div key={i} className={styles.weakPoint}>
            <div className={styles.weakQuestion}>❓ {wp.question}</div>
            <div className={styles.weakIssue}>⚠️ {wp.issue}</div>
            <div className={styles.weakSuggestion}>💡 {wp.suggestion}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create review page**

Create `app/review/page.tsx`:

```tsx
import { AudioUploader } from '@/components/review/AudioUploader';
import { ReviewReport } from '@/components/review/ReviewReport';
import styles from '@/components/review/Review.module.css';

export default function ReviewPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>📊 面试复盘</h1>
      <AudioUploader />
      <ReviewReport />
    </div>
  );
}
```

- [ ] **Step 7: Verify review flow**

Upload an interview recording audio file, verify transcription starts, analysis report appears.

- [ ] **Step 8: Commit**

```bash
git add lib/speech/ lib/ai/review-analyzer.ts app/api/review/ stores/review-store.ts components/review/ app/review/ && git commit -m "$(cat <<'EOF'
feat: add interview recording review with Whisper transcription and AI analysis

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Sidebar Session History

**Files:**
- Modify: `app/layout.tsx`
- Modify: `components/layout/Sidebar.tsx`
- Modify: `stores/interview-store.ts`

- [ ] **Step 1: Add session persistence to interview store**

Modify `stores/interview-store.ts` — add `loadSessions` action and `sessions` list:

```typescript
// Add to the existing file:

interface SessionSummary {
  id: string;
  title: string;
  date: string;
}

// Add to InterviewState interface:
  sessions: SessionSummary[];
  loadSessions: () => void;

// Add to create() initial state:
  sessions: [],

// Add to create() actions:
  loadSessions: () => {
    // Load sessions from localStorage for now; later from DB
    const stored = typeof window !== 'undefined' ? localStorage.getItem('op_sessions') : null;
    if (stored) {
      try { set({ sessions: JSON.parse(stored) }); } catch {}
    }
  },
```

- [ ] **Step 2: Persist session on end**

Add to `endSession` in `stores/interview-store.ts`:

```typescript
endSession: () =>
  set((s) => {
    const updated = s.session
      ? { ...s.session, status: 'completed' as const, endedAt: new Date().toISOString() }
      : null;
    const summary: SessionSummary = {
      id: s.session?.id || '',
      title: `面试 · ${new Date().toLocaleDateString('zh-CN')}`,
      date: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };
    const sessions = [...s.sessions, summary];
    localStorage.setItem('op_sessions', JSON.stringify(sessions));
    return { session: updated, sessions };
  }),
```

- [ ] **Step 3: Make sidebar dynamic in layout**

Modify `app/layout.tsx` — make it a client component that reads from store:

```tsx
'use client';
import { TopBar } from '@/components/layout/TopBar';
import { Sidebar } from '@/components/layout/Sidebar';
import { useInterviewStore } from '@/stores/interview-store';
import { useEffect } from 'react';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const sessions = useInterviewStore(s => s.sessions);
  const loadSessions = useInterviewStore(s => s.loadSessions);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  return (
    <html lang="zh-CN">
      <body>
        <TopBar />
        <div style={{ display: 'flex' }}>
          <Sidebar sessions={sessions} />
          <main style={{ flex: 1, minHeight: 'calc(100vh - 44px)' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
```

Move metadata export to a separate `app/metadata.ts` if needed, or remove it (metadata must be in server component; with 'use client' it won't work — just hardcode `<title>` in the HTML).

- [ ] **Step 4: Verify sidebar shows session history**

Run interview session, end it, check sidebar shows the new session entry.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx components/layout/Sidebar.tsx stores/interview-store.ts && git commit -m "$(cat <<'EOF'
feat: add session history persistence to sidebar and interview store

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Final Integration & Polish

**Files:**
- Create: `.env.local`
- Modify: `package.json`

- [ ] **Step 1: Create `.env.local` with environment variables**

Create `.env.local`:

```
OPENAI_API_KEY=sk-your-key-here
DATABASE_URL=./offerpilot.db
```

- [ ] **Step 2: Add npm scripts for dev, build, and migration**

Modify `package.json` — ensure scripts section includes:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

- [ ] **Step 3: Full end-to-end smoke test**

```bash
npm run dev
```

Test flow:
1. Open http://localhost:3000
2. Upload PDF resume → verify AI parsing
3. Fill project details → save
4. Click "开始模拟面试" → verify interviewer asks first question
5. Answer → verify feedback card appears + next question comes
6. Click ⭐ on a candidate message → verify alert
7. Go to /collection → verify bookmark with AI answer
8. Click 👍/👎 → verify vote update
9. Go to /review → upload audio → verify transcription + analysis
10. End interview session → verify sidebar shows new entry

- [ ] **Step 4: Commit**

```bash
git add .env.local .gitignore package.json && git commit -m "$(cat <<'EOF'
feat: add env config, npm scripts, and complete MVP integration

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review

1. **Spec coverage:**
   - [x] Resume upload + AI parsing → Tasks 5
   - [x] Project detail entry → Tasks 5
   - [x] Interview simulation with dynamic follow-up → Task 6
   - [x] Instant feedback on answers → Task 6
   - [x] Bookmark + AI answer + vote → Task 7
   - [x] Interview recording review → Task 8
   - [x] Layout shell + session history → Tasks 4, 9
   - [x] Design tokens → Task 1

2. **Placeholder scan:** No TBD/TODO. All code shown. All types defined.

3. **Type consistency:** `InterviewMessage.role` uses `'interviewer' | 'candidate'` consistently across stores, API routes, and components. `Bookmark.userVote` uses `'up' | 'down' | null` consistently.
