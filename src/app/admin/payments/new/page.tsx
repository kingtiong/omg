import { prisma } from "@/lib/db";
import { PageHeader, Crumbs } from "@/components/ui/page-header";
import { PaymentForm } from "./_form";

export default async function NewPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ invoiceId?: string; customerId?: string }>;
}) {
  const { invoiceId, customerId } = await searchParams;

  const customers = await prisma.customer.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, code: true, name: true, paymentTermsDays: true },
  });

  let preselectedCustomerId = customerId ?? null;
  if (!preselectedCustomerId && invoiceId) {
    const inv = await prisma.invoice.findUnique({ where: { id: invoiceId }, select: { customerId: true } });
    if (inv) preselectedCustomerId = inv.customerId;
  }

  // Pull outstanding invoices for the chosen customer (or all if none selected)
  const outstandingInvoices = preselectedCustomerId
    ? await prisma.invoice.findMany({
        where: { customerId: preselectedCustomerId, status: { in: ["UNPAID", "PARTIAL"] } },
        orderBy: { dueDate: "asc" },
        select: { id: true, number: true, dueDate: true, total: true, amountPaid: true },
      })
    : [];

  return (
    <>
      <Crumbs items={[{ href: "/admin/payments", label: "Payments" }, { label: "Record" }]} />
      <PageHeader
        eyebrow="New"
        title="Record payment"
        description="Capture a payment received from a customer and apply it across one or many open invoices."
      />
      <PaymentForm
        customers={customers}
        outstandingInvoices={outstandingInvoices.map((i) => ({
          id: i.id,
          number: i.number,
          dueDate: i.dueDate.toISOString(),
          total: Number(i.total),
          paid: Number(i.amountPaid),
        }))}
        preselectedCustomerId={preselectedCustomerId}
        preselectedInvoiceId={invoiceId ?? null}
      />
    </>
  );
}
