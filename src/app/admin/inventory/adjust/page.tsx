import { prisma } from "@/lib/db";
import { PageHeader, Crumbs } from "@/components/ui/page-header";
import { AdjustForm } from "./_form";

export default async function AdjustStockPage({
  searchParams,
}: {
  searchParams: Promise<{ partId?: string }>;
}) {
  const { partId } = await searchParams;
  const [parts, locations, defaultPart] = await Promise.all([
    prisma.part.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, sku: true, partNumber: true, name: true },
      take: 1000,
    }),
    prisma.location.findMany({ orderBy: [{ isDefault: "desc" }, { code: "asc" }] }),
    partId
      ? prisma.part.findUnique({
          where: { id: partId },
          select: { id: true, sku: true, partNumber: true, name: true },
        })
      : null,
  ]);

  return (
    <>
      <Crumbs items={[{ href: "/admin/inventory", label: "Inventory" }, { label: "Adjust" }]} />
      <PageHeader
        eyebrow="Stock adjustment"
        title="Adjust stock"
        description="Correct on-hand quantities (e.g. after a stock-take). Each adjustment is recorded in the audit log."
      />
      <AdjustForm parts={parts} locations={locations} defaultPart={defaultPart ?? undefined} />
    </>
  );
}
