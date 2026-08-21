// Domain types shared between the wizard, the AI layer, and the
// deterministic financial engine. AI modules populate the "assumption"
// shaped objects; lib/financial/* turns them into numbers. The AI never
// computes the numbers itself (see lib/financial/README.md).

export type BusinessScope = "local" | "regional" | "national" | "online";

export interface LocationInput {
  country: string;
  region: string; // state/province
  city: string;
  serviceRadius?: string;
  scope: BusinessScope;
}

export type BusinessModelType =
  | "service"
  | "ecommerce"
  | "retail"
  | "manufacturing"
  | "rental"
  | "construction"
  | "professional_services"
  | "software"
  | "marketplace"
  | "subscription"
  | "other";

export interface BusinessModelInput {
  industry: string;
  businessType: BusinessModelType;
}

export type InvolvementLevel =
  | "owner_operator"
  | "manage_small_team"
  | "manager_run"
  | "mostly_passive"
  | "sell_eventually";

export interface OwnerGoalsInput {
  targetAnnualIncome: number;
  targetAnnualRevenue: number;
  desiredWeeklyHours: number;
  desiredEmployees: number;
  involvement: InvolvementLevel;
}

export type CapitalBand =
  | "under_5k"
  | "5k_10k"
  | "10k_25k"
  | "25k_50k"
  | "50k_100k"
  | "100k_plus";

export interface CapitalInput {
  band: CapitalBand;
  customAmount?: number;
}

export interface ExperienceInput {
  industryExperience: string;
  salesExperience: string;
  managementExperience: string;
  existingEquipment: string;
  existingNetwork: string;
}

export interface PreferencesInput {
  cashFlow: number; // 1-5 importance
  scalability: number;
  flexibility: number;
  passivePotential: number;
  lowStartupCost: number;
  highProfitMargin: number;
  recurringRevenue: number;
  exitPotential: number;
}

export interface ProjectInputs {
  businessIdea: string;
  location: LocationInput;
  businessModel: BusinessModelInput;
  ownerGoals: OwnerGoalsInput;
  capital: CapitalInput;
  experience: ExperienceInput;
  preferences: PreferencesInput;
}

// ── Financial assumptions (AI proposes, user edits, code computes) ───────
export interface FinancialAssumptions {
  averagePrice: number;
  startingCustomersPerMonth: number;
  monthlyGrowthRatePct: number;
  repeatPurchasesPerYear: number;
  customerLifespanYears: number;
  directLaborPctOfRevenue: number;
  directMaterialsPctOfRevenue: number;
  otherDirectCostPerUnit: number;
  employees: number;
  avgHourlyWage: number;
  laborHoursPerUnit: number;
  monthlyOverhead: number;
  monthlyMarketingSpend: number;
  customerAcquisitionCost: number;
  closeRatePct: number;
  totalStartupCost: number;
  ownerAnnualIncomeGoal?: number;
}

export interface UnitEconomics {
  averagePrice: number;
  directLaborCost: number;
  directMaterialsCost: number;
  otherDirectCost: number;
  grossProfit: number;
  grossMarginPct: number;
  customerAcquisitionCost: number;
  contributionMargin: number;
  estimatedLTV: number;
  ltvToCacRatio: number;
  breakEvenCustomers: number;
}

export interface MonthlyForecastRow {
  month: number;
  customers: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  operatingExpenses: number;
  ebitda: number;
  netMarginPct: number;
}

export interface YearlyForecastRow {
  year: 1 | 2 | 3;
  revenue: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingProfit: number;
  estimatedOwnerIncome: number;
  employees: number;
  customers: number;
}

export interface BreakEvenResult {
  fixedMonthlyExpenses: number;
  contributionMarginPerCustomer: number;
  breakEvenCustomersPerMonth: number;
  breakEvenRevenuePerMonth: number;
  estimatedMonthsUntilBreakEven: number | null;
}

export type ScenarioName = "conservative" | "expected" | "aggressive";

export interface ScenarioResult {
  name: ScenarioName;
  assumptions: FinancialAssumptions;
  year1Revenue: number;
  year1Profit: number;
  breakEvenMonth: number | null;
}

export interface GoalReverseEngineeringResult {
  targetAnnualIncome: number;
  requiredAnnualProfit: number;
  requiredAnnualRevenue: number;
  requiredUnitsPerYear: number;
  requiredUnitsPerMonth: number;
  requiredUnitsPerWeek: number;
  requiredLeadsPerWeek: number;
  assumedCloseRatePct: number;
}

export interface VentureScoreBreakdown {
  overall: number;
  label: string;
  categories: {
    profitPotential: number;
    cashFlow: number;
    scalability: number;
    ownerFreedom: number;
    startupEfficiency: number;
    risk: number;
  };
}

export interface StartupCostItem {
  id: string;
  category: string;
  description: string;
  quantity: number;
  costEach: number;
  essential: boolean;
  haveIt?: boolean;
}

export interface ServicePackage {
  id: string;
  tier: "starter" | "core" | "premium";
  name: string;
  description: string;
  includedServices: string[];
  customerPrice: number;
  estimatedLaborCost: number;
  materialCost: number;
}
