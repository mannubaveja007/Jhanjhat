import { NextRequest, NextResponse } from "next/server";
import { CreateDealInputSchema } from "@jhanjhat/shared";
import { projectRepository, analysisRepository } from "@jhanjhat/db";
import { analyzeDeal, embedAndStoreDealMemory } from "@jhanjhat/ai";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const validated = CreateDealInputSchema.parse(json);

    // 1. Create project & document
    const project = await projectRepository.createProject(validated);
    const document = project.documents[0];

    // 2. Run analysis with quote verification and plain TS maths
    const analysisResult = await analyzeDeal({
      projectId: project.id,
      documentId: document.id,
      rawContent: validated.rawContent,
      budgetAmount: validated.budgetAmount,
      hourlyMinimum: validated.hourlyMinimum,
      clientName: validated.clientName,
      projectTitle: validated.title,
      tone: validated.tone,
    });

    // 3. Update estimated hours in project
    await projectRepository.updateEstimatedHours(project.id, analysisResult.math.totalEffectiveHours);

    // 4. Save analysis to database
    const savedAnalysis = await analysisRepository.saveAnalysis({
      projectId: project.id,
      documentId: document.id,
      riskScore: analysisResult.riskScore,
      effectiveHourlyRate: analysisResult.math.effectiveHourlyRate,
      decision: analysisResult.decision,
      counterOffer: analysisResult.counterOffer,
      draftReply: analysisResult.draftReply,
      tone: analysisResult.tone,
      droppedQuotesCount: analysisResult.droppedQuotesCount,
      hiddenCosts: analysisResult.hiddenCosts,
      rawResponse: analysisResult,
      clauses: analysisResult.riskyClauses,
      workItems: analysisResult.workItems,
    });

    // 5. Index into Deal Memory (asynchronous safe batched embeddings)
    embedAndStoreDealMemory({
      projectId: project.id,
      documentId: document.id,
      analysis: analysisResult,
      clauses: analysisResult.riskyClauses,
    }).catch((err) => console.error("[Deal Analysis API] Deal Memory indexing failed:", err));

    return NextResponse.json({
      success: true,
      projectId: project.id,
      analysis: savedAnalysis,
      math: analysisResult.math,
    });
  } catch (err: any) {
    console.error("[Deal Analysis API] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to analyze deal" },
      { status: 400 }
    );
  }
}
