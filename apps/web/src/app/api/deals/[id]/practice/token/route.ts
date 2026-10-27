import { NextRequest, NextResponse } from "next/server";
import { projectRepository, simulationRepository } from "@jhanjhat/db";
import { redactSensitiveInfo, StartPracticeSessionInputSchema } from "@jhanjhat/shared";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const json = await req.json().catch(() => ({}));
    const validated = StartPracticeSessionInputSchema.parse({
      projectId: params.id,
      ...json,
    });

    const project = await projectRepository.getProject(params.id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const agentId = process.env.ELEVENLABS_AGENT_ID || "agent_8701m5pnf3nte8yb5rdp3fc7rcz3";

    if (!apiKey) {
      return NextResponse.json(
        { error: "ELEVENLABS_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    // 1. Fetch signed URL from ElevenLabs
    const urlResp = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        method: "GET",
        headers: {
          "xi-api-key": apiKey,
        },
      }
    );

    if (!urlResp.ok) {
      const errText = await urlResp.text();
      throw new Error(`ElevenLabs signed URL failed (${urlResp.status}): ${errText}`);
    }

    const { signed_url } = await urlResp.json();

    // 2. Prepare dynamic variables (sanitized & redacted scenario)
    const document = project.documents[0];
    const rawBrief = document ? document.rawContent : "Freelance project negotiation";
    const redactedBrief = redactSensitiveInfo(rawBrief.slice(0, 2500)).redactedText.slice(0, 500);

    const latestAnalysis = project.analyses[0];
    const hiddenAsks = latestAnalysis
      ? latestAnalysis.clauses.map((c) => `${c.category}: ${c.quote.slice(0, 100)}`)
      : ["Ask for unlimited revisions", "Delay payment past launch", "Cut budget by 30%"];

    // 3. Create simulation session in DB
    const simulation = await simulationRepository.createSimulation({
      projectId: project.id,
      clientName: project.clientName,
      freelancerName: validated.freelancerName,
      persona: validated.persona,
      difficulty: validated.difficulty,
      projectBrief: redactedBrief,
      hiddenAsks,
      budgetCeiling: project.budgetAmount,
    });

    const dynamicVariables = {
      client_name: project.clientName,
      freelancer_name: validated.freelancerName,
      persona: validated.persona,
      difficulty: String(validated.difficulty),
      project_brief: redactedBrief,
      hidden_asks: hiddenAsks.join(" | "),
      budget_ceiling: `$${project.budgetAmount}`,
    };

    return NextResponse.json({
      success: true,
      signedUrl: signed_url,
      simulationId: simulation.id,
      agentId,
      dynamicVariables,
    });
  } catch (err: any) {
    console.error("[Practice Token API] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
