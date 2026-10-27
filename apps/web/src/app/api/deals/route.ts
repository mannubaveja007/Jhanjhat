import { NextResponse } from "next/server";
import { projectRepository } from "@jhanjhat/db";

export async function GET() {
  try {
    const projects = await projectRepository.listProjects();
    return NextResponse.json({ projects });
  } catch (err: any) {
    console.error("[Deals List API] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
