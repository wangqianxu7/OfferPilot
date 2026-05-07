import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY! });

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
    model: openai('gpt-4o-mini'),
    prompt: `你是大模型算法面试官，正在考察候选人对「${topicName}」的知识掌握。

${historyStr ? `之前的问答：\n${historyStr}\n` : ''}
请出一道关于${topicName}的面试题。要求：
- 有一定深度，不是简单的概念背诵
- 可以涉及原理、对比、实践细节
- 如果之前已经出过类似题，换一个不同角度

只输出题目，不要加任何前缀。`,
  });
  return text.trim();
}

export async function judgeBasicsAnswer(question: string, answer: string, topic: string) {
  const topicName = TOPIC_NAMES[topic] || topic;
  const { text } = await generateText({
    model: openai('gpt-4o'),
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
