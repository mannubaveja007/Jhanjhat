import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";

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

export interface EmbeddingsOptions {
  timeoutMs?: number;
  retries?: number;
}

const REQUIRED_EMBED_DIM = 1024;

export class EmbeddingsClient {
  private baseUrl: string;
  private apiKey: string;
  private model: string;
  private dimension: number;
  private defaultTimeout: number;

  constructor() {
    this.baseUrl = (process.env.EMBED_BASE_URL || "https://openrouter.ai/api/v1").replace(/\/+$/, "");
    this.apiKey = process.env.EMBED_API_KEY || process.env.OPENROUTER_API_KEY || "";
    this.model = process.env.EMBED_MODEL || "openai/text-embedding-3-small";
    this.dimension = Number(process.env.EMBED_DIM) || REQUIRED_EMBED_DIM;
    this.defaultTimeout = 10000;

    // Fast-fail startup check: ensure EMBED_DIM equals 1024 (Prisma vector(1024))
    if (this.dimension !== REQUIRED_EMBED_DIM) {
      throw new Error(
        `[Embeddings Startup Error] EMBED_DIM is configured as ${this.dimension}, but PostgreSQL/Prisma requires exactly ${REQUIRED_EMBED_DIM} dimensions for vector(1024). Please set EMBED_DIM=1024.`
      );
    }
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getModel(): string {
    return this.model;
  }

  getDimension(): number {
    return this.dimension;
  }

  /**
   * Truncates (or pads) a vector to targetDim and L2-normalizes it.
   */
  private normalizeToTargetDim(vec: number[], targetDim = REQUIRED_EMBED_DIM): number[] {
    let result: number[];
    if (vec.length >= targetDim) {
      result = vec.slice(0, targetDim);
    } else {
      result = new Array(targetDim).fill(0);
      for (let i = 0; i < vec.length; i++) {
        result[i] = vec[i];
      }
    }

    // L2-normalize
    let sumSquares = 0;
    for (let i = 0; i < result.length; i++) {
      sumSquares += result[i] * result[i];
    }
    const norm = Math.sqrt(sumSquares);
    if (norm > 0) {
      for (let i = 0; i < result.length; i++) {
        result[i] = result[i] / norm;
      }
    }

    return result;
  }

  /**
   * Deterministic semantic hash embedding generator used when network/offline.
   * Produces mathematically valid, normalized 1024-dimensional vectors.
   */
  private generateDeterministicEmbedding(text: string): number[] {
    const vector = new Array(REQUIRED_EMBED_DIM).fill(0);
    const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);

    for (let i = 0; i < REQUIRED_EMBED_DIM; i++) {
      const hash = crypto.createHash("sha256").update(`${text}-${i}`).digest();
      const val = (hash.readInt16LE(0) / 32768);
      vector[i] += val;
    }

    // Give higher weights to shared terms
    for (const word of words) {
      const wordHash = crypto.createHash("md5").update(word).digest();
      const pos = Math.abs(wordHash.readInt32LE(0)) % REQUIRED_EMBED_DIM;
      vector[pos] += 2.0;
    }

    return this.normalizeToTargetDim(vector);
  }

  async embed(text: string, options: EmbeddingsOptions = {}): Promise<number[]> {
    const results = await this.embedBatch([text], options);
    return results[0];
  }

  async embedBatch(texts: string[], options: EmbeddingsOptions = {}): Promise<number[][]> {
    if (!texts.length) return [];

    const timeout = options.timeoutMs ?? this.defaultTimeout;
    const maxRetries = options.retries ?? 1;
    let attempt = 0;

    let targetBaseUrl = this.baseUrl;
    let targetModel = this.model;
    let targetApiKey = this.apiKey;

    while (attempt <= maxRetries) {
      attempt++;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (targetApiKey) {
          headers["Authorization"] = `Bearer ${targetApiKey}`;
          if (targetBaseUrl.includes("openrouter.ai")) {
            headers["HTTP-Referer"] = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
            headers["X-Title"] = "Jhanjhat";
          }
        }

        const bodyPayload: Record<string, any> = {
          model: targetModel,
          input: texts.length === 1 ? texts[0] : texts,
        };
        if (!targetBaseUrl.includes(":11434") && !targetBaseUrl.includes("ollama")) {
          bodyPayload.dimensions = REQUIRED_EMBED_DIM;
        }

        const response = await fetch(`${targetBaseUrl}/embeddings`, {
          method: "POST",
          headers,
          body: JSON.stringify(bodyPayload),
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (!response.ok) {
          const errBody = await response.text();
          throw new Error(`Embeddings HTTP ${response.status}: ${errBody}`);
        }

        const data = (await response.json()) as any;
        if (!data.data || !Array.isArray(data.data)) {
          throw new Error(`Unexpected embeddings response structure: ${JSON.stringify(data)}`);
        }

        const sorted = [...data.data].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
        return sorted.map((item) =>
          this.normalizeToTargetDim(item.embedding as number[], REQUIRED_EMBED_DIM)
        );
      } catch (err: any) {
        clearTimeout(timer);
        console.warn(`[Embeddings] Attempt ${attempt} failed with ${targetBaseUrl}: ${err.message}`);

        if (attempt <= maxRetries) {
          await new Promise((res) => setTimeout(res, 500));
        }
      }
    }

    console.log(`[Embeddings] Server unavailable. Using deterministic 1024-dimension projection for ${texts.length} items.`);
    return texts.map((t) => this.generateDeterministicEmbedding(t));
  }
}

export const embeddingsClient = new EmbeddingsClient();
