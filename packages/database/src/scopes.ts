import type { AdminRole, AdminSession } from "./auth";

export function canUseZoneFilter(role: AdminRole): boolean {
  return role === "MASTER_ADMIN";
}

export function canUseCenterFilter(role: AdminRole): boolean {
  return role === "MASTER_ADMIN" || role === "ZONE_ADMIN";
}

export function isResponseInScope(
  session: AdminSession,
  response: { zoneId: string; centerId: string }
): boolean {
  if (session.role === "MASTER_ADMIN") return true;
  if (session.role === "ZONE_ADMIN") return response.zoneId === session.zoneId;
  return response.centerId === session.centerId;
}
