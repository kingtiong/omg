"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { parseForm, type ActionResult } from "@/lib/forms";
import { nextPurchaseOrderNumber } from "@/lib/numbering";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  createPurchaseOrderSchema,
  purchaseOrderItemsSchema,
  receivePurchaseOrderSchema,
  receiptLinesSchema,
} from "@/lib/schemas/purchase-order";

const idSchema = z.object({ id: z.string().min(1) });

export async function createPurchaseOrder(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = parseForm(createPurchaseOrderSchema, formData);
  if (!parsed.success) return parsed.result;
  const d = parsed.data;

  let items: Array<{ partId: string; quantity: number; unitCost: number }>;
  try {
    items = purchaseOrderItemsSchema.parse(JSON.parse(d.items));
  } catch {
    return { ok: false, error: "Please add at least one valid line item." };
  }

  const parts = await prisma.part.findMany({
    where: { id: { in: items.map((i) => i.partId) } },
    select: { id: true },
  });
  if (parts.length !== new Set(items.map((i) => i.partId)).size) {
    return { ok: false, error: "One or more parts are no longer available." };
  }

  const subtotal = items.reduce((a, x) => a + x.quantity * x.unitCost, 0);
  const taxTotal = 0;
  const total = subtotal;

  const number = await nextPurchaseOrderNumber();
  const expectedAt = d.expectedAt ? new Date(d.expectedAt) : null;

  let createdId: string;
  try {
    const po = await prisma.purchaseOrder.create({
      data: {
        number,
        supplierId: d.supplierId,
        status: "DRAFT",
        expectedAt,
        notes: d.notes || null,
        subtotal,
        taxTotal,
        total,
        items: {
          create: items.map((i) => ({
            partId: i.partId,
            quantity: i.quantity,
            unitCost: i.unitCost,
            lineTotal: i.quantity * i.unitCost,
          })),
        },
      },
    });
    createdId = po.id;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return { ok: false, error: `Database error: ${e.code}` };
    }
    return { ok: false, error: "Failed to create purchase order." };
  }

  revalidatePath("/admin/purchase-orders");
  redirect(`/admin/purchase-orders/${createdId}`);
}

export async function sendPurchaseOrder(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = parseForm(idSchema, formData);
  if (!parsed.success) return parsed.result;
  const { id } = parsed.data;

  const po = await prisma.purchaseOrder.findUnique({ where: { id }, select: { status: true } });
  if (!po) return { ok: false, error: "Purchase order not found." };
  if (po.status !== "DRAFT") return { ok: false, error: `Cannot send a ${po.status} purchase order.` };

  await prisma.purchaseOrder.update({ where: { id }, data: { status: "SENT" } });
  revalidatePath("/admin/purchase-orders");
  revalidatePath(`/admin/purchase-orders/${id}`);
  return { ok: true };
}

export async function cancelPurchaseOrder(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = parseForm(idSchema, formData);
  if (!parsed.success) return parsed.result;
  const { id } = parsed.data;

  const po = await prisma.purchaseOrder.findUnique({ where: { id }, select: { status: true } });
  if (!po) return { ok: false, error: "Purchase order not found." };
  if (po.status === "RECEIVED" || po.status === "CANCELLED") {
    return { ok: false, error: `Cannot cancel a ${po.status} purchase order.` };
  }

  await prisma.purchaseOrder.update({ where: { id }, data: { status: "CANCELLED" } });
  revalidatePath("/admin/purchase-orders");
  revalidatePath(`/admin/purchase-orders/${id}`);
  return { ok: true };
}

export async function receivePurchaseOrder(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = parseForm(receivePurchaseOrderSchema, formData);
  if (!parsed.success) return parsed.result;
  const d = parsed.data;

  let receipts: Array<{ itemId: string; qty: number }>;
  try {
    receipts = receiptLinesSchema.parse(JSON.parse(d.receipts)).filter((r) => r.qty > 0);
  } catch {
    return { ok: false, error: "Invalid receipt payload." };
  }
  if (receipts.length === 0) return { ok: false, error: "Enter a quantity for at least one line." };

  const session = await getServerSession(authOptions);

  try {
    await prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.findUnique({
        where: { id: d.id },
        include: { items: true },
      });
      if (!po) throw new Error("Purchase order not found.");
      if (po.status === "RECEIVED" || po.status === "CANCELLED") {
        throw new Error(`Cannot receive a ${po.status} purchase order.`);
      }

      const itemMap = new Map(po.items.map((i) => [i.id, i]));
      const receiptMap = new Map(receipts.map((r) => [r.itemId, r.qty]));

      for (const [itemId, qty] of receiptMap) {
        const item = itemMap.get(itemId);
        if (!item) throw new Error("Line not on this purchase order.");
        const remaining = item.quantity - item.receivedQty;
        if (qty > remaining) {
          throw new Error(`Cannot receive ${qty} — only ${remaining} outstanding on a line.`);
        }
      }

      for (const [itemId, qty] of receiptMap) {
        const item = itemMap.get(itemId)!;

        await tx.purchaseOrderItem.update({
          where: { id: itemId },
          data: { receivedQty: { increment: qty } },
        });

        await tx.inventory.upsert({
          where: { partId_locationId: { partId: item.partId, locationId: d.locationId } },
          update: { quantity: { increment: qty } },
          create: { partId: item.partId, locationId: d.locationId, quantity: qty },
        });

        await tx.part.update({
          where: { id: item.partId },
          data: { costPrice: item.unitCost },
        });

        await tx.stockMovement.create({
          data: {
            partId: item.partId,
            locationId: d.locationId,
            type: "RECEIPT",
            quantity: qty,
            refType: "PURCHASE_ORDER",
            refId: po.id,
            notes: `Receipt for ${po.number}`,
            byUserId: session?.user?.id ?? null,
          },
        });
      }

      const refreshed = await tx.purchaseOrderItem.findMany({
        where: { purchaseOrderId: po.id },
        select: { quantity: true, receivedQty: true },
      });
      const fullyReceived = refreshed.every((i) => i.receivedQty >= i.quantity);
      const anyReceived = refreshed.some((i) => i.receivedQty > 0);
      const nextStatus = fullyReceived ? "RECEIVED" : anyReceived ? "PARTIAL" : po.status;

      await tx.purchaseOrder.update({
        where: { id: po.id },
        data: {
          status: nextStatus,
          receivedAt: fullyReceived ? new Date() : po.receivedAt,
        },
      });
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return { ok: false, error: `Database error: ${e.code}` };
    }
    if (e instanceof Error) return { ok: false, error: e.message };
    return { ok: false, error: "Failed to record receipt." };
  }

  revalidatePath("/admin/purchase-orders");
  revalidatePath(`/admin/purchase-orders/${d.id}`);
  revalidatePath("/admin/inventory");
  return { ok: true };
}
