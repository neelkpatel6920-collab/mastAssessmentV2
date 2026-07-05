import { NextResponse } from "next/server";
import { getScopedResponseById, pdfReport } from "@mast/database";
import { currentAdmin } from "../../../../../auth";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await currentAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const response = await getScopedResponseById(session, params.id);
  if (!response) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const stream = await pdfReport(response);
  return new NextResponse(stream as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="mast-report-${response.id}.pdf"`
    }
  });
}
