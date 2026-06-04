"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseForm, type ActionResult } from "@/lib/forms";

const adjustSchema = z.object({
  partId: z.string().min(1),
  locationId: z.string().min(1),
  delta: z.coerce.number().int(),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export async function adjustStock(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = parseForm(adjustSchema, formData);
  if (!parsed.success) return parsed.result;
  const d = parsed.data;
  if (d.delta === 0) return { ok: false, error: "Adjustment amount cannot be zero." };

  const session = await getServerSession(authOptions);

  await prisma.$transaction(async (tx) => {
    const inv = await tx.inventory.upsert({
      where: { partId_locationId: { partId: d.partId, locationId: d.locationId } },
      update: { quantity: { increment: d.delta } },
      create: {
        partId: d.partId,
        locationId: d.locationId,
        quantity: Math.max(d.delta, 0),
      },
    });
    if (inv.quantity < 0) {
      throw new Error("Adjustment would result in negative stock.");
    }
    await tx.stockMovement.create({
      data: {
        partId: d.partId,
        locationId: d.locationId,
        type: "ADJUSTMENT",
        quantity: d.delta,
        notes: d.notes || null,
        byUserId: session?.user?.id ?? null,
      },
    });
  });

  revalidatePath("/admin/inventory");
  redirect("/admin/inventory");
}
