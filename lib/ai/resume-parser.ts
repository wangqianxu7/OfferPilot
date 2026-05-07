import { generateText } from 'ai';
import { FLASH } from './client';

const PARSE_PROMPT = `你是一个简历分析专家。请从以下简历文本中提取信息，严格按JSON格式返回：

{
  "skills": ["技能1", "技能2"],
  "projects": [{ "name": "项目名称", "description": "项目简要描述", "techStack": ["技术1"] }],
  "education": "教育背景简述"
}

简历文本：
`;

export async function parseResume(resumeText: string) {
  const { text } = await generateText({
    model: FLASH,
    prompt: PARSE_PROMPT + resumeText,
  });
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse resume JSON from AI response');
  return JSON.parse(jsonMatch[0]);
}
