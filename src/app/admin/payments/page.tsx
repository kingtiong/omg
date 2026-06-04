import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Table, THead, TBody, TR, TH, TD, EmptyRow } from "@/components/ui/table";
import { formatDate, formatMoney } from "@/lib/format";
import { Plus } from "lucide-react";

export default async function PaymentsPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { receivedAt: "desc" },
    take: 200,
    include: {
      customer: { select: { name: true, code: true } },
      _count: { select: { applications: true } },
    },
  });

  return (
    <>
      <PageHeader
        eyebrow="Finance"
        title="Payments"
        description="Customer payments received and how they were applied to invoices."
        actions={
          <Link href="/admin/payments/new">
            <Button>
              <Plus className="h-4 w-4" />
              Record payment
            </Button>
          </Link>
        }
      />

      <Table>
        <THead>
          <TR>
            <TH>Reference</TH>
            <TH>Date</TH>
            <TH>Customer</TH>
            <TH>Method</TH>
            <TH className="text-right">Amount</TH>
            <TH className="text-right">Invoices applied</TH>
            <TH>Notes</TH>
          </TR>
        </THead>
        <TBody>
          {payments.length === 0 ? (
            <EmptyRow colSpan={7} message="No payments recorded yet." />
          ) : (
            payments.map((p) => (
              <TR key={p.id}>
                <TD className="font-mono text-xs text-ink">{p.reference}</TD>
                <TD className="text-ink-dim">{formatDate(p.receivedAt)}</TD>
                <TD>
                  <div className="text-platinum">{p.customer.name}</div>
                  <div className="font-mono text-xs text-ink-muted">{p.customer.code}</div>
                </TD>
                <TD className="text-ink-dim">{p.method}</TD>
                <TD className="text-right text-emerald-300">{formatMoney(Number(p.amount))}</TD>
                <TD className="text-right text-ink-dim">{p._count.applications}</TD>
                <TD className="text-ink-muted">{p.notes ?? "—"}</TD>
              </TR>
            ))
          )}
        </TBody>
      </Table>
    </>
  );
}
