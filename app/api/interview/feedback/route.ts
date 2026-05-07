import { NextRequest, NextResponse } from 'next/server';
import { generateFeedback } from '@/lib/ai/feedback';

export async function POST(req: NextRequest) {
  const { question, answer } = await req.json();
  const feedback = await generateFeedback(question, answer);
  return NextResponse.json(feedback);
}
