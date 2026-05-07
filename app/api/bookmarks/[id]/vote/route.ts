import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { generateText } from 'ai';
import { FLASH } from '@/lib/ai/client';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { vote } = await req.json();
  const row = await db.select().from(schema.bookmarks).where(eq(schema.bookmarks.id, id)).get();

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
    const { text } = await generateText({
      model: FLASH,
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
    .where(eq(schema.bookmarks.id, id));

  return NextResponse.json({ upVotes, downVotes, userVote: vote, aiAnswer, aiAnswerVersion });
}
