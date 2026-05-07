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

  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    prompt: `你是一个面试教练。请为以下面试问题生成一个高质量的参考答案，要具体、有结构、有技术深度。

问题：${question}
候选人的回答（供参考，可能存在不足）：${userAnswer}

请给出一个更好的参考答案：`,
  });

  const id = uuid();
  await db.insert(schema.bookmarks).values({
    id, sessionId: sessionId || '', question, userAnswer,
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
