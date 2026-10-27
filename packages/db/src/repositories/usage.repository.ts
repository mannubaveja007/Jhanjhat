import { prisma } from "../client";

export interface LogAiUsageInput {
  model: string;
  provider: string;
  callType: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost?: number;
  latencyMs?: number;
  metadata?: Record<string, any>;
}

export class UsageRepository {
  async logAiUsage(input: LogAiUsageInput) {
    try {
      return await prisma.aiUsage.create({
        data: {
          model: input.model,
          provider: input.provider,
          callType: input.callType,
          promptTokens: input.promptTokens,
          completionTokens: input.completionTokens,
          totalTokens: input.totalTokens,
          cost: input.cost ?? 0,
          latencyMs: input.latencyMs ?? 0,
          metadata: input.metadata ?? {},
        },
      });
    } catch (err) {
      console.error("[UsageRepository] Failed to log AI usage:", err);
      return null;
    }
  }
}

export const usageRepository = new UsageRepository();
