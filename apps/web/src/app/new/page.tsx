/* Hallmark · pre-emit critique: P5 H4 E5 S4 R5 V5 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "../../components/navbar";
import { ShieldAlert, ArrowRight, Sparkles, AlertCircle, FileText, CheckCircle2 } from "lucide-react";

const DEMO_PRESETS = [
  {
    label: "Payment After Launch",
    title: "Fintech Mobile App & Web Platform",
    clientName: "Stealth FinTech Co.",
    budgetAmount: 3500,
    hourlyMinimum: 60,
    tone: "ENGLISH" as const,
    text: `MASTER SERVICES AGREEMENT - STEALTH FINTECH CO.
1. SCOPE OF SERVICES: Contractor will engineer and deploy the complete iOS mobile app, Android client, and responsive web management dashboard.
2. COMPENSATION & PAYMENT TERMS: Total fixed compensation for all deliverables shall be $3,500. Payment will be released strictly 45 days after the platform reaches 10,000 active verified users following public launch. In the event that the platform does not achieve 10,000 active users within six months of deployment, no payment shall be owed to Contractor.
3. CANCELLATION & TERMINATION: Client may terminate this agreement at any time for convenience. No kill fee or cancellation payment shall be provided regardless of completed milestones.
4. INTELLECTUAL PROPERTY: All code, designs, and architectures shall be considered work-for-hire and ownership shall vest exclusively in Client from the moment of creation.
5. DEADLINES: Contractor agrees to deliver all completed modules by December 1st without deadline adjustments.`,
  },
  {
    label: "Unlimited Revisions",
    title: "Brand Identity & 10-Page Marketing Site",
    clientName: "HyperGrowth Digital Agency",
    budgetAmount: 1200,
    hourlyMinimum: 50,
    tone: "HINGLISH" as const,
    text: `HYPERGROWTH CLIENT SCOPE BRIEF
Hey! We need a complete brand identity revamp including logo, typography guidelines, design tokens, and 10 custom marketing landing pages built in Next.js.
Terms:
- Fixed budget of $1,200 for the entire package.
- Contractor shall provide unlimited rounds of revisions until the Client is completely satisfied with all creative assets.
- Deliverables must look modern, high-converting, and world-class. Specific animations and interactive widgets will be requested during design review.
- Contractor agrees to attend daily morning 45-minute standup calls and provide ongoing Slack support.
- All intellectual property transfers immediately upon contract signing before any payment milestone is processed.`,
  },
  {
    label: "Hidden Scope Creep",
    title: "Storefront with Split Payout Backend",
    clientName: "RapidCommerce Inc.",
    budgetAmount: 2000,
    hourlyMinimum: 55,
    tone: "ENGLISH" as const,
    text: `PROJECT SPECIFICATION & CHAT LOG - RAPIDCOMMERCE
Client: We just need a simple clean storefront for our boutique catalog. Very standard build!
Deliverables:
- Contractor will build a clean storefront as described.
- Scope of deliverables will include standard e-commerce features as determined by client during weekly syncs.
- In addition to standard catalog display, Contractor shall integrate multi-vendor marketplace split payouts, real-time inventory synchronization webhooks, and custom Stripe Connect flows.
- Contractor shall also implement mobile app API endpoints and native push notification handlers as part of standard delivery.
- All modifications requested in Slack shall be implemented within 24 hours at no extra charge.
- No deadline-change terms or timeline adjustments will be granted for any scope expansions requested during the build.
- Exclusions: None. Contractor is responsible for all server configurations, DevOps deployments, and database optimizations required to go live.`,
  },
];

export default function NewDealPage() {
  const router = useRouter();
  const [title, setTitle] = useState("Fintech Mobile App & Web Platform");
  const [clientName, setClientName] = useState("Stealth FinTech Co.");
  const [budgetAmount, setBudgetAmount] = useState<number>(3500);
  const [hourlyMinimum, setHourlyMinimum] = useState<number>(60);
  const [tone, setTone] = useState<"ENGLISH" | "HINGLISH">("ENGLISH");
  const [rawContent, setRawContent] = useState(DEMO_PRESETS[0].text);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyPreset = (preset: typeof DEMO_PRESETS[0]) => {
    setTitle(preset.title);
    setClientName(preset.clientName);
    setBudgetAmount(preset.budgetAmount);
    setHourlyMinimum(preset.hourlyMinimum);
    setTone(preset.tone);
    setRawContent(preset.text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const resp = await fetch("/api/deals/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          clientName,
          budgetAmount: Number(budgetAmount),
          hourlyMinimum: Number(hourlyMinimum),
          currency: "USD",
          tone,
          rawContent,
        }),
      });

      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.error || "Failed to analyze contract");
      }

      const result = await resp.json();
      router.push(`/deals/${result.projectId}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during analysis.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-10 px-4 sm:px-6 overflow-x-clip">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 pb-6 border-b border-[var(--border)]">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
            Analyze Deal &amp; Contract Terms
          </h1>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Paste a contract, brief, or client chat. Jhanjhat extracts risky clauses with verbatim quotes, computes hidden hours, and evaluates your effective hourly rate.
          </p>
        </div>

        {/* Presets Bar */}
        <div className="mb-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-[var(--accent)]" />
            <span className="text-xs font-medium text-[var(--foreground)]">
              Quick test with seeded demo deals
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {DEMO_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                className="flex items-center gap-1.5 rounded border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-1.5 text-xs text-[var(--foreground)] hover:bg-[var(--surface-muted)] active:scale-[0.98] transition-colors"
              >
                <FileText className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-500">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Analysis Failed:</span> {error}
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded border border-[var(--input)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] focus:border-[var(--ring)] focus:outline-none"
                  placeholder="e.g. Fintech Mobile App"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                  Client Name / Company
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full rounded border border-[var(--input)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] focus:border-[var(--ring)] focus:outline-none"
                  placeholder="e.g. Stealth FinTech Co."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                  Offered Fixed Budget ($)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(Number(e.target.value))}
                  className="w-full rounded border border-[var(--input)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] focus:border-[var(--ring)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                  Your Minimum Hourly Rate ($/hr)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={hourlyMinimum}
                  onChange={(e) => setHourlyMinimum(Number(e.target.value))}
                  className="w-full rounded border border-[var(--input)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] focus:border-[var(--ring)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                  Negotiation Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as "ENGLISH" | "HINGLISH")}
                  className="w-full rounded border border-[var(--input)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] focus:border-[var(--ring)] focus:outline-none"
                >
                  <option value="ENGLISH">English (Assertive &amp; Professional)</option>
                  <option value="HINGLISH">Hinglish (Colloquial &amp; Grounded)</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-[var(--foreground)]">
                  Contract Text, SOW Brief, or Chat Log
                </label>
                <span className="text-[11px] text-[var(--muted-foreground)]">
                  {rawContent.length} characters
                </span>
              </div>
              <textarea
                required
                rows={12}
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                className="w-full rounded border border-[var(--input)] bg-[var(--surface)] p-3 text-xs leading-relaxed text-[var(--foreground)] focus:border-[var(--ring)] focus:outline-none font-mono"
                placeholder="Paste the contract text or client email/chat thread here…"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-[var(--muted-foreground)]">
              Deterministic quote verification matches verbatim quotes in code.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 rounded bg-[var(--primary)] px-5 py-2.5 text-xs font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] active:scale-[0.98] active:opacity-90 disabled:opacity-60 transition-transform whitespace-nowrap"
            >
              {isSubmitting ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-[var(--primary-foreground)] border-t-transparent motion-safe:animate-spin" />
                  <span>Analyzing…</span>
                </>
              ) : (
                <>
                  <span>Evaluate Deal</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Statutory Disclaimer Notice */}
        <div className="mt-12 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] p-4 text-center">
          <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
            <span className="font-semibold text-[var(--foreground)]">Legal Notice:</span> Jhanjhat provides automated commercial risk analysis, plain arithmetic scoping, and negotiation coaching for freelance contracts. This analysis is not legal advice. Consult a licensed attorney for formal legal contracts.
          </p>
        </div>
      </div>
    </main>
  );
}
