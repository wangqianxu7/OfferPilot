import { generateText } from 'ai';
import { FLASH } from './client';

export async function analyzeTranscript(transcript: string) {
  const { text } = await generateText({
    model: FLASH,
    prompt: `你是一个面试表现分析专家。分析以下面试录音转录文本，给出诊断报告。

${transcript}

请严格按JSON格式返回：
{
  "pace": "语速分析：过快/适中/过慢，具体时段描述",
  "fillerWords": ["统计到的填充词或口头禅"],
  "weakPoints": [
    { "question": "问题描述", "issue": "具体哪里没答好", "suggestion": "改进建议" }
  ],
  "overallScore": 1-10的总体评分
}`,
  });
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse analysis JSON');
  return JSON.parse(jsonMatch[0]);
}
