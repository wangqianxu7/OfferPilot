import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { buildInterviewSystemPrompt, buildInterviewContext } from '@/lib/ai/interviewer';

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  const { resumeText, projectDetails, history } = await req.json();

  const systemPrompt = buildInterviewSystemPrompt(resumeText, projectDetails);
  const contextMessages = buildInterviewContext(history);

  const result = streamText({
    model: openai('gpt-4o'),
    system: systemPrompt,
    messages: contextMessages,
  });

  return result.toTextStreamResponse();
}
