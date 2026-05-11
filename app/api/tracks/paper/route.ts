import { NextRequest, NextResponse } from 'next/server';
import { parsePaper, generatePaperQuestion, judgePaperAnswer, generatePaperReference } from '@/lib/ai/tracks/paper';
import { savePaperJson, listPapers } from '@/lib/cache/fs-cache';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'parse': {
        const { pdfText, fileName } = body;
        if (!pdfText) return NextResponse.json({ error: 'Missing pdfText' }, { status: 400 });

        const parsed = await parsePaper(pdfText);
        const id = crypto.randomUUID();
        const paperData = {
          id,
          title: parsed.title,
          authors: parsed.authors || '',
          abstract: parsed.abstract,
          keyTechniques: parsed.keyTechniques,
          sectionSummary: parsed.sectionSummary,
          paperText: pdfText,
          fileName: fileName || 'unknown.pdf',
          createdAt: new Date().toISOString(),
        };

        savePaperJson(id, paperData);
        return NextResponse.json(paperData);
      }

      case 'papers': {
        const papers = listPapers();
        return NextResponse.json({ papers });
      }

      case 'question': {
        const { paperInfo, history } = body;
        if (!paperInfo) return NextResponse.json({ error: 'Missing paperInfo' }, { status: 400 });
        const question = await generatePaperQuestion(paperInfo, history || []);
        return NextResponse.json({ question });
      }

      case 'judge': {
        const { paperInfo, question, answer } = body;
        if (!paperInfo || !question || !answer) {
          return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }
        const result = await judgePaperAnswer(paperInfo, question, answer);
        return NextResponse.json(result);
      }

      case 'reference': {
        const { paperInfo, question } = body;
        if (!paperInfo || !question) {
          return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }
        const result = await generatePaperReference(paperInfo, question);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (e) {
    console.error('Paper track error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
