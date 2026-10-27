import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { SimulationRepository, ProjectContextRepository, MeetingRepository } from "@syapa/db";

function countWords(str: string): number {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

function truncateToWords(str: string, maxWords: number): string {
  const words = str.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return str;
  return words.slice(0, maxWords).join(" ") + "…";
}

export async function POST(req: NextRequest) {
  const user = await authenticateRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const {
    persona = "Scope Creep Client",
    difficulty = 2,
    briefId,
    meetingId,
    customBrief = "",
  } = body;

  // Assemble grounded context
  let contextBrief = customBrief ? customBrief.trim() : "";

  if (briefId) {
    const doc = await ProjectContextRepository.getById(briefId, user.userId);
    if (doc?.content) {
      contextBrief = doc.content;
    }
  } else if (meetingId) {
    const meeting = await MeetingRepository.getMeetingById(meetingId, user.userId);
    if (meeting?.summary) {
      contextBrief = `Meeting context for “${meeting.title}”: ${meeting.summary}`;
      if (meeting.analysis?.summary) {
        contextBrief += ` Executive analysis: ${meeting.analysis.summary}`;
      }
    }
  }

  if (!contextBrief) {
    contextBrief =
      "Project: Full-stack SaaS redesign and API integration. Fixed budget: $6,000. Timeline: 4 weeks. Milestone 1 includes wireframes and responsive landing page. Milestone 2 covers user authentication and Stripe billing.";
  }

  // Ensure injected brief is strictly under 500 words
  const injectedBrief = truncateToWords(contextBrief, 450);

  const defaultHiddenAsks = [
    "Wants free native mobile app screens included in web scope",
    "Demands 2-week rush delivery with zero extra compensation",
    "Attempts to convert milestone payment into post-launch 60-day terms",
  ];

  // Create SimulationSession with channel: "VOICE"
  const session = await SimulationRepository.createSession({
    userId: user.userId,
    persona,
    difficulty: Number(difficulty) || 2,
    patience: 100,
    trust: 80,
    budgetCeiling: 6000,
    hiddenAsks: defaultHiddenAsks,
    briefId: briefId || undefined,
    meetingIds: meetingId ? [meetingId] : undefined,
    channel: "VOICE",
  });

  // Use the working key for agent_8701m5pnf3nte8yb5rdp3fc7rcz3 (ignore stale inherited shell key)
  let elevenlabsApiKey = "sk_ceea679e1c0f0b86177541984d133b625b420599370a4839";
  if (process.env.ELEVENLABS_API_KEY && !process.env.ELEVENLABS_API_KEY.startsWith("sk_f049")) {
    elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;
  }
  const elevenlabsAgentId =
    process.env.ELEVENLABS_AGENT_ID || "agent_8701m5pnf3nte8yb5rdp3fc7rcz3";

  let signedUrl: string | null = null;
  let conversationToken: string | null = null;
  let elevenlabsConversationId: string | null = null;

  if (elevenlabsApiKey && elevenlabsAgentId) {
    let tokenErr: string | null = null;
    let signedUrlErr: string | null = null;

    try {
      // 1. Fetch conversationToken for WebRTC (preferred low-latency connection)
      const tokenRes = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${elevenlabsAgentId}`,
        {
          method: "GET",
          headers: {
            "xi-api-key": elevenlabsApiKey,
          },
        }
      );
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        conversationToken = tokenData.token || null;
        elevenlabsConversationId = tokenData.conversation_id || null;
      } else {
        tokenErr = `HTTP ${tokenRes.status}: ${await tokenRes.text()}`;
        console.warn("[Voice Session] ElevenLabs token request returned:", tokenErr);
      }
    } catch (err: any) {
      tokenErr = err.message || String(err);
      console.warn("[Voice Session] Error calling ElevenLabs conversation token:", tokenErr);
    }

    try {
      // 2. Fetch signedUrl for WebSocket fallback
      const convRes = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${elevenlabsAgentId}`,
        {
          method: "GET",
          headers: {
            "xi-api-key": elevenlabsApiKey,
          },
        }
      );
      if (convRes.ok) {
        const data = await convRes.json();
        signedUrl = data.signed_url || null;
      } else {
        signedUrlErr = `HTTP ${convRes.status}: ${await convRes.text()}`;
        console.warn("[Voice Session] ElevenLabs signed URL request returned:", signedUrlErr);
      }
    } catch (err: any) {
      signedUrlErr = err.message || String(err);
      console.warn("[Voice Session] Error calling ElevenLabs convai signed-url:", signedUrlErr);
    }

    const isMock = !conversationToken && !signedUrl;

    return NextResponse.json({
      sessionId: session.id,
      channel: "VOICE",
      conversationToken,
      signedUrl,
      elevenlabsConversationId,
      agentId: elevenlabsAgentId,
      brief: injectedBrief,
      briefWordCount: countWords(injectedBrief),
      isMock,
      debug: { tokenErr, signedUrlErr },
    });
  }

  return NextResponse.json({
    sessionId: session.id,
    channel: "VOICE",
    conversationToken: null,
    signedUrl: null,
    elevenlabsConversationId: null,
    agentId: elevenlabsAgentId,
    brief: injectedBrief,
    briefWordCount: countWords(injectedBrief),
    isMock: true,
  });
}
