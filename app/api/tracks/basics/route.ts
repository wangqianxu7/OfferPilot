import { NextRequest, NextResponse } from 'next/server';
import { generateBasicsQuestion, judgeBasicsAnswer, generateReferenceAnswer } from '@/lib/ai/tracks/basics';

export async function POST(req: NextRequest) {
  const { action, topic, answer, question, history } = await req.json();

  if (action === 'question') {
    const q = await generateBasicsQuestion(topic, history || []);
    return NextResponse.json({ question: q });
  }

  if (action === 'reference') {
    const result = await generateReferenceAnswer(question, topic);
    return NextResponse.json(result);
  }

  if (action === 'judge') {
    const result = await judgeBasicsAnswer(question, answer, topic);
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
