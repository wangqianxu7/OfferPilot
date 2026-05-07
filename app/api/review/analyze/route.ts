import { NextRequest, NextResponse } from 'next/server';
import { analyzeTranscript } from '@/lib/ai/review-analyzer';

export async function POST(req: NextRequest) {
  const { transcript } = await req.json();
  const analysis = await analyzeTranscript(transcript);
  return NextResponse.json(analysis);
}
