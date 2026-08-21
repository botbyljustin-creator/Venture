import ExcelJS from "exceljs";
import type { ProjectBundle } from "@/lib/projects/data";

export async function buildVentureWorkbook(bundle: ProjectBundle): Promise<ExcelJS.Buffer> {
  const { project, score, forecast, startupCosts, packages, launchTasks } = bundle;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "VentureForge";
  workbook.created = new Date();

  const headerFill: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4338CA" } };
  const headerFont: Partial<ExcelJS.Font> = { color: { argb: "FFFFFFFF" }, bold: true };

  function styleHeader(row: ExcelJS.Row) {
    row.eachCell((cell) => {
      cell.fill = headerFill;
      cell.font = headerFont;
    });
  }

  // ── Summary ──────────────────────────────────────────────────────────
  const summary = workbook.addWorksheet("Summary");
  summary.columns = [{ width: 32 }, { width: 24 }];
  summary.addRow(["Venture", project.name]);
  summary.addRow(["Industry", project.industry || ""]);
  summary.addRow(["Location", [project.city, project.region].filter(Boolean).join(", ")]);
  if (score) {
    summary.addRow(["Venture Score", `${score.overall}/100`]);
    summary.addRow(["Label", score.label]);
  }
  if (startupCosts) summary.addRow(["Total Startup Investment", startupCosts.total]);
  if (forecast) {
    summary.addRow(["Year 1 Revenue", forecast.yearly[0]?.revenue]);
    summary.addRow(["Year 1 Operating Profit", forecast.yearly[0]?.operatingProfit]);
    summary.addRow([
      "Break-Even",
      forecast.breakEven.estimatedMonthsUntilBreakEven ? `Month ${forecast.breakEven.estimatedMonthsUntilBreakEven}` : "Beyond Year 1",
    ]);
  }
  summary.getColumn(1).font = { bold: true };

  // ── Startup Costs ────────────────────────────────────────────────────
  if (startupCosts) {
    const sheet = workbook.addWorksheet("Startup Costs");
    sheet.columns = [
      { header: "Category", key: "category", width: 18 },
      { header: "Description", key: "description", width: 30 },
      { header: "Quantity", key: "quantity", width: 10 },
      { header: "Cost Each", key: "costEach", width: 12 },
      { header: "Total", key: "total", width: 12 },
      { header: "Essential", key: "essential", width: 10 },
    ];
    styleHeader(sheet.getRow(1));
    for (const item of startupCosts.items) {
      sheet.addRow({
        category: item.category,
        description: item.description,
        quantity: item.quantity,
        costEach: item.costEach,
        total: item.total,
        essential: item.essential ? "Essential" : "Optional",
      });
    }
    sheet.addRow({});
    sheet.addRow({ description: "Minimum", total: startupCosts.minimum });
    sheet.addRow({ description: "Total", total: startupCosts.total });
    sheet.addRow({ description: "Recommended (with buffer)", total: startupCosts.recommended });
  }

  // ── Pricing ──────────────────────────────────────────────────────────
  if (packages.length) {
    const sheet = workbook.addWorksheet("Pricing");
    sheet.columns = [
      { header: "Tier", key: "tier", width: 12 },
      { header: "Name", key: "name", width: 24 },
      { header: "Customer Price", key: "customerPrice", width: 14 },
      { header: "Labor Cost", key: "laborCost", width: 12 },
      { header: "Material Cost", key: "materialCost", width: 14 },
      { header: "Gross Profit", key: "grossProfit", width: 14 },
    ];
    styleHeader(sheet.getRow(1));
    for (const p of packages) {
      sheet.addRow({
        tier: p.tier,
        name: p.name,
        customerPrice: p.customerPrice,
        laborCost: p.estimatedLaborCost,
        materialCost: p.materialCost,
        grossProfit: p.customerPrice - p.estimatedLaborCost - p.materialCost,
      });
    }
  }

  // ── Monthly Forecast ─────────────────────────────────────────────────
  if (forecast) {
    const sheet = workbook.addWorksheet("Monthly Forecast");
    sheet.columns = [
      { header: "Month", key: "month", width: 8 },
      { header: "Customers", key: "customers", width: 12 },
      { header: "Revenue", key: "revenue", width: 14 },
      { header: "COGS", key: "cogs", width: 14 },
      { header: "Gross Profit", key: "grossProfit", width: 14 },
      { header: "Operating Expenses", key: "operatingExpenses", width: 18 },
      { header: "EBITDA", key: "ebitda", width: 14 },
      { header: "Net Margin %", key: "netMarginPct", width: 12 },
    ];
    styleHeader(sheet.getRow(1));
    for (const row of forecast.monthly) sheet.addRow(row);

    const yearlySheet = workbook.addWorksheet("Year 1-3");
    yearlySheet.columns = [
      { header: "Year", key: "year", width: 8 },
      { header: "Revenue", key: "revenue", width: 14 },
      { header: "Gross Profit", key: "grossProfit", width: 14 },
      { header: "Operating Expenses", key: "operatingExpenses", width: 18 },
      { header: "Operating Profit", key: "operatingProfit", width: 16 },
      { header: "Est. Owner Income", key: "estimatedOwnerIncome", width: 18 },
      { header: "Employees", key: "employees", width: 10 },
      { header: "Customers", key: "customers", width: 10 },
    ];
    styleHeader(yearlySheet.getRow(1));
    for (const row of forecast.yearly) yearlySheet.addRow(row);
  }

  // ── Launch Plan ──────────────────────────────────────────────────────
  if (launchTasks.length) {
    const sheet = workbook.addWorksheet("Launch Plan");
    sheet.columns = [
      { header: "Week", key: "week", width: 8 },
      { header: "Task", key: "task", width: 50 },
      { header: "Priority", key: "priority", width: 12 },
      { header: "Estimated Time", key: "estimated_time", width: 16 },
      { header: "Status", key: "status", width: 12 },
    ];
    styleHeader(sheet.getRow(1));
    for (const t of launchTasks) sheet.addRow(t);
  }

  return workbook.xlsx.writeBuffer();
}
