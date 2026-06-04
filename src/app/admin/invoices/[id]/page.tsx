import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader, Crumbs } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatMoney } from "@/lib/format";
import { Download } from "lucide-react";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      items: true,
      payments: { include: { payment: true } },
      salesOrder: { select: { number: true } },
    },
  });
  if (!invoice) notFound();

  const total = Number(invoice.total);
  const paid = Number(invoice.amountPaid);
  const outstanding = total - paid;
  const today = new Date();
  const isOverdue = (invoice.status === "UNPAID" || invoice.status === "PARTIAL") && invoice.dueDate < today;

  return (
    <>
      <Crumbs items={[{ href: "/admin/invoices", label: "Invoices" }, { label: invoice.number }]} />
      <PageHeader
        eyebrow={formatDate(invoice.issueDate)}
        title={invoice.number}
        description={`${invoice.customer.name} · ${invoice.customer.code}`}
        actions={
          <>
            <a href={`/api/invoices/${invoice.id}/pdf`} target="_blank" rel="noreferrer">
              <Button variant="outline">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </a>
            {outstanding > 0 && (
              <Link href={`/admin/payments/new?invoiceId=${invoice.id}`}>
                <Button>Record payment</Button>
              </Link>
            )}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Line items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>Description</TH>
                  <TH className="text-right">Qty</TH>
                  <TH className="text-right">Unit</TH>
                  <TH className="text-right">SST</TH>
                  <TH className="text-right">Line total</TH>
                </TR>
              </THead>
              <TBody>
                {invoice.items.map((it) => (
                  <TR key={it.id}>
                    <TD className="text-platinum">{it.description}</TD>
                    <TD className="text-right">{it.quantity}</TD>
                    <TD className="text-right text-ink-dim">{formatMoney(Number(it.unitPrice))}</TD>
                    <TD className="text-right text-ink-dim">{Number(it.sstRate).toFixed(2)}%</TD>
                    <TD className="text-right text-platinum">{formatMoney(Number(it.lineTotal))}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-dim">Status</span>
                {invoice.status === "PAID" ? (
                  <Badge variant="success">Paid</Badge>
                ) : isOverdue ? (
                  <Badge variant="danger">Overdue</Badge>
                ) : invoice.status === "PARTIAL" ? (
                  <Badge variant="gold">Partial</Badge>
                ) : invoice.status === "VOID" ? (
                  <Badge variant="neutral">Void</Badge>
                ) : (
                  <Badge variant="warning">Unpaid</Badge>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-ink-dim">Issued</span>
                <span className="text-platinum">{formatDate(invoice.issueDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-dim">Due</span>
                <span className={isOverdue ? "text-red-300" : "text-platinum"}>{formatDate(invoice.dueDate)}</span>
              </div>
              {invoice.salesOrder && (
                <div className="flex justify-between">
                  <span className="text-ink-dim">Sales order</span>
                  <span className="font-mono text-xs text-ink-dim">{invoice.salesOrder.number}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Totals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-dim">Subtotal</span>
                <span className="text-platinum">{formatMoney(Number(invoice.subtotal))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-dim">SST</span>
                <span className="text-platinum">{formatMoney(Number(invoice.taxTotal))}</span>
              </div>
              <div className="my-2 border-t border-line/50" />
              <div className="flex justify-between">
                <span className="text-ink-dim">Total</span>
                <span className="font-serif text-lg text-platinum">{formatMoney(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-dim">Paid</span>
                <span className="text-emerald-300">{formatMoney(paid)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-dim">Outstanding</span>
                <span className="font-serif text-lg text-platinum">{formatMoney(outstanding)}</span>
              </div>
            </CardContent>
          </Card>

          {invoice.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Payments applied</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <THead>
                    <TR>
                      <TH>Date</TH>
                      <TH>Reference</TH>
                      <TH>Method</TH>
                      <TH className="text-right">Amount</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {invoice.payments.map((pa) => (
                      <TR key={pa.id}>
                        <TD className="text-ink-dim">{formatDate(pa.payment.receivedAt)}</TD>
                        <TD className="font-mono text-xs text-ink">{pa.payment.reference}</TD>
                        <TD className="text-ink-dim">{pa.payment.method}</TD>
                        <TD className="text-right text-emerald-300">{formatMoney(Number(pa.amount))}</TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
