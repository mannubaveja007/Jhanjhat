"use client";

/* Hallmark · pre-emit critique: P5 H4 E5 S4 R5 V5 */
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useConversation, ConversationProvider } from "@elevenlabs/react";
import {
  Mic,
  MicOff,
  Clock,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Volume2,
} from "lucide-react";

interface Concession {
  quote: string;
  explanation: string;
}

interface Boundary {
  quote: string;
  rule: string;
}

interface Rewrite {
  weakReply: string;
  suggestedRewrite: string;
  reasoning: string;
}

interface ScorecardData {
  overallScore: number;
  summary: string;
  freeConcessions: Concession[];
  boundariesHeld: Boundary[];
  rewrites: Rewrite[];
}

const PERSONA_MAP: Record<string, "AGGRESSIVE" | "SCOPE_CREEPER" | "BUDGET_SQUEEZER" | "CHILL"> = {
  "Pushy VP of Product": "AGGRESSIVE",
  "Scope-creeping agency director": "SCOPE_CREEPER",
  "Passive-aggressive founder": "BUDGET_SQUEEZER",
};

const DIFFICULTY_MAP: Record<string, 1 | 2 | 3> = {
  gentle: 1,
  realistic: 2,
  ruthless: 3,
};

function PracticeRoomInner() {
  const params = useParams();
  const dealId = params?.id as string;

  // Session configuration state
  const [freelancerName, setFreelancerName] = useState("Alex");
  const [persona, setPersona] = useState("Pushy VP of Product");
  const [difficulty, setDifficulty] = useState<"gentle" | "realistic" | "ruthless">("realistic");
  const [simulationId, setSimulationId] = useState<string | null>(null);

  // Timer & Session state
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [timerActive, setTimerActive] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [scorecard, setScorecard] = useState<ScorecardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Spoken transcript tracking
  const activeConversationIdRef = useRef<string | null>(null);
  const localTurnsRef = useRef<Array<{ role: "user" | "client"; content: string }>>([]);

  // ElevenLabs Conversational AI hook
  const conversation = useConversation({
    onConnect: () => {
      console.log("[ElevenLabs] Connected");
      setTimerActive(true);
      try {
        const id = conversation.getId();
        if (id) activeConversationIdRef.current = id;
      } catch (e) {
        // ignore ID lookup if not yet ready
      }
    },
    onDisconnect: () => {
      console.log("[ElevenLabs] Disconnected");
      setTimerActive(false);
    },
    onMessage: (msg: any) => {
      if (msg && msg.message) {
        localTurnsRef.current.push({
          role: msg.source === "ai" ? "client" : "user",
          content: msg.message,
        });
      }
    },
    onError: (err) => {
      console.error("[ElevenLabs] Error:", err);
      setError(typeof err === "string" ? err : "Voice session error occurred");
    },
  });

  // 5-minute countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleEndSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeLeft]);

  const handleStartSession = async () => {
    setError(null);
    setScorecard(null);
    setTimeLeft(300);
    localTurnsRef.current = [];
    activeConversationIdRef.current = null;

    try {
      // 1. Request signed URL and simulation ID from backend
      const res = await fetch(`/api/deals/${dealId}/practice/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          freelancerName,
          persona: PERSONA_MAP[persona] || "BUDGET_SQUEEZER",
          difficulty: DIFFICULTY_MAP[difficulty] || 2,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to start practice session");
      }

      const { signedUrl, simulationId: simId } = await res.json();
      setSimulationId(simId);

      // 2. Start ElevenLabs conversational AI session via WebRTC/WebSocket
      await conversation.startSession({
        signedUrl,
      });
    } catch (err: any) {
      console.error("[Practice Room] Start error:", err);
      setError(err.message || "Failed to connect microphone or start voice sparring.");
    }
  };

  const handleEndSession = async () => {
    setIsFinishing(true);
    setTimerActive(false);

    let convId = activeConversationIdRef.current;
    try {
      const liveId = conversation.getId();
      if (liveId) convId = liveId;
    } catch (e) {
      // ignore
    }

    try {
      await conversation.endSession();
    } catch (e) {
      // ignore end session error
    }

    try {
      // 3. Request evaluation scorecard from backend
      const res = await fetch(`/api/deals/${dealId}/practice/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          simulationId,
          conversationId: convId,
          localTurns: localTurnsRef.current,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate scorecard");
      }

      const data = await res.json();
      if (data.scorecard) {
        setScorecard(data.scorecard);
      }
    } catch (err: any) {
      console.error("[Practice Room] Finish error:", err);
      setError("Scorecard computation failed. Please try again.");
    } finally {
      setIsFinishing(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isConnected = conversation.status === "connected";

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-10 px-4 sm:px-6 lg:px-8 overflow-x-clip">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href={`/deals/${dealId}`}
            className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] active:scale-[0.98] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Deal Analysis</span>
          </Link>
        </div>

        {/* Header */}
        <div className="pb-6 border-b border-[var(--border)]">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
            Voice Sparring Practice Room
          </h1>
          <p className="mt-1 text-xs text-[var(--muted-foreground)] leading-relaxed">
            Rehearse setting commercial boundaries and defending rate floors against AI client personas before sending your counter-offer.
          </p>
        </div>

        {error && (
          <div className="rounded border border-[var(--destructive)]/30 bg-[var(--destructive)]/10 p-4 text-xs text-[var(--destructive)]">
            <div className="font-semibold mb-1">Session Notice</div>
            <p>{error}</p>
          </div>
        )}

        {/* Configuration Setup Form (Shown when idle and no scorecard) */}
        {!isConnected && !scorecard && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 space-y-5">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              Sparring Scenario Settings
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  value={freelancerName}
                  onChange={(e) => setFreelancerName(e.target.value)}
                  className="w-full rounded border border-[var(--input)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                  Client Persona
                </label>
                <select
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  className="w-full rounded border border-[var(--input)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                >
                  <option value="Pushy VP of Product">Pushy VP of Product (High pressure)</option>
                  <option value="Passive-aggressive founder">Passive-aggressive Founder (Guilt-trip)</option>
                  <option value="Scope-creeping agency director">Scope-creeping Agency Director (Endless retainer)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                  Sparring Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full rounded border border-[var(--input)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                >
                  <option value="gentle">Gentle (Easier pushback)</option>
                  <option value="realistic">Realistic (Standard tough client)</option>
                  <option value="ruthless">Ruthless (Aggressive lowballing)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={handleStartSession}
                className="inline-flex items-center gap-2 rounded bg-[var(--primary)] px-5 py-2.5 text-xs font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] active:scale-[0.98] motion-safe:transition-transform whitespace-nowrap"
              >
                <Mic className="h-4 w-4" />
                <span>Start Voice Sparring</span>
              </button>
            </div>
          </div>
        )}

        {/* Live Call Interface */}
        {isConnected && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8 text-center space-y-6">
            <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] border-b border-[var(--border)] pb-4">
              <span className="flex items-center gap-1.5">
                <Volume2 className="h-4 w-4 text-[var(--accent)]" />
                <span>Client Persona: <strong className="text-[var(--foreground)]">{persona}</strong></span>
              </span>

              <span className="flex items-center gap-1 font-mono text-xs text-[var(--foreground)] font-semibold">
                <Clock className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                <span>{minutes}:{seconds < 10 ? `0${seconds}` : seconds}</span>
              </span>
            </div>

            <div className="py-8">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[var(--surface-subtle)] border-2 border-[var(--accent)] motion-safe:animate-pulse">
                <Mic className="h-10 w-10 text-[var(--accent)]" />
              </div>
              <p className="mt-4 text-sm font-semibold text-[var(--foreground)]">
                {conversation.isSpeaking ? "Client Persona is speaking…" : "Listening to you… defend your terms!"}
              </p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                State your rate floor clearly and deflect unpaid scope creep.
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                type="button"
                disabled={isFinishing}
                onClick={handleEndSession}
                className="inline-flex items-center gap-2 rounded bg-[var(--destructive)] px-5 py-2.5 text-xs font-medium text-[var(--destructive-foreground)] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] active:scale-[0.98] disabled:opacity-50 motion-safe:transition-transform whitespace-nowrap"
              >
                <MicOff className="h-4 w-4" />
                <span>{isFinishing ? "Evaluating…" : "End Session & Evaluate"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Scorecard Results */}
        {scorecard && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
              <div>
                <span className="text-xs text-[var(--muted-foreground)]">Simulation Debrief</span>
                <h2 className="text-lg font-bold text-[var(--foreground)] mt-0.5">
                  Negotiation Scorecard
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="block text-[11px] text-[var(--muted-foreground)]">Score</span>
                  <span className="text-xl font-bold font-mono text-[var(--foreground)]">
                    {scorecard.overallScore}/100
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[var(--foreground)] leading-relaxed">
              {scorecard.summary}
            </p>

            {/* Boundaries Held */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--foreground)]">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Boundaries Held ({scorecard.boundariesHeld.length})</span>
              </div>
              <div className="space-y-2">
                {scorecard.boundariesHeld.map((b, i) => (
                  <div
                    key={i}
                    className="rounded border border-[var(--border)] bg-[var(--surface-subtle)] p-3 text-xs"
                  >
                    <div className="font-mono text-[var(--foreground)]">&ldquo;{b.quote}&rdquo;</div>
                    <div className="mt-1 text-[11px] text-[var(--muted-foreground)]">{b.rule}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Free Concessions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--destructive)]">
                <AlertTriangle className="h-4 w-4 text-[var(--destructive)]" />
                <span>Free Concessions Given ({scorecard.freeConcessions.length})</span>
              </div>
              <div className="space-y-2">
                {scorecard.freeConcessions.map((c, i) => (
                  <div
                    key={i}
                    className="rounded border border-[var(--destructive)]/30 bg-[var(--destructive)]/10 p-3 text-xs text-[var(--foreground)]"
                  >
                    <div className="font-mono text-[var(--destructive)]">&ldquo;{c.quote}&rdquo;</div>
                    <div className="mt-1 text-[11px] text-[var(--muted-foreground)]">{c.explanation}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Exactly 3 Tactical Rewrites */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--foreground)]">
                <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                <span>3 Tactical Response Rewrites</span>
              </div>

              <div className="space-y-3">
                {scorecard.rewrites.map((r, i) => (
                  <div
                    key={i}
                    className="rounded border border-[var(--border)] bg-[var(--surface-subtle)] p-4 text-xs space-y-2"
                  >
                    <div>
                      <span className="text-[11px] text-[var(--muted-foreground)]">What you said:</span>
                      <div className="font-mono text-[var(--foreground)] mt-0.5">&ldquo;{r.weakReply}&rdquo;</div>
                    </div>
                    <div>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Recommended anchor rewrite:</span>
                      <div className="rounded border border-[var(--input)] bg-[var(--surface)] p-2.5 mt-0.5 font-mono text-[var(--foreground)] leading-relaxed">
                        {r.suggestedRewrite}
                      </div>
                    </div>
                    <div className="text-[11px] text-[var(--muted-foreground)]">
                      <strong className="text-[var(--foreground)]">Strategy:</strong> {r.reasoning}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setScorecard(null)}
                className="inline-flex items-center gap-1.5 rounded border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] active:scale-[0.98] motion-safe:transition-transform whitespace-nowrap"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Spar Again</span>
              </button>

              <Link
                href={`/deals/${dealId}`}
                className="inline-flex items-center gap-1.5 rounded bg-[var(--primary)] px-4 py-2 text-xs font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] active:scale-[0.98] motion-safe:transition-transform whitespace-nowrap"
              >
                <span>Back to Deal</span>
              </Link>
            </div>
          </div>
        )}

        {/* Informational Disclaimer */}
        <p className="text-center text-[10px] text-[var(--muted-foreground)]">
          Jhanjhat provides deal analysis and negotiation rehearsal for informational purposes only, not legal or financial advice.
        </p>
      </div>
    </main>
  );
}

export default function PracticeRoomPage() {
  return (
    <ConversationProvider>
      <PracticeRoomInner />
    </ConversationProvider>
  );
}
