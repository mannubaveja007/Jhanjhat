import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";

// Find root .env file
let currentDir = __dirname;
for (let i = 0; i < 4; i++) {
  const envPath = path.join(currentDir, ".env");
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
  currentDir = path.dirname(currentDir);
}
dotenv.config();

import { z } from "zod";

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  retries?: number;
  isJson?: boolean;
  callType?: "DEAL_ANALYSIS" | "OUT_OF_SCOPE" | "SCORECARD" | "EMBEDDINGS" | "SIMULATION_TURN";
  onUsage?: (usage: {
    model: string;
    provider: string;
    callType: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    latencyMs: number;
    cost: number;
  }) => Promise<unknown> | unknown;
}

export class LLMClient {
  private baseUrl: string;
  private apiKey: string;
  private model: string;
  private defaultTimeout: number;

  constructor() {
    this.baseUrl = (process.env.LLM_BASE_URL || "http://localhost:11434").replace(/\/+$/, "");
    this.apiKey = process.env.LLM_API_KEY || process.env.OPENROUTER_API_KEY || "";
    this.model = process.env.LLM_MODEL || "gemma4:12b";
    this.defaultTimeout = Number(process.env.LLM_TIMEOUT_MS) || 90000;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getModel(): string {
    return this.model;
  }

  private isOllama(): boolean {
    return this.baseUrl.includes(":11434") || this.baseUrl.includes("ollama");
  }

  async chatCompletion(messages: LLMMessage[], options: LLMOptions = {}): Promise<string> {
    const maxRetries = options.retries ?? 2;
    let attempt = 0;
    let lastError: any = null;

    const isOllamaHost = this.isOllama();
    // Use native Ollama /api/chat when communicating with local Ollama daemon for maximum speed & stability
    let endpointUrl = isOllamaHost
      ? `${this.baseUrl.replace(/\/v1$/, "")}/api/chat`
      : `${this.baseUrl}/chat/completions`;

    while (attempt <= maxRetries) {
      attempt++;
      const controller = new AbortController();
      const timeout = options.timeoutMs ?? this.defaultTimeout;
      const timer = setTimeout(() => controller.abort(), timeout);
      const startTime = Date.now();

      try {
        console.log(`[LLM] Model [${this.model}] Attempt ${attempt}: calling ${endpointUrl}`);

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (this.apiKey) {
          headers["Authorization"] = `Bearer ${this.apiKey}`;
        }

        let bodyPayload: any;
        if (isOllamaHost) {
          bodyPayload = {
            model: this.model,
            messages,
            stream: false,
            options: {
              temperature: options.temperature ?? 0.1,
              num_predict: options.maxTokens ?? 4096,
            },
          };
        } else {
          bodyPayload = {
            model: this.model,
            messages,
            temperature: options.temperature ?? 0.2,
            max_tokens: options.maxTokens,
          };
        }

        const response = await fetch(endpointUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(bodyPayload),
          signal: controller.signal,
        });

        clearTimeout(timer);
        const latencyMs = Date.now() - startTime;

        if (!response.ok) {
          const errBody = await response.text();
          throw new Error(`LLM HTTP ${response.status}: ${errBody}`);
        }

        const data = (await response.json()) as any;
        let reply = "";
        let promptTokens = 0;
        let completionTokens = 0;

        if (isOllamaHost) {
          const rawContent = data.message?.content ?? "";
          const thinking = data.message?.thinking ?? "";
          reply = rawContent.trim().length > 0 ? rawContent : thinking;
          promptTokens = data.prompt_eval_count || 0;
          completionTokens = data.eval_count || 0;
        } else {
          reply = data.choices?.[0]?.message?.content ?? "";
          promptTokens = data.usage?.prompt_tokens || 0;
          completionTokens = data.usage?.completion_tokens || 0;
        }

        const totalTokens = promptTokens + completionTokens;
        const provider = isOllamaHost ? "ollama" : "openrouter";
        const cost = provider === "ollama" ? 0 : (promptTokens * 0.00000015 + completionTokens * 0.0000006);

        // Track usage if onUsage callback provided
        if (options.onUsage) {
          try {
            await options.onUsage({
              model: this.model,
              provider,
              callType: options.callType || "DEAL_ANALYSIS",
              promptTokens,
              completionTokens,
              totalTokens,
              latencyMs,
              cost,
            });
          } catch (usageErr) {
            console.warn("[LLM] Usage logging callback error:", usageErr);
          }
        }

        return reply.trim();
      } catch (err: any) {
        clearTimeout(timer);
        lastError = err;
        console.warn(`[LLM Error] Model ${this.model} attempt ${attempt} failed:`, err?.message || err);

        if (attempt <= maxRetries) {
          const backoff = Math.min(1000 * Math.pow(2, attempt - 1), 4000);
          await new Promise((res) => setTimeout(res, backoff));
        }
      }
    }

    throw new Error(`Local LLM failed [${this.model}]: ${lastError?.message}`);
  }

  /**
   * Enforces structured JSON output matching a Zod schema with repair retry.
   */
  async structuredOutput<T>(
    messages: LLMMessage[],
    schema: z.ZodType<T, any, any>,
    schemaName = "ResponseSchema",
    options: LLMOptions = {}
  ): Promise<T> {
    const schemaInstruction = `You must return ONLY a valid JSON object strictly complying with this format:\n${schemaName}. Do not include markdown codeblocks, explanation, or any other text. Output pure JSON only.`;

    const enrichedMessages: LLMMessage[] = [
      ...messages,
      {
        role: "system",
        content: schemaInstruction,
      },
    ];

    let rawReply = await this.chatCompletion(enrichedMessages, {
      ...options,
      isJson: true,
      temperature: options.temperature ?? 0.1,
    });

    try {
      const parsed = this.cleanAndParseJson(rawReply);
      const validated = schema.parse(parsed);
      return validated;
    } catch (firstErr: any) {
      console.warn(`[LLM] Structured output validation failed: ${firstErr.message}. Attempting 1 repair retry...`);

      const retryMessages: LLMMessage[] = [
        ...enrichedMessages,
        { role: "assistant", content: rawReply },
        {
          role: "user",
          content: `Your previous output did not match the required schema: ${firstErr.message}.\nHere is what you output:\n${rawReply}\n\nPlease fix the JSON and return ONLY the valid corrected JSON object.`,
        },
      ];

      const repairedReply = await this.chatCompletion(retryMessages, {
        ...options,
        isJson: true,
        temperature: 0.1,
      });

      const secondParsed = this.cleanAndParseJson(repairedReply);
      const secondValidated = schema.parse(secondParsed);
      return secondValidated;
    }
  }

  private cleanAndParseJson(text: string): any {
    let cleaned = text.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    return JSON.parse(cleaned);
  }
}

export const llmClient = new LLMClient();
