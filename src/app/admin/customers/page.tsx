import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, THead, TBody, TR, TH, TD, EmptyRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { formatMoney } from "@/lib/format";

export default async function CustomersPage({
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
  const customers = await prisma.customer.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <>
      <PageHeader
        eyebrow="Master Data"
        title="Customers"
        description="The car service centres you sell to."
        actions={
          <Link href="/admin/customers/new">
            <Button>
              <Plus className="h-4 w-4" />
              New customer
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
            <TH>Service centre</TH>
            <TH>Contact</TH>
            <TH>Phone</TH>
            <TH>Terms</TH>
            <TH>Credit limit</TH>
            <TH>Status</TH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {customers.length === 0 ? (
            <EmptyRow colSpan={8} message={q ? "No customers match your search." : "No customers yet — add your first."} />
          ) : (
            customers.map((c) => (
              <TR key={c.id}>
                <TD className="font-mono text-xs text-ink-dim">{c.code}</TD>
                <TD className="text-platinum">{c.name}</TD>
                <TD className="text-ink-dim">{c.contactName ?? "—"}</TD>
                <TD className="text-ink-dim">{c.phone ?? "—"}</TD>
                <TD className="text-ink-dim">NET {c.paymentTermsDays}</TD>
                <TD className="text-ink-dim">{Number(c.creditLimit) > 0 ? formatMoney(Number(c.creditLimit)) : "—"}</TD>
                <TD>{c.active ? <Badge variant="success">Active</Badge> : <Badge variant="neutral">Inactive</Badge>}</TD>
                <TD className="text-right">
                  <Link href={`/admin/customers/${c.id}`} className="text-xs uppercase tracking-wider text-gold hover:text-gold-bright">
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
