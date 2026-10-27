import { NextRequest, NextResponse } from "next/server";
import { hoursRepository } from "@jhanjhat/db";
import { z } from "zod";

const LogHoursInputSchema = z.object({
  hours: z.number().positive("Hours must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  date: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const json = await req.json();
    const validated = LogHoursInputSchema.parse(json);

    const log = await hoursRepository.logHours({
      projectId: params.id,
      hours: validated.hours,
      description: validated.description,
      date: validated.date ? new Date(validated.date) : new Date(),
    });

    const summary = await hoursRepository.getProjectHoursSummary(params.id);

    return NextResponse.json({
      success: true,
      log,
      summary,
    });
  } catch (err: any) {
    console.error("[Log Hours API] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
