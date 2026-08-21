import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import type { YearlyForecastRow } from "@/types/venture";

export function YearlyForecastTable({ rows }: { rows: YearlyForecastRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Year</TableHead>
          <TableHead>Revenue</TableHead>
          <TableHead>Gross Profit</TableHead>
          <TableHead>Operating Expenses</TableHead>
          <TableHead>Operating Profit</TableHead>
          <TableHead>Est. Owner Income</TableHead>
          <TableHead>Employees</TableHead>
          <TableHead>Customers</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.year}>
            <TableCell className="font-medium">Year {r.year}</TableCell>
            <TableCell className="font-tabular">{formatCurrency(r.revenue)}</TableCell>
            <TableCell className="font-tabular">{formatCurrency(r.grossProfit)}</TableCell>
            <TableCell className="font-tabular">{formatCurrency(r.operatingExpenses)}</TableCell>
            <TableCell className="font-tabular">{formatCurrency(r.operatingProfit)}</TableCell>
            <TableCell className="font-tabular">{formatCurrency(r.estimatedOwnerIncome)}</TableCell>
            <TableCell className="font-tabular">{r.employees}</TableCell>
            <TableCell className="font-tabular">{r.customers}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
