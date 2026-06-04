import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
async function main() {
  const users = [
    { email: "admin@omg.local",    pw: "ChangeMe!2026" },
    { email: "customer@omg.local", pw: "CustTest!2026" },
    { email: "delivery@omg.local", pw: "DelTest!2026" },
  ];
  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.pw, 10);
    const r = await prisma.user.update({
      where: { email: u.email },
      data: { passwordHash, active: true },
    });
    console.log(`✓ ${r.email}  role=${r.role}  active=${r.active}`);
  }
}
main().finally(() => prisma.$disconnect());
