import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader, Crumbs } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { POActions } from "./actions-form";
import { ReceiveForm } from "./receive-form";
import type { PurchaseOrderStatus } from "@prisma/client";

const statusVariant: Record<PurchaseOrderStatus, "neutral" | "warning" | "gold" | "success" | "danger"> = {
  DRAFT: "neutral",
  SENT: "warning",
  PARTIAL: "gold",
  RECEIVED: "success",
  CANCELLED: "danger",
};

export default async function AdminPurchaseOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [po, locations] = await Promise.all([
    prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        items: { include: { part: { select: { sku: true, partNumber: true, name: true } } } },
        supplier: true,
      },
    }),
    prisma.location.findMany({ orderBy: [{ isDefault: "desc" }, { code: "asc" }] }),
  ]);
  if (!po) notFound();

  const canReceive = (po.status === "SENT" || po.status === "PARTIAL") &&
    po.items.some((i) => i.receivedQty < i.quantity);
  const canSend = po.status === "DRAFT";
  const canCancel = po.status === "DRAFT" || po.status === "SENT" || po.status === "PARTIAL";

  return (
    <>
      <Crumbs items={[{ href: "/admin/purchase-orders", label: "Purchase orders" }, { label: po.number }]} />
      <PageHeader
        eyebrow={formatDate(po.orderDate)}
        title={po.number}
        description={`${po.supplier.name} (${po.supplier.code})`}
        actions={<Badge variant={statusVariant[po.status]}>{po.status}</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>Part</TH>
                  <TH className="text-right">Ordered</TH>
                  <TH className="text-right">Received</TH>
                  <TH className="text-right">Unit cost</TH>
                  <TH className="text-right">Line total</TH>
                </TR>
              </THead>
              <TBody>
                {po.items.map((it) => (
                  <TR key={it.id}>
                    <TD>
                      <div className="text-platinum">{it.part.name}</div>
                      <div className="font-mono text-xs text-ink-muted">
                        {it.part.sku} · {it.part.partNumber}
                      </div>
                    </TD>
                    <TD className="text-right">{it.quantity}</TD>
                    <TD className="text-right text-ink-dim">{it.receivedQty}</TD>
                    <TD className="text-right text-ink-dim">{formatMoney(Number(it.unitCost))}</TD>
                    <TD className="text-right text-platinum">{formatMoney(Number(it.lineTotal))}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="Subtotal" value={formatMoney(Number(po.subtotal))} />
              <Row label="Tax" value={formatMoney(Number(po.taxTotal))} />
              <div className="my-2 border-t border-line/50" />
              <Row label="Total" value={formatMoney(Number(po.total))} bold />
              <div className="space-y-1 pt-2 text-xs text-ink-muted">
                <div>Expected: {po.expectedAt ? formatDate(po.expectedAt) : "—"}</div>
                <div>Received: {po.receivedAt ? formatDateTime(po.receivedAt) : "—"}</div>
                <div>Created {formatDateTime(po.createdAt)}</div>
              </div>
            </CardContent>
          </Card>

          {po.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-sm text-ink-dim">{po.notes}</p>
              </CardContent>
            </Card>
          )}

          {(canSend || canCancel) && <POActions poId={po.id} canSend={canSend} canCancel={canCancel} />}

          {canReceive && locations.length > 0 && (
            <ReceiveForm
              poId={po.id}
              locations={locations.map((l) => ({
                id: l.id,
                code: l.code,
                name: l.name,
                isDefault: l.isDefault,
              }))}
              items={po.items.map((i) => ({
                id: i.id,
                partLabel: `${i.part.sku} · ${i.part.name}`,
                ordered: i.quantity,
                received: i.receivedQty,
              }))}
            />
          )}
        </div>
      </div>
    </>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-dim">{label}</span>
      <span className={bold ? "font-serif text-lg text-platinum" : "text-platinum"}>{value}</span>
    </div>
  );
}
