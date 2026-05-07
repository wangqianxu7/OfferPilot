import { generateText } from 'ai';
import { FLASH, PRO } from '../client';

const TOPIC_NAMES: Record<string, string> = {
  'post-training': '大模型后训练',
  'multimodal': '多模态模型',
  'rag': 'RAG检索增强',
  'agent': 'AI Agent',
};

export async function generateTorchCodeQuestion(topic: string, history: { question: string }[]) {
  const topicName = TOPIC_NAMES[topic] || topic;
  const historyStr = history.map(h => `- ${h.question}`).join('\n');

  const { text } = await generateText({
    model: FLASH,
    prompt: `你是一个大模型算法面试官，正在考察候选人的PyTorch代码实现能力。

专题方向：${topicName}
${historyStr ? `之前出过的题（不要重复）：\n${historyStr}\n` : ''}

请出一道让候选人在线手写的代码实现题。要求：
- 是该方向的核心组件/算法实现（如Attention、LoRA、CLIP loss等）
- 不涉及训练循环，只写模型定义或核心函数
- 代码量控制在20-50行左右
- 给候选人明确的功能要求和输入输出说明

输出格式（纯文本，不是JSON）：
第一行：题目名称
空一行
题目描述和要求
空一行
输入输出格式说明`,
  });
  return text.trim();
}

export async function reviewTorchCode(question: string, code: string) {
  const { text } = await generateText({
    model: PRO,
    prompt: `你是PyTorch专家。审查以下代码实现。

题目要求：
${question}

候选人代码：
${code}

请逐行审查，严格按JSON格式返回：
{
  "correctness": "逻辑正确性评价（是否正确实现了要求的功能）",
  "complexity": "时间/空间复杂度分析",
  "style": ["代码风格建议"],
  "improvements": [
    { "line": 行号（从1开始）, "issue": "具体问题", "suggestion": "改进建议" }
  ],
  "score": 1-10的整数评分
}`,
  });
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse torch review JSON');
  return JSON.parse(jsonMatch[0]);
}
