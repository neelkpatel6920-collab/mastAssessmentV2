import { NextResponse } from "next/server";
import { allScopedResponses, makeCsv } from "@mast/database";
import { currentAdmin } from "../../../../auth";

export async function GET() {
  const session = await currentAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const responses = await allScopedResponses(session);

  return new NextResponse(makeCsv(responses), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"mast-responses.csv\""
    }
  });
}
