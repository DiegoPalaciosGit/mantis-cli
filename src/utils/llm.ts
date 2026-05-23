import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

export interface LLMRequest {
  model?: string;
  systemPrompt?: string;
  prompt: string;
  temperature?: number;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Generates text using either Gemini (Google) or Anthropic.
 * Reads API keys from process.env: GEMINI_API_KEY and ANTHROPIC_API_KEY.
 */
export async function generateText(
  provider: 'gemini' | 'anthropic',
  model: string,
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  try {
    if (provider === 'gemini') {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not set.');
      }
      const genAI = new GoogleGenerativeAI(apiKey);
      const modelInstance = genAI.getGenerativeModel({
        model: model || 'gemini-2.5-flash',
        systemInstruction,
      });
      const result = await modelInstance.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } else if (provider === 'anthropic') {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY environment variable is not set.');
      }
      const anthropic = new Anthropic({ apiKey });
      const response = await anthropic.messages.create({
        model: model || 'claude-3-opus-20240229',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
        system: systemInstruction,
      });
      
      const text = response.content
        .filter((block) => block.type === 'text')
        .map((block: any) => block.text)
        .join('');
      return text;
    } else {
      throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  } catch (error: any) {
    console.error(`[LLM Error] Error generating text with ${provider}:`, error.message || error);
    throw error;
  }
}

/**
 * Retained for compatibility with other components if needed.
 */
export async function callLLM(request: LLMRequest): Promise<LLMResponse> {
  const provider = (request.model?.startsWith('claude') || request.model?.startsWith('opus')) ? 'anthropic' : 'gemini';
  const model = request.model || (provider === 'gemini' ? 'gemini-2.5-flash' : 'claude-3-opus-20240229');
  
  const content = await generateText(provider, model, request.prompt, request.systemPrompt);
  return {
    content,
    usage: {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    },
  };
}
