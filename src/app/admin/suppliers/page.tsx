import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, THead, TBody, TR, TH, TD, EmptyRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { code: { contains: q, mode: "insensitive" as const } },
          { email: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};
  const suppliers = await prisma.supplier.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <>
      <PageHeader
        eyebrow="Master Data"
        title="Suppliers"
        description="The vendors you buy spare parts from."
        actions={
          <Link href="/admin/suppliers/new">
            <Button>
              <Plus className="h-4 w-4" />
              New supplier
            </Button>
          </Link>
        }
      />

      <form className="mb-4 flex gap-3">
        <Input name="q" defaultValue={q} placeholder="Search by name, code, or email…" className="max-w-md" />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      <Table>
        <THead>
          <TR>
            <TH>Code</TH>
            <TH>Name</TH>
            <TH>Contact</TH>
            <TH>Phone</TH>
            <TH>Terms</TH>
            <TH>Status</TH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {suppliers.length === 0 ? (
            <EmptyRow colSpan={7} message={q ? "No suppliers match your search." : "No suppliers yet — add your first."} />
          ) : (
            suppliers.map((s) => (
              <TR key={s.id}>
                <TD className="font-mono text-xs text-ink-dim">{s.code}</TD>
                <TD className="text-platinum">{s.name}</TD>
                <TD className="text-ink-dim">{s.contactName ?? "—"}</TD>
                <TD className="text-ink-dim">{s.phone ?? "—"}</TD>
                <TD className="text-ink-dim">NET {s.paymentTermsDays}</TD>
                <TD>
                  {s.active ? <Badge variant="success">Active</Badge> : <Badge variant="neutral">Inactive</Badge>}
                </TD>
                <TD className="text-right">
                  <Link href={`/admin/suppliers/${s.id}`} className="text-xs uppercase tracking-wider text-gold hover:text-gold-bright">
                    Edit
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
