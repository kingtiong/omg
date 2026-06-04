import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD, EmptyRow } from "@/components/ui/table";
import {
  periodKPIs,
  periodRange,
  dailySeries,
  topPartsByRevenue,
  topCustomers,
  slowMovers,
  reorderRecommendations,
  type Period,
} from "@/lib/analytics";
import { formatMoney } from "@/lib/format";
import { RevenueProfitChart, UnitsBarChart } from "./_charts";

const PERIODS: Array<{ value: Period; label: string }> = [
  { value: "this_week", label: "This week" },
  { value: "last_week", label: "Last week" },
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "last_30", label: "Last 30 days" },
  { value: "last_90", label: "Last 90 days" },
];

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: Period }>;
}) {
  const { period = "this_month" } = await searchParams;
  const range = periodRange(period);

  const [kpis, daily, topParts, topCust, slow, reorder] = await Promise.all([
    periodKPIs(range.from, range.to),
    dailySeries(range.from, range.to),
    topPartsByRevenue(range.from, range.to, 10),
    topCustomers(range.from, range.to, 10),
    slowMovers(90, 15),
    reorderRecommendations(30),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Insights"
        title="Analytics"
        description={`${range.label} (${range.from.toLocaleDateString("en-GB")} → ${new Date(range.to.getTime() - 1).toLocaleDateString("en-GB")})`}
        actions={
          <div className="flex flex-wrap gap-1.5">
            {PERIODS.map((p) => (
              <Link
                key={p.value}
                href={`?period=${p.value}`}
                className={`rounded-sm px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] transition-colors ${
                  period === p.value
                    ? "border border-gold bg-gold/10 text-gold-bright"
                    : "border border-line text-ink-dim hover:text-ink"
                }`}
              >
                {p.label}
              </Link>
            ))}
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="Orders" value={kpis.orders.toString()} />
        <KpiCard label="Units sold" value={kpis.units.toLocaleString()} />
        <KpiCard label="Revenue" value={formatMoney(kpis.revenue)} />
        <KpiCard label="Cost of goods" value={formatMoney(kpis.cost)} muted />
        <KpiCard label="Profit" value={formatMoney(kpis.profit)} accent />
        <KpiCard label="Margin" value={`${(kpis.margin * 100).toFixed(1)}%`} accent />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue & profit per day</CardTitle>
          </CardHeader>
          <CardContent>
            {daily.length === 0 ? (
              <p className="py-12 text-center text-ink-muted">No sales data in this period.</p>
            ) : (
              <RevenueProfitChart data={daily} />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Units shipped per day</CardTitle>
          </CardHeader>
          <CardContent>
            {daily.length === 0 ? (
              <p className="py-12 text-center text-ink-muted">No data.</p>
            ) : (
              <UnitsBarChart data={daily} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top parts by revenue</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>Part</TH>
                  <TH className="text-right">Units</TH>
                  <TH className="text-right">Revenue</TH>
                  <TH className="text-right">Profit</TH>
                  <TH className="text-right">Margin</TH>
                </TR>
              </THead>
              <TBody>
                {topParts.length === 0 ? (
                  <EmptyRow colSpan={5} message="No sales in this period." />
                ) : (
                  topParts.map((p) => (
                    <TR key={p.partId}>
                      <TD>
                        <div className="text-platinum">{p.name}</div>
                        <div className="font-mono text-xs text-ink-muted">{p.sku} · {p.partNumber}</div>
                      </TD>
                      <TD className="text-right">{p.units}</TD>
                      <TD className="text-right text-platinum">{formatMoney(p.revenue)}</TD>
                      <TD className="text-right text-emerald-300">{formatMoney(p.profit)}</TD>
                      <TD className="text-right text-ink-dim">{(p.margin * 100).toFixed(1)}%</TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top customers by revenue</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>Customer</TH>
                  <TH className="text-right">Orders</TH>
                  <TH className="text-right">Revenue</TH>
                  <TH className="text-right">Profit</TH>
                </TR>
              </THead>
              <TBody>
                {topCust.length === 0 ? (
                  <EmptyRow colSpan={4} message="No customer activity." />
                ) : (
                  topCust.map((c) => (
                    <TR key={c.customerId}>
                      <TD>
                        <div className="text-platinum">{c.name}</div>
                        <div className="font-mono text-xs text-ink-muted">{c.code}</div>
                      </TD>
                      <TD className="text-right">{c.orders}</TD>
                      <TD className="text-right text-platinum">{formatMoney(c.revenue)}</TD>
                      <TD className="text-right text-emerald-300">{formatMoney(c.profit)}</TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Reorder recommendations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <THead>
              <TR>
                <TH>Part</TH>
                <TH>Supplier</TH>
                <TH className="text-right">On hand</TH>
                <TH className="text-right">Min</TH>
                <TH className="text-right">Avg/day (30d)</TH>
                <TH className="text-right">Lead</TH>
                <TH className="text-right">Suggested order</TH>
              </TR>
            </THead>
            <TBody>
              {reorder.length === 0 ? (
                <EmptyRow colSpan={7} message="All parts are above their minimum stock." />
              ) : (
                reorder.map((r) => (
                  <TR key={r.id}>
                    <TD>
                      <div className="text-platinum">{r.name}</div>
                      <div className="font-mono text-xs text-ink-muted">{r.sku} · {r.partNumber}</div>
                    </TD>
                    <TD className="text-ink-dim">{r.supplierName ?? "—"}</TD>
                    <TD className={`text-right ${r.onHand <= 0 ? "text-red-300" : r.onHand < r.minStock ? "text-amber-300" : "text-ink"}`}>
                      {r.onHand}
                    </TD>
                    <TD className="text-right text-ink-dim">{r.minStock}</TD>
                    <TD className="text-right text-ink-dim">{r.avgDailyLast30.toFixed(2)}</TD>
                    <TD className="text-right text-ink-dim">{r.leadTimeDays}d</TD>
                    <TD className="text-right font-serif text-lg text-gold-bright">{r.suggested}</TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Slow movers (last 90 days)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <THead>
              <TR>
                <TH>Part</TH>
                <TH className="text-right">Sold (90d)</TH>
                <TH className="text-right">On hand</TH>
              </TR>
            </THead>
            <TBody>
              {slow.length === 0 ? (
                <EmptyRow colSpan={3} message="No data." />
              ) : (
                slow.map((p) => (
                  <TR key={p.id}>
                    <TD>
                      <div className="text-platinum">{p.name}</div>
                      <div className="font-mono text-xs text-ink-muted">{p.sku} · {p.partNumber}</div>
                    </TD>
                    <TD className="text-right text-ink-dim">{p.sold}</TD>
                    <TD className="text-right">{p.onHand}</TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

function KpiCard({ label, value, accent, muted }: { label: string; value: string; accent?: boolean; muted?: boolean }) {
  return (
    <Card>
      <CardContent>
        <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted">{label}</div>
        <div className={`mt-1 font-serif text-2xl ${accent ? "text-gold-bright" : muted ? "text-ink-dim" : "text-platinum"}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
