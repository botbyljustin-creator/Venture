import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { appConfig } from "@/config/app";
import type { ProjectBundle } from "@/lib/projects/data";
import { formatCurrency, formatPercent } from "@/lib/utils";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#0f1115" },
  coverPage: { padding: 60, justifyContent: "center", alignItems: "center" },
  coverTitle: { fontSize: 30, fontWeight: 700, marginBottom: 8, textAlign: "center" },
  coverSubtitle: { fontSize: 14, color: "#64748b", marginBottom: 40, textAlign: "center" },
  coverMeta: { fontSize: 11, color: "#64748b", textAlign: "center" },
  sectionTitle: { fontSize: 16, fontWeight: 700, marginBottom: 10, marginTop: 18 },
  subTitle: { fontSize: 12, fontWeight: 700, marginBottom: 6, marginTop: 12 },
  paragraph: { fontSize: 10, lineHeight: 1.5, marginBottom: 6, color: "#1f2430" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  label: { color: "#64748b" },
  value: { fontWeight: 700 },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 8 },
  metricBox: { width: "22%", marginBottom: 10 },
  metricLabel: { fontSize: 8, color: "#64748b", textTransform: "uppercase" },
  metricValue: { fontSize: 14, fontWeight: 700, marginTop: 2 },
  table: { marginTop: 8 },
  tableHeaderRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingBottom: 4, marginBottom: 4 },
  tableRow: { flexDirection: "row", paddingVertical: 3, borderBottomWidth: 0.5, borderBottomColor: "#f1f1f1" },
  th: { fontSize: 8, fontWeight: 700, color: "#64748b", textTransform: "uppercase" },
  td: { fontSize: 9 },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, fontSize: 7, color: "#94a3b8", textAlign: "center" },
  pageNumber: { position: "absolute", bottom: 24, right: 40, fontSize: 8, color: "#94a3b8" },
});

