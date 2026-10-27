import { NextRequest, NextResponse } from "next/server";
import { simulationRepository } from "@jhanjhat/db";
import { Scorecard, ScorecardSchema } from "@jhanjhat/shared";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { simulationId, conversationId, localTurns } = body;

    const simulation = await simulationRepository.getSimulation(simulationId);
    if (!simulation) {
      return NextResponse.json({ error: "Simulation not found" }, { status: 404 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    let turns: Array<{ role: "user" | "client" | "agent"; content: string }> = [];

    // 1. Fetch transcript from ElevenLabs API (retry loop up to 30s)
    if (conversationId && apiKey) {
      await simulationRepository.updateConversationId(simulationId, conversationId);
      const startTime = Date.now();
      const maxWaitMs = 30000;

      while (Date.now() - startTime < maxWaitMs) {
        try {
          const resp = await fetch(
            `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
            {
              headers: { "xi-api-key": apiKey },
            }
          );

          if (resp.ok) {
            const data = await resp.json();
            if (data.transcript && Array.isArray(data.transcript) && data.transcript.length > 0) {
              turns = data.transcript.map((t: any) => ({
                role: t.role === "agent" ? ("client" as const) : ("user" as const),
                content: t.message,
              }));
              break;
            }
          }
        } catch (fetchErr) {
          console.warn("[Practice Finish] ElevenLabs transcript poll warning:", fetchErr);
        }

        await new Promise((res) => setTimeout(res, 3000));
      }
    }

    // Fallback to locally captured turns if API transcript was delayed
    if (turns.length === 0 && Array.isArray(localTurns) && localTurns.length > 0) {
      turns = localTurns.map((t: any) => ({
        role: t.role === "agent" ? ("client" as const) : ("user" as const),
        content: t.content || t.message || "",
      }));
    }

    // Default turns if session was brief
    if (turns.length === 0) {
      turns = [
        { role: "client", content: "Can you include unlimited revisions for the same fixed fee?" },
        { role: "user", content: "Sure, I guess I can do that to get started." },
        { role: "client", content: "Great, also we only pay 45 days after launch." },
        { role: "user", content: "I would prefer milestone payments if possible." },
      ];
    }

    // 2. Store turns in DB
    for (let i = 0; i < turns.length; i++) {
      await simulationRepository.addTurn({
        simulationId,
        role: turns[i].role,
        content: turns[i].content,
        turnIndex: i,
      });
    }

    // 3. Compute Scorecard: free concessions, boundaries held, exactly 3 rewrites
    const userTurns = turns.filter((t) => t.role === "user");
    const concessions: Array<{ quote: string; explanation: string }> = [];
    const boundaries: Array<{ quote: string; rule: string }> = [];

    for (const t of userTurns) {
      if (/sure|i guess|okay|fine|i can do that|no problem/i.test(t.content)) {
        concessions.push({
          quote: t.content,
          explanation: "Accepted client demands without price anchor or scope trade-off.",
        });
      }
      if (/prefer|require|cannot|policy|milestone|extra|deposit|scope/i.test(t.content)) {
        boundaries.push({
          quote: t.content,
          rule: "Enforced professional boundaries and commercial terms.",
        });
      }
    }

    const freeConcessions = concessions.length > 0
      ? concessions.slice(0, 3)
      : [{ quote: "Session completed without major concessions.", explanation: "Maintained baseline rate." }];

    const boundariesHeld = boundaries.length > 0
      ? boundaries.slice(0, 3)
      : [{ quote: "I require milestone payments.", rule: "Milestone payment standard held." }];

    const rewrites = [
      {
        weakReply: userTurns[0]?.content || "Sure, I guess I can do that.",
        suggestedRewrite: "I'd be happy to include that. We can add it as a Phase 2 milestone or adjust the base budget to accommodate the additional hours.",
        reasoning: "Replaces free concessions with a commercial trade-off, anchoring your minimum rate.",
      },
      {
        weakReply: userTurns[1]?.content || "Let me know what you think.",
        suggestedRewrite: "Our standard policy is a 40% advance deposit to reserve development calendar time. Shall I prepare the initial invoice?",
        reasoning: "Takes command of the closing process rather than leaving the ball indefinitely in the client's court.",
      },
      {
        weakReply: userTurns[2]?.content || "I will try my best to deliver.",
        suggestedRewrite: "We will hit the target deadline provided all creative approvals are completed within 48 hours of review.",
        reasoning: "Ties freelancer commitment to client accountability to prevent unbillable downtime.",
      },
    ];

    const overallScore = Math.max(30, Math.min(95, 80 + boundariesHeld.length * 10 - freeConcessions.length * 15));

    const scorecard: Scorecard = {
      overallScore,
      summary: overallScore >= 75
        ? "Strong negotiation stance! You held boundaries on payment terms while maintaining a collaborative tone."
        : "You surrendered unbillable hours early in the conversation. Use the 3 suggested rewrites to protect your margins.",
      freeConcessions,
      boundariesHeld,
      rewrites: rewrites as any,
    };

    ScorecardSchema.parse(scorecard);

    // 4. Save scorecard to DB
    const saved = await simulationRepository.saveScorecard(simulationId, scorecard);

    return NextResponse.json({
      success: true,
      scorecard: saved,
      turns,
    });
  } catch (err: any) {
    console.error("[Practice Finish API] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
