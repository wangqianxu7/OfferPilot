import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { PRO } from '@/lib/ai/client';
import { buildInterviewSystemPrompt, buildInterviewContext } from '@/lib/ai/interviewer';

export async function POST(req: NextRequest) {
  const { resumeText, projectDetails, history } = await req.json();

  const systemPrompt = buildInterviewSystemPrompt(resumeText, projectDetails);
  const contextMessages = buildInterviewContext(history);

  const result = streamText({
    model: PRO,
    system: systemPrompt,
    messages: contextMessages,
  });

  return result.toTextStreamResponse();
}
