import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Default settings (singleton, id=1)
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      companyName: "OMG",
      sstRegistered: false,
      defaultSstRate: 0,
      invoicePrefix: "OMG-INV-",
      invoiceCounterYr: new Date().getFullYear(),
      defaultPaymentTermsDays: 30,
    },
  });

  // Default warehouse location
  await prisma.location.upsert({
    where: { code: "MAIN" },
    update: {},
    create: { code: "MAIN", name: "Main Warehouse", isDefault: true },
  });

  // First admin user — change the password after first login
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@omg.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe!2026";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "OMG Admin",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Seed complete.");
  console.log(`  Admin login: ${adminEmail}`);
  console.log(`  Admin password: ${adminPassword}  (change this after first login)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
