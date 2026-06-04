import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader, Crumbs } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import type { SalesOrderStatus } from "@prisma/client";

const statusVariant: Record<SalesOrderStatus, "neutral" | "warning" | "gold" | "success" | "danger"> = {
  PENDING: "warning",
  CONFIRMED: "gold",
  PICKING: "gold",
  DISPATCHED: "gold",
  DELIVERED: "success",
  CANCELLED: "danger",
};

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const { id } = await params;
  const { placed } = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session?.user?.customerId) return null;

  const order = await prisma.salesOrder.findFirst({
    where: { id, customerId: session.user.customerId },
    include: {
      items: { include: { part: { select: { sku: true, partNumber: true, name: true } } } },
      delivery: true,
      invoice: true,
    },
  });
  if (!order) notFound();

  return (
    <>
      <Crumbs items={[{ href: "/portal/orders", label: "My orders" }, { label: order.number }]} />
      <PageHeader
        eyebrow={formatDate(order.orderDate)}
        title={order.number}
        actions={<Badge variant={statusVariant[order.status]}>{order.status}</Badge>}
      />

      {placed === "1" && (
        <div className="mb-6 rounded-sm border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          Order placed. OMG will confirm shortly and you&apos;ll see status updates here.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>Part</TH>
                  <TH className="text-right">Qty</TH>
                  <TH className="text-right">Unit</TH>
                  <TH className="text-right">Line total</TH>
                </TR>
              </THead>
              <TBody>
                {order.items.map((it) => (
                  <TR key={it.id}>
                    <TD>
                      <div className="text-platinum">{it.part.name}</div>
                      <div className="font-mono text-xs text-ink-muted">
                        {it.part.sku} · {it.part.partNumber}
                      </div>
                    </TD>
                    <TD className="text-right">{it.quantity}</TD>
                    <TD className="text-right text-ink-dim">{formatMoney(Number(it.unitPrice))}</TD>
                    <TD className="text-right text-platinum">{formatMoney(Number(it.lineTotal))}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Subtotal" value={formatMoney(Number(order.subtotal))} />
            <Row label="SST" value={formatMoney(Number(order.taxTotal))} />
            <div className="my-2 border-t border-line/50" />
            <Row label="Total" value={formatMoney(Number(order.total))} bold />

            <div className="mt-5 space-y-2 text-xs">
              {order.deliveryAddress && (
                <div>
                  <div className="uppercase tracking-wider text-ink-muted">Delivery to</div>
                  <div className="whitespace-pre-line text-ink-dim">{order.deliveryAddress}</div>
                </div>
              )}
              {order.notes && (
                <div>
                  <div className="uppercase tracking-wider text-ink-muted">Notes</div>
                  <div className="text-ink-dim">{order.notes}</div>
                </div>
              )}
              {order.delivery && (
                <div className="rounded-sm border border-line bg-bg2/40 p-3">
                  <div className="uppercase tracking-wider text-ink-muted">Delivery</div>
                  <div className="text-ink-dim">{order.delivery.number} · {order.delivery.status}</div>
                  {order.delivery.dispatchedAt && (
                    <div className="text-xs text-ink-muted">
                      Dispatched {formatDateTime(order.delivery.dispatchedAt)}
                    </div>
                  )}
                </div>
              )}
              {order.invoice && (
                <div className="rounded-sm border border-line bg-bg2/40 p-3">
                  <div className="uppercase tracking-wider text-ink-muted">Invoice</div>
                  <div className="text-ink-dim">{order.invoice.number} · {order.invoice.status}</div>
                  <div className="text-xs text-ink-muted">Due {formatDate(order.invoice.dueDate)}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-dim">{label}</span>
      <span className={bold ? "font-serif text-lg text-platinum" : "text-platinum"}>{value}</span>
    </div>
  );
}
