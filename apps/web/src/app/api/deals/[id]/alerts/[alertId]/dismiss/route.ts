import { NextRequest, NextResponse } from "next/server";
import { hoursRepository } from "@jhanjhat/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; alertId: string } }
) {
  try {
    const updated = await hoursRepository.dismissAlert(params.alertId);
    return NextResponse.json({ success: true, alert: updated });
  } catch (err: any) {
    console.error("[Dismiss Alert API] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
