"use client";

/* Hallmark · pre-emit critique: P5 H4 E5 S4 R5 V5 */
import { useState } from "react";
import { Copy, Check, ShieldAlert, Sparkles } from "lucide-react";

interface CounterOfferProps {
  proposedBudget: number;
  depositPercent: number;
  revisionCap: number;
  killFeePercent: number;
  paymentNetDays: number;
  draftReply: string;
}

export function CounterOfferBox({
  proposedBudget,
  depositPercent,
  revisionCap,
  killFeePercent,
  paymentNetDays,
  draftReply,
}: CounterOfferProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draftReply);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
        <div>
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Counter-Offer Terms &amp; Scope Boundary
          </h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Computed commercial counters protecting rate floors and revision boundaries.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] active:scale-[0.98] disabled:opacity-50 motion-safe:transition-transform whitespace-nowrap self-start sm:self-auto"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
              <span>Copy Reply</span>
            </>
          )}
        </button>
      </div>

      {/* Structured Counter Terms */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
          <span className="block text-[11px] text-[var(--muted-foreground)]">Proposed Fee</span>
          <span className="mt-1 block text-sm font-semibold text-[var(--foreground)]">
            $<span className="font-mono">{proposedBudget.toLocaleString()}</span>
          </span>
        </div>

        <div className="rounded border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
          <span className="block text-[11px] text-[var(--muted-foreground)]">Upfront Deposit</span>
          <span className="mt-1 block text-sm font-semibold text-[var(--foreground)]">
            <span className="font-mono">{depositPercent}</span>%
          </span>
        </div>

        <div className="rounded border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
          <span className="block text-[11px] text-[var(--muted-foreground)]">Revision Cap</span>
          <span className="mt-1 block text-sm font-semibold text-[var(--foreground)]">
            <span className="font-mono">{revisionCap}</span> rounds
          </span>
        </div>

        <div className="rounded border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
          <span className="block text-[11px] text-[var(--muted-foreground)]">Kill Fee</span>
          <span className="mt-1 block text-sm font-semibold text-[var(--foreground)]">
            <span className="font-mono">{killFeePercent}</span>%
          </span>
        </div>

        <div className="rounded border border-[var(--border)] bg-[var(--surface-subtle)] p-3 col-span-2 sm:col-span-1">
          <span className="block text-[11px] text-[var(--muted-foreground)]">Payment Terms</span>
          <span className="mt-1 block text-sm font-semibold text-[var(--foreground)]">
            Net <span className="font-mono">{paymentNetDays}</span> days
          </span>
        </div>
      </div>

      {/* Formatted Draft Response */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[var(--foreground)]">
            Draft Counter Response (Ready to Send)
          </span>
          <span className="text-[11px] text-[var(--muted-foreground)]">
            Edit freely before sending
          </span>
        </div>
        <div className="rounded border border-[var(--input)] bg-[var(--surface-subtle)] p-4 font-mono text-xs leading-relaxed text-[var(--foreground)] whitespace-pre-wrap select-all">
          {draftReply}
        </div>
      </div>
    </div>
  );
}
