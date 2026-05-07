import { NextRequest, NextResponse } from 'next/server';
import { extractPdfText } from '@/lib/utils/pdf';
import { parseResume } from '@/lib/ai/resume-parser';
import { v4 as uuid } from 'uuid';
import { saveResumeJson } from '@/lib/cache/fs-cache';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) return NextResponse.json({ error: '未收到文件' }, { status: 400 });

  let resumeText: string;
  try {
    resumeText = await extractPdfText(file);
  } catch {
    return NextResponse.json({ error: 'PDF解析失败，文件可能已损坏或不是有效的PDF' }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-key-here') {
    return NextResponse.json({ error: '请先在 .env.local 中配置有效的 OPENAI_API_KEY' }, { status: 500 });
  }

  try {
    const parsed = await parseResume(resumeText);

    // Save to cache
    const cacheId = uuid();
    saveResumeJson(cacheId, {
      id: cacheId,
      fileName: file.name,
      pdfPath: '',
      parsed,
      projects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ resumeText, parsed, cacheId });
  } catch {
    return NextResponse.json({ error: 'AI解析失败，请检查API Key是否正确或稍后重试' }, { status: 500 });
  }
}
