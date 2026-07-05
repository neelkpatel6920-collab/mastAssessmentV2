import { NextResponse } from "next/server";
import { listZonesWithCenters } from "@mast/database";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await listZonesWithCenters());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Centers could not be loaded." },
      { status: 500 }
    );
  }
}
