import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
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

export default async function OrdersListPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.customerId) return null;
  const orders = await prisma.salesOrder.findMany({
    where: { customerId: session.user.customerId },
    orderBy: { orderDate: "desc" },
    take: 100,
    include: { _count: { select: { items: true } } },
  });

  return (
    <>
      <PageHeader eyebrow="History" title="My orders" />
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
          {orders.length === 0 ? (
            <EmptyRow colSpan={6} message="No orders yet." />
          ) : (
            orders.map((o) => (
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
