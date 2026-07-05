import { NextResponse } from "next/server";
import { adminCookieName } from "@mast/database";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(adminCookieName());
  return response;
}
