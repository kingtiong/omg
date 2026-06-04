import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, THead, TBody, TR, TH, TD, EmptyRow } from "@/components/ui/table";
import { AddToCartButton } from "./add-to-cart";
import { formatMoney } from "@/lib/format";

export default async function BrowsePartsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const where = {
    active: true,
    ...(q
      ? {
          OR: [
            { sku: { contains: q, mode: "insensitive" as const } },
            { partNumber: { contains: q, mode: "insensitive" as const } },
            { name: { contains: q, mode: "insensitive" as const } },
            { barcode: { contains: q, mode: "insensitive" as const } },
            { crossReferences: { some: { partNumber: { contains: q, mode: "insensitive" as const } } } },
          ],
        }
      : {}),
  };

  const parts = await prisma.part.findMany({
    where,
    orderBy: { name: "asc" },
    take: 200,
    include: {
      brand: { select: { name: true } },
      category: { select: { name: true } },
      inventory: { select: { quantity: true, reserved: true } },
    },
  });

  return (
    <>
      <PageHeader
        eyebrow="Catalog"
        title="Browse parts"
        description="Search by SKU, part number, name, or cross-reference number."
      />

      <form className="mb-4 flex gap-3">
        <Input name="q" defaultValue={q} placeholder="e.g. brake pad, BR-1234, OEM 1234567…" className="max-w-xl" />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      <Table>
        <THead>
          <TR>
            <TH>SKU</TH>
            <TH>Part #</TH>
            <TH>Name</TH>
            <TH>Brand</TH>
            <TH className="text-right">Available</TH>
            <TH className="text-right">Price</TH>
            <TH className="text-right">Action</TH>
          </TR>
        </THead>
        <TBody>
          {parts.length === 0 ? (
            <EmptyRow colSpan={7} message="No parts match — try a different search." />
          ) : (
            parts.map((p) => {
              const available = p.inventory.reduce((a, i) => a + (i.quantity - i.reserved), 0);
              return (
                <TR key={p.id}>
                  <TD className="font-mono text-xs text-ink-dim">{p.sku}</TD>
                  <TD className="font-mono text-xs text-ink">{p.partNumber}</TD>
                  <TD className="text-platinum">{p.name}</TD>
                  <TD className="text-ink-dim">{p.brand?.name ?? "—"}</TD>
                  <TD className="text-right">
                    {available > 0 ? (
                      <span className="text-emerald-300">{available} in stock</span>
                    ) : (
                      <span className="text-amber-300">Out of stock</span>
                    )}
                  </TD>
                  <TD className="text-right text-platinum">{formatMoney(Number(p.sellPrice))}</TD>
                  <TD className="text-right">
                    <AddToCartButton
                      part={{
                        partId: p.id,
                        sku: p.sku,
                        partNumber: p.partNumber,
                        name: p.name,
                        unitPrice: Number(p.sellPrice),
                      }}
                      disabled={available <= 0}
                    />
                  </TD>
                </TR>
              );
            })
          )}
        </TBody>
      </Table>
    </>
  );
}
