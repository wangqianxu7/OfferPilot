import { createOpenAI } from '@ai-sdk/openai';

// DeepSeek API (OpenAI 兼容接口)
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';

const deepseekApiKey = process.env.ANTHROPIC_AUTH_TOKEN;
if (!deepseekApiKey) {
  throw new Error('Missing ANTHROPIC_AUTH_TOKEN — DeepSeek API 密钥未设置。请在 ~/.zshrc 中 export ANTHROPIC_AUTH_TOKEN');
}

export const deepseek = createOpenAI({
  apiKey: deepseekApiKey,
  baseURL: DEEPSEEK_BASE_URL,
});

// OpenAI 直连/代理（仅用于 Whisper 语音转录）
const openaiApiKey = process.env.OPENAI_API_KEY;
const openaiBaseUrl = process.env.OPENAI_BASE_URL;

export const openaiClient = openaiApiKey
  ? createOpenAI({
      apiKey: openaiApiKey,
      baseURL: openaiBaseUrl || undefined,
    })
  : null;

// 模型别名 — 使用 .chat() 强制走 /chat/completions（DeepSeek 不支持 OpenAI responses API）
export const FLASH = deepseek.chat('deepseek-v4-flash');   // 轻量任务 → gpt-4o-mini 平替
export const PRO = deepseek.chat('deepseek-v4-pro');       // 重度任务 → gpt-4o 平替
