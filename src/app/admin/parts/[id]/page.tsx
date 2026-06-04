import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader, Crumbs } from "@/components/ui/page-header";
import { PartForm } from "../_form";
import { updatePart } from "../actions";

export default async function EditPartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [part, categories, brands, suppliers] = await Promise.all([
    prisma.part.findUnique({ where: { id } }),
    prisma.partCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, code: true, name: true } }),
  ]);
  if (!part) notFound();

  const action = updatePart.bind(null, id);

  return (
    <>
      <Crumbs items={[{ href: "/admin/parts", label: "Parts catalog" }, { label: part.name }]} />
      <PageHeader eyebrow="Edit" title={part.name} description={`SKU ${part.sku} · Part # ${part.partNumber}`} />
      <PartForm
        categories={categories}
        brands={brands}
        suppliers={suppliers}
        defaults={{
          sku: part.sku,
          partNumber: part.partNumber,
          name: part.name,
          description: part.description,
          barcode: part.barcode,
          categoryId: part.categoryId,
          brandId: part.brandId,
          primarySupplierId: part.primarySupplierId,
          costPrice: Number(part.costPrice),
          sellPrice: Number(part.sellPrice),
          minStock: part.minStock,
          reorderQty: part.reorderQty,
          leadTimeDays: part.leadTimeDays,
          sstRate: part.sstRate ? Number(part.sstRate) : null,
          active: part.active,
        }}
        action={action}
        submitLabel="Save changes"
      />
    </>
  );
}
