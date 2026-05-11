import { generateText } from 'ai';
import { FLASH, PRO } from '../client';

const TOPIC_NAMES: Record<string, string> = {
  'post-training': '大模型后训练（Post-Training）',
  'multimodal': '多模态大模型（Multimodal）',
  'rag': '检索增强生成（RAG）',
  'agent': 'AI Agent',
};

export async function generateBasicsQuestion(topic: string, history: { question: string; answer: string }[]) {
  const topicName = TOPIC_NAMES[topic] || topic;
  const historyStr = history.map(h => `Q: ${h.question}\nA: ${h.answer}`).join('\n\n');

  const { text } = await generateText({
    model: FLASH,
    temperature: 0.7,
    prompt: `你是大模型算法面试官，正在考察候选人对「${topicName}」的知识掌握。

${historyStr ? `之前的问答：\n${historyStr}\n` : ''}
请出一道关于${topicName}的面试题。要求：
- 有一定深度，不是简单的概念背诵
- 可以涉及原理、对比、实践细节
- 如果之前已经出过类似题，换一个不同角度
- 题目简洁，控制在30字以内

只输出题目，不要加任何前缀。`,
  });
  return text.trim();
}

export async function generateReferenceAnswer(question: string, topic: string) {
  const topicName = TOPIC_NAMES[topic] || topic;
  const { text } = await generateText({
    model: FLASH,
    prompt: `你是大模型算法面试官。请为以下面试题生成一个高质量的参考答案。

题目（${topicName}）：${question}

要求：
- 答案要具体、有结构、有技术深度
- 涵盖核心原理，适当扩展相关概念
- 如果题目涉及对比（如A vs B），需分别阐述优缺点
- 控制在200字以内

只输出参考答案内容，不要加任何前缀。`,
  });
  return { referenceAnswer: text.trim() };
}

export async function judgeBasicsAnswer(question: string, answer: string, topic: string) {
  const topicName = TOPIC_NAMES[topic] || topic;
  const { text } = await generateText({
    model: PRO,
    prompt: `你是大模型算法面试官。评估候选人对以下题目的回答。

题目（${topicName}）：${question}
候选人回答：${answer}

请严格按JSON格式返回：
{
  "score": 1-10的整数评分,
  "comment": "简短点评",
  "referenceAnswer": "参考答案要点"
}`,
  });
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse judge JSON');
  return JSON.parse(jsonMatch[0]);
}
