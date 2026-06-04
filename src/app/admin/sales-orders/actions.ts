"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { parseForm, type ActionResult } from "@/lib/forms";
import { nextDeliveryNumber, nextInvoiceNumber } from "@/lib/numbering";
import { Prisma } from "@prisma/client";

const idSchema = z.object({ id: z.string().min(1) });

export async function confirmSalesOrder(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = parseForm(idSchema, formData);
  if (!parsed.success) return parsed.result;
  const { id } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.salesOrder.findUnique({
        where: { id },
        include: {
          items: { include: { part: { select: { id: true, name: true } } } },
          customer: { select: { paymentTermsDays: true } },
        },
      });
      if (!order) throw new Error("Order not found.");
      if (order.status !== "PENDING") throw new Error(`Order is already ${order.status}, can't confirm.`);

      const defaultLocation = await tx.location.findFirst({ orderBy: { isDefault: "desc" } });
      if (!defaultLocation) throw new Error("No default location set up.");

      // Reserve stock per line + write a stock movement
      for (const item of order.items) {
        const inv = await tx.inventory.upsert({
          where: { partId_locationId: { partId: item.partId, locationId: defaultLocation.id } },
          update: { reserved: { increment: item.quantity } },
          create: { partId: item.partId, locationId: defaultLocation.id, quantity: 0, reserved: item.quantity },
        });
        if (inv.reserved > inv.quantity) {
          // Allow back-order — keep going but record it
        }
        await tx.stockMovement.create({
          data: {
            partId: item.partId,
            locationId: defaultLocation.id,
            type: "RESERVE",
            quantity: -item.quantity,
            refType: "SALES_ORDER",
            refId: order.id,
            notes: `Reserved for ${order.number}`,
          },
        });
      }

      // Update order status
      await tx.salesOrder.update({ where: { id: order.id }, data: { status: "CONFIRMED" } });

      // Create invoice (due = today + customer.paymentTermsDays)
      const dueDate = new Date(Date.now() + order.customer.paymentTermsDays * 24 * 60 * 60 * 1000);
      const invNumber = await nextInvoiceNumber();
      await tx.invoice.create({
        data: {
          number: invNumber,
          customerId: order.customerId,
          salesOrderId: order.id,
          status: "UNPAID",
          issueDate: new Date(),
          dueDate,
          subtotal: order.subtotal,
          taxTotal: order.taxTotal,
          total: order.total,
          items: {
            create: order.items.map((it) => ({
              partId: it.partId,
              description: it.part.name,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              sstRate: it.sstRate,
              lineTotal: it.lineTotal,
            })),
          },
        },
      });

      // Create delivery (PENDING, awaiting picking)
      const delNumber = await nextDeliveryNumber();
      await tx.delivery.create({
        data: {
          number: delNumber,
          salesOrderId: order.id,
          status: "PENDING",
        },
      });
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return { ok: false, error: `Database error: ${e.code}` };
    }
    if (e instanceof Error) return { ok: false, error: e.message };
    return { ok: false, error: "Failed to confirm order." };
  }

  revalidatePath("/admin/sales-orders");
  revalidatePath(`/admin/sales-orders/${id}`);
  revalidatePath(`/portal/orders/${id}`);
  redirect(`/admin/sales-orders/${id}?confirmed=1`);
}

export async function rejectSalesOrder(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = parseForm(idSchema, formData);
  if (!parsed.success) return parsed.result;
  const { id } = parsed.data;

  const order = await prisma.salesOrder.findUnique({ where: { id }, select: { status: true } });
  if (!order) return { ok: false, error: "Order not found." };
  if (order.status !== "PENDING") return { ok: false, error: `Order is already ${order.status}.` };

  await prisma.salesOrder.update({ where: { id }, data: { status: "CANCELLED" } });
  revalidatePath("/admin/sales-orders");
  revalidatePath(`/admin/sales-orders/${id}`);
  redirect("/admin/sales-orders");
}
