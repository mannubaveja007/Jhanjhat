"use client";

/* Hallmark · pre-emit critique: P5 H4 E5 S4 R5 V5 */
import { useState } from "react";
import { ShieldAlert, ArrowRight, Copy, Check, DollarSign, Clock } from "lucide-react";

interface OutOfScopeResult {
  isOutOfScope: boolean;
  reason: string;
  recommendedAction: "ACCEPT" | "CHARGE_EXTRA" | "DECLINE";
  estimatedExtraHours: number;
  estimatedExtraFee: number;
  suggestedReply: string;
}

interface OutOfScopeToolProps {
  projectId: string;
}

export function OutOfScopeTool({ projectId }: OutOfScopeToolProps) {
  const [requestText, setRequestText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<OutOfScopeResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/deals/${projectId}/out-of-scope`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestText }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Evaluation failed");
      }

      const data = await res.json();
      setResult(data.evaluation);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyReply = async () => {
    if (!result?.suggestedReply) return;
    try {
      await navigator.clipboard.writeText(result.suggestedReply);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 space-y-6">
      <div className="pb-4 border-b border-[var(--border)]">
        <h2 className="text-base font-semibold text-[var(--foreground)]">
          Scope Creep &amp; Change Order Radar
        </h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Check if a new client email or chat ask falls outside original agreed terms and get an instant change order proposal.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
            Client Message / New Request
          </label>
          <textarea
            required
            rows={4}
            value={requestText}
            onChange={(e) => setRequestText(e.target.value)}
            placeholder="e.g. Could we also add multi-factor authentication, audit logs, and export to CSV before launching next week?"
            className="w-full rounded border border-[var(--input)] bg-[var(--surface-subtle)] p-3 text-xs leading-relaxed text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          />
        </div>

        {error && (
          <div className="rounded border border-[var(--destructive)]/30 bg-[var(--destructive)]/10 p-3 text-xs text-[var(--destructive)]">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded bg-[var(--primary)] px-4 py-2 text-xs font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] active:scale-[0.98] disabled:opacity-50 motion-safe:transition-transform whitespace-nowrap"
          >
            <span>{isSubmitting ? "Evaluating…" : "Evaluate Request"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>

      {/* Evaluation Results */}
      {result && (
        <div className="mt-6 rounded border border-[var(--border)] bg-[var(--surface-subtle)] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${
                  result.isOutOfScope
                    ? "border-[var(--destructive)]/30 bg-[var(--destructive)]/10 text-[var(--destructive)]"
                    : "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground)]"
                }`}
              >
                {result.isOutOfScope ? "OUT OF SCOPE" : "WITHIN SCOPE"}
              </span>

              <span className="text-xs text-[var(--muted-foreground)]">
                Recommended Action: <strong className="text-[var(--foreground)]">{result.recommendedAction}</strong>
              </span>
            </div>

            {result.isOutOfScope && (
              <div className="flex items-center gap-4 text-xs font-medium text-[var(--foreground)]">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                  +<span className="font-mono">{result.estimatedExtraHours}</span>h
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                  +$<span className="font-mono">{result.estimatedExtraFee.toLocaleString()}</span>
                </span>
              </div>
            )}
          </div>

          <p className="text-xs text-[var(--foreground)] leading-relaxed">
            {result.reason}
          </p>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[var(--foreground)]">
                Suggested Boundary Response
              </span>
              <button
                type="button"
                onClick={handleCopyReply}
                className="inline-flex items-center gap-1.5 rounded border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[11px] font-medium text-[var(--foreground)] hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] active:scale-[0.98] disabled:opacity-50 motion-safe:transition-transform whitespace-nowrap"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-500" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 text-[var(--muted-foreground)]" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
            <div className="rounded border border-[var(--input)] bg-[var(--surface)] p-3 font-mono text-xs leading-relaxed text-[var(--foreground)] whitespace-pre-wrap select-all">
              {result.suggestedReply}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
