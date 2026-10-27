/* Hallmark · pre-emit critique: P5 H4 E5 S4 R5 V5 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { projectRepository } from "@jhanjhat/db";
import { findSimilarPastDeals } from "@jhanjhat/ai";
import {
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  DollarSign,
  Mic,
  History,
  CheckCircle2,
} from "lucide-react";
import { CounterOfferBox } from "./counter-offer-box";
import { BudgetWatchSection } from "./budget-watch-section";
import { OutOfScopeTool } from "./out-of-scope-tool";

export const dynamic = "force-dynamic";

interface DealDetailPageProps {
  params: { id: string };
}

export default async function DealDetailPage({ params }: DealDetailPageProps) {
  const project = await projectRepository.getProject(params.id);
  if (!project) notFound();

  const latestAnalysis = project.analyses[0];
  const primaryDoc = project.documents[0];

  // Hybrid search past deal memory
  let similarDeals: any[] = [];
  try {
    if (primaryDoc?.rawContent) {
      similarDeals = await findSimilarPastDeals(primaryDoc.rawContent, project.id);
    }
  } catch (err) {
    console.error("[Deal Memory] Hybrid search fallback:", err);
  }

  const decisionBadgeClass =
    latestAnalysis?.decision === "TAKE"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : latestAnalysis?.decision === "RENEGOTIATE"
      ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
      : "border-[var(--destructive)]/30 bg-[var(--destructive)]/10 text-[var(--destructive)]";

  const math = latestAnalysis?.math as any;
  const counterTerms = latestAnalysis?.counterOfferTerms as any;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-10 px-4 sm:px-6 lg:px-8 overflow-x-clip">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/deals"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] active:scale-[0.98] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Deals</span>
          </Link>

          <Link
            href={`/deals/${project.id}/practice`}
            className="inline-flex items-center gap-2 rounded bg-[var(--primary)] px-4 py-2 text-xs font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] active:scale-[0.98] motion-safe:transition-transform whitespace-nowrap"
          >
            <Mic className="h-4 w-4" />
            <span>Spar With Client Persona</span>
          </Link>
        </div>

        {/* Title Header */}
        <div className="pb-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] mb-1">
            <span>{project.clientName}</span>
            <span>•</span>
            <span>Evaluated {new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
            {project.title}
          </h1>
        </div>

        {/* Legal Disclaimer Notice */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
          <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
            <span className="font-semibold text-[var(--foreground)]">Legal Notice:</span> Jhanjhat provides commercial risk analysis, plain math scoping, and tactical negotiation coaching. This analysis is not legal advice. Consult a licensed attorney for formal contract execution.
          </p>
        </div>

        {/* Decision & Risk Overview */}
        {latestAnalysis && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
              <div>
                <span className="text-xs text-[var(--muted-foreground)]">Commercial Recommendation</span>
                <div className="mt-1 flex items-center gap-3">
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold ${decisionBadgeClass}`}>
                    {latestAnalysis.decision}
                  </span>
                  <span className="text-sm font-semibold text-[var(--foreground)]">
                    Risk Score: <span className="font-mono">{latestAnalysis.riskScore}</span>/100
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs text-[var(--muted-foreground)]">
                <div>
                  <span className="block text-[11px]">Offered Fee</span>
                  <span className="text-sm font-semibold text-[var(--foreground)]">
                    $<span className="font-mono">{project.budgetAmount.toLocaleString()}</span>
                  </span>
                </div>
                <div>
                  <span className="block text-[11px]">Likely Hours</span>
                  <span className="text-sm font-semibold text-[var(--foreground)]">
                    <span className="font-mono">{project.estimatedHours}</span>h
                  </span>
                </div>
                <div>
                  <span className="block text-[11px]">Rate Floor</span>
                  <span className="text-sm font-semibold text-[var(--foreground)]">
                    $<span className="font-mono">{project.hourlyMinimum}</span>/hr
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[var(--foreground)] leading-relaxed">
              {latestAnalysis.summary}
            </p>
          </div>
        )}

        {/* Plain TypeScript Arithmetic Scoping */}
        {math && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
            <div className="pb-3 border-b border-[var(--border)]">
              <h2 className="text-base font-semibold text-[var(--foreground)]">
                Plain Arithmetic Scoping &amp; Rate Floor Math
              </h2>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Deterministic calculation without LLM hallucinations. Hours and rates verified in plain TypeScript.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="rounded border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
                <span className="block text-[11px] text-[var(--muted-foreground)]">Hours Range</span>
                <span className="mt-1 block text-sm font-semibold text-[var(--foreground)]">
                  <span className="font-mono">{math.hoursRange.low}</span> - <span className="font-mono">{math.hoursRange.high}</span>h
                </span>
                <span className="text-[10px] text-[var(--muted-foreground)]">
                  Likely: <span className="font-mono">{math.hoursRange.likely}</span>h
                </span>
              </div>

              <div className="rounded border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
                <span className="block text-[11px] text-[var(--muted-foreground)]">Hidden Work Items</span>
                <span className="mt-1 block text-sm font-semibold text-[var(--foreground)]">
                  +<span className="font-mono">{math.hiddenWorkItemHours}</span>h
                </span>
                <span className="text-[10px] text-[var(--muted-foreground)]">Unpriced asks</span>
              </div>

              <div className="rounded border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
                <span className="block text-[11px] text-[var(--muted-foreground)]">Effective Hourly Rate</span>
                <span className="mt-1 block text-sm font-semibold text-[var(--foreground)]">
                  $<span className="font-mono">{math.effectiveHourlyRate}</span>/hr
                </span>
                <span className="text-[10px] text-[var(--muted-foreground)]">
                  Offered fee ÷ likely hours
                </span>
              </div>

              <div className="rounded border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
                <span className="block text-[11px] text-[var(--muted-foreground)]">Rate Gap vs Floor</span>
                <span
                  className={`mt-1 block text-sm font-semibold ${
                    math.rateDelta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--destructive)]"
                  }`}
                >
                  {math.rateDelta >= 0 ? "+" : ""}$<span className="font-mono">{math.rateDelta}</span>/hr
                </span>
                <span className="text-[10px] text-[var(--muted-foreground)]">
                  Floor: $<span className="font-mono">{math.hourlyMinimum}</span>/hr
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Risky Clauses with Verbatim Quotes */}
        {latestAnalysis?.clauses && latestAnalysis.clauses.length > 0 && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border)]">
              <div>
                <h2 className="text-base font-semibold text-[var(--foreground)]">
                  Risky Contract Clauses &amp; Verbatim Evidence
                </h2>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Every highlighted quote is matched character-for-character against source text.
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Deterministic Quote Verifier Active</span>
              </div>
            </div>

            <div className="space-y-4">
              {latestAnalysis.clauses.map((clause, idx) => {
                const severityClass =
                  clause.severity === "CRITICAL"
                    ? "border-[var(--destructive)]/30 bg-[var(--destructive)]/10 text-[var(--destructive)]"
                    : clause.severity === "HIGH"
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--foreground)]";

                return (
                  <div
                    key={clause.id || idx}
                    className="rounded border border-[var(--border)] bg-[var(--surface-subtle)] p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${severityClass}`}>
                          {clause.severity}
                        </span>
                        <span className="text-xs font-semibold text-[var(--foreground)]">
                          {clause.category.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>

                    <div className="rounded border border-[var(--input)] bg-[var(--surface)] p-3 font-mono text-xs leading-relaxed text-[var(--foreground)] border-l-4 border-l-[var(--destructive)]">
                      &ldquo;{clause.quote}&rdquo;
                    </div>

                    <p className="text-xs text-[var(--foreground)] leading-relaxed">
                      {clause.explanation}
                    </p>

                    <div className="text-[11px] text-[var(--muted-foreground)]">
                      <strong className="text-[var(--foreground)]">Recommended Mitigation:</strong>{" "}
                      {clause.mitigation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Hidden Work Items */}
        {latestAnalysis?.workItems && latestAnalysis.workItems.length > 0 && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
            <div className="pb-3 border-b border-[var(--border)]">
              <h2 className="text-base font-semibold text-[var(--foreground)]">
                Unpriced Hidden Work Items
              </h2>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Implicit deliverable requests extracted from contract terms that will burn hours if not scoped out.
              </p>
            </div>

            <div className="space-y-3">
              {latestAnalysis.workItems.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded border border-[var(--border)] bg-[var(--surface-subtle)] p-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-[var(--foreground)]">{item.title}</div>
                    <div className="text-[var(--muted-foreground)]">{item.description}</div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-medium text-[var(--foreground)] shrink-0">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                      +<span className="font-mono">{item.extraHours}</span>h
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                      +$<span className="font-mono">{item.extraCost.toLocaleString()}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Counter-Offer Box */}
        {counterTerms && (
          <CounterOfferBox
            proposedBudget={counterTerms.proposedBudget || project.budgetAmount}
            depositPercent={counterTerms.depositPercent || 40}
            revisionCap={counterTerms.revisionCap || 2}
            killFeePercent={counterTerms.killFeePercent || 35}
            paymentNetDays={counterTerms.paymentNetDays || 14}
            draftReply={latestAnalysis.counterOffer || ""}
          />
        )}

        {/* Deal Memory Card: You've Seen This Before */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
            <History className="h-4 w-4 text-[var(--accent)]" />
            <div>
              <h2 className="text-base font-semibold text-[var(--foreground)]">
                Deal Memory &amp; Similar Past Precedents
              </h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                70% vector + 30% text hybrid search across your prior contract repository.
              </p>
            </div>
          </div>

          {similarDeals.length === 0 ? (
            <p className="text-xs text-[var(--muted-foreground)]">
              No previous contracts with similar clause structures found in memory.
            </p>
          ) : (
            <div className="space-y-3">
              {similarDeals.map((deal) => (
                <div
                  key={deal.chunkId}
                  className="rounded border border-[var(--border)] bg-[var(--surface-subtle)] p-3 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[var(--foreground)]">
                      {deal.projectTitle} ({deal.clientName})
                    </span>
                    <span className="text-[11px] text-[var(--muted-foreground)]">
                      Similarity: <span className="font-mono">{Math.round(deal.score * 100)}</span>%
                    </span>
                  </div>
                  <p className="text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                    {deal.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Budget Watch Section */}
        <BudgetWatchSection
          projectId={project.id}
          estimatedHours={project.estimatedHours || 100}
          initialHoursLogs={project.hoursLogs}
          initialAlerts={project.alerts}
          hourlyMinimum={project.hourlyMinimum}
          budgetAmount={project.budgetAmount}
        />

        {/* Scope Creep & Change Order Tool */}
        <OutOfScopeTool projectId={project.id} />
      </div>
    </main>
  );
}
