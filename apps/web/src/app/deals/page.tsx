/* Hallmark · pre-emit critique: P5 H4 E5 S4 R5 V5 */
import Link from "next/link";
import { projectRepository } from "@jhanjhat/db";
import { Plus, ArrowRight, AlertTriangle, ShieldCheck, Clock, DollarSign } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DealsPage() {
  const projects = await projectRepository.listProjects();

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-12 px-4 sm:px-6 lg:px-8 overflow-x-clip">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-[var(--border)]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
              Deal Intelligence &amp; Budget Watch
            </h1>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Automated commercial risk checks, plain math scoping, and real-time budget burn tracking.
            </p>
          </div>

          <Link
            href="/new"
            className="inline-flex items-center gap-2 rounded bg-[var(--primary)] px-4 py-2 text-xs font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] active:scale-[0.98] motion-safe:transition-transform whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>New Evaluation</span>
          </Link>
        </div>

        {/* List of Deals */}
        <div className="mt-8 space-y-4">
          {projects.length === 0 ? (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
              <ShieldCheck className="mx-auto h-8 w-8 text-[var(--muted-foreground)]" />
              <h2 className="mt-3 text-sm font-semibold text-[var(--foreground)]">
                No active deals evaluated yet
              </h2>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Start by evaluating a freelance contract, brief, or chat thread.
              </p>
              <div className="mt-5">
                <Link
                  href="/new"
                  className="inline-flex items-center gap-2 rounded bg-[var(--primary)] px-4 py-2 text-xs font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] active:scale-[0.98] motion-safe:transition-transform whitespace-nowrap"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Evaluate Deal</span>
                </Link>
              </div>
            </div>
          ) : (
            projects.map((project) => {
              const latestAnalysis = project.analyses[0];
              const totalLoggedHours = project.hoursLogs.reduce((acc, log) => acc + log.hours, 0);
              const activeAlerts = project.alerts;

              const decisionBadgeClass =
                latestAnalysis?.decision === "TAKE"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : latestAnalysis?.decision === "RENEGOTIATE"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400";

              return (
                <div
                  key={project.id}
                  className="group rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 hover:border-[var(--ring)] transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[var(--muted-foreground)]">
                          {project.clientName}
                        </span>
                        {latestAnalysis && (
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${decisionBadgeClass}`}
                          >
                            {latestAnalysis.decision}
                          </span>
                        )}
                        {activeAlerts.length > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-500">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{activeAlerts.length} Budget Alert{activeAlerts.length > 1 ? "s" : ""}</span>
                          </span>
                        )}
                      </div>

                      <h2 className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                        <Link href={`/deals/${project.id}`} className="hover:underline">
                          {project.title}
                        </Link>
                      </h2>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--muted-foreground)] pt-1">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5 text-[var(--foreground)]" />
                          <span>$</span>
                          <span className="font-mono text-[var(--foreground)] font-medium">
                            {project.budgetAmount.toLocaleString()}
                          </span>
                          <span>budget</span>
                        </span>

                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-[var(--foreground)]" />
                          <span className="font-mono text-[var(--foreground)] font-medium">
                            {totalLoggedHours}
                          </span>
                          <span>h logged</span>
                          {project.estimatedHours > 0 && (
                            <span> / <span className="font-mono">{project.estimatedHours}</span>h est.</span>
                          )}
                        </span>

                        {latestAnalysis && (
                          <span>
                            Risk Score:{" "}
                            <span className="font-mono font-medium text-[var(--foreground)]">
                              {latestAnalysis.riskScore}/100
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <Link
                        href={`/deals/${project.id}/practice`}
                        className="rounded border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-muted)] active:scale-[0.98] transition-colors whitespace-nowrap"
                      >
                        Voice Sparring
                      </Link>

                      <Link
                        href={`/deals/${project.id}`}
                        className="inline-flex items-center gap-1.5 rounded bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--border)] active:scale-[0.98] transition-colors whitespace-nowrap"
                      >
                        <span>View Deal</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Statutory Legal Disclaimer Notice */}
        <div className="mt-12 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] p-4 text-center">
          <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
            <span className="font-semibold text-[var(--foreground)]">Legal Notice:</span> Jhanjhat provides automated commercial risk analysis, plain arithmetic scoping, and negotiation coaching for freelance contracts. This analysis is not legal advice. Consult a licensed attorney for formal legal contracts.
          </p>
        </div>
      </div>
    </main>
  );
}
