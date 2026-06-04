import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, THead, TBody, TR, TH, TD, EmptyRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload } from "lucide-react";
import { formatMoney } from "@/lib/format";

export default async function PartsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const where = q
    ? {
        OR: [
          { sku: { contains: q, mode: "insensitive" as const } },
          { partNumber: { contains: q, mode: "insensitive" as const } },
          { name: { contains: q, mode: "insensitive" as const } },
          { barcode: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const parts = await prisma.part.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      category: { select: { name: true } },
      brand: { select: { name: true } },
      inventory: { select: { quantity: true } },
    },
  });
  const totalParts = await prisma.part.count();

  return (
    <>
      <PageHeader
        eyebrow="Master Data"
        title="Parts catalog"
        description={`${totalParts.toLocaleString()} SKUs across your inventory.`}
        actions={
          <>
            <Link href="/admin/parts/import">
              <Button variant="outline">
                <Upload className="h-4 w-4" />
                Import CSV
              </Button>
            </Link>
            <Link href="/admin/parts/new">
              <Button>
                <Plus className="h-4 w-4" />
                New part
              </Button>
            </Link>
          </>
        }
      />

      <form className="mb-4 flex gap-3">
        <Input name="q" defaultValue={q} placeholder="Search SKU, part number, name, barcode…" className="max-w-xl" />
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
            <TH>Category</TH>
            <TH className="text-right">Cost</TH>
            <TH className="text-right">Sell</TH>
            <TH className="text-right">Stock</TH>
            <TH>Status</TH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {parts.length === 0 ? (
            <EmptyRow colSpan={10} message={q ? "No parts match your search." : "No parts yet — add one or import a CSV."} />
          ) : (
            parts.map((p) => {
              const stock = p.inventory.reduce((a, i) => a + i.quantity, 0);
              const lowStock = p.minStock > 0 && stock < p.minStock;
              return (
                <TR key={p.id}>
                  <TD className="font-mono text-xs text-ink-dim">{p.sku}</TD>
                  <TD className="font-mono text-xs text-ink">{p.partNumber}</TD>
                  <TD className="text-platinum">{p.name}</TD>
                  <TD className="text-ink-dim">{p.brand?.name ?? "—"}</TD>
                  <TD className="text-ink-dim">{p.category?.name ?? "—"}</TD>
                  <TD className="text-right text-ink-dim">{formatMoney(Number(p.costPrice))}</TD>
                  <TD className="text-right text-platinum">{formatMoney(Number(p.sellPrice))}</TD>
                  <TD className="text-right">
                    {lowStock ? (
                      <span className="text-amber-300">{stock}</span>
                    ) : (
                      <span className="text-ink">{stock}</span>
                    )}
                  </TD>
                  <TD>{p.active ? <Badge variant="success">Active</Badge> : <Badge variant="neutral">Inactive</Badge>}</TD>
                  <TD className="text-right">
                    <Link href={`/admin/parts/${p.id}`} className="text-xs uppercase tracking-wider text-gold hover:text-gold-bright">
                      Edit
                    </Link>
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
