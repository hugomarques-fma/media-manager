// Epic 4: AI Agent client

import axios from 'axios';

interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class AIAgentClient {
  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor(apiKey: string, provider: 'openai' | 'claude' = 'claude') {
    this.apiKey = apiKey;
    this.model = provider === 'openai' ? 'gpt-4o' : 'claude-3-opus-20240229';
    this.baseURL = provider === 'openai'
      ? 'https://api.openai.com/v1'
      : 'https://api.anthropic.com/v1';
  }

  async analyzeCampaigns(context: string): Promise<string> {
    const messages: AIMessage[] = [
      {
        role: 'user',
        content: `Analyze these Meta Ads campaigns and provide optimization suggestions:\n\n${context}`,
      },
    ];

    try {
      const response = await axios.post(
        `${this.baseURL}/messages`,
        {
          model: this.model,
          max_tokens: 2048,
          messages,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      return response.data.content[0].text;
    } catch (error) {
      console.error('AI Analysis failed:', error);
      throw error;
    }
  }
}

export function createAIClient(provider: 'openai' | 'claude' = 'claude') {
  const apiKey = provider === 'openai'
    ? process.env.OPENAI_API_KEY
    : process.env.CLAUDE_API_KEY;

  if (!apiKey) {
    throw new Error(`${provider.toUpperCase()}_API_KEY is not set`);
  }

  return new AIAgentClient(apiKey, provider);
}
