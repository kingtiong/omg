import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader, Crumbs } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime } from "@/lib/format";
import { DeliveryActions } from "./actions-form";
import type { DeliveryStatus } from "@prisma/client";

const variantFor: Record<DeliveryStatus, "neutral" | "warning" | "gold" | "success" | "danger"> = {
  PENDING: "warning",
  PICKING: "gold",
  READY: "gold",
  DISPATCHED: "gold",
  DELIVERED: "success",
  CANCELLED: "danger",
};

export default async function DeliveryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const delivery = await prisma.delivery.findUnique({
    where: { id },
    include: {
      salesOrder: {
        include: {
          customer: true,
          items: { include: { part: { select: { sku: true, partNumber: true, name: true } } } },
        },
      },
      pickedBy: { select: { name: true } },
    },
  });
  if (!delivery) notFound();

  return (
    <>
      <Crumbs items={[{ href: "/delivery", label: "Today" }, { label: delivery.number }]} />
      <PageHeader
        eyebrow={delivery.number}
        title={delivery.salesOrder.customer.name}
        actions={<Badge variant={variantFor[delivery.status]}>{delivery.status}</Badge>}
      />

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Pick list — Order {delivery.salesOrder.number}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-line/40">
            {delivery.salesOrder.items.map((it) => (
              <li key={it.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <div className="font-mono text-xs text-ink-muted">
                    {it.part.sku} · {it.part.partNumber}
                  </div>
                  <div className="text-platinum">{it.part.name}</div>
                </div>
                <div className="rounded-sm border border-gold/40 bg-gold/10 px-3 py-1.5 font-serif text-xl text-gold-bright">
                  ×{it.quantity}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {delivery.salesOrder.deliveryAddress && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Deliver to</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-ink-dim">{delivery.salesOrder.deliveryAddress}</p>
            {delivery.salesOrder.customer.phone && (
              <a
                href={`tel:${delivery.salesOrder.customer.phone}`}
                className="mt-3 inline-block text-sm text-gold hover:text-gold-bright"
              >
                ☎ Call {delivery.salesOrder.customer.phone}
              </a>
            )}
          </CardContent>
        </Card>
      )}

      <DeliveryActions deliveryId={delivery.id} status={delivery.status} />

      {delivery.status === "DELIVERED" && (
        <Card className="mt-4">
          <CardContent className="text-sm">
            <div className="mb-1 text-ink-muted">
              Delivered {delivery.deliveredAt ? formatDateTime(delivery.deliveredAt) : ""}
              {delivery.pickedBy?.name ? ` · by ${delivery.pickedBy.name}` : ""}
            </div>
            {delivery.recipient && <div className="text-ink-dim">Received by {delivery.recipient}</div>}
            {delivery.notes && <div className="mt-1 text-ink-muted">Note: {delivery.notes}</div>}
          </CardContent>
        </Card>
      )}
    </>
  );
}
