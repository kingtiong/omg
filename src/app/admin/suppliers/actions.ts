"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { supplierSchema } from "@/lib/schemas/supplier";
import { parseForm, type ActionResult } from "@/lib/forms";
import { Prisma } from "@prisma/client";

async function nextSupplierCode(): Promise<string> {
  const count = await prisma.supplier.count();
  return `SUP-${String(count + 1).padStart(4, "0")}`;
}

export async function createSupplier(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = parseForm(supplierSchema, formData);
  if (!parsed.success) return parsed.result;
  const d = parsed.data;
  if (!d.code || d.code.trim() === "") d.code = await nextSupplierCode();
  try {
    await prisma.supplier.create({
      data: {
        code: d.code,
        name: d.name,
        contactName: d.contactName || null,
        email: d.email || null,
        phone: d.phone || null,
        address: d.address || null,
        paymentTermsDays: d.paymentTermsDays,
        active: d.active,
        notes: d.notes || null,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "A supplier with that code already exists." };
    }
    throw e;
  }
  revalidatePath("/admin/suppliers");
  redirect("/admin/suppliers");
}

export async function updateSupplier(id: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = parseForm(supplierSchema, formData);
  if (!parsed.success) return parsed.result;
  const d = parsed.data;
  try {
    await prisma.supplier.update({
      where: { id },
      data: {
        code: d.code,
        name: d.name,
        contactName: d.contactName || null,
        email: d.email || null,
        phone: d.phone || null,
        address: d.address || null,
        paymentTermsDays: d.paymentTermsDays,
        active: d.active,
        notes: d.notes || null,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "A supplier with that code already exists." };
    }
    throw e;
  }
  revalidatePath("/admin/suppliers");
  revalidatePath(`/admin/suppliers/${id}`);
  redirect("/admin/suppliers");
}

export async function toggleSupplierActive(id: string) {
  const s = await prisma.supplier.findUnique({ where: { id }, select: { active: true } });
  if (!s) return;
  await prisma.supplier.update({ where: { id }, data: { active: !s.active } });
  revalidatePath("/admin/suppliers");
}
