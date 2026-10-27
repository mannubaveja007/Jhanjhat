/* Hallmark · pre-emit critique: P5 H4 E5 S4 R5 V5 */
import Link from "next/link";
import { SmoothScroll } from "@/components/smooth-scroll";
import {
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Clock,
  DollarSign,
  Mic,
  FileCheck2,
  Lock,
  Sparkles,
  HelpCircle,
} from "lucide-react";

export default function LandingPage() {
  return (
    <SmoothScroll>
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-16 px-4 sm:px-6 lg:px-8 overflow-x-clip">
        <div className="mx-auto max-w-5xl space-y-24">
          {/* HERO SECTION */}
          <section className="space-y-6 pt-4 sm:pt-10">
            <div className="max-w-3xl space-y-4">
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--foreground)]">
                Stop taking deals that burn hours
              </h1>
              <p className="text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed max-w-2xl">
                Audit contract scope risks and spar against pushy client AI personas.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/new"
                className="inline-flex items-center gap-2 rounded bg-[var(--primary)] px-5 py-2.5 text-xs font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] active:scale-[0.98] motion-safe:transition-transform whitespace-nowrap"
              >
                <span>Evaluate Contract Now</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/deals"
                className="inline-flex items-center gap-2 rounded border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] active:scale-[0.98] motion-safe:transition-transform whitespace-nowrap"
              >
                <span>View Demo Pipeline</span>
              </Link>
            </div>

            {/* DUAL-FACED DEMONSTRATION SIGNATURE */}
            <div className="mt-8 rounded-lg border border-[var(--border)] bg-[var(--surface)] overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--border)]">
              {/* LEFT: Plain Math Scoping Breakdown */}
              <div className="p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                    <span className="font-semibold text-[var(--foreground)]">Contract Math Audit</span>
                    <span className="rounded border border-[var(--destructive)]/30 bg-[var(--destructive)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--destructive)]">
                      WALK AWAY
                    </span>
                  </div>

                  <div className="rounded border border-[var(--border)] bg-[var(--surface-subtle)] p-3 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">Offered Fixed Fee</span>
                      <span className="font-mono font-medium text-[var(--foreground)]">$3,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">Estimated Likely Hours</span>
                      <span className="font-mono font-medium text-[var(--foreground)]">135h (incl. +40h hidden asks)</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-[var(--border)]">
                      <span className="font-semibold text-[var(--foreground)]">Effective Hourly Rate</span>
                      <span className="font-mono font-bold text-[var(--destructive)]">$25/hr</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                    Client requested unlimited revisions, post-launch SLA, and cross-platform mobile views within a single web storefront budget.
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
                  <span>Deterministic Quote Verifier</span>
                  <span className="text-[var(--foreground)] font-medium">Character-Exact Matches</span>
                </div>
              </div>

              {/* RIGHT: Voice Sparring Partner */}
              <div className="p-6 flex flex-col justify-between space-y-4 bg-[var(--surface-subtle)]">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                    <span className="font-semibold text-[var(--foreground)]">Practice Room Sparring</span>
                    <span className="rounded border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[10px] text-[var(--muted-foreground)]">
                      ElevenLabs Voice AI
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-2.5">
                      <span className="block text-[10px] font-semibold text-[var(--muted-foreground)] mb-0.5">
                        Client Persona (Pushy VP):
                      </span>
                      <p className="text-[var(--foreground)] italic">
                        &ldquo;Other agencies include iOS deployment as standard. Can you just wrap it in for this milestone?&rdquo;
                      </p>
                    </div>

                    <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-2.5">
                      <span className="block text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mb-0.5">
                        Tactical Boundary Held:
                      </span>
                      <p className="text-[var(--foreground)]">
                        &ldquo;Native mobile deployment requires separate provisioning. We can deliver it under a dedicated Phase 2 scope.&rdquo;
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
                  <span>Live 5-Minute Timer</span>
                  <span className="text-[var(--foreground)] font-medium">Automatic Scorecard</span>
                </div>
              </div>
            </div>
          </section>

          {/* 4-STEP COMMERCIAL PROTECTION LOOP */}
          <section className="space-y-8">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
                The 4-Step Commercial Defense Loop
              </h2>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
                Every contract moves through automated commercial triage to protect your earnings.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-[var(--surface-subtle)] border border-[var(--border)] text-[var(--foreground)]">
                  <FileCheck2 className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-[var(--foreground)]">
                  1. Deal Analysis
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  Deterministic quote verifier checks contract terms, drops hallucinated citations, and calculates plain math hours.
                </p>
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-[var(--surface-subtle)] border border-[var(--border)] text-[var(--foreground)]">
                  <Clock className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-[var(--foreground)]">
                  2. Budget Watch
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  Log billable hours against likely scope with automatic threshold warnings at 70%, 90%, and 100% capacity.
                </p>
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-[var(--surface-subtle)] border border-[var(--border)] text-[var(--foreground)]">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-[var(--foreground)]">
                  3. Scope Radar
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  Paste new client requests mid-project to instantly compute change order pricing and get an assertive reply.
                </p>
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-[var(--surface-subtle)] border border-[var(--border)] text-[var(--foreground)]">
                  <Mic className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-[var(--foreground)]">
                  4. Voice Sparring
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  Call the AI client persona over ElevenLabs WebRTC to practice holding rate boundaries before sending your email.
                </p>
              </div>
            </div>
          </section>

          {/* LOCAL-FIRST PRIVACY & REDACTION */}
          <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-[var(--accent)]" />
              <h2 className="text-base font-semibold text-[var(--foreground)]">
                Local-First Architecture &amp; Deterministic Privacy
              </h2>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed max-w-3xl">
              Jhanjhat runs entirely on your local machine with PostgreSQL pgvector. All text is deterministically scrubbed by our unit-tested redactor before any external API call: emails, phone numbers, UPI IDs, Indian PAN cards, GSTIN numbers, Aadhaar numbers, and bank account numbers are masked with cryptographic tokens.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-[var(--muted-foreground)]">
              <span className="rounded border border-[var(--border)] bg-[var(--surface-subtle)] px-2.5 py-1">
                Zero Cloud Database
              </span>
              <span className="rounded border border-[var(--border)] bg-[var(--surface-subtle)] px-2.5 py-1">
                Local pgvector HNSW
              </span>
              <span className="rounded border border-[var(--border)] bg-[var(--surface-subtle)] px-2.5 py-1">
                Deterministic Quote Verification
              </span>
            </div>
          </section>

          {/* STATIC PRICING */}
          <section className="space-y-6">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
                Simple, Honest Economics
              </h2>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
                No monthly recurring seat fees, no vendor lock-in, and no arbitrary feature gates.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
                <span className="text-xs font-semibold text-[var(--muted-foreground)]">Open-Source Local App</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-mono text-[var(--foreground)]">$0</span>
                  <span className="text-xs text-[var(--muted-foreground)]">/ forever</span>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  Full access to contract analysis, budget watch, scope creep radar, and local memory search running on your local database.
                </p>
                <div className="pt-2">
                  <Link
                    href="/new"
                    className="inline-flex items-center gap-2 rounded bg-[var(--primary)] px-4 py-2 text-xs font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] active:scale-[0.98] motion-safe:transition-transform whitespace-nowrap"
                  >
                    <span>Get Started Locally</span>
                  </Link>
                </div>
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] p-6 space-y-4">
                <span className="text-xs font-semibold text-[var(--muted-foreground)]">Voice Sparring (ElevenLabs)</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-mono text-[var(--foreground)]">Pay-as-you-go</span>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  Bring your own ElevenLabs API key for real-time conversational voice sparring sessions, billed directly by ElevenLabs at raw API rates.
                </p>
                <div className="pt-2">
                  <Link
                    href="/deals"
                    className="inline-flex items-center gap-2 rounded border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] active:scale-[0.98] motion-safe:transition-transform whitespace-nowrap"
                  >
                    <span>Browse Seeded Deals</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* FREQUENTLY ASKED QUESTIONS */}
          <section className="space-y-6">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-4 space-y-1.5">
                <h3 className="text-xs font-semibold text-[var(--foreground)]">
                  Is Jhanjhat giving legal advice?
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  No. Jhanjhat provides automated commercial risk analysis, plain math scoping, and tactical negotiation coaching. It is not legal counsel. Consult a qualified attorney for formal contract execution.
                </p>
              </div>

              <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-4 space-y-1.5">
                <h3 className="text-xs font-semibold text-[var(--foreground)]">
                  What makes the quote verification deterministic?
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  Instead of trusting LLM citations, every clause quote is verified character-by-character in plain TypeScript against the source document. If a quoted phrase does not exist in the contract, it is immediately discarded.
                </p>
              </div>

              <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-4 space-y-1.5">
                <h3 className="text-xs font-semibold text-[var(--foreground)]">
                  How does Deal Memory work?
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  Past deals and contract clauses are stored in PostgreSQL with pgvector. When evaluating a new deal, hybrid search combines 70% cosine vector similarity with 30% full-text keyword ranking to retrieve similar historical precedents.
                </p>
              </div>
            </div>
          </section>

          {/* STATUTORY LEGAL DISCLAIMER NOTICE */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] p-4 text-center">
            <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
              <span className="font-semibold text-[var(--foreground)]">Legal Notice:</span> Jhanjhat provides automated commercial risk analysis, plain arithmetic scoping, and negotiation coaching for freelance contracts. This analysis is not legal advice. Consult a licensed attorney for formal legal contracts.
            </p>
          </div>
        </div>
      </main>
    </SmoothScroll>
  );
}
