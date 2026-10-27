import { NextRequest, NextResponse } from "next/server";
import { projectRepository, hoursRepository } from "@jhanjhat/db";
import { findSimilarPastDeals } from "@jhanjhat/ai";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await projectRepository.getProject(params.id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const hoursSummary = await hoursRepository.getProjectHoursSummary(params.id);

    // Hybrid search over earlier deals for Deal Memory
    let similarDeals: any[] = [];
    const document = project.documents[0];
    if (document) {
      try {
        const queryText = document.rawContent.slice(0, 300);
        similarDeals = await findSimilarPastDeals(queryText, project.id);
      } catch (memErr) {
        console.warn("[Deals API] Similar deals lookup warning:", memErr);
      }
    }

    return NextResponse.json({
      project,
      hoursSummary,
      similarDeals,
    });
  } catch (err: any) {
    console.error("[Deal Get API] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