export function VentureReportDocument({ bundle }: { bundle: ProjectBundle }) {
  const { project, score, forecast, startupCosts, packages, businessPlan, risk, launchTasks } = bundle;

  return (
    <Document title={`${project.name} — Venture Report`} author={appConfig.name}>
      {/* Cover page */}
      <Page size="A4" style={[styles.page, styles.coverPage]}>
        <Text style={styles.coverTitle}>{project.name}</Text>
        <Text style={styles.coverSubtitle}>
          {[project.industry, project.city && project.region ? `${project.city}, ${project.region}` : null].filter(Boolean).join(" · ")}
        </Text>
        {score && (
          <View style={{ alignItems: "center", marginTop: 20, marginBottom: 20 }}>
            <Text style={{ fontSize: 40, fontWeight: 700 }}>{score.overall}/100</Text>
            <Text style={{ fontSize: 12, color: "#64748b" }}>{score.label}</Text>
          </View>
        )}
        <Text style={styles.coverMeta}>Prepared by {appConfig.name} · {new Date().toLocaleDateString()}</Text>
      </Page>

      {/* Executive summary + score */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Executive Summary</Text>
        {businessPlan?.executiveSummary && <Text style={styles.paragraph}>{businessPlan.executiveSummary}</Text>}

        {score && (
          <>
            <Text style={styles.subTitle}>Venture Score Breakdown</Text>
            {[
              ["Profit Potential", score.profit_potential],
              ["Cash Flow", score.cash_flow],
              ["Scalability", score.scalability],
              ["Owner Freedom", score.owner_freedom],
              ["Startup Efficiency", score.startup_efficiency],
              ["Risk (higher = safer)", score.risk],
            ].map(([label, value]) => (
              <View key={label as string} style={styles.row}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{value}/100</Text>
              </View>
            ))}
            {score.verdict && <Text style={[styles.paragraph, { marginTop: 8 }]}>{score.verdict}</Text>}
          </>
        )}

        <Text style={styles.footer}>{appConfig.disclaimer}</Text>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
      </Page>

      {/* Financial model */}
      {forecast && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Financial Model</Text>
          <View style={styles.metricGrid}>
            <Metric label="Average Price" value={formatCurrency(forecast.unitEconomics.averagePrice)} />
            <Metric label="Gross Margin" value={formatPercent(forecast.unitEconomics.grossMarginPct)} />
            <Metric label="LTV : CAC" value={`${forecast.unitEconomics.ltvToCacRatio.toFixed(1)}x`} />
            <Metric label="Break-Even Customers/mo" value={String(forecast.breakEven.breakEvenCustomersPerMonth)} />
          </View>

          <Text style={styles.subTitle}>Year 1-3 Projection</Text>
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.th, { width: "16%" }]}>Year</Text>
              <Text style={[styles.th, { width: "21%" }]}>Revenue</Text>
              <Text style={[styles.th, { width: "21%" }]}>Gross Profit</Text>
              <Text style={[styles.th, { width: "21%" }]}>Op. Profit</Text>
              <Text style={[styles.th, { width: "21%" }]}>Owner Income</Text>
            </View>
            {forecast.yearly.map((y) => (
              <View key={y.year} style={styles.tableRow}>
                <Text style={[styles.td, { width: "16%" }]}>Year {y.year}</Text>
                <Text style={[styles.td, { width: "21%" }]}>{formatCurrency(y.revenue)}</Text>
                <Text style={[styles.td, { width: "21%" }]}>{formatCurrency(y.grossProfit)}</Text>
                <Text style={[styles.td, { width: "21%" }]}>{formatCurrency(y.operatingProfit)}</Text>
                <Text style={[styles.td, { width: "21%" }]}>{formatCurrency(y.estimatedOwnerIncome)}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.subTitle}>Break-Even Analysis</Text>
          <View style={styles.row}><Text style={styles.label}>Fixed Monthly Expenses</Text><Text style={styles.value}>{formatCurrency(forecast.breakEven.fixedMonthlyExpenses)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Break-Even Revenue/mo</Text><Text style={styles.value}>{formatCurrency(forecast.breakEven.breakEvenRevenuePerMonth)}</Text></View>
          <View style={styles.row}>
            <Text style={styles.label}>Estimated Time to Break-Even</Text>
            <Text style={styles.value}>{forecast.breakEven.estimatedMonthsUntilBreakEven ? `Month ${forecast.breakEven.estimatedMonthsUntilBreakEven}` : "Beyond Year 1"}</Text>
          </View>

          <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
        </Page>
      )}

      {/* Startup costs + pricing */}
      {(startupCosts || packages.length > 0) && (
        <Page size="A4" style={styles.page}>
          {startupCosts && (
            <>
              <Text style={styles.sectionTitle}>Startup Costs</Text>
              <View style={styles.metricGrid}>
                <Metric label="Minimum" value={formatCurrency(startupCosts.minimum)} />
                <Metric label="Total" value={formatCurrency(startupCosts.total)} />
                <Metric label="Recommended" value={formatCurrency(startupCosts.recommended)} />
              </View>
              <View style={styles.table}>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.th, { width: "40%" }]}>Item</Text>
                  <Text style={[styles.th, { width: "30%" }]}>Category</Text>
                  <Text style={[styles.th, { width: "15%" }]}>Qty</Text>
                  <Text style={[styles.th, { width: "15%" }]}>Total</Text>
                </View>
                {startupCosts.items.map((item) => (
                  <View key={item.id} style={styles.tableRow}>
                    <Text style={[styles.td, { width: "40%" }]}>{item.description}</Text>
                    <Text style={[styles.td, { width: "30%" }]}>{item.category}</Text>
                    <Text style={[styles.td, { width: "15%" }]}>{item.quantity}</Text>
                    <Text style={[styles.td, { width: "15%" }]}>{formatCurrency(item.total)}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {packages.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Pricing Packages</Text>
              {packages.map((p) => (
                <View key={p.id} style={{ marginBottom: 8 }}>
                  <Text style={styles.subTitle}>{p.name} — {formatCurrency(p.customerPrice)}</Text>
                  <Text style={styles.paragraph}>{p.description}</Text>
                </View>
              ))}
            </>
          )}
          <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
        </Page>
      )}

      {/* Launch plan + risks */}
      <Page size="A4" style={styles.page}>
        {launchTasks.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>30-Day Launch Plan</Text>
            {[1, 2, 3, 4].map((week) => {
              const tasks = launchTasks.filter((t) => t.week === week);
              if (!tasks.length) return null;
              return (
                <View key={week} style={{ marginBottom: 10 }}>
                  <Text style={styles.subTitle}>Week {week}</Text>
                  {tasks.map((t) => (
                    <Text key={t.id} style={styles.paragraph}>• {t.task} ({t.priority} priority{t.estimated_time ? `, ${t.estimated_time}` : ""})</Text>
                  ))}
                </View>
              );
            })}
          </>
        )}

        {risk && (
          <>
            <Text style={styles.sectionTitle}>Risk Analysis</Text>
            {risk.risks.map((r) => (
              <Text key={r.risk} style={styles.paragraph}>• {r.risk} — {r.mitigation}</Text>
            ))}
          </>
        )}

        <Text style={styles.footer}>{appConfig.disclaimer}</Text>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
      </Page>
    </Document>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginRight: 16, marginBottom: 8 }}>
      <Text style={{ fontSize: 8, color: "#64748b", textTransform: "uppercase" }}>{label}</Text>
      <Text style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{value}</Text>
    </View>
  );
}
