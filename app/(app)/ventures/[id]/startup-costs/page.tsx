import { getProjectBundle } from "@/lib/projects/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default async function StartupCostsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { startupCosts } = await getProjectBundle(id);

  if (!startupCosts) {
    return <p className="text-muted-foreground">Startup costs not available yet.</p>;
  }

  const byCategory = new Map<string, typeof startupCosts.items>();
  for (const item of startupCosts.items) {
    if (!byCategory.has(item.category)) byCategory.set(item.category, []);
    byCategory.get(item.category)!.push(item);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Minimum Startup Investment</p>
            <p className="mt-1 font-tabular text-2xl font-semibold">{formatCurrency(startupCosts.minimum)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Startup Investment</p>
            <p className="mt-1 font-tabular text-2xl font-semibold">{formatCurrency(startupCosts.total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Recommended Startup Capital</p>
            <p className="mt-1 font-tabular text-2xl font-semibold">{formatCurrency(startupCosts.recommended)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Includes a 15% working capital buffer</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Cost Each</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {startupCosts.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="font-tabular">{item.quantity}</TableCell>
                  <TableCell className="font-tabular">{formatCurrency(item.costEach)}</TableCell>
                  <TableCell className="font-tabular font-medium">{formatCurrency(item.total)}</TableCell>
                  <TableCell>
                    <Badge variant={item.essential ? "danger" : "secondary"}>{item.essential ? "Essential" : "Optional"}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
