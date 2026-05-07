import { NextRequest, NextResponse } from 'next/server';
import { generateLeetCodeQuestion, reviewLeetCodeCode } from '@/lib/ai/tracks/leetcode';

export async function POST(req: NextRequest) {
  const { action, difficulty, question, code } = await req.json();

  if (action === 'question') {
    const q = await generateLeetCodeQuestion(difficulty || 'medium');
    const leetcodeUrl = q.leetcodeSlug
      ? `https://leetcode.cn/problems/${q.leetcodeSlug}/`
      : null;
    return NextResponse.json({ ...q, leetcodeUrl });
  }

  if (action === 'review') {
    const review = await reviewLeetCodeCode(question, code);
    return NextResponse.json(review);
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
