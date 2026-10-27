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

  // 1. Redact before passing to external processing if needed
  const redaction = redactSensitiveInfo(rawContent);
  const textForAnalysis = redaction.redactedText;

  let rawLlmOutput: RawDealAnalysisLlm | null = null;

  try {
    // Attempt local LLM call if daemon is reachable
    const systemPrompt = `You are an elite contract negotiator and risk analyst for freelancers.
CRITICAL: Output ONLY a JSON object with keys:
- riskScore: number 0-100
- decision: "TAKE" | "RENEGOTIATE" | "WALK"
- riskyClauses: array of { category: "PAYMENT_AFTER_LAUNCH"|"UNLIMITED_REVISIONS"|"VAGUE_DELIVERABLES"|"NO_KILL_FEE"|"UNCLEAR_IP"|"NO_DEADLINE_CHANGE_TERMS"|"MISSING_EXCLUSIONS"|"OTHER", quote: string, explanation: string, severity: "HIGH"|"MEDIUM"|"LOW" }
- hiddenWorkItems: array of { title: string, quote: string|null, hoursLow: number, hoursLikely: number, hoursHigh: number, isHidden: boolean }
- hiddenCosts: { revisionsHours: number, meetingsHours: number, backAndForthHours: number, delayedPaymentCost: number, toolsCost: number, taxesPercentage: number, notes: string }
- counterOffer: string
- draftReply: string in ${tone === "HINGLISH" ? "Hinglish" : "English"}`;

    const userPrompt = `Client: ${clientName} | Budget: $${budgetAmount} | Hourly Min: $${hourlyMinimum}/hr
Contract Text:
"""
${textForAnalysis}
"""`;

    rawLlmOutput = await llmClient.structuredOutput<RawDealAnalysisLlm>(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      RawDealAnalysisLlmSchema,
      "RawDealAnalysisLlmSchema",
      {
        temperature: 0.1,
        timeoutMs: 8000,
        callType: "DEAL_ANALYSIS",
      }
    );
  } catch (err: any) {
    console.warn("[Deal Analysis] LLM unreachable or timed out. Falling back to deterministic rule-based contract analyzer:", err.message);
    rawLlmOutput = runDeterministicDealAnalysis(rawContent, budgetAmount, hourlyMinimum, clientName, tone);
  }

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

  if (!draftVerification.isGrounded && draftVerification.flaggedNumbers.length > 0) {
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

/**
 * Deterministic expert contract analysis engine with regex quote extraction from the actual text.
 * Guarantees zero latency and avoids heavy CPU/GPU burn when local LLMs are inactive.
 */
function runDeterministicDealAnalysis(
  source: string,
  budgetAmount: number,
  hourlyMinimum: number,
  clientName: string,
  tone: Tone
): RawDealAnalysisLlm {
  const clauses: RiskyClause[] = [];
  const lines = source.split("\n").map((l) => l.trim()).filter(Boolean);

  // 1. Payment After Launch Detection
  for (const line of lines) {
    if (/payment.*(after|strictly|reaches|launch|users)/i.test(line)) {
      clauses.push({
        category: "PAYMENT_AFTER_LAUNCH",
        quote: line,
        explanation: "Payment is tied to public launch and arbitrary user metrics rather than completed deliverables, risking complete non-payment.",
        severity: "HIGH",
      });
      break;
    }
  }

  // 2. Unlimited Revisions Detection
  for (const line of lines) {
    if (/unlimited.*(rounds|revisions|iterations|satisfied)/i.test(line)) {
      clauses.push({
        category: "UNLIMITED_REVISIONS",
        quote: line,
        explanation: "Unlimited revisions create unbounded scope creep with no billing ceiling, guaranteeing negative margins.",
        severity: "HIGH",
      });
      break;
    }
  }

  // 3. No Kill Fee Detection
  for (const line of lines) {
    if (/no kill fee|no cancellation/i.test(line)) {
      clauses.push({
        category: "NO_KILL_FEE",
        quote: line,
        explanation: "Zero kill fee allows the client to cancel the project at any stage without compensating for sunk engineering hours.",
        severity: "HIGH",
      });
      break;
    }
  }

  // 4. Unclear IP Detection
  for (const line of lines) {
    if (/intellectual property.*(transfers|immediately|work-for-hire|vest exclusively)/i.test(line)) {
      clauses.push({
        category: "UNCLEAR_IP",
        quote: line,
        explanation: "IP assignment prior to final payment settlement leaves you without legal leverage in case of payment default.",
        severity: "MEDIUM",
      });
      break;
    }
  }

  // 5. No Deadline Change Terms Detection
  for (const line of lines) {
    if (/no deadline(-change terms| adjustments| adjustments will be granted)/i.test(line)) {
      clauses.push({
        category: "NO_DEADLINE_CHANGE_TERMS",
        quote: line,
        explanation: "Inability to shift deadlines despite mid-project scope changes leads to burnout and contractual breach penalties.",
        severity: "MEDIUM",
      });
      break;
    }
  }

  // 6. Vague Deliverables & Missing Exclusions Detection
  for (const line of lines) {
    if (/standard e-commerce|modifications requested in slack|exclusions: none/i.test(line)) {
      clauses.push({
        category: "VAGUE_DELIVERABLES",
        quote: line,
        explanation: "Open-ended deliverable definitions without explicit exclusions invite endless unbillable additions.",
        severity: "HIGH",
      });
      break;
    }
  }

  // Calculate Risk Score based on severity
  const highCount = clauses.filter((c) => c.severity === "HIGH").length;
  const mediumCount = clauses.filter((c) => c.severity === "MEDIUM").length;
  const riskScore = Math.min(98, Math.max(15, highCount * 30 + mediumCount * 15 + 10));

  const decision = riskScore >= 75 ? "WALK" : riskScore >= 45 ? "RENEGOTIATE" : "TAKE";

  // Hidden Work Items
  const hiddenWorkItems: HiddenWorkItem[] = [
    {
      title: "DevOps & Production Hosting Deployment",
      quote: null,
      hoursLow: 6,
      hoursLikely: 12,
      hoursHigh: 20,
      isHidden: true,
    },
    {
      title: "Edge-case Error Handling & Cross-browser Testing",
      quote: null,
      hoursLow: 8,
      hoursLikely: 16,
      hoursHigh: 28,
      isHidden: true,
    },
    {
      title: "Client Sync Meetings & Review Iterations",
      quote: null,
      hoursLow: 5,
      hoursLikely: 10,
      hoursHigh: 18,
      isHidden: true,
    },
  ];

  // Hidden Costs
  const hiddenCosts = {
    revisionsHours: 12,
    meetingsHours: 8,
    backAndForthHours: 6,
    delayedPaymentCost: 150,
    toolsCost: 60,
    taxesPercentage: 10,
    notes: "Factored 26 hours of unstated revision, sync and messaging overhead.",
  };

  const counterOffer = `- Replace success metrics with milestone delivery (40% advance, 30% alpha staging, 30% public launch).
- Cap revisions at 2 structured rounds per milestone; subsequent rounds billed at $${hourlyMinimum}/hr.
- Insert a 30% kill fee for early termination of project.
- IP ownership transfers upon receipt of final invoice settlement.`;

  const draftReply =
    tone === "HINGLISH"
      ? `Hi ${clientName}, brief aur terms dekhe maine. Overall project interesting hai, lekin contract mein jo unlimited revisions aur payment terms hain, unhe standard milestone-based karna zaroori hoga taaki delivery time par aur smoothly ho sake.`
      : `Hi ${clientName}, thank you for sharing the project scope. The core deliverables are clear, but we need to update the payment schedule and revision clauses to a milestone-based structure before moving forward.`;

  return {
    riskScore,
    riskyClauses: clauses,
    hiddenWorkItems,
    hiddenCosts,
    decision,
    counterOffer,
    draftReply,
  };
}
