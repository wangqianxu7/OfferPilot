import { NextRequest, NextResponse } from 'next/server';
import { loadArchive } from '@/lib/cache/fs-cache';

export async function POST(req: NextRequest) {
  const { id } = await req.json();
  const data = loadArchive(id);
  return NextResponse.json(data);
}
