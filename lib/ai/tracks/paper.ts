import { generateText } from 'ai';
import { FLASH, PRO } from '../client';

export async function parsePaper(text: string) {
  const { text: result } = await generateText({
    model: FLASH,
    temperature: 0.3,
    prompt: `你是一篇技术论文/报告的解析器。请从以下PDF文本中提取关键信息。

论文文本：
${text.slice(0, 15000)}

请严格按JSON格式返回：
{
  "title": "论文标题",
  "authors": "作者列表",
  "abstract": "摘要概括（100字以内）",
  "keyTechniques": ["核心技术1", "核心技术2", "核心技术3"],
  "sectionSummary": "各章节核心内容概要（按章节分段，300字以内）"
}

只输出JSON，不要加任何前缀或后缀。`,
  });

  const jsonMatch = result.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse paper JSON');
  return JSON.parse(jsonMatch[0]) as {
    title: string;
    authors: string;
    abstract: string;
    keyTechniques: string[];
    sectionSummary: string;
  };
}

export async function generatePaperQuestion(
  paperInfo: { title: string; abstract: string; keyTechniques: string[]; sectionSummary: string },
  history: { question: string; answer: string }[]
) {
  const historyStr = history
    .map(h => `Q: ${h.question}\nA: ${h.answer}`)
    .join('\n\n');

  const techniques = paperInfo.keyTechniques.join('、');

  const { text } = await generateText({
    model: FLASH,
    temperature: 0.7,
    prompt: `你是一个技术面试官，正在针对一篇论文进行技术提问。考察候选人对论文核心内容的理解深度。

论文标题：${paperInfo.title}
论文摘要：${paperInfo.abstract}
核心技术：${techniques}
章节概要：${paperInfo.sectionSummary}

${historyStr ? `之前问过的问题：\n${historyStr}\n` : ''}
请出一道关于这篇论文的技术面试题。要求：
- 围绕论文的核心技术或创新点提问
- 有一定深度，不是简单的概念背诵
- 可以从原理、实现细节、对比分析、应用场景等角度切入
- 如果之前已经出过类似题，换一个不同角度
- 题目简洁，控制在40字以内

只输出题目，不要加任何前缀。`,
  });
  return text.trim();
}

export async function judgePaperAnswer(
  paperInfo: { title: string; abstract: string; keyTechniques: string[]; sectionSummary: string },
  question: string,
  answer: string
) {
  const techniques = paperInfo.keyTechniques.join('、');

  const { text } = await generateText({
    model: PRO,
    prompt: `你是一个技术面试官，正在评估候选人对一篇论文相关问题的回答。

论文标题：${paperInfo.title}
论文摘要：${paperInfo.abstract}
核心技术：${techniques}

面试题：${question}
候选人回答：${answer}

请评估候选人对论文的理解程度，严格按JSON格式返回：
{
  "score": 1-10的整数评分,
  "comment": "简短点评（20字以内）",
  "referenceAnswer": "基于论文内容的参考答案要点（100字以内）"
}`,
  });

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse judge JSON');
  return JSON.parse(jsonMatch[0]) as {
    score: number;
    comment: string;
    referenceAnswer: string;
  };
}

export async function generatePaperReference(
  paperInfo: { title: string; abstract: string; keyTechniques: string[]; sectionSummary: string },
  question: string
) {
  const techniques = paperInfo.keyTechniques.join('、');

  const { text } = await generateText({
    model: FLASH,
    prompt: `你是一个技术面试官。请为以下关于论文的面试题生成一个高质量的参考答案。

论文标题：${paperInfo.title}
核心技术：${techniques}
章节概要：${paperInfo.sectionSummary}

题目：${question}

要求：
- 答案要具体、有结构，结合论文内容
- 涵盖核心原理，可适当扩展论文中的相关技术细节
- 控制在200字以内

只输出参考答案内容，不要加任何前缀。`,
  });
  return { referenceAnswer: text.trim() };
}
