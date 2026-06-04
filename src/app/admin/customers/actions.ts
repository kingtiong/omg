"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { customerSchema } from "@/lib/schemas/customer";
import { parseForm, type ActionResult } from "@/lib/forms";
import { Prisma } from "@prisma/client";

async function nextCustomerCode(): Promise<string> {
  const count = await prisma.customer.count();
  return `CUST-${String(count + 1).padStart(4, "0")}`;
}

export async function createCustomer(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = parseForm(customerSchema, formData);
  if (!parsed.success) return parsed.result;
  const d = parsed.data;
  if (!d.code || d.code.trim() === "") d.code = await nextCustomerCode();
  try {
    await prisma.customer.create({
      data: {
        code: d.code,
        name: d.name,
        contactName: d.contactName || null,
        email: d.email || null,
        phone: d.phone || null,
        address: d.address || null,
        paymentTermsDays: d.paymentTermsDays,
        creditLimit: d.creditLimit,
        active: d.active,
        notes: d.notes || null,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "A customer with that code already exists." };
    }
    throw e;
  }
  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}

export async function updateCustomer(id: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = parseForm(customerSchema, formData);
  if (!parsed.success) return parsed.result;
  const d = parsed.data;
  try {
    await prisma.customer.update({
      where: { id },
      data: {
        code: d.code,
        name: d.name,
        contactName: d.contactName || null,
        email: d.email || null,
        phone: d.phone || null,
        address: d.address || null,
        paymentTermsDays: d.paymentTermsDays,
        creditLimit: d.creditLimit,
        active: d.active,
        notes: d.notes || null,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "A customer with that code already exists." };
    }
    throw e;
  }
  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${id}`);
  redirect("/admin/customers");
}
