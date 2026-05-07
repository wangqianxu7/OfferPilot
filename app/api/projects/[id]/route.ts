import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = uuid();
  await db.insert(schema.projectDetails).values({
    id,
    candidateId: body.candidateId,
    name: body.name,
    content: body.content,
    keyDecisions: body.keyDecisions || [],
    painPoints: body.painPoints || [],
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json({ id });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const body = await req.json();
  const { id } = await params;
  await db.update(schema.projectDetails)
    .set({ content: body.content, keyDecisions: body.keyDecisions, painPoints: body.painPoints })
    .where(eq(schema.projectDetails.id, id));
  return NextResponse.json({ ok: true });
}
