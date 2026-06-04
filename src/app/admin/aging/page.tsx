import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD, EmptyRow } from "@/components/ui/table";
import { formatDate, formatMoney } from "@/lib/format";
import { bucketForDueDate, bucketLabels, type AgingBucket } from "@/lib/aging";

export default async function AgingPage() {
  const today = new Date();
  const invoices = await prisma.invoice.findMany({
    where: { status: { in: ["UNPAID", "PARTIAL"] } },
    orderBy: { dueDate: "asc" },
    include: { customer: { select: { name: true, code: true } } },
  });

  const totals: Record<AgingBucket, number> = {
    current: 0,
    due0_30: 0,
    due31_60: 0,
    due61_90: 0,
    due90plus: 0,
  };
  const byBucket: Record<AgingBucket, typeof invoices> = {
    current: [],
    due0_30: [],
    due31_60: [],
    due61_90: [],
    due90plus: [],
  };
  let grandTotal = 0;

  for (const inv of invoices) {
    const out = Number(inv.total) - Number(inv.amountPaid);
    if (out <= 0) continue;
    const bucket = bucketForDueDate(inv.dueDate, today);
    totals[bucket] += out;
    byBucket[bucket].push(inv);
    grandTotal += out;
  }

  const buckets: AgingBucket[] = ["current", "due0_30", "due31_60", "due61_90", "due90plus"];

  return (
    <>
      <PageHeader
        eyebrow="Finance"
        title="Aging report"
        description="Outstanding invoices grouped by how overdue they are. The 90+ bucket is where collection effort matters most."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        {buckets.map((b) => (
          <Card key={b}>
            <CardContent>
              <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted">{bucketLabels[b]}</div>
              <div className={`mt-1 font-serif text-2xl ${b === "due90plus" ? "text-red-300" : b === "due61_90" ? "text-amber-300" : "text-platinum"}`}>
                {formatMoney(totals[b])}
              </div>
              <div className="text-[10px] text-ink-muted">{byBucket[b].length} invoice{byBucket[b].length === 1 ? "" : "s"}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <CardContent className="flex items-center justify-between text-sm">
          <span className="text-ink-dim">Total outstanding</span>
          <span className="font-serif text-2xl text-platinum">{formatMoney(grandTotal)}</span>
        </CardContent>
      </Card>

      {buckets.map((b) =>
        byBucket[b].length === 0 ? null : (
          <div key={b} className="mt-8">
            <h2 className="mb-3 text-xs uppercase tracking-[0.4em] text-gold">{bucketLabels[b]}</h2>
            <Table>
              <THead>
                <TR>
                  <TH>Invoice</TH>
                  <TH>Customer</TH>
                  <TH>Due</TH>
                  <TH className="text-right">Total</TH>
                  <TH className="text-right">Outstanding</TH>
                </TR>
              </THead>
              <TBody>
                {byBucket[b].length === 0 ? (
                  <EmptyRow colSpan={5} message="—" />
                ) : (
                  byBucket[b].map((inv) => {
                    const out = Number(inv.total) - Number(inv.amountPaid);
                    return (
                      <TR key={inv.id}>
                        <TD>
                          <Link href={`/admin/invoices/${inv.id}`} className="font-mono text-xs text-gold hover:text-gold-bright">
                            {inv.number}
                          </Link>
                        </TD>
                        <TD>
                          <div className="text-platinum">{inv.customer.name}</div>
                          <div className="font-mono text-xs text-ink-muted">{inv.customer.code}</div>
                        </TD>
                        <TD className="text-ink-dim">{formatDate(inv.dueDate)}</TD>
                        <TD className="text-right text-ink-dim">{formatMoney(Number(inv.total))}</TD>
                        <TD className="text-right text-platinum">{formatMoney(out)}</TD>
                      </TR>
                    );
                  })
                )}
              </TBody>
            </Table>
          </div>
        )
      )}
    </>
  );
}
