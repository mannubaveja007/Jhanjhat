/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 | theme: console (by request) */
import Link from "next/link";
import { SmoothScroll } from "@/components/smooth-scroll";
import { LandingInteractive } from "./landing-interactive";
import { Lock } from "lucide-react";

export default function LandingPage() {
  return (
    <SmoothScroll>
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-12 px-4 sm:px-6 lg:px-8 overflow-x-clip">
        <div className="mx-auto max-w-5xl space-y-20">
          {/* Hero, GSAP Live Rate Modeler, 4-Step Loop, and Signature */}
          <LandingInteractive />

          {/* LOCAL-FIRST ARCHITECTURE & PRIVACY */}
          <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-[var(--accent)]" />
              <h2 className="text-base font-semibold text-[var(--foreground)]">
                Local-First Architecture &amp; Deterministic Privacy
              </h2>
            </div>
            <p className="text-xs text-[var(--muted)] leading-relaxed max-w-3xl">
              Jhanjhat runs entirely on your local machine with PostgreSQL pgvector. All text is deterministically scrubbed by our unit-tested redactor before any external API call: emails, phone numbers, UPI IDs, Indian PAN cards, GSTIN numbers, Aadhaar numbers, and bank account numbers are masked with cryptographic tokens.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-[var(--muted)]">
              <span className="rounded border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1">
                Zero Cloud Database
              </span>
              <span className="rounded border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1">
                Local pgvector HNSW
              </span>
              <span className="rounded border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1">
                Deterministic Quote Verification
              </span>
            </div>
          </section>

          {/* PRICING */}
          <section className="space-y-6">
            <div className="max-w-2xl space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                Simple, Honest Economics
              </h2>
              <p className="text-xs sm:text-sm text-[var(--muted)]">
                No monthly recurring seat fees, no vendor lock-in, and no arbitrary feature gates.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
                <span className="text-xs font-semibold text-[var(--muted)]">Open-Source Local App</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-mono text-[var(--foreground)]">$0</span>
                  <span className="text-xs text-[var(--muted)]">/ forever</span>
                </div>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
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
                <span className="text-xs font-semibold text-[var(--muted)]">Voice Sparring (ElevenLabs)</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-mono text-[var(--foreground)]">Pay-as-you-go</span>
                </div>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
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
            <div className="max-w-2xl space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-4 space-y-1.5">
                <h3 className="text-xs font-semibold text-[var(--foreground)]">
                  Is Jhanjhat giving legal advice?
                </h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  No. Jhanjhat provides automated commercial risk analysis, plain math scoping, and tactical negotiation coaching. It is not legal counsel. Consult a qualified attorney for formal contract execution.
                </p>
              </div>

              <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-4 space-y-1.5">
                <h3 className="text-xs font-semibold text-[var(--foreground)]">
                  What makes the quote verification deterministic?
                </h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Instead of trusting LLM citations, every clause quote is verified character-by-character in plain TypeScript against the source document. If a quoted phrase does not exist in the contract, it is immediately discarded.
                </p>
              </div>

              <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-4 space-y-1.5">
                <h3 className="text-xs font-semibold text-[var(--foreground)]">
                  How does Deal Memory work?
                </h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Past deals and contract clauses are stored in PostgreSQL with pgvector. When evaluating a new deal, hybrid search combines 70% cosine vector similarity with 30% full-text keyword ranking to retrieve similar historical precedents.
                </p>
              </div>
            </div>
          </section>

          {/* STATUTORY LEGAL DISCLAIMER NOTICE */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-center">
            <p className="text-[11px] text-[var(--muted)] leading-relaxed">
              <span className="font-semibold text-[var(--foreground)]">Legal Notice:</span> Jhanjhat provides automated commercial risk analysis, plain arithmetic scoping, and negotiation coaching for freelance contracts. This analysis is not legal advice. Consult a licensed attorney for formal legal contracts.
            </p>
          </div>
        </div>
      </main>
    </SmoothScroll>
  );
}
