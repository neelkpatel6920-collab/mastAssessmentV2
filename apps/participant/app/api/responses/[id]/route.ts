import { NextResponse } from "next/server";
import { z } from "zod";
import { getTestResponseById, updateResponseValidation } from "@mast/database";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const response = await getTestResponseById(params.id);

  if (!response) return NextResponse.json({ error: "Result not found." }, { status: 404 });
  return NextResponse.json(response);
}

const patchSchema = z.object({
  secondTestAnswers: z.array(z.boolean()).length(10),
  valid: z.enum(["Valid", "Invalid"])
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = patchSchema.parse(await request.json());
    const existing = await getTestResponseById(params.id);
    if (!existing) return NextResponse.json({ error: "Result not found." }, { status: 404 });

    await updateResponseValidation(params.id, {
      valid: body.valid,
      secondTestAnswers: body.secondTestAnswers
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request." },
      { status: 400 }
    );
  }
}
