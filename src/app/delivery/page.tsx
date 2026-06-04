import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime } from "@/lib/format";
import type { DeliveryStatus } from "@prisma/client";

const variantFor: Record<DeliveryStatus, "neutral" | "warning" | "gold" | "success" | "danger"> = {
  PENDING: "warning",
  PICKING: "gold",
  READY: "gold",
  DISPATCHED: "gold",
  DELIVERED: "success",
  CANCELLED: "danger",
};

export default async function DeliveryListPage() {
  const [active, deliveredToday] = await Promise.all([
    prisma.delivery.findMany({
      where: { status: { in: ["PENDING", "PICKING", "READY", "DISPATCHED"] } },
      orderBy: { createdAt: "asc" },
      include: {
        salesOrder: {
          include: {
            customer: { select: { name: true, code: true, phone: true } },
            _count: { select: { items: true } },
          },
        },
      },
    }),
    prisma.delivery.findMany({
      where: {
        status: "DELIVERED",
        deliveredAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
      orderBy: { deliveredAt: "desc" },
      include: {
        salesOrder: {
          include: {
            customer: { select: { name: true, code: true } },
          },
        },
      },
    }),
  ]);

  return (
    <>
      <PageHeader eyebrow="Delivery" title="Today&apos;s pickups" />

      <div className="space-y-3">
        <h2 className="text-[11px] uppercase tracking-[0.4em] text-gold">Active</h2>
        {active.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-ink-muted">
              No active deliveries right now. Take a break ☕
            </CardContent>
          </Card>
        ) : (
          active.map((d) => (
            <Link key={d.id} href={`/delivery/${d.id}`}>
              <Card className="transition-all hover:-translate-y-0.5 hover:border-gold/40">
                <CardContent className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted">{d.number}</div>
                    <div className="mt-1 font-serif text-xl text-platinum">{d.salesOrder.customer.name}</div>
                    <div className="mt-1 text-xs text-ink-dim">
                      Order {d.salesOrder.number} · {d.salesOrder._count.items} item
                      {d.salesOrder._count.items === 1 ? "" : "s"}
                    </div>
                    {d.salesOrder.deliveryAddress && (
                      <div className="mt-2 whitespace-pre-line text-xs text-ink-muted">
                        {d.salesOrder.deliveryAddress}
                      </div>
                    )}
                    {d.salesOrder.customer.phone && (
                      <a
                        href={`tel:${d.salesOrder.customer.phone}`}
                        className="mt-2 inline-block text-xs text-gold hover:text-gold-bright"
                      >
                        ☎ {d.salesOrder.customer.phone}
                      </a>
                    )}
                  </div>
                  <Badge variant={variantFor[d.status]}>{d.status}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      {deliveredToday.length > 0 && (
        <div className="mt-8 space-y-3">
          <h2 className="text-[11px] uppercase tracking-[0.4em] text-gold">Delivered today</h2>
          {deliveredToday.map((d) => (
            <Card key={d.id}>
              <CardContent className="flex items-center justify-between text-sm">
                <div>
                  <div className="text-platinum">{d.salesOrder.customer.name}</div>
                  <div className="text-xs text-ink-muted">
                    {d.number} · {d.deliveredAt ? formatDateTime(d.deliveredAt) : formatDate(d.updatedAt)}
                  </div>
                </div>
                <Badge variant="success">Delivered</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
