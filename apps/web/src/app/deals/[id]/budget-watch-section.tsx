"use client";

/* Hallmark · pre-emit critique: P5 H4 E5 S4 R5 V5 */
import { useState } from "react";
import { AlertTriangle, Clock, Plus, CheckCircle2, X } from "lucide-react";

interface AlertItem {
  id: string;
  type: string;
  message: string;
  threshold?: number | null;
  createdAt: string | Date;
  isDismissed: boolean;
}

interface HoursLogItem {
  id: string;
  hours: number;
  date: string | Date;
  notes?: string | null;
}

interface BudgetWatchProps {
  projectId: string;
  estimatedHours: number;
  initialHoursLogs: HoursLogItem[];
  initialAlerts: AlertItem[];
  hourlyMinimum: number;
  budgetAmount: number;
}

export function BudgetWatchSection({
  projectId,
  estimatedHours,
  initialHoursLogs,
  initialAlerts,
  hourlyMinimum,
  budgetAmount,
}: BudgetWatchProps) {
  const [hoursLogs, setHoursLogs] = useState<HoursLogItem[]>(initialHoursLogs);
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts.filter((a) => !a.isDismissed));
  const [newHours, setNewHours] = useState<number>(4);
  const [newNotes, setNewNotes] = useState<string>("");
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [dismissingId, setDismissingId] = useState<string | null>(null);

  const totalLogged = hoursLogs.reduce((acc, log) => acc + log.hours, 0);
  const percentUsed = estimatedHours > 0 ? Math.min(Math.round((totalLogged / estimatedHours) * 100), 200) : 0;
  const currentEffectiveRate = totalLogged > 0 ? Math.round(budgetAmount / totalLogged) : budgetAmount;

  const handleLogHours = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newHours <= 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/deals/${projectId}/hours`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hours: Number(newHours),
          date: newDate,
          notes: newNotes,
        }),
      });

      if (!res.ok) throw new Error("Failed to log hours");
      const data = await res.json();

      setHoursLogs((prev) => [data.log, ...prev]);
      if (data.alertsTriggered && data.alertsTriggered.length > 0) {
        setAlerts((prev) => [...data.alertsTriggered, ...prev]);
      }
      setNewNotes("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    setDismissingId(alertId);
    try {
      const res = await fetch(`/api/deals/${projectId}/alerts/${alertId}/dismiss`, {
        method: "POST",
      });
      if (res.ok) {
        setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDismissingId(null);
    }
  };

  const progressBarColor =
    percentUsed >= 100
      ? "bg-[var(--destructive)]"
      : percentUsed >= 70
      ? "bg-[var(--muted)]"
      : "bg-[var(--accent)]";

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
        <div>
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Budget Watch &amp; Scope Burn
          </h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Real-time hours burn against likely scope with 70%, 90%, and 100% threshold alerts.
          </p>
        </div>

        <div className="text-right self-start sm:self-auto">
          <span className="text-[11px] text-[var(--muted-foreground)] block">Effective Rate</span>
          <span className="text-sm font-semibold text-[var(--foreground)]">
            $<span className="font-mono">{currentEffectiveRate}</span>/hr
            {currentEffectiveRate < hourlyMinimum && (
              <span className="ml-1.5 text-[11px] text-[var(--destructive)] font-normal">
                (below floor $<span className="font-mono">{hourlyMinimum}</span>)
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Active Threshold Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-[var(--destructive)]/30 bg-[var(--destructive)]/10 p-3 text-xs text-[var(--foreground)]"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--destructive)]" />
                <span>{alert.message}</span>
              </div>
              <button
                type="button"
                disabled={dismissingId === alert.id}
                onClick={() => handleDismissAlert(alert.id)}
                className="inline-flex items-center gap-1 rounded border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[11px] font-medium text-[var(--foreground)] hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] active:scale-[0.98] disabled:opacity-50 motion-safe:transition-transform whitespace-nowrap"
              >
                <X className="h-3 w-3" />
                <span>Dismiss</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Progress Bar & Metric Gauge */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-[var(--foreground)]">
            Logged <span className="font-mono">{totalLogged}</span>h of{" "}
            <span className="font-mono">{estimatedHours}</span>h estimated
          </span>
          <span className="font-mono text-xs text-[var(--muted-foreground)]">
            {percentUsed}%
          </span>
        </div>

        <div className="h-2.5 w-full rounded-full bg-[var(--surface-muted)] overflow-hidden">
          <div
            className={`h-full ${progressBarColor}`}
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          />
        </div>
      </div>

      {/* Log Hours Form */}
      <form onSubmit={handleLogHours} className="rounded border border-[var(--border)] bg-[var(--surface-subtle)] p-4 space-y-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground)]">
          <Clock className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
          <span>Log Work Hours</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-[var(--muted-foreground)] mb-1">
              Hours Spent
            </label>
            <input
              type="number"
              required
              min={0.5}
              step={0.5}
              value={newHours}
              onChange={(e) => setNewHours(Number(e.target.value))}
              className="w-full rounded border border-[var(--input)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-mono text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[var(--muted-foreground)] mb-1">
              Date
            </label>
            <input
              type="date"
              required
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full rounded border border-[var(--input)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-mono text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[var(--muted-foreground)] mb-1">
              Work Description
            </label>
            <input
              type="text"
              placeholder="e.g. Auth flow integration"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full rounded border border-[var(--input)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded bg-[var(--primary)] px-3.5 py-1.5 text-xs font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] active:scale-[0.98] disabled:opacity-50 motion-safe:transition-transform whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{isSubmitting ? "Logging…" : "Log Hours"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
