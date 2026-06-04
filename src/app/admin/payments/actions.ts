"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseForm, type ActionResult } from "@/lib/forms";
import { nextPaymentReference } from "@/lib/numbering";

const paymentSchema = z.object({
  customerId: z.string().min(1),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  method: z.enum(["BANK_TRANSFER", "CASH", "CHEQUE", "ONLINE", "OTHER"]),
  receivedAt: z.string().optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  applications: z.string().optional(),
});

export async function recordPayment(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = parseForm(paymentSchema, formData);
  if (!parsed.success) return parsed.result;
  const d = parsed.data;
  const session = await getServerSession(authOptions);

  let applications: Array<{ invoiceId: string; amount: number }> = [];
  if (d.applications) {
    try {
      const arr = JSON.parse(d.applications);
      applications = z
        .array(z.object({ invoiceId: z.string(), amount: z.coerce.number().min(0) }))
        .parse(arr)
        .filter((a) => a.amount > 0);
    } catch {
      return { ok: false, error: "Invalid invoice allocation." };
    }
  }

  const totalApplied = applications.reduce((a, x) => a + x.amount, 0);
  if (totalApplied > d.amount + 0.001) {
    return { ok: false, error: "Allocations exceed payment amount." };
  }

  const reference = await nextPaymentReference();
  const receivedAt = d.receivedAt ? new Date(d.receivedAt) : new Date();

  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        reference,
        customerId: d.customerId,
        amount: d.amount,
        method: d.method,
        receivedAt,
        notes: d.notes || null,
        recordedById: session?.user?.id ?? null,
      },
    });

    for (const app of applications) {
      await tx.paymentApplication.create({
        data: { paymentId: payment.id, invoiceId: app.invoiceId, amount: app.amount },
      });
      const inv = await tx.invoice.findUnique({ where: { id: app.invoiceId } });
      if (!inv) continue;
      const newPaid = Number(inv.amountPaid) + app.amount;
      const total = Number(inv.total);
      const status = newPaid >= total - 0.001 ? "PAID" : newPaid > 0 ? "PARTIAL" : inv.status;
      await tx.invoice.update({
        where: { id: app.invoiceId },
        data: { amountPaid: newPaid, status },
      });
    }
  });

  revalidatePath("/admin/payments");
  revalidatePath("/admin/invoices");
  redirect("/admin/payments");
}
