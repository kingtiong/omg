import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, THead, TBody, TR, TH, TD, EmptyRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; locationId?: string; lowStock?: string }>;
}) {
  const { q, locationId, lowStock } = await searchParams;

  const [locations, parts] = await Promise.all([
    prisma.location.findMany({ orderBy: { code: "asc" } }),
    prisma.part.findMany({
      where: q
        ? {
            active: true,
            OR: [
              { sku: { contains: q, mode: "insensitive" } },
              { partNumber: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
            ],
          }
        : { active: true },
      orderBy: { name: "asc" },
      take: 200,
      include: {
        inventory: locationId ? { where: { locationId } } : true,
      },
    }),
  ]);

  const rows = parts
    .map((p) => {
      const totalStock = p.inventory.reduce((a, i) => a + i.quantity, 0);
      const reserved = p.inventory.reduce((a, i) => a + i.reserved, 0);
      const available = totalStock - reserved;
      const low = p.minStock > 0 && totalStock < p.minStock;
      return { part: p, totalStock, reserved, available, low };
    })
    .filter((r) => (lowStock === "1" ? r.low : true));

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Inventory"
        description="Live stock-on-hand across all locations. Yellow rows are below their minimum-stock threshold."
        actions={
          <Link href="/admin/inventory/adjust">
            <Button variant="outline">
              <ArrowUpDown className="h-4 w-4" />
              Adjust stock
            </Button>
          </Link>
        }
      />

      <form className="mb-4 flex flex-wrap gap-3">
        <Input name="q" defaultValue={q} placeholder="Search SKU, part number, name…" className="max-w-md" />
        <Select name="locationId" defaultValue={locationId ?? ""} className="max-w-xs">
          <option value="">All locations</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.code} · {l.name}
            </option>
          ))}
        </Select>
        <label className="flex items-center gap-2 text-sm text-ink-dim">
          <input
            type="checkbox"
            name="lowStock"
            value="1"
            defaultChecked={lowStock === "1"}
            className="h-4 w-4 accent-gold"
          />
          Low stock only
        </label>
        <Button type="submit" variant="outline">
          Apply
        </Button>
      </form>

      <Table>
        <THead>
          <TR>
            <TH>SKU</TH>
            <TH>Part #</TH>
            <TH>Name</TH>
            <TH className="text-right">On hand</TH>
            <TH className="text-right">Reserved</TH>
            <TH className="text-right">Available</TH>
            <TH className="text-right">Min</TH>
            <TH>Status</TH>
            <TH className="text-right">Adjust</TH>
          </TR>
        </THead>
        <TBody>
          {rows.length === 0 ? (
            <EmptyRow colSpan={9} message="No parts match." />
          ) : (
            rows.map(({ part, totalStock, reserved, available, low }) => (
              <TR key={part.id} className={low ? "bg-amber-500/[0.03]" : undefined}>
                <TD className="font-mono text-xs text-ink-dim">{part.sku}</TD>
                <TD className="font-mono text-xs text-ink">{part.partNumber}</TD>
                <TD className="text-platinum">{part.name}</TD>
                <TD className="text-right">{totalStock}</TD>
                <TD className="text-right text-ink-dim">{reserved}</TD>
                <TD className="text-right text-platinum">{available}</TD>
                <TD className="text-right text-ink-dim">{part.minStock}</TD>
                <TD>{low ? <Badge variant="warning">Low</Badge> : <Badge variant="success">OK</Badge>}</TD>
                <TD className="text-right">
                  <Link
                    href={`/admin/inventory/adjust?partId=${part.id}`}
                    className="text-xs uppercase tracking-wider text-gold hover:text-gold-bright"
                  >
                    Adjust
                  </Link>
                </TD>
              </TR>
            ))
          )}
        </TBody>
      </Table>
    </>
  );
}
