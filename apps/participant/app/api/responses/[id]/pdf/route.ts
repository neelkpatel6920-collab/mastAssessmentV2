import { NextResponse } from "next/server";
import { getTestResponseById, pdfReport } from "@mast/database";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const response = await getTestResponseById(params.id);

  if (!response) return NextResponse.json({ error: "Report not found." }, { status: 404 });

  const stream = await pdfReport(response);
  return new NextResponse(stream as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="mast-report-${response.id}.pdf"`
    }
  });
}
