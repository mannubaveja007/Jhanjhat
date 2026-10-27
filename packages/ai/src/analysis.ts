import {
  RawDealAnalysisLlmSchema,
  RawDealAnalysisLlm,
  RiskyClause,
  HiddenWorkItem,
  DealAnalysisResult,
  Tone,
  redactSensitiveInfo,
  filterAndVerifyQuotes,
  computeDealMath,
  verifyDraftAmounts,
} from "@jhanjhat/shared";
import { llmClient } from "./llm";

export interface AnalyzeDealParams {
  projectId: string;
  documentId: string;
  rawContent: string;
  budgetAmount: number;
  hourlyMinimum: number;
  clientName?: string;
  projectTitle?: string;
  tone?: Tone;
}

export async function analyzeDeal(params: AnalyzeDealParams): Promise<DealAnalysisResult> {
  const {
    projectId,
    documentId,
    rawContent,
    budgetAmount,
    hourlyMinimum,
    clientName = "Client",
    projectTitle = "Project",
    tone = "ENGLISH",
  } = params;

  // 1. Redact before passing to external / LLM processing if needed, but verify quotes on original
  const redaction = redactSensitiveInfo(rawContent);
  const textForAnalysis = redaction.redactedText;

  // 2. Prompt for Gemma
  const systemPrompt = `You are an elite contract negotiator and risk analyst for freelancers.
Analyze the provided client document (contract, brief, or chat log).
Identify deal-breaking risks, unstated work, and hidden costs.

CRITICAL RULES:
1. Every risky clause MUST cite an EXACT, VERBATIM quote from the provided text. Never paraphrase or invent quotes.
2. Clause categories MUST be one of:
   - UNLIMITED_REVISIONS
   - PAYMENT_AFTER_LAUNCH
   - VAGUE_DELIVERABLES
   - NO_KILL_FEE
   - UNCLEAR_IP
   - NO_DEADLINE_CHANGE_TERMS
   - MISSING_EXCLUSIONS
   - OTHER
3. Estimate hidden work items with low, likely, and high hours.
4. Estimate hidden costs (revision rounds, sync meetings, back-and-forth, delayed payment penalties, tool costs, taxes).
5. Recommend a clear decision: TAKE (fair terms and rate), RENEGOTIATE (salvageable with counter-offer), or WALK (exploitative or toxic terms).
6. Provide a concise bullet-point counter-offer.
7. Draft a reply in the requested tone: ${tone === "HINGLISH" ? "Hinglish (mix of professional Hindi and English, friendly yet assertive, e.g., 'Aapka project brief dekha... lekin revisions limit karna zaroori hai')" : "Professional, assertive English"}.`;

  const userPrompt = `CLIENT: ${clientName}
PROJECT: ${projectTitle}
BUDGET: $${budgetAmount}
FREELANCER MINIMUM HOURLY RATE: $${hourlyMinimum}/hr
TONE: ${tone}

DOCUMENT TEXT:
"""
${textForAnalysis}
"""

Analyze this deal and return ONLY a JSON object conforming to the schema.`;

  // 3. One Gemma call with JSON schema + Zod validation, with 1 retry on error
  const rawLlmOutput = await llmClient.structuredOutput<RawDealAnalysisLlm>(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    RawDealAnalysisLlmSchema,
    "RawDealAnalysisLlmSchema",
    {
      temperature: 0.1,
      callType: "DEAL_ANALYSIS",
    }
  );

  // 4. Quote Verification: Verify each quote in code against original source text (normalizing whitespace and curly quotes).
  // Drop and count failures.
  const clauseFilter = filterAndVerifyQuotes(rawLlmOutput.riskyClauses, rawContent);
  const verifiedClauses = clauseFilter.validItems;
  const droppedQuotesCount = clauseFilter.droppedCount;

  // 5. Plain TypeScript Math: NEVER model output.
  const computedMath = computeDealMath({
    workItems: rawLlmOutput.hiddenWorkItems,
    budgetAmount,
    hourlyMinimum,
    hiddenCosts: rawLlmOutput.hiddenCosts,
  });

  // 6. Verify Draft Amounts: Check every amount in the drafted message against computed numbers
  const draftVerification = verifyDraftAmounts(rawLlmOutput.draftReply, computedMath);
  let finalDraft = rawLlmOutput.draftReply;

  // If the draft hallucinated an ungrounded number, ground it by appending or substituting
  if (!draftVerification.isGrounded && draftVerification.flaggedNumbers.length > 0) {
    console.warn("[Deal Analysis] Draft contained ungrounded amounts:", draftVerification.flaggedNumbers);
    finalDraft += `\n\n[Note: Proposed counter-budget: $${computedMath.suggestedCounterOfferAmount} based on ${computedMath.totalEffectiveHours} estimated hours at $${hourlyMinimum}/hr.]`;
  }

  return {
    id: `analysis_${Date.now()}`,
    projectId,
    riskScore: rawLlmOutput.riskScore,
    decision: rawLlmOutput.decision,
    counterOffer: rawLlmOutput.counterOffer,
    draftReply: finalDraft,
    tone,
    droppedQuotesCount,
    riskyClauses: verifiedClauses,
    workItems: rawLlmOutput.hiddenWorkItems,
    hiddenCosts: rawLlmOutput.hiddenCosts,
    math: computedMath,
  };
}
