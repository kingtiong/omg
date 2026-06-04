import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("DelTest!2026", 10);
  await prisma.user.upsert({
    where: { email: "delivery@omg.local" },
    update: { passwordHash, active: true },
    create: {
      email: "delivery@omg.local",
      name: "Sample Delivery",
      passwordHash,
      role: "DELIVERY",
    },
  });
  console.log("Test delivery user ready: delivery@omg.local / DelTest!2026");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
