import { z } from "zod";

export * from "./redact";
export * from "./quotes";
export * from "./math";

// ==================== DEAL & ANALYSIS SCHEMAS ====================

export const RiskyClauseCategorySchema = z.enum([
  "UNLIMITED_REVISIONS",
  "PAYMENT_AFTER_LAUNCH",
  "VAGUE_DELIVERABLES",
  "NO_KILL_FEE",
  "UNCLEAR_IP",
  "NO_DEADLINE_CHANGE_TERMS",
  "MISSING_EXCLUSIONS",
  "OTHER",
]);
export type RiskyClauseCategory = z.infer<typeof RiskyClauseCategorySchema>;

export const SeveritySchema = z.enum(["HIGH", "MEDIUM", "LOW"]);
export type Severity = z.infer<typeof SeveritySchema>;

export const RiskyClauseSchema = z.object({
  category: RiskyClauseCategorySchema,
  quote: z.string().describe("Exact verbatim quote from the source text"),
  explanation: z.string().describe("Why this clause poses a risk to the freelancer"),
  severity: SeveritySchema,
});
export type RiskyClause = z.infer<typeof RiskyClauseSchema>;

export const HiddenWorkItemSchema = z.object({
  title: z.string().describe("Hidden or unstated task implied by the scope"),
  quote: z.string().nullable().optional().describe("Source quote if directly referenced"),
  hoursLow: z.number().min(0),
  hoursLikely: z.number().min(0),
  hoursHigh: z.number().min(0),
  isHidden: z.boolean().default(true),
});
export type HiddenWorkItem = z.infer<typeof HiddenWorkItemSchema>;

export const HiddenCostsSchema = z.object({
  revisionsHours: z.number().min(0).default(0),
  meetingsHours: z.number().min(0).default(0),
  backAndForthHours: z.number().min(0).default(0),
  delayedPaymentCost: z.number().min(0).default(0),
  toolsCost: z.number().min(0).default(0),
  taxesPercentage: z.number().min(0).default(0),
  notes: z.string().default(""),
});
export type HiddenCosts = z.infer<typeof HiddenCostsSchema>;

export const DecisionSchema = z.enum(["TAKE", "RENEGOTIATE", "WALK"]);
export type Decision = z.infer<typeof DecisionSchema>;

export const ToneSchema = z.enum(["ENGLISH", "HINGLISH"]);
export type Tone = z.infer<typeof ToneSchema>;

/**
 * Raw output expected from Gemma LLM for deal analysis
 */
export const RawDealAnalysisLlmSchema = z.object({
  riskScore: z.number().min(0).max(100),
  riskyClauses: z.array(RiskyClauseSchema),
  hiddenWorkItems: z.array(HiddenWorkItemSchema),
  hiddenCosts: HiddenCostsSchema,
  decision: DecisionSchema,
  counterOffer: z.string().describe("Bullet-point counter offer terms"),
  draftReply: z.string().describe("Draft email or chat reply to the client in requested tone"),
});
export type RawDealAnalysisLlm = z.infer<typeof RawDealAnalysisLlmSchema>;

export const CreateDealInputSchema = z.object({
  title: z.string().min(1).default("Freelance Contract"),
  clientName: z.string().min(1).default("Client"),
  budgetAmount: z.number().positive("Budget amount must be greater than 0"),
  hourlyMinimum: z.number().positive("Hourly minimum must be greater than 0"),
  currency: z.string().default("USD"),
  tone: ToneSchema.default("ENGLISH"),
  rawContent: z.string().min(10, "Contract or brief text must be at least 10 characters"),
});
export type CreateDealInput = z.infer<typeof CreateDealInputSchema>;

export const DealAnalysisResultSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  riskScore: z.number().min(0).max(100),
  decision: DecisionSchema,
  counterOffer: z.string(),
  draftReply: z.string(),
  tone: ToneSchema,
  droppedQuotesCount: z.number().int().nonnegative(),
  riskyClauses: z.array(RiskyClauseSchema),
  workItems: z.array(HiddenWorkItemSchema),
  hiddenCosts: HiddenCostsSchema,
  math: z.object({
    totalHoursLow: z.number(),
    totalHoursLikely: z.number(),
    totalHoursHigh: z.number(),
    hiddenHours: z.number(),
    totalEffectiveHours: z.number(),
    budgetAmount: z.number(),
    hourlyMinimum: z.number(),
    effectiveHourlyRate: z.number(),
    rateDelta: z.number(),
    isBelowMinimum: z.boolean(),
    suggestedCounterOfferAmount: z.number(),
  }),
});
export type DealAnalysisResult = z.infer<typeof DealAnalysisResultSchema>;

// ==================== OUT OF SCOPE CHECK SCHEMAS ====================

export const OutOfScopeInputSchema = z.object({
  projectId: z.string(),
  newRequestText: z.string().min(5, "New request text must be provided"),
});
export type OutOfScopeInput = z.infer<typeof OutOfScopeInputSchema>;

export const OutOfScopeResultSchema = z.object({
  status: z.enum(["IN_SCOPE", "OUT_OF_SCOPE"]),
  quote: z.string().describe("Relevant excerpt from client's new request"),
  suggestedPrice: z.number().min(0),
  replyDraft: z.string().describe("Professional response acknowledging request and stating scope/price"),
  reasoning: z.string(),
});
export type OutOfScopeResult = z.infer<typeof OutOfScopeResultSchema>;

// ==================== PRACTICE ROOM & SCORECARD SCHEMAS ====================

export const PersonaSchema = z.enum([
  "AGGRESSIVE",
  "SCOPE_CREEPER",
  "BUDGET_SQUEEZER",
  "CHILL",
]);
export type Persona = z.infer<typeof PersonaSchema>;

export const StartPracticeSessionInputSchema = z.object({
  projectId: z.string(),
  freelancerName: z.string().default("Freelancer"),
  persona: PersonaSchema.default("BUDGET_SQUEEZER"),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(1),
});
export type StartPracticeSessionInput = z.infer<typeof StartPracticeSessionInputSchema>;

export const ConcessionItemSchema = z.object({
  quote: z.string(),
  explanation: z.string(),
});
export type ConcessionItem = z.infer<typeof ConcessionItemSchema>;

export const BoundaryItemSchema = z.object({
  quote: z.string(),
  rule: z.string(),
});
export type BoundaryItem = z.infer<typeof BoundaryItemSchema>;

export const RewriteItemSchema = z.object({
  weakReply: z.string(),
  suggestedRewrite: z.string(),
  reasoning: z.string(),
});
export type RewriteItem = z.infer<typeof RewriteItemSchema>;

export const ScorecardSchema = z.object({
  overallScore: z.number().min(0).max(100),
  summary: z.string(),
  freeConcessions: z.array(ConcessionItemSchema),
  boundariesHeld: z.array(BoundaryItemSchema),
  rewrites: z.array(RewriteItemSchema).length(3, "Must provide exactly 3 rewrites of weak replies"),
});
export type Scorecard = z.infer<typeof ScorecardSchema>;

// ==================== DEAL MEMORY / HYBRID SEARCH SCHEMAS ====================

export const SimilarDealCardSchema = z.object({
  chunkId: z.string(),
  projectId: z.string(),
  projectTitle: z.string(),
  clientName: z.string(),
  content: z.string(),
  vectorScore: z.number(),
  textScore: z.number(),
  hybridScore: z.number(),
  createdAt: z.date().or(z.string()),
});
export type SimilarDealCard = z.infer<typeof SimilarDealCardSchema>;
