import { prisma } from "@/lib/db";
import { PageHeader, Crumbs } from "@/components/ui/page-header";
import { NewPurchaseOrderForm } from "./_form";

export default async function NewPurchaseOrderPage() {
  const [suppliers, parts] = await Promise.all([
    prisma.supplier.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, code: true, name: true },
    }),
    prisma.part.findMany({
      where: { active: true },
      orderBy: { partNumber: "asc" },
      select: { id: true, sku: true, partNumber: true, name: true, costPrice: true },
    }),
  ]);

  return (
    <>
      <Crumbs items={[{ href: "/admin/purchase-orders", label: "Purchase orders" }, { label: "New" }]} />
      <PageHeader
        eyebrow="New"
        title="Create purchase order"
        description="Draft a PO for a supplier. You can send it once the lines look right."
      />
      <NewPurchaseOrderForm
        suppliers={suppliers}
        parts={parts.map((p) => ({ ...p, costPrice: Number(p.costPrice) }))}
      />
    </>
  );
}
