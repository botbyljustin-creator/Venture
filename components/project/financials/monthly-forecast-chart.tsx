"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { MonthlyForecastRow } from "@/types/venture";
import { formatCurrency } from "@/lib/utils";

export function MonthlyForecastChart({ data }: { data: MonthlyForecastRow[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="month" tickFormatter={(m) => `M${m}`} fontSize={12} stroke="var(--muted-foreground)" />
          <YAxis tickFormatter={(v) => formatCurrency(v, { compact: true })} fontSize={12} stroke="var(--muted-foreground)" width={60} />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            labelFormatter={(m) => `Month ${m}`}
            contentStyle={{ borderRadius: 8, borderColor: "var(--border)", fontSize: 13 }}
          />
          <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fill="url(#revenueGradient)" strokeWidth={2} name="Revenue" />
          <Area type="monotone" dataKey="ebitda" stroke="var(--success)" fillOpacity={0} strokeWidth={2} name="EBITDA" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
