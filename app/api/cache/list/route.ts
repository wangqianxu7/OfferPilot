import { NextResponse } from 'next/server';
import { listArchives } from '@/lib/cache/fs-cache';

export async function GET() {
  const index = listArchives();
  return NextResponse.json(index);
}
