import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader, Crumbs } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { OrderActions } from "./actions-form";
import type { SalesOrderStatus } from "@prisma/client";

const statusVariant: Record<SalesOrderStatus, "neutral" | "warning" | "gold" | "success" | "danger"> = {
  PENDING: "warning",
  CONFIRMED: "gold",
  PICKING: "gold",
  DISPATCHED: "gold",
  DELIVERED: "success",
  CANCELLED: "danger",
};

export default async function AdminSalesOrderDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ confirmed?: string }>;
}) {
  const { id } = await params;
  const { confirmed } = await searchParams;
  const order = await prisma.salesOrder.findUnique({
    where: { id },
    include: {
      items: { include: { part: { select: { sku: true, partNumber: true, name: true } } } },
      customer: true,
      delivery: true,
      invoice: true,
      createdBy: { select: { name: true, email: true } },
    },
  });
  if (!order) notFound();

  return (
    <>
      <Crumbs items={[{ href: "/admin/sales-orders", label: "Sales orders" }, { label: order.number }]} />
      <PageHeader
        eyebrow={formatDate(order.orderDate)}
        title={order.number}
        description={`${order.customer.name} (${order.customer.code})`}
        actions={<Badge variant={statusVariant[order.status]}>{order.status}</Badge>}
      />

      {confirmed === "1" && (
        <div className="mb-6 rounded-sm border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          Order confirmed. Stock reserved, invoice {order.invoice?.number} generated, delivery {order.delivery?.number} created.
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
                  <TH className="text-right">Cost</TH>
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
                    <TD className="text-right text-ink-muted">{formatMoney(Number(it.unitCost))}</TD>
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
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="Subtotal" value={formatMoney(Number(order.subtotal))} />
              <Row label="SST" value={formatMoney(Number(order.taxTotal))} />
              <div className="my-2 border-t border-line/50" />
              <Row label="Total" value={formatMoney(Number(order.total))} bold />
              <div className="text-xs text-ink-muted">
                Created by {order.createdBy?.name ?? "—"} · {formatDateTime(order.createdAt)}
              </div>
            </CardContent>
          </Card>

          {order.deliveryAddress && (
            <Card>
              <CardHeader>
                <CardTitle>Delivery to</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-sm text-ink-dim">{order.deliveryAddress}</p>
              </CardContent>
            </Card>
          )}

          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Customer notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-sm text-ink-dim">{order.notes}</p>
              </CardContent>
            </Card>
          )}

          {order.status === "PENDING" && <OrderActions orderId={order.id} />}

          {(order.invoice || order.delivery) && (
            <Card>
              <CardHeader>
                <CardTitle>Linked records</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {order.invoice && (
                  <div>
                    <div className="uppercase tracking-wider text-ink-muted">Invoice</div>
                    <div className="text-ink-dim">{order.invoice.number} · {order.invoice.status}</div>
                    <div className="text-xs text-ink-muted">Due {formatDate(order.invoice.dueDate)}</div>
                  </div>
                )}
                {order.delivery && (
                  <div>
                    <div className="uppercase tracking-wider text-ink-muted">Delivery</div>
                    <div className="text-ink-dim">{order.delivery.number} · {order.delivery.status}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
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
