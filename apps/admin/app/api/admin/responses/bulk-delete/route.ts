import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteResponsesByIds } from "@mast/database";
import { currentAdmin } from "../../../../auth";

const schema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(500)
});

export async function DELETE(request: Request) {
  const session = await currentAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = schema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const deleted = await deleteResponsesByIds(session, body.data.ids);
  return NextResponse.json({ deleted });
}
