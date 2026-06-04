"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { parseForm, type ActionResult } from "@/lib/forms";
import { settingsSchema } from "@/lib/schemas/settings";

export async function updateSettings(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = parseForm(settingsSchema, formData);
  if (!parsed.success) return parsed.result;
  const d = parsed.data;

  const data = {
    companyName: d.companyName,
    companyAddress: d.companyAddress || null,
    companyPhone: d.companyPhone || null,
    companyEmail: d.companyEmail || null,
    sstRegistered: d.sstRegistered,
    defaultSstRate: d.defaultSstRate,
    defaultPaymentTermsDays: d.defaultPaymentTermsDays,
    invoicePrefix: d.invoicePrefix.endsWith("-") ? d.invoicePrefix : `${d.invoicePrefix}-`,
  };

  try {
    await prisma.settings.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return { ok: false, error: `Database error: ${e.code}` };
    }
    return { ok: false, error: "Failed to save settings." };
  }

  revalidatePath("/admin/settings");
  return { ok: true, data: { saved: true } };
}
