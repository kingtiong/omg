"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { customerUserSchema } from "@/lib/schemas/customer-user";
import { parseForm, type ActionResult } from "@/lib/forms";

export async function addCustomerUser(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = parseForm(customerUserSchema, formData);
  if (!parsed.success) return parsed.result;
  const d = parsed.data;
  try {
    const passwordHash = await bcrypt.hash(d.password, 10);
    await prisma.user.create({
      data: {
        email: d.email,
        name: d.name,
        passwordHash,
        role: "CUSTOMER",
        customerId: d.customerId,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "A user with that email already exists." };
    }
    throw e;
  }
  revalidatePath(`/admin/customers/${d.customerId}`);
  return { ok: true };
}

export async function deactivateCustomerUser(userId: string, customerId: string) {
  await prisma.user.update({ where: { id: userId }, data: { active: false } });
  revalidatePath(`/admin/customers/${customerId}`);
}

export async function reactivateCustomerUser(userId: string, customerId: string) {
  await prisma.user.update({ where: { id: userId }, data: { active: true } });
  revalidatePath(`/admin/customers/${customerId}`);
}
