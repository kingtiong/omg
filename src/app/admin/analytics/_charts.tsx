"use client";

import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const palette = {
  grid: "rgba(212,175,55,0.12)",
  axis: "#6e6a5e",
  revenue: "#d4af37",
  profit: "#7be0a8",
  units: "#a0a0c0",
  bg: "rgba(7,7,11,0.95)",
  ink: "#f6f1e3",
};

export function RevenueProfitChart({ data }: { data: Array<{ date: string; revenue: number; profit: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={palette.revenue} stopOpacity={0.4} />
            <stop offset="95%" stopColor={palette.revenue} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="prof" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={palette.profit} stopOpacity={0.35} />
            <stop offset="95%" stopColor={palette.profit} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
        <XAxis dataKey="date" stroke={palette.axis} fontSize={10} />
        <YAxis stroke={palette.axis} fontSize={10} tickFormatter={(v) => `RM${v.toLocaleString()}`} />
        <Tooltip
          contentStyle={{ background: palette.bg, border: `1px solid ${palette.grid}`, borderRadius: 4, color: palette.ink }}
          labelStyle={{ color: palette.ink }}
          formatter={(v: number, name: string) => [`RM ${v.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`, name]}
        />
        <Legend wrapperStyle={{ color: palette.ink, fontSize: 11 }} />
        <Area type="monotone" dataKey="revenue" name="Revenue" stroke={palette.revenue} strokeWidth={2} fill="url(#rev)" />
        <Area type="monotone" dataKey="profit" name="Profit" stroke={palette.profit} strokeWidth={2} fill="url(#prof)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function UnitsBarChart({ data }: { data: Array<{ date: string; units: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
        <XAxis dataKey="date" stroke={palette.axis} fontSize={10} />
        <YAxis stroke={palette.axis} fontSize={10} />
        <Tooltip
          contentStyle={{ background: palette.bg, border: `1px solid ${palette.grid}`, borderRadius: 4, color: palette.ink }}
        />
        <Bar dataKey="units" name="Units" fill={palette.units} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
