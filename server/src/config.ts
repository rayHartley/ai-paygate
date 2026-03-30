// AI PayGate Configuration
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),

  // TRON Network
  tronNetwork: process.env.TRON_NETWORK || 'nile', // nile | shasta | mainnet
  tronPrivateKey: process.env.TRON_PRIVATE_KEY || '',
  tronFullHost: process.env.TRON_FULL_HOST || 'https://nile.trongrid.io',

  // Payment recipient wallet
  paymentRecipient: process.env.PAYMENT_RECIPIENT || '',

  // Facilitator
  facilitatorUrl: process.env.FACILITATOR_URL || 'https://facilitator.bankofai.io',

  // LLM API
  llmApiUrl: process.env.LLM_API_URL || 'http://yy.dbh.baidu-int.com/v1/chat/completions',
  llmApiKey: process.env.LLM_API_KEY || '',
  llmModel: process.env.LLM_MODEL || 'gpt-4.1',

  // Mock mode (for demo without real TRON keys)
  mockMode: process.env.MOCK_MODE === 'true' || !process.env.TRON_PRIVATE_KEY,

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

// TRON token contract addresses per network
export const TRON_TOKENS: Record<string, Record<string, string>> = {
  nile: {
    USDT: 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj',
    USDD: 'TNiKSmVafGNwDJkNRmvJFPdBCFpGeJCxZN',
  },
  shasta: {
    USDT: 'TG3XXyExBkFU9nQGX7bLbERPMSa9M31aY2',
  },
  mainnet: {
    USDT: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    USDD: 'TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn',
  },
};

// AI Service definitions with pricing
export interface AIServiceDef {
  id: string;
  name: string;
  description: string;
  category: string;
  priceUsdt: number; // price in USDT (6 decimals on TRON)
  icon: string;
  systemPrompt: string;
}

export const AI_SERVICES: AIServiceDef[] = [
  {
    id: 'ai-writer',
    name: 'AI Writing Assistant',
    description: 'Professional content writing: articles, emails, reports, creative writing. Pay per request.',
    category: 'Content',
    priceUsdt: 0.1,
    icon: '✍️',
    systemPrompt: 'You are a professional writing assistant. Help the user write high-quality content. Be creative, clear, and well-structured. Output in the language the user requests.',
  },
  {
    id: 'ai-translator',
    name: 'AI Translator',
    description: 'High-quality translation between 50+ languages. Preserves context and nuance.',
    category: 'Language',
    priceUsdt: 0.05,
    icon: '🌐',
    systemPrompt: 'You are a professional translator. Translate the given text accurately while preserving the original meaning, tone, and context. If the target language is not specified, translate to English.',
  },
  {
    id: 'ai-coder',
    name: 'AI Code Review',
    description: 'Expert code review with suggestions for improvement, bug detection, and best practices.',
    category: 'Development',
    priceUsdt: 0.15,
    icon: '💻',
    systemPrompt: 'You are an expert code reviewer. Review the given code and provide: 1) Bug identification 2) Performance suggestions 3) Security concerns 4) Best practice recommendations. Be specific and actionable.',
  },
  {
    id: 'ai-analyst',
    name: 'AI Data Analyst',
    description: 'Analyze data, generate insights, and provide actionable recommendations.',
    category: 'Analytics',
    priceUsdt: 0.2,
    icon: '📊',
    systemPrompt: 'You are an expert data analyst. Analyze the given data or question and provide clear insights, trends, and actionable recommendations. Use structured formatting with key findings highlighted.',
  },
  {
    id: 'ai-summarizer',
    name: 'AI Summarizer',
    description: 'Summarize long texts, articles, and documents into concise overviews.',
    category: 'Content',
    priceUsdt: 0.03,
    icon: '📝',
    systemPrompt: 'You are an expert summarizer. Summarize the given text concisely while keeping the key information, main arguments, and important details. Provide bullet points for clarity.',
  },
];
