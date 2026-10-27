import { NextRequest, NextResponse } from "next/server";
import { projectRepository } from "@jhanjhat/db";
import { checkOutOfScope } from "@jhanjhat/ai";
import { z } from "zod";

const OutOfScopeReqSchema = z.object({
  newRequestText: z.string().min(5, "New request text must be provided"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const json = await req.json().catch(() => ({}));
    const text = json.newRequestText || json.requestText;
    if (!text || typeof text !== "string" || text.trim().length < 5) {
      return NextResponse.json(
        { error: "New request text must be at least 5 characters long." },
        { status: 400 }
      );
    }

    const project = await projectRepository.getProject(params.id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const document = project.documents[0];
    const scopeSummary = document ? document.rawContent.slice(0, 500) : project.title;

    const result = await checkOutOfScope({
      projectTitle: project.title,
      scopeSummary,
      hourlyMinimum: project.hourlyMinimum,
      newRequestText: text,
    });

    const isOutOfScope = result.status === "OUT_OF_SCOPE";
    const estimatedExtraHours = Math.max(1, Math.round(result.suggestedPrice / (project.hourlyMinimum || 50)));

    return NextResponse.json({
      success: true,
      result,
      evaluation: {
        isOutOfScope,
        reason: result.reasoning,
        recommendedAction: isOutOfScope ? "CHARGE_EXTRA" : "ACCEPT",
        estimatedExtraHours,
        estimatedExtraFee: result.suggestedPrice,
        suggestedReply: result.replyDraft,
      },
    });
  } catch (err: any) {
    console.error("[Out of Scope API] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
