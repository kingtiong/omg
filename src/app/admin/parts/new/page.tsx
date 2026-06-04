import { prisma } from "@/lib/db";
import { PageHeader, Crumbs } from "@/components/ui/page-header";
import { PartForm } from "../_form";
import { createPart } from "../actions";

export default async function NewPartPage() {
  const [categories, brands, suppliers] = await Promise.all([
    prisma.partCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, code: true, name: true } }),
  ]);

  return (
    <>
      <Crumbs items={[{ href: "/admin/parts", label: "Parts catalog" }, { label: "New" }]} />
      <PageHeader eyebrow="New" title="Add part" description="Add a single SKU. For bulk uploads, use Import CSV." />
      <PartForm categories={categories} brands={brands} suppliers={suppliers} action={createPart} submitLabel="Create part" />
    </>
  );
}
