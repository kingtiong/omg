import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, THead, TBody, TR, TH, TD, EmptyRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatMoney } from "@/lib/format";
import type { PurchaseOrderStatus } from "@prisma/client";

const STATUSES: PurchaseOrderStatus[] = ["DRAFT", "SENT", "PARTIAL", "RECEIVED", "CANCELLED"];

const statusVariant: Record<PurchaseOrderStatus, "neutral" | "warning" | "gold" | "success" | "danger"> = {
  DRAFT: "neutral",
  SENT: "warning",
  PARTIAL: "gold",
  RECEIVED: "success",
  CANCELLED: "danger",
};

export default async function AdminPurchaseOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: PurchaseOrderStatus | "" }>;
}) {
  const { q, status } = await searchParams;

  const orders = await prisma.purchaseOrder.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { number: { contains: q, mode: "insensitive" } },
              { supplier: { name: { contains: q, mode: "insensitive" } } },
              { supplier: { code: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    orderBy: { orderDate: "desc" },
    take: 200,
    include: {
      supplier: { select: { name: true, code: true } },
      _count: { select: { items: true } },
    },
  });

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Purchase orders"
        description="Issue POs to suppliers, track expected receipts, and book stock in when goods arrive."
        actions={
          <Link href="/admin/purchase-orders/new">
            <Button>New purchase order</Button>
          </Link>
        }
      />

      <form className="mb-4 flex flex-wrap gap-3">
        <Input name="q" defaultValue={q} placeholder="Search by PO number or supplier…" className="max-w-md" />
        <Select name="status" defaultValue={status ?? ""} className="max-w-xs">
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="outline">
          Apply
        </Button>
      </form>

      <Table>
        <THead>
          <TR>
            <TH>Number</TH>
            <TH>Date</TH>
            <TH>Supplier</TH>
            <TH>Expected</TH>
            <TH>Items</TH>
            <TH className="text-right">Total</TH>
            <TH>Status</TH>
            <TH className="text-right">Detail</TH>
          </TR>
        </THead>
        <TBody>
          {orders.length === 0 ? (
            <EmptyRow colSpan={8} message="No purchase orders match." />
          ) : (
            orders.map((o) => (
              <TR key={o.id}>
                <TD className="font-mono text-xs text-ink">{o.number}</TD>
                <TD className="text-ink-dim">{formatDate(o.orderDate)}</TD>
                <TD>
                  <div className="text-platinum">{o.supplier.name}</div>
                  <div className="font-mono text-xs text-ink-muted">{o.supplier.code}</div>
                </TD>
                <TD className="text-ink-dim">{o.expectedAt ? formatDate(o.expectedAt) : "—"}</TD>
                <TD className="text-ink-dim">{o._count.items}</TD>
                <TD className="text-right text-platinum">{formatMoney(Number(o.total))}</TD>
                <TD>
                  <Badge variant={statusVariant[o.status]}>{o.status}</Badge>
                </TD>
                <TD className="text-right">
                  <Link
                    href={`/admin/purchase-orders/${o.id}`}
                    className="text-xs uppercase tracking-wider text-gold hover:text-gold-bright"
                  >
                    Open
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
