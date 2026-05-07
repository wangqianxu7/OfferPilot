import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function generateLeetCodeQuestion(difficulty: string = 'medium') {
  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    prompt: `你是一个算法面试官。请出一道${difficulty}难度的算法题。

要求输出严格JSON格式：
{
  "title": "题目名称（英文，LeetCode风格）",
  "description": "题目描述（中文）",
  "hint": "解题提示",
  "leetcodeSlug": "对应的LeetCode题目slug（如果能匹配到经典题的话，否则为空字符串）"
}

题目方向偏向大模型算法面试中常见的数据结构和算法（哈希表、二叉树、动态规划、排序等，不涉及大模型特定知识）。`,
  });
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse LC question JSON');
  return JSON.parse(jsonMatch[0]);
}

export async function reviewLeetCodeCode(question: string, code: string) {
  const { text } = await generateText({
    model: openai('gpt-4o'),
    prompt: `你是算法面试官。审查候选人针对以下算法题写的代码。

题目：${question}
代码：
${code}

请严格按JSON格式审查：
{
  "correctness": "逻辑正确性评价",
  "complexity": "时间/空间复杂度分析",
  "style": ["代码风格建议1", "建议2"],
  "improvements": [
    { "line": 行号, "issue": "问题", "suggestion": "改进建议" }
  ],
  "score": 1-10
}`,
  });
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse review JSON');
  return JSON.parse(jsonMatch[0]);
}
