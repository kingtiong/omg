import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const customer = await prisma.customer.upsert({
    where: { code: "CUST-TEST-001" },
    update: {},
    create: {
      code: "CUST-TEST-001",
      name: "AutoCare Sample SDN BHD",
      contactName: "Ahmad Tester",
      email: "ops@autocaresample.test",
      phone: "+60 12 555 1234",
      address: "12, Jalan Test, 47000 Sungai Buloh, Selangor",
      paymentTermsDays: 30,
      creditLimit: 10000,
    },
  });

  const passwordHash = await bcrypt.hash("CustTest!2026", 10);
  await prisma.user.upsert({
    where: { email: "customer@omg.local" },
    update: { customerId: customer.id, passwordHash, active: true },
    create: {
      email: "customer@omg.local",
      name: "Sample Customer",
      passwordHash,
      role: "CUSTOMER",
      customerId: customer.id,
    },
  });

  console.log(`Test customer ${customer.code} ready.`);
  console.log(`  Login: customer@omg.local / CustTest!2026`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
