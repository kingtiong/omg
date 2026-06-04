import { prisma } from "@/lib/db";

export type Period = "this_week" | "last_week" | "this_month" | "last_month" | "last_30" | "last_90";

export function periodRange(p: Period): { from: Date; to: Date; label: string } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  function startOfWeek(d: Date): Date {
    const x = new Date(d);
    const day = x.getDay() || 7; // Mon=1..Sun=7
    if (day !== 1) x.setDate(x.getDate() - (day - 1));
    x.setHours(0, 0, 0, 0);
    return x;
  }

  switch (p) {
    case "this_week": {
      const from = startOfWeek(today);
      const to = new Date(from);
      to.setDate(from.getDate() + 7);
      return { from, to, label: "This week" };
    }
    case "last_week": {
      const thisStart = startOfWeek(today);
      const from = new Date(thisStart);
      from.setDate(thisStart.getDate() - 7);
      const to = thisStart;
      return { from, to, label: "Last week" };
    }
    case "this_month": {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return { from, to, label: "This month" };
    }
    case "last_month": {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from, to, label: "Last month" };
    }
    case "last_30": {
      const from = new Date(today);
      from.setDate(today.getDate() - 30);
      const to = new Date(today);
      to.setDate(today.getDate() + 1);
      return { from, to, label: "Last 30 days" };
    }
    case "last_90": {
      const from = new Date(today);
      from.setDate(today.getDate() - 90);
      const to = new Date(today);
      to.setDate(today.getDate() + 1);
      return { from, to, label: "Last 90 days" };
    }
  }
}

export interface KPI {
  orders: number;
  units: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: number; // 0..1
}

export async function periodKPIs(from: Date, to: Date): Promise<KPI> {
  const orders = await prisma.salesOrder.findMany({
    where: { orderDate: { gte: from, lt: to }, status: { notIn: ["PENDING", "CANCELLED"] } },
    include: { items: true },
  });
  let units = 0,
    revenue = 0,
    cost = 0;
  for (const o of orders) {
    for (const it of o.items) {
      units += it.quantity;
      revenue += Number(it.unitPrice) * it.quantity;
      cost += Number(it.unitCost) * it.quantity;
    }
  }
  const profit = revenue - cost;
  return {
    orders: orders.length,
    units,
    revenue,
    cost,
    profit,
    margin: revenue > 0 ? profit / revenue : 0,
  };
}

export async function dailySeries(from: Date, to: Date): Promise<Array<{ date: string; revenue: number; profit: number; units: number }>> {
  const rows = await prisma.$queryRaw<Array<{ date: string; revenue: number; cost: number; units: number }>>`
    SELECT
      to_char(date_trunc('day', so."orderDate"), 'YYYY-MM-DD') AS date,
      COALESCE(SUM(soi."unitPrice" * soi.quantity), 0)::float AS revenue,
      COALESCE(SUM(soi."unitCost" * soi.quantity), 0)::float AS cost,
      COALESCE(SUM(soi.quantity), 0)::int AS units
    FROM "SalesOrder" so
    JOIN "SalesOrderItem" soi ON soi."salesOrderId" = so.id
    WHERE so."orderDate" >= ${from} AND so."orderDate" < ${to}
      AND so.status NOT IN ('PENDING', 'CANCELLED')
    GROUP BY 1
    ORDER BY 1;
  `;
  return rows.map((r) => ({
    date: r.date,
    revenue: Number(r.revenue),
    profit: Number(r.revenue) - Number(r.cost),
    units: Number(r.units),
  }));
}

export async function topPartsByRevenue(from: Date, to: Date, limit = 10) {
  const rows = await prisma.$queryRaw<
    Array<{
      partId: string;
      sku: string;
      partNumber: string;
      name: string;
      units: number;
      revenue: number;
      cost: number;
    }>
  >`
    SELECT p.id AS "partId", p.sku, p."partNumber", p.name,
      SUM(soi.quantity)::int AS units,
      SUM(soi."unitPrice" * soi.quantity)::float AS revenue,
      SUM(soi."unitCost" * soi.quantity)::float AS cost
    FROM "SalesOrderItem" soi
    JOIN "SalesOrder" so ON so.id = soi."salesOrderId"
    JOIN "Part" p ON p.id = soi."partId"
    WHERE so."orderDate" >= ${from} AND so."orderDate" < ${to}
      AND so.status NOT IN ('PENDING', 'CANCELLED')
    GROUP BY p.id, p.sku, p."partNumber", p.name
    ORDER BY revenue DESC
    LIMIT ${limit};
  `;
  return rows.map((r) => ({
    ...r,
    units: Number(r.units),
    revenue: Number(r.revenue),
    cost: Number(r.cost),
    profit: Number(r.revenue) - Number(r.cost),
    margin: Number(r.revenue) > 0 ? (Number(r.revenue) - Number(r.cost)) / Number(r.revenue) : 0,
  }));
}

