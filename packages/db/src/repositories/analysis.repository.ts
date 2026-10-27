import { prisma } from "../client";
import { RawDealAnalysisLlm, RiskyClause, HiddenWorkItem, ComputedDealMath, Tone } from "@jhanjhat/shared";

export interface SaveAnalysisInput {
  projectId: string;
  documentId: string;
  riskScore: number;
  effectiveHourlyRate: number;
  decision: string;
  counterOffer: string;
  draftReply: string;
  tone: Tone;
  droppedQuotesCount: number;
  hiddenCosts?: any;
  rawResponse?: any;
  clauses: RiskyClause[];
  workItems: HiddenWorkItem[];
}

export class AnalysisRepository {
  async saveAnalysis(input: SaveAnalysisInput) {
    return prisma.analysis.create({
      data: {
        projectId: input.projectId,
        documentId: input.documentId,
        riskScore: input.riskScore,
        effectiveHourlyRate: input.effectiveHourlyRate,
        decision: input.decision,
        counterOffer: input.counterOffer,
        draftReply: input.draftReply,
        tone: input.tone,
        droppedQuotesCount: input.droppedQuotesCount,
        hiddenCosts: input.hiddenCosts ?? {},
        rawResponse: input.rawResponse ?? {},
        clauses: {
          create: input.clauses.map((c) => ({
            category: c.category,
            quote: c.quote,
            explanation: c.explanation,
            severity: c.severity,
          })),
        },
        workItems: {
          create: input.workItems.map((w) => ({
            title: w.title,
            quote: w.quote ?? null,
            hoursLow: w.hoursLow,
            hoursLikely: w.hoursLikely,
            hoursHigh: w.hoursHigh,
            isHidden: w.isHidden,
          })),
        },
      },
      include: {
        clauses: true,
        workItems: true,
      },
    });
  }

  async getLatestAnalysisByProject(projectId: string) {
    return prisma.analysis.findFirst({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      include: {
        clauses: true,
        workItems: true,
      },
    });
  }
}

export const analysisRepository = new AnalysisRepository();
