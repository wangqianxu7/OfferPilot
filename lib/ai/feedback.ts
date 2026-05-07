import { generateText } from 'ai';
import { FLASH } from './client';

export async function generateFeedback(question: string, answer: string) {
  const { text } = await generateText({
    model: FLASH,
    prompt: `你是一个面试教练。评估以下候选人的回答。

面试官问题：${question}
候选人回答：${answer}

请严格按JSON格式返回：
{
  "score": 分数(1-10),
  "strengths": ["优点1", "优点2"],
  "improvements": ["改进建议1", "改进建议2"]
}`,
  });
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse feedback JSON');
  return JSON.parse(jsonMatch[0]);
}
