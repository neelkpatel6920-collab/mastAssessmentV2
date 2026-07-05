import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { CENTER_SEEDS } from "@mast/core";

const prisma = new PrismaClient();

async function main() {
  for (const seed of CENTER_SEEDS) {
    const zone = await prisma.zone.upsert({
      where: { name: seed.zone },
      create: { name: seed.zone },
      update: {}
    });

    await prisma.center.upsert({
      where: { zoneId_name: { zoneId: zone.id, name: seed.center } },
      create: { name: seed.center, zoneId: zone.id },
      update: {}
    });
  }

  const name = process.env.MASTER_ADMIN_NAME;
  const email = process.env.MASTER_ADMIN_EMAIL;
  const password = process.env.MASTER_ADMIN_PASSWORD;

  if (name && email && password) {
    await prisma.adminUser.upsert({
      where: { email },
      create: {
        name,
        email,
        passwordHash: await bcrypt.hash(password, 12),
        role: "MASTER_ADMIN"
      },
      update: {
        name,
        passwordHash: await bcrypt.hash(password, 12),
        role: "MASTER_ADMIN",
        isActive: true
      }
    });
  }

  const credentialPath = join(process.cwd(), "output", "admin-zone-credentials.json");
  if (existsSync(credentialPath)) {
    const credentials = JSON.parse(readFileSync(credentialPath, "utf8")) as Array<{
      zone: string;
      name: string;
      email: string;
      password: string;
    }>;

    for (const credential of credentials) {
      const zone = await prisma.zone.findUnique({ where: { name: credential.zone } });
      if (!zone) continue;

      await prisma.adminUser.upsert({
        where: { email: credential.email },
        create: {
          name: credential.name,
          email: credential.email,
          passwordHash: await bcrypt.hash(credential.password, 12),
          role: "ZONE_ADMIN",
          zoneId: zone.id
        },
        update: {
          name: credential.name,
          passwordHash: await bcrypt.hash(credential.password, 12),
          role: "ZONE_ADMIN",
          zoneId: zone.id,
          centerId: null,
          isActive: true
        }
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
