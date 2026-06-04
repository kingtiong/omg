import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, THead, TBody, TR, TH, TD, EmptyRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatMoney } from "@/lib/format";
import type { InvoiceStatus } from "@prisma/client";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: InvoiceStatus | "OVERDUE" | "" }>;
}) {
  const { q, status } = await searchParams;
  const today = new Date();

  let where: Record<string, unknown> = {};
  if (status === "OVERDUE") {
    where = { status: { in: ["UNPAID", "PARTIAL"] }, dueDate: { lt: today } };
  } else if (status) {
    where = { status };
  }
  if (q) {
    where = {
      ...where,
      OR: [
        { number: { contains: q, mode: "insensitive" } },
        { customer: { name: { contains: q, mode: "insensitive" } } },
        { customer: { code: { contains: q, mode: "insensitive" } } },
      ],
    };
  }

  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: { dueDate: "asc" },
    take: 200,
    include: { customer: { select: { name: true, code: true } } },
  });

  return (
    <>
      <PageHeader
        eyebrow="Finance"
        title="Invoices"
        description="Issued invoices, payment status, and due dates."
      />

      <form className="mb-4 flex flex-wrap gap-3">
        <Input name="q" defaultValue={q} placeholder="Search invoice number or customer…" className="max-w-md" />
        <Select name="status" defaultValue={status ?? ""} className="max-w-xs">
          <option value="">All</option>
          <option value="UNPAID">Unpaid</option>
          <option value="PARTIAL">Partial</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue (unpaid past due)</option>
          <option value="VOID">Void</option>
        </Select>
        <Button type="submit" variant="outline">
          Apply
        </Button>
      </form>

      <Table>
        <THead>
          <TR>
            <TH>Number</TH>
            <TH>Issued</TH>
            <TH>Due</TH>
            <TH>Customer</TH>
            <TH className="text-right">Total</TH>
            <TH className="text-right">Paid</TH>
            <TH className="text-right">Outstanding</TH>
            <TH>Status</TH>
            <TH className="text-right">Open</TH>
          </TR>
        </THead>
        <TBody>
          {invoices.length === 0 ? (
            <EmptyRow colSpan={9} message="No invoices match." />
          ) : (
            invoices.map((inv) => {
              const total = Number(inv.total);
              const paid = Number(inv.amountPaid);
              const outstanding = total - paid;
              const isOverdue = (inv.status === "UNPAID" || inv.status === "PARTIAL") && inv.dueDate < today;
              return (
                <TR key={inv.id}>
                  <TD className="font-mono text-xs text-ink">{inv.number}</TD>
                  <TD className="text-ink-dim">{formatDate(inv.issueDate)}</TD>
                  <TD className={isOverdue ? "text-red-300" : "text-ink-dim"}>{formatDate(inv.dueDate)}</TD>
                  <TD>
                    <div className="text-platinum">{inv.customer.name}</div>
                    <div className="font-mono text-xs text-ink-muted">{inv.customer.code}</div>
                  </TD>
                  <TD className="text-right text-platinum">{formatMoney(total)}</TD>
                  <TD className="text-right text-emerald-300">{formatMoney(paid)}</TD>
                  <TD className="text-right text-platinum">{formatMoney(outstanding)}</TD>
                  <TD>
                    {inv.status === "PAID" ? (
                      <Badge variant="success">Paid</Badge>
                    ) : isOverdue ? (
                      <Badge variant="danger">Overdue</Badge>
                    ) : inv.status === "PARTIAL" ? (
                      <Badge variant="gold">Partial</Badge>
                    ) : inv.status === "VOID" ? (
                      <Badge variant="neutral">Void</Badge>
                    ) : (
                      <Badge variant="warning">Unpaid</Badge>
                    )}
                  </TD>
                  <TD className="text-right">
                    <Link href={`/admin/invoices/${inv.id}`} className="text-xs uppercase tracking-wider text-gold hover:text-gold-bright">
                      Open
                    </Link>
                  </TD>
                </TR>
              );
            })
          )}
        </TBody>
      </Table>
    </>
  );
}
