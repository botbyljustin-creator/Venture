import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { MonthlyForecastRow } from "@/types/venture";

export function MonthlyForecastTable({ rows }: { rows: MonthlyForecastRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Month</TableHead>
          <TableHead>Customers</TableHead>
          <TableHead>Revenue</TableHead>
          <TableHead>COGS</TableHead>
          <TableHead>Gross Profit</TableHead>
          <TableHead>OpEx</TableHead>
          <TableHead>EBITDA</TableHead>
          <TableHead>Net Margin</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.month}>
            <TableCell className="font-medium">{r.month}</TableCell>
            <TableCell className="font-tabular">{r.customers}</TableCell>
            <TableCell className="font-tabular">{formatCurrency(r.revenue)}</TableCell>
            <TableCell className="font-tabular">{formatCurrency(r.cogs)}</TableCell>
            <TableCell className="font-tabular">{formatCurrency(r.grossProfit)}</TableCell>
            <TableCell className="font-tabular">{formatCurrency(r.operatingExpenses)}</TableCell>
            <TableCell className={`font-tabular ${r.ebitda >= 0 ? "text-success" : "text-danger"}`}>{formatCurrency(r.ebitda)}</TableCell>
            <TableCell className="font-tabular">{formatPercent(r.netMarginPct)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
