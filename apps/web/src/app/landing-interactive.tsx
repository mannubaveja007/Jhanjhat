"use client";

/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 | theme: console (by request) */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import {
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Clock,
  DollarSign,
  Mic,
  Sliders,
  Sparkles,
  FileText,
  Volume2,
} from "lucide-react";

export function LandingInteractive() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Interactive contract calculator state
  const [budget, setBudget] = useState(4000);
  const [hasUnlimitedRevisions, setHasUnlimitedRevisions] = useState(true);
  const [hasPaymentDelayed, setHasPaymentDelayed] = useState(true);
  const [animatedRate, setAnimatedRate] = useState(25);
  const [animatedRisk, setAnimatedRisk] = useState(82);

  // Compute live values
  const baseHours = 60;
  const revisionHours = hasUnlimitedRevisions ? 45 : 10;
  const paymentRiskHours = hasPaymentDelayed ? 20 : 0;
  const totalHours = baseHours + revisionHours + paymentRiskHours;
  const calculatedRate = Math.round(budget / totalHours);
  const calculatedRisk = Math.min(
    95,
    Math.max(
      15,
      (hasUnlimitedRevisions ? 40 : 10) +
        (hasPaymentDelayed ? 35 : 10) +
        (calculatedRate < 50 ? 20 : 0)
    )
  );

  const verdict =
    calculatedRisk >= 75
      ? "WALK"
      : calculatedRisk >= 45
      ? "RENEGOTIATE"
      : "TAKE";

  // GSAP Entrance & Number Tweening
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAnimatedRate(calculatedRate);
      setAnimatedRisk(calculatedRisk);
      return;
    }

    const rateObj = { val: animatedRate };
    const riskObj = { val: animatedRisk };

    gsap.to(rateObj, {
      val: calculatedRate,
      duration: 0.4,
      ease: "power2.out",
      onUpdate: () => setAnimatedRate(Math.round(rateObj.val)),
    });

    gsap.to(riskObj, {
      val: calculatedRisk,
      duration: 0.4,
      ease: "power2.out",
      onUpdate: () => setAnimatedRisk(Math.round(riskObj.val)),
    });
  }, [calculatedRate, calculatedRisk]);

  // Initial Hero Timeline
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.from(".hero-reveal", {
        y: 20,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power2.out",
      });

      gsap.from(".hero-card-reveal", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.25,
        ease: "power2.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const verdictBadgeClass =
    verdict === "TAKE"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
      : verdict === "RENEGOTIATE"
      ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
      : "border-[var(--destructive)]/30 bg-[var(--destructive)]/10 text-[var(--destructive)]";

  return (
    <div ref={containerRef} className="space-y-20">
      {/* HERO SECTION */}
      <section className="space-y-6 pt-4 sm:pt-8">
        <div className="max-w-3xl space-y-4">
          <h1 className="hero-reveal text-3xl sm:text-5xl font-medium tracking-tight text-[var(--foreground)]">
            Stop taking deals that burn hours
          </h1>
          <p className="hero-reveal text-sm sm:text-base text-[var(--muted)] leading-relaxed max-w-2xl">
            Audit contract scope risks and spar against pushy client AI personas.
          </p>
        </div>

        <div className="hero-reveal flex flex-wrap items-center gap-3 pt-2">
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

        {/* LIVE GSAP INTERACTIVE SCOPING WIDGET */}
        <div className="hero-card-reveal mt-8 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-[var(--accent)]" />
                <h2 className="text-sm font-medium text-[var(--foreground)]">
                  Live Contract Risk &amp; Rate Modeler
                </h2>
              </div>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Adjust contract clauses to see how hidden asks instantly degrade your effective rate.
              </p>
            </div>

            <span className={`self-start sm:self-auto rounded border px-2.5 py-0.5 text-xs font-bold ${verdictBadgeClass}`}>
              {verdict}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Controls */}
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-[var(--foreground)] font-medium">Offered Fixed Budget</span>
                  <span className="font-mono text-[var(--accent)]">${budget.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={12000}
                  step={500}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full accent-[var(--accent)]"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-3 p-2.5 rounded border border-[var(--border)] bg-[var(--surface-subtle)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasUnlimitedRevisions}
                    onChange={(e) => setHasUnlimitedRevisions(e.target.checked)}
                    className="accent-[var(--accent)] h-4 w-4 rounded"
                  />
                  <div>
                    <span className="font-medium text-[var(--foreground)] block">
                      Clause: &ldquo;Client may request revisions until fully satisfied&rdquo;
                    </span>
                    <span className="text-[11px] text-[var(--muted-foreground)]">
                      Adds +35h of unbilled back-and-forth iteration
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2.5 rounded border border-[var(--border)] bg-[var(--surface-subtle)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasPaymentDelayed}
                    onChange={(e) => setHasPaymentDelayed(e.target.checked)}
                    className="accent-[var(--accent)] h-4 w-4 rounded"
                  />
                  <div>
                    <span className="font-medium text-[var(--foreground)] block">
                      Clause: &ldquo;Final compensation released 45 days post-launch&rdquo;
                    </span>
                    <span className="text-[11px] text-[var(--muted-foreground)]">
                      Zero advance deposit; high risk of post-launch holdouts
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Real-time Math Output */}
            <div className="rounded border border-[var(--border)] bg-[var(--surface-muted)] p-4 flex flex-col justify-between space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-3">
                  <span className="block text-[11px] text-[var(--muted-foreground)]">Effective Hourly Rate</span>
                  <span className="text-lg font-bold font-mono text-[var(--foreground)]">
                    ${animatedRate}/hr
                  </span>
                  <span className="text-[10px] text-[var(--muted-foreground)] block">
                    vs $60/hr floor
                  </span>
                </div>

                <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-3">
                  <span className="block text-[11px] text-[var(--muted-foreground)]">Calculated Risk Score</span>
                  <span className="text-lg font-bold font-mono text-[var(--destructive)]">
                    {animatedRisk}/100
                  </span>
                  <span className="text-[10px] text-[var(--muted-foreground)] block">
                    Commercial exposure
                  </span>
                </div>
              </div>

              <div className="text-xs text-[var(--muted-foreground)] border-t border-[var(--border)] pt-3 leading-relaxed">
                <span className="font-medium text-[var(--foreground)]">Total Likely Scope:</span>{" "}
                <span className="font-mono text-[var(--foreground)]">{totalHours}h</span> (base {baseHours}h +{" "}
                {revisionHours + paymentRiskHours}h scope creep).
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-STEP COMMERCIAL PROTECTION LOOP */}
      <section className="space-y-6">
        <div className="max-w-2xl space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-[var(--foreground)]">
            The 4-Step Commercial Defense Loop
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted)]">
            Every contract moves through automated commercial triage to protect your earnings.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--accent)]">
              <FileText className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              1. Deal Analysis
            </h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Deterministic quote verifier checks contract terms, drops hallucinated citations, and calculates plain math hours.
            </p>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--cool)]">
              <Clock className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              2. Budget Watch
            </h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Log billable hours against likely scope with automatic threshold warnings at 70%, 90%, and 100% capacity.
            </p>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--destructive)]">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              3. Scope Radar
            </h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Paste new client requests mid-project to instantly compute change order pricing and get an assertive reply.
            </p>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--accent)]">
              <Mic className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              4. Voice Sparring
            </h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Call the AI client persona over ElevenLabs WebRTC to practice holding rate boundaries before sending your email.
            </p>
          </div>
        </div>
      </section>

      {/* DUAL-FACED DEMONSTRATION SIGNATURE */}
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--border)]">
        {/* LEFT: Plain Math Scoping Breakdown */}
        <div className="p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
              <span className="font-semibold text-[var(--foreground)]">Contract Math Audit</span>
              <span className="rounded border border-[var(--destructive)]/30 bg-[var(--destructive)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--destructive)]">
                WALK AWAY
              </span>
            </div>

            <div className="rounded border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Offered Fixed Fee</span>
                <span className="font-mono text-[var(--foreground)]">$3,500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Estimated Likely Hours</span>
                <span className="font-mono text-[var(--foreground)]">135h (incl. +40h hidden asks)</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[var(--border)]">
                <span className="font-semibold text-[var(--foreground)]">Effective Hourly Rate</span>
                <span className="font-mono font-bold text-[var(--destructive)]">$25/hr</span>
              </div>
            </div>

            <p className="text-[11px] text-[var(--muted)] leading-relaxed">
              Client requested unlimited revisions, post-launch SLA, and cross-platform mobile views within a single web storefront budget.
            </p>
          </div>

          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--muted)]">
            <span>Deterministic Quote Verifier</span>
            <span className="text-[var(--foreground)] font-medium">Character-Exact Matches</span>
          </div>
        </div>

        {/* RIGHT: Voice Sparring Partner */}
        <div className="p-6 flex flex-col justify-between space-y-4 bg-[var(--surface-subtle)]">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
              <span className="font-semibold text-[var(--foreground)]">Practice Room Sparring</span>
              <span className="rounded border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[10px] text-[var(--muted)]">
                ElevenLabs Voice AI
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-2.5">
                <span className="block text-[10px] font-semibold text-[var(--muted)] mb-0.5">
                  Client Persona (Pushy VP):
                </span>
                <p className="text-[var(--foreground)]">
                  &ldquo;Other agencies include iOS deployment as standard. Can you just wrap it in for this milestone?&rdquo;
                </p>
              </div>

              <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-2.5">
                <span className="block text-[10px] font-semibold text-emerald-400 mb-0.5">
                  Tactical Boundary Held:
                </span>
                <p className="text-[var(--foreground)]">
                  &ldquo;Native mobile deployment requires separate provisioning. We can deliver it under a dedicated Phase 2 scope.&rdquo;
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--muted)]">
            <span>Live 5-Minute Timer</span>
            <span className="text-[var(--foreground)] font-medium">Automatic Scorecard</span>
          </div>
        </div>
      </section>
    </div>
  );
}
