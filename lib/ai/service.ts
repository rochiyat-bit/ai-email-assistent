import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { AIUsageLog } from '@/models';

export interface EmailData {
  subject: string;
  from: string;
  snippet: string;
  body?: string;
  date: string;
}

export interface SummarizeResult {
  summary: string;
  category: 'important' | 'transactional' | 'promotional';
  confidence: number;
  tokensUsed: number;
  reasoning?: string;
}

export interface ReplyResult {
  reply: string;
  subject: string;
  tokensUsed: number;
}

export class AIService {
  private anthropic: Anthropic;
  private openai: OpenAI;
  private defaultProvider: 'anthropic' | 'openai';
  private userId?: string;

  constructor(
    provider: 'anthropic' | 'openai' = 'anthropic',
    userId?: string
  ) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
    this.defaultProvider = provider;
    this.userId = userId;
  }

  async summarizeEmail(email: EmailData): Promise<SummarizeResult> {
    const startTime = Date.now();

    try {
      const prompt = this.buildSummarizePrompt(email);

      let result: SummarizeResult;

      if (this.defaultProvider === 'anthropic') {
        result = await this.summarizeWithClaude(prompt);
      } else {
        result = await this.summarizeWithOpenAI(prompt);
      }

      // Log AI usage
      if (this.userId) {
        await this.logUsage({
          userId: this.userId,
          operationType: 'summarize',
          emailCount: 1,
          modelUsed: this.defaultProvider === 'anthropic' ? 'claude-3-5-sonnet-20241022' : 'gpt-4o',
          tokensUsed: result.tokensUsed,
          latencyMs: Date.now() - startTime,
          success: true,
        });
      }

      return result;
    } catch (error) {
      // Log failure
      if (this.userId) {
        await this.logUsage({
          userId: this.userId,
          operationType: 'summarize',
          emailCount: 1,
          modelUsed: this.defaultProvider === 'anthropic' ? 'claude-3-5-sonnet-20241022' : 'gpt-4o',
          tokensUsed: 0,
          latencyMs: Date.now() - startTime,
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      throw error;
    }
  }

  private buildSummarizePrompt(email: EmailData): string {
    return `Analyze this email and provide:
1. A concise one-line summary (max 100 characters)
2. Category classification (important/transactional/promotional)
3. Confidence score (0-1)

Email Details:
From: ${email.from}
Subject: ${email.subject}
Preview: ${email.snippet}
${email.body ? `Body: ${email.body.substring(0, 1000)}` : ''}

Classification Guidelines:
- IMPORTANT: Emails requiring action, from people you know, or containing critical information
- TRANSACTIONAL: Receipts, confirmations, shipping updates, account notifications
- PROMOTIONAL: Marketing emails, newsletters, promotional offers

Respond in JSON format:
{
  "summary": "concise one-line summary",
  "category": "important|transactional|promotional",
  "confidence": 0.95,
  "reasoning": "brief explanation"
}`;
  }

  private async summarizeWithClaude(prompt: string): Promise<SummarizeResult> {
    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const result = JSON.parse(content.text);
    return {
      summary: result.summary,
      category: result.category,
      confidence: result.confidence,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      reasoning: result.reasoning,
    };
  }

  private async summarizeWithOpenAI(prompt: string): Promise<SummarizeResult> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: prompt,
      }],
      response_format: { type: 'json_object' },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      summary: result.summary,
      category: result.category,
      confidence: result.confidence,
      tokensUsed: response.usage?.total_tokens || 0,
      reasoning: result.reasoning,
    };
  }

  async generateReply(
    email: EmailData,
    tone: 'professional' | 'casual' | 'friendly' | 'formal',
    customInstructions?: string
  ): Promise<ReplyResult> {
    const startTime = Date.now();

    try {
      const prompt = this.buildReplyPrompt(email, tone, customInstructions);

      let result: ReplyResult;

      if (this.defaultProvider === 'anthropic') {
        result = await this.generateReplyWithClaude(prompt);
      } else {
        result = await this.generateReplyWithOpenAI(prompt);
      }

      // Log AI usage
      if (this.userId) {
        await this.logUsage({
          userId: this.userId,
          operationType: 'reply',
          emailCount: 1,
          modelUsed: this.defaultProvider === 'anthropic' ? 'claude-3-5-sonnet-20241022' : 'gpt-4o',
          tokensUsed: result.tokensUsed,
          latencyMs: Date.now() - startTime,
          success: true,
        });
      }

      return result;
    } catch (error) {
      if (this.userId) {
        await this.logUsage({
          userId: this.userId,
          operationType: 'reply',
          emailCount: 1,
          modelUsed: this.defaultProvider === 'anthropic' ? 'claude-3-5-sonnet-20241022' : 'gpt-4o',
          tokensUsed: 0,
          latencyMs: Date.now() - startTime,
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      throw error;
    }
  }

  private buildReplyPrompt(
    email: EmailData,
    tone: string,
    customInstructions?: string
  ): string {
    return `Generate a ${tone} email reply for:

Original Email:
From: ${email.from}
Subject: ${email.subject}
Body: ${email.body || email.snippet}

${customInstructions ? `Additional Instructions: ${customInstructions}` : ''}

Tone Guidelines:
- Professional: Formal language, clear and concise
- Casual: Relaxed language, friendly but appropriate
- Friendly: Warm and approachable, personable
- Formal: Very formal, traditional business communication

Respond in JSON format:
{
  "subject": "Re: [original subject]",
  "reply": "Full email reply text"
}`;
  }

  private async generateReplyWithClaude(prompt: string): Promise<ReplyResult> {
    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const result = JSON.parse(content.text);
    return {
      reply: result.reply,
      subject: result.subject,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    };
  }

  private async generateReplyWithOpenAI(prompt: string): Promise<ReplyResult> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: prompt,
      }],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      reply: result.reply,
      subject: result.subject,
      tokensUsed: response.usage?.total_tokens || 0,
    };
  }

  async batchProcessEmails(emails: EmailData[]): Promise<SummarizeResult[]> {
    const startTime = Date.now();
    const batchSize = 10;
    const results: SummarizeResult[] = [];
    let totalTokens = 0;

    try {
      for (let i = 0; i < emails.length; i += batchSize) {
        const batch = emails.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(email => this.summarizeEmail(email))
        );
        results.push(...batchResults);
        totalTokens += batchResults.reduce((sum, r) => sum + r.tokensUsed, 0);

        // Small delay to avoid rate limiting
        if (i + batchSize < emails.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Log batch processing
      if (this.userId) {
        await this.logUsage({
          userId: this.userId,
          operationType: 'batch_process',
          emailCount: emails.length,
          modelUsed: this.defaultProvider === 'anthropic' ? 'claude-3-5-sonnet-20241022' : 'gpt-4o',
          tokensUsed: totalTokens,
          latencyMs: Date.now() - startTime,
          success: true,
        });
      }

      return results;
    } catch (error) {
      if (this.userId) {
        await this.logUsage({
          userId: this.userId,
          operationType: 'batch_process',
          emailCount: emails.length,
          modelUsed: this.defaultProvider === 'anthropic' ? 'claude-3-5-sonnet-20241022' : 'gpt-4o',
          tokensUsed: totalTokens,
          latencyMs: Date.now() - startTime,
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      throw error;
    }
  }

  private async logUsage(params: {
    userId: string;
    operationType: 'summarize' | 'categorize' | 'reply' | 'batch_process';
    emailCount: number;
    modelUsed: string;
    tokensUsed: number;
    latencyMs: number;
    success: boolean;
    errorMessage?: string;
  }) {
    try {
      // Calculate cost based on model
      let costPerToken = 0;
      if (params.modelUsed.includes('claude')) {
        costPerToken = (3 / 1000000); // Claude-3.5-Sonnet: $3 per million tokens
      } else if (params.modelUsed.includes('gpt-4o')) {
        costPerToken = (5 / 1000000); // GPT-4o: ~$5 per million tokens
      }

      await AIUsageLog.create({
        user_id: params.userId,
        operation_type: params.operationType,
        email_count: params.emailCount,
        model_used: params.modelUsed,
        tokens_input: Math.floor(params.tokensUsed * 0.6), // Approximate
        tokens_output: Math.floor(params.tokensUsed * 0.4),
        total_tokens: params.tokensUsed,
        cost_usd: params.tokensUsed * costPerToken,
        latency_ms: params.latencyMs,
        success: params.success,
        error_message: params.errorMessage || null,
      });
    } catch (error) {
      console.error('Error logging AI usage:', error);
    }
  }
}

export async function createAIService(userId?: string): Promise<AIService> {
  const provider = (process.env.AI_PROVIDER as 'anthropic' | 'openai') || 'anthropic';
  return new AIService(provider, userId);
}
