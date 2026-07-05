import { NextResponse } from "next/server";
import { getTestResponseById } from "@mast/database";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const response = await getTestResponseById(params.id);

  if (!response) return NextResponse.json({ error: "Result not found." }, { status: 404 });
  return NextResponse.json(response);
}
