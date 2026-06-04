"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { contactRequestSchema } from "@/lib/schemas/contact";
import { parseForm, type ActionResult } from "@/lib/forms";

export async function submitContactRequest(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = parseForm(contactRequestSchema, formData);
  if (!parsed.success) return parsed.result;
  const d = parsed.data;

  await prisma.contactRequest.create({
    data: {
      name: d.name,
      company: d.company || null,
      email: d.email,
      phone: d.phone || null,
      message: d.message || null,
      source: d.source || "homepage",
    },
  });

  revalidatePath("/admin/leads");
  return { ok: true, data: { submitted: true } };
}
