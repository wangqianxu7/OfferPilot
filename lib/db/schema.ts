import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const candidates = sqliteTable('candidates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  resumeText: text('resume_text').notNull(),
  resumeParsed: text('resume_parsed', { mode: 'json' }),
  createdAt: text('created_at').notNull(),
});

export const projectDetails = sqliteTable('project_details', {
  id: text('id').primaryKey(),
  candidateId: text('candidate_id').notNull().references(() => candidates.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  content: text('content').notNull(),
  keyDecisions: text('key_decisions', { mode: 'json' }).$type<string[] | null>(),
  painPoints: text('pain_points', { mode: 'json' }).$type<string[] | null>(),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  candidateIdx: index('idx_project_details_candidate').on(table.candidateId),
}));

export const interviewSessions = sqliteTable('interview_sessions', {
  id: text('id').primaryKey(),
  candidateId: text('candidate_id').notNull().references(() => candidates.id, { onDelete: 'cascade' }),
  status: text('status').notNull(),
  startedAt: text('started_at').notNull(),
  endedAt: text('ended_at'),
}, (table) => ({
  candidateIdx: index('idx_interview_sessions_candidate').on(table.candidateId),
}));

export const interviewMessages = sqliteTable('interview_messages', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => interviewSessions.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  content: text('content').notNull(),
  voiceUrl: text('voice_url'),
  feedback: text('feedback', { mode: 'json' }),
  timestamp: text('timestamp').notNull(),
}, (table) => ({
  sessionIdx: index('idx_messages_session').on(table.sessionId),
}));

export const bookmarks = sqliteTable('bookmarks', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => interviewSessions.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  userAnswer: text('user_answer').notNull(),
  aiAnswer: text('ai_answer').notNull(),
  aiAnswerVersion: integer('ai_answer_version').notNull().default(1),
  upVotes: integer('up_votes').notNull().default(0),
  downVotes: integer('down_votes').notNull().default(0),
  userVote: text('user_vote'),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  sessionIdx: index('idx_bookmarks_session').on(table.sessionId),
}));

export const reviewReports = sqliteTable('review_reports', {
  id: text('id').primaryKey(),
  sessionId: text('session_id'),
  audioUrl: text('audio_url').notNull(),
  transcript: text('transcript').notNull().default(''),
  analysis: text('analysis', { mode: 'json' }),
  createdAt: text('created_at').notNull(),
});
