"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseForm, type ActionResult } from "@/lib/forms";

const idSchema = z.object({ id: z.string().min(1) });
const deliverSchema = z.object({
  id: z.string().min(1),
  recipient: z.string().trim().max(200).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export async function markPicking(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = parseForm(idSchema, formData);
  if (!parsed.success) return parsed.result;
  const session = await getServerSession(authOptions);
  await prisma.delivery.update({
    where: { id: parsed.data.id },
    data: { status: "PICKING", pickedAt: new Date(), pickedById: session?.user?.id ?? null },
  });
  await prisma.salesOrder.update({
    where: { id: (await prisma.delivery.findUnique({ where: { id: parsed.data.id }, select: { salesOrderId: true } }))!.salesOrderId },
    data: { status: "PICKING" },
  });
  revalidatePath("/delivery");
  revalidatePath(`/delivery/${parsed.data.id}`);
  return { ok: true };
}

export async function markDispatched(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = parseForm(idSchema, formData);
  if (!parsed.success) return parsed.result;
  const delivery = await prisma.delivery.findUnique({ where: { id: parsed.data.id } });
  if (!delivery) return { ok: false, error: "Delivery not found." };

  await prisma.delivery.update({
    where: { id: parsed.data.id },
    data: { status: "DISPATCHED", dispatchedAt: new Date() },
  });
  await prisma.salesOrder.update({
    where: { id: delivery.salesOrderId },
    data: { status: "DISPATCHED" },
  });
  revalidatePath("/delivery");
  revalidatePath(`/delivery/${parsed.data.id}`);
  return { ok: true };
}

export async function markDelivered(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = parseForm(deliverSchema, formData);
  if (!parsed.success) return parsed.result;

  const delivery = await prisma.delivery.findUnique({
    where: { id: parsed.data.id },
    include: { salesOrder: { include: { items: true } } },
  });
  if (!delivery) return { ok: false, error: "Delivery not found." };

  const defaultLocation = await prisma.location.findFirst({ orderBy: { isDefault: "desc" } });
  if (!defaultLocation) return { ok: false, error: "No default location configured." };

  await prisma.$transaction(async (tx) => {
    // Decrement stock & reservation per line + write SHIPMENT movements
    for (const item of delivery.salesOrder.items) {
      await tx.inventory.update({
        where: { partId_locationId: { partId: item.partId, locationId: defaultLocation.id } },
        data: {
          quantity: { decrement: item.quantity },
          reserved: { decrement: item.quantity },
        },
      });
      await tx.stockMovement.create({
        data: {
          partId: item.partId,
          locationId: defaultLocation.id,
          type: "SHIPMENT",
          quantity: -item.quantity,
          refType: "SALES_ORDER",
          refId: delivery.salesOrderId,
          notes: `Shipped via ${delivery.number}`,
        },
      });
    }
    await tx.delivery.update({
      where: { id: delivery.id },
      data: {
        status: "DELIVERED",
        deliveredAt: new Date(),
        recipient: parsed.data.recipient || null,
        notes: parsed.data.notes || null,
      },
    });
    await tx.salesOrder.update({
      where: { id: delivery.salesOrderId },
      data: { status: "DELIVERED" },
    });
  });

  revalidatePath("/delivery");
  revalidatePath(`/delivery/${parsed.data.id}`);
  return { ok: true };
}
