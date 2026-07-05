import { NextResponse } from "next/server";
import { listResponsesForAdmin, type ResponseFilters } from "@mast/database";
import { currentAdmin } from "../../../auth";

function buildFilters(url: URL): ResponseFilters {
  const search = url.searchParams.get("search")?.trim() || undefined;
  const zoneId = url.searchParams.get("zoneId") || undefined;
  const centerId = url.searchParams.get("centerId") || undefined;
  const primaryType = url.searchParams.get("primaryType") || undefined;
  const secondaryType = url.searchParams.get("secondaryType") || undefined;
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  return {
    search,
    zoneId,
    centerId,
    primaryType,
    secondaryType,
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined
  };
}

export async function GET(request: Request) {
  const session = await currentAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const page = Math.max(Number(url.searchParams.get("page") ?? 1), 1);
  const pageSize = Math.min(Math.max(Number(url.searchParams.get("pageSize") ?? 25), 1), 100);

  return NextResponse.json(await listResponsesForAdmin(session, buildFilters(url), page, pageSize));
}
