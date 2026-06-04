import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Truck, Users, Package, Boxes, ClipboardList, Receipt } from "lucide-react";

export default async function AdminDashboard() {
  const [supplierCount, customerCount, partCount, salesOrderCount, unpaidInvoiceCount, lowStockCount] = await Promise.all([
    prisma.supplier.count({ where: { active: true } }),
    prisma.customer.count({ where: { active: true } }),
    prisma.part.count({ where: { active: true } }),
    prisma.salesOrder.count({ where: { status: { in: ["PENDING", "CONFIRMED", "PICKING"] } } }),
    prisma.invoice.count({ where: { status: { in: ["UNPAID", "PARTIAL", "OVERDUE"] } } }),
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM "Part" p
      WHERE p.active = true
        AND p."minStock" > 0
        AND COALESCE((SELECT SUM(quantity) FROM "Inventory" WHERE "partId" = p.id), 0) < p."minStock"
    `.then((r) => Number(r[0]?.count ?? 0)),
  ]);

  const tiles: Array<{ label: string; value: number | string; href: string; icon: React.ComponentType<{ className?: string }> }> = [
    { label: "Active Suppliers", value: supplierCount, href: "/admin/suppliers", icon: Truck },
    { label: "Active Customers", value: customerCount, href: "/admin/customers", icon: Users },
    { label: "Active Parts (SKUs)", value: partCount, href: "/admin/parts", icon: Package },
    { label: "Open Sales Orders", value: salesOrderCount, href: "/admin/sales-orders", icon: ClipboardList },
    { label: "Unpaid Invoices", value: unpaidInvoiceCount, href: "/admin/invoices", icon: Receipt },
    { label: "Low-Stock Parts", value: lowStockCount, href: "/admin/inventory", icon: Boxes },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="OMG Operations"
        description="Live overview of your spare-parts business. Click any tile for the underlying detail."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <Link key={t.label} href={t.href}>
              <Card className="group cursor-pointer transition-all hover:-translate-y-0.5 hover:border-gold/40">
                <CardContent className="flex items-center gap-5">
                  <div className="rounded-sm border border-line bg-bg2/50 p-3 transition-colors group-hover:border-gold/40 group-hover:bg-gold/10">
                    <Icon className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">{t.label}</div>
                    <div className="mt-1 font-serif text-3xl text-platinum">{t.value}</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}
