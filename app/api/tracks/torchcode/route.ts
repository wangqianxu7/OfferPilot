import { NextRequest, NextResponse } from 'next/server';
import { generateTorchCodeQuestion, reviewTorchCode } from '@/lib/ai/tracks/torchcode';

export async function POST(req: NextRequest) {
  const { action, topic, question, code, history } = await req.json();

  if (action === 'question') {
    const q = await generateTorchCodeQuestion(topic, history || []);
    return NextResponse.json({ question: q });
  }

  if (action === 'review') {
    const review = await reviewTorchCode(question, code);
    return NextResponse.json(review);
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
