"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { parseForm, type ActionResult } from "@/lib/forms";

const updateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["NEW", "CONTACTED", "CONVERTED", "ARCHIVED"]),
});

export async function updateLeadStatus(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = parseForm(updateSchema, formData);
  if (!parsed.success) return parsed.result;
  await prisma.contactRequest.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
  });
  revalidatePath("/admin/leads");
  return { ok: true };
}
