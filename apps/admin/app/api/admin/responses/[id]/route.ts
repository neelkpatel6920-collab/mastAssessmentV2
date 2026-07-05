import { NextResponse } from "next/server";
import { getScopedResponseById } from "@mast/database";
import { currentAdmin } from "../../../../auth";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await currentAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const response = await getScopedResponseById(session, params.id);
  if (!response) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(response);
}
