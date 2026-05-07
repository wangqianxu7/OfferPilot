import { NextRequest, NextResponse } from 'next/server';
import { saveAnswer } from '@/lib/cache/fs-cache';

export async function POST(req: NextRequest) {
  const { date, question, code } = await req.json();
  const filePath = saveAnswer(date, question, code);
  return NextResponse.json({ path: filePath });
}
