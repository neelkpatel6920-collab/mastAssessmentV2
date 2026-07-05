import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import bcrypt from "bcryptjs";

// Load .env.local synchronously if it exists
const envLocalPath = resolve(".env.local");
if (existsSync(envLocalPath)) {
  try {
    // @ts-ignore - process.loadEnvFile available in Node 20.12+
    process.loadEnvFile(envLocalPath);
  } catch {
    // Fallback: manual synchronous parse
    const lines = readFileSync(envLocalPath, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { centerIdFor, seedCenterRecords, seedZonesWithCenters } from "@mast/database";

type GeneratedAdmin = {
  role: "MASTER_ADMIN" | "ZONE_ADMIN" | "CENTER_ADMIN";
  name: string;
  email: string;
  password: string;
  zoneId: string | null;
  centerId: string | null;
};

type CredentialFile = {
  mainAdmin: GeneratedAdmin;
  zoneAdmins: GeneratedAdmin[];
  centerAdmins: GeneratedAdmin[];
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function initFirestore() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: requireEnv("FIREBASE_PROJECT_ID"),
        clientEmail: requireEnv("FIREBASE_CLIENT_EMAIL"),
        privateKey: requireEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n")
      })
    });
  }
  return getFirestore();
}

async function readCredentials(): Promise<CredentialFile> {
  const path = resolve("output", "admin-credentials.json");
  return JSON.parse(await readFile(path, "utf8")) as CredentialFile;
}

async function main() {
  const db = initFirestore();
  const credentials = await readCredentials();

  for (const zone of seedZonesWithCenters()) {
    await db.collection("zones").doc(zone.id).set({ name: zone.name }, { merge: true });
  }

  for (const center of seedCenterRecords()) {
    await db.collection("centers").doc(centerIdFor(center.no)).set(
      {
        name: center.name,
        no: center.no,
        zoneId: center.zoneId,
        zoneName: center.zoneName
      },
      { merge: true }
    );
  }

  const admins = [credentials.mainAdmin, ...credentials.zoneAdmins, ...credentials.centerAdmins];
  for (const admin of admins) {
    await db.collection("adminUsers").doc(admin.email.toLowerCase()).set(
      {
        name: admin.name,
        email: admin.email.toLowerCase(),
        passwordHash: await bcrypt.hash(admin.password, 12),
        role: admin.role,
        zoneId: admin.zoneId ?? null,
        centerId: admin.centerId ?? null,
        isActive: true
      },
      { merge: true }
    );
  }

  console.log(`Seeded ${seedZonesWithCenters().length} zones, ${seedCenterRecords().length} centers, ${admins.length} admins.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
