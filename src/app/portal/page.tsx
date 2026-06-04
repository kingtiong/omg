import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD, EmptyRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatMoney } from "@/lib/format";
import type { SalesOrderStatus } from "@prisma/client";

const statusVariant: Record<SalesOrderStatus, "neutral" | "warning" | "gold" | "success" | "danger"> = {
  PENDING: "warning",
  CONFIRMED: "gold",
  PICKING: "gold",
  DISPATCHED: "gold",
  DELIVERED: "success",
  CANCELLED: "danger",
};

export default async function PortalDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.customerId) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-ink-dim">
          Your account isn&apos;t linked to a customer record yet. Ask your OMG admin to fix this.
        </CardContent>
      </Card>
    );
  }
  const customerId = session.user.customerId;

  const [openOrders, recentOrders, customer, openInvoiceCount] = await Promise.all([
    prisma.salesOrder.count({
      where: { customerId, status: { in: ["PENDING", "CONFIRMED", "PICKING", "DISPATCHED"] } },
    }),
    prisma.salesOrder.findMany({
      where: { customerId },
      orderBy: { orderDate: "desc" },
      take: 8,
      include: { _count: { select: { items: true } } },
    }),
    prisma.customer.findUnique({ where: { id: customerId } }),
    prisma.invoice.count({ where: { customerId, status: { in: ["UNPAID", "PARTIAL", "OVERDUE"] } } }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow={customer?.code}
        title={`Hello, ${customer?.name ?? session.user.name ?? "team"}`}
        description="Browse parts, place orders, and track deliveries."
      />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">Open orders</div>
            <div className="mt-1 font-serif text-3xl text-platinum">{openOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">Outstanding invoices</div>
            <div className="mt-1 font-serif text-3xl text-platinum">{openInvoiceCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">Payment terms</div>
            <div className="mt-1 font-serif text-3xl text-platinum">NET {customer?.paymentTermsDays ?? 30}</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="mb-3 text-xs uppercase tracking-[0.4em] text-gold">Recent orders</h2>
      <Table>
        <THead>
          <TR>
            <TH>Number</TH>
            <TH>Date</TH>
            <TH>Items</TH>
            <TH className="text-right">Total</TH>
            <TH>Status</TH>
            <TH className="text-right">Detail</TH>
          </TR>
        </THead>
        <TBody>
          {recentOrders.length === 0 ? (
            <EmptyRow colSpan={6} message="No orders yet — start at Browse Parts." />
          ) : (
            recentOrders.map((o) => (
              <TR key={o.id}>
                <TD className="font-mono text-xs text-ink">{o.number}</TD>
                <TD className="text-ink-dim">{formatDate(o.orderDate)}</TD>
                <TD className="text-ink-dim">{o._count.items}</TD>
                <TD className="text-right text-platinum">{formatMoney(Number(o.total))}</TD>
                <TD>
                  <Badge variant={statusVariant[o.status]}>{o.status}</Badge>
                </TD>
                <TD className="text-right">
                  <Link href={`/portal/orders/${o.id}`} className="text-xs uppercase tracking-wider text-gold hover:text-gold-bright">
                    View
                  </Link>
                </TD>
              </TR>
            ))
          )}
        </TBody>
      </Table>
    </>
  );
}
