"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { nextSalesOrderNumber } from "@/lib/numbering";

const placeOrderSchema = z.object({
  cart: z.string(),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  deliveryAddress: z.string().trim().max(1000).optional().or(z.literal("")),
});

const cartSchema = z.array(
  z.object({
    partId: z.string().min(1),
    qty: z.number().int().min(1).max(10000),
  })
);

export interface PlaceOrderResult {
  ok: boolean;
  error?: string;
  orderId?: string;
  orderNumber?: string;
}

export async function placeOrder(_prev: PlaceOrderResult, formData: FormData): Promise<PlaceOrderResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.customerId) return { ok: false, error: "You are not linked to a customer account." };
  const customerId = session.user.customerId;

  const parsed = placeOrderSchema.safeParse({
    cart: formData.get("cart"),
    notes: formData.get("notes"),
    deliveryAddress: formData.get("deliveryAddress"),
  });
  if (!parsed.success) return { ok: false, error: "Invalid order payload." };

  let cartItems: Array<{ partId: string; qty: number }>;
  try {
    cartItems = cartSchema.parse(JSON.parse(parsed.data.cart));
  } catch {
    return { ok: false, error: "Cart is empty or malformed." };
  }
  if (cartItems.length === 0) return { ok: false, error: "Cart is empty." };

  // Load parts (snapshot prices and check availability)
  const parts = await prisma.part.findMany({
    where: { id: { in: cartItems.map((c) => c.partId) }, active: true },
    select: { id: true, sku: true, name: true, sellPrice: true, costPrice: true, sstRate: true },
  });
  if (parts.length !== cartItems.length) {
    return { ok: false, error: "One or more parts in your cart are no longer available." };
  }

  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  const defaultSstRate = Number(settings?.defaultSstRate ?? 0);
  const partMap = new Map(parts.map((p) => [p.id, p]));

  let subtotal = 0;
  let taxTotal = 0;
  const itemsData = cartItems.map((c) => {
    const p = partMap.get(c.partId)!;
    const unitPrice = Number(p.sellPrice);
    const unitCost = Number(p.costPrice);
    const sstRate = p.sstRate != null ? Number(p.sstRate) : defaultSstRate;
    const lineSubtotal = unitPrice * c.qty;
    const lineTax = (lineSubtotal * sstRate) / 100;
    subtotal += lineSubtotal;
    taxTotal += lineTax;
    return {
      partId: p.id,
      quantity: c.qty,
      unitPrice,
      unitCost,
      sstRate,
      lineTotal: lineSubtotal + lineTax,
    };
  });
  const total = subtotal + taxTotal;

  const number = await nextSalesOrderNumber();

  const order = await prisma.salesOrder.create({
    data: {
      number,
      customerId,
      createdById: session.user.id,
      status: "PENDING",
      notes: parsed.data.notes || null,
      deliveryAddress: parsed.data.deliveryAddress || null,
      subtotal,
      taxTotal,
      total,
      items: { create: itemsData },
    },
  });

  revalidatePath("/portal");
  revalidatePath("/portal/orders");
  revalidatePath("/admin/sales-orders");
  redirect(`/portal/orders/${order.id}?placed=1`);
}
