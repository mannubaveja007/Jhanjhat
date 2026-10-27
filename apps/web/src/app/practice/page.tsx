/* Hallmark · pre-emit critique: P5 H4 E5 S4 R5 V5 */
import Link from "next/link";
import { projectRepository } from "@jhanjhat/db";
import { Mic, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PracticeHubPage() {
  const projects = await projectRepository.listProjects();

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-12 px-4 sm:px-6 lg:px-8 overflow-x-clip">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="pb-6 border-b border-[var(--border)]">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
            Voice Sparring Practice Hub
          </h1>
          <p className="mt-1 text-xs text-[var(--muted-foreground)] leading-relaxed">
            Select a contract scenario below to spar against an AI client persona in real-time over ElevenLabs Conversational AI.
          </p>
        </div>

        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
              <Mic className="mx-auto h-8 w-8 text-[var(--muted-foreground)]" />
              <h2 className="mt-3 text-sm font-semibold text-[var(--foreground)]">
                No contract scenarios available
              </h2>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Evaluate a new contract first to generate a customized sparring scenario.
              </p>
              <div className="mt-5">
                <Link
                  href="/new"
                  className="inline-flex items-center gap-2 rounded bg-[var(--primary)] px-4 py-2 text-xs font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] active:scale-[0.98] motion-safe:transition-transform whitespace-nowrap"
                >
                  <span>Evaluate Contract</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            projects.map((project) => {
              const latestAnalysis = project.analyses[0];

              return (
                <div
                  key={project.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                      <span>Client: {project.clientName}</span>
                      <span>•</span>
                      <span>Budget: $<span className="font-mono">{project.budgetAmount.toLocaleString()}</span></span>
                    </div>

                    <h2 className="text-sm font-semibold text-[var(--foreground)]">
                      {project.title}
                    </h2>

                    {latestAnalysis && (
                      <p className="text-xs text-[var(--muted-foreground)] line-clamp-1">
                        {latestAnalysis.summary}
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/deals/${project.id}/practice`}
                    className="inline-flex items-center gap-2 rounded bg-[var(--primary)] px-4 py-2 text-xs font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] active:scale-[0.98] motion-safe:transition-transform whitespace-nowrap self-start sm:self-auto"
                  >
                    <Mic className="h-3.5 w-3.5" />
                    <span>Enter Practice Room</span>
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
