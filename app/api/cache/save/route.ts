import { NextRequest, NextResponse } from 'next/server';
import { saveResumeJson, saveSession } from '@/lib/cache/fs-cache';

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.type === 'resume') {
    saveResumeJson(body.id, body.data);
  } else if (body.type === 'session') {
    saveSession(body.data);
  }

  return NextResponse.json({ ok: true });
}
