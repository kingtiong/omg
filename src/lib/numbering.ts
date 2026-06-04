import { prisma } from "@/lib/db";

const PAD = 5;

export async function nextSalesOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `OMG-SO-${year}-`;
  const count = await prisma.salesOrder.count({ where: { number: { startsWith: prefix } } });
  return `${prefix}${String(count + 1).padStart(PAD, "0")}`;
}

export async function nextPurchaseOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `OMG-PO-${year}-`;
  const count = await prisma.purchaseOrder.count({ where: { number: { startsWith: prefix } } });
  return `${prefix}${String(count + 1).padStart(PAD, "0")}`;
}

export async function nextDeliveryNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `OMG-DEL-${year}-`;
  const count = await prisma.delivery.count({ where: { number: { startsWith: prefix } } });
  return `${prefix}${String(count + 1).padStart(PAD, "0")}`;
}

export async function nextInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const settings = await prisma.settings.findUnique({ where: { id: 1 }, select: { invoicePrefix: true } });
  const base = settings?.invoicePrefix?.trim() || "OMG-INV-";
  const normalized = base.endsWith("-") ? base : `${base}-`;
  const prefix = `${normalized}${year}-`;
  const count = await prisma.invoice.count({ where: { number: { startsWith: prefix } } });
  return `${prefix}${String(count + 1).padStart(PAD, "0")}`;
}

export async function nextPaymentReference(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `OMG-PMT-${year}-`;
  const count = await prisma.payment.count({ where: { reference: { startsWith: prefix } } });
  return `${prefix}${String(count + 1).padStart(PAD, "0")}`;
}
