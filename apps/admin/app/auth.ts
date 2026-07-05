import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookieName, verifyAdminSession, type AdminSession } from "@mast/database";

export async function currentAdmin(): Promise<AdminSession | null> {
  return verifyAdminSession(cookies().get(adminCookieName())?.value);
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await currentAdmin();
  if (!session) redirect("/login");
  return session;
}