export async function topCustomers(from: Date, to: Date, limit = 10) {
  const rows = await prisma.$queryRaw<
    Array<{ customerId: string; code: string; name: string; orders: number; revenue: number; profit: number }>
  >`
    SELECT c.id AS "customerId", c.code, c.name,
      COUNT(DISTINCT so.id)::int AS orders,
      SUM(soi."unitPrice" * soi.quantity)::float AS revenue,
      SUM((soi."unitPrice" - soi."unitCost") * soi.quantity)::float AS profit
    FROM "SalesOrder" so
    JOIN "SalesOrderItem" soi ON soi."salesOrderId" = so.id
    JOIN "Customer" c ON c.id = so."customerId"
    WHERE so."orderDate" >= ${from} AND so."orderDate" < ${to}
      AND so.status NOT IN ('PENDING', 'CANCELLED')
    GROUP BY c.id, c.code, c.name
    ORDER BY revenue DESC
    LIMIT ${limit};
  `;
  return rows.map((r) => ({ ...r, orders: Number(r.orders), revenue: Number(r.revenue), profit: Number(r.profit) }));
}

export async function slowMovers(days = 90, limit = 20) {
  const from = new Date();
  from.setDate(from.getDate() - days);
  const rows = await prisma.$queryRaw<
    Array<{
      id: string;
      sku: string;
      partNumber: string;
      name: string;
      onHand: number;
      sold: number;
    }>
  >`
    SELECT p.id, p.sku, p."partNumber", p.name,
      COALESCE((SELECT SUM(quantity) FROM "Inventory" WHERE "partId" = p.id), 0)::int AS "onHand",
      COALESCE((
        SELECT SUM(soi.quantity)
        FROM "SalesOrderItem" soi
        JOIN "SalesOrder" so ON so.id = soi."salesOrderId"
        WHERE soi."partId" = p.id
          AND so."orderDate" >= ${from}
          AND so.status NOT IN ('PENDING','CANCELLED')
      ), 0)::int AS sold
    FROM "Part" p
    WHERE p.active = true
    ORDER BY sold ASC, "onHand" DESC
    LIMIT ${limit};
  `;
  return rows.map((r) => ({ ...r, onHand: Number(r.onHand), sold: Number(r.sold) }));
}

export async function reorderRecommendations(limit = 50) {
  // simple heuristic: parts where on-hand < minStock; suggest reorderQty (or minStock - onHand if larger)
  const rows = await prisma.$queryRaw<
    Array<{
      id: string;
      sku: string;
      partNumber: string;
      name: string;
      onHand: number;
      reserved: number;
      minStock: number;
      reorderQty: number;
      leadTimeDays: number;
      avgDailyLast30: number;
      supplierName: string | null;
    }>
  >`
    WITH demand AS (
      SELECT soi."partId" AS pid,
             SUM(soi.quantity)::float / 30.0 AS avg_daily
      FROM "SalesOrderItem" soi
      JOIN "SalesOrder" so ON so.id = soi."salesOrderId"
      WHERE so."orderDate" >= NOW() - INTERVAL '30 days'
        AND so.status NOT IN ('PENDING','CANCELLED')
      GROUP BY soi."partId"
    )
    SELECT p.id, p.sku, p."partNumber", p.name,
      COALESCE((SELECT SUM(quantity) FROM "Inventory" WHERE "partId" = p.id), 0)::int AS "onHand",
      COALESCE((SELECT SUM(reserved) FROM "Inventory" WHERE "partId" = p.id), 0)::int AS reserved,
      p."minStock", p."reorderQty", p."leadTimeDays",
      COALESCE(d.avg_daily, 0)::float AS "avgDailyLast30",
      s.name AS "supplierName"
    FROM "Part" p
    LEFT JOIN demand d ON d.pid = p.id
    LEFT JOIN "Supplier" s ON s.id = p."primarySupplierId"
    WHERE p.active = true
      AND p."minStock" > 0
      AND COALESCE((SELECT SUM(quantity) FROM "Inventory" WHERE "partId" = p.id), 0) < p."minStock"
    ORDER BY (p."minStock" - COALESCE((SELECT SUM(quantity) FROM "Inventory" WHERE "partId" = p.id), 0)) DESC
    LIMIT ${limit};
  `;
  return rows.map((r) => {
    const onHand = Number(r.onHand);
    const minStock = Number(r.minStock);
    const reorderQty = Number(r.reorderQty);
    const avg = Number(r.avgDailyLast30);
    const lead = Number(r.leadTimeDays);
    // recommended: max(reorderQty, minStock - onHand, lead-time consumption + safety)
    const leadConsumption = Math.ceil(avg * lead);
    const safety = Math.ceil(avg * 7); // 7 days safety
    const target = Math.max(minStock, leadConsumption + safety);
    const suggested = Math.max(reorderQty, target - onHand);
    return {
      ...r,
      onHand,
      reserved: Number(r.reserved),
      minStock,
      reorderQty,
      leadTimeDays: lead,
      avgDailyLast30: avg,
      suggested,
    };
  });
}
