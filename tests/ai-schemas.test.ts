import { describe, it, expect } from "vitest";
import {
  classificationSchema,
  financialAssumptionsSchema,
  startupCostsSchema,
  qualitativeScoreSchema,
} from "@/lib/ai/schemas";

describe("AI output schema validation", () => {
  it("accepts a well-formed classification response", () => {
    const result = classificationSchema.safeParse({
      refinedBusinessName: "Tampa Bay Pressure Washing",
      industry: "Pressure Washing",
      businessType: "service",
      serviceOfferings: ["Driveway cleaning", "House washing"],
      targetCustomer: "Homeowners in the Tampa Bay area with driveways or exteriors needing cleaning.",
      competitiveLandscapeSummary: "Moderate competition from independent operators and a few regional franchises.",
      clarifyingQuestions: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a classification response with an invalid businessType", () => {
    const result = classificationSchema.safeParse({
      refinedBusinessName: "Test Co",
      industry: "Test",
      businessType: "not_a_real_type",
      serviceOfferings: ["Thing"],
      targetCustomer: "Someone",
      competitiveLandscapeSummary: "Some competitors exist in this space.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects financial assumptions with an out-of-range percentage", () => {
    const result = financialAssumptionsSchema.safeParse({
      averagePrice: 350,
      startingCustomersPerMonth: 20,
      monthlyGrowthRatePct: 8,
      repeatPurchasesPerYear: 2,
      customerLifespanYears: 3,
      directLaborPctOfRevenue: 150, // invalid: > 90
      directMaterialsPctOfRevenue: 8,
      otherDirectCostPerUnit: 10,
      employees: 1,
      avgHourlyWage: 20,
      laborHoursPerUnit: 2,
      monthlyOverhead: 800,
      monthlyMarketingSpend: 1200,
      customerAcquisitionCost: 60,
      closeRatePct: 25,
      reasoning: "Based on Tampa market rates for pressure washing services.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a startup costs response with too few items", () => {
    const result = startupCostsSchema.safeParse({
      items: [
        { id: "1", category: "Equipment", description: "Washer", quantity: 1, costEach: 3000, essential: true },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("clamps qualitative scores to the 0-100 range via validation", () => {
    const tooHigh = qualitativeScoreSchema.safeParse({
      scalability: 150,
      scalabilityRationale: "This business can scale well beyond one operator.",
      ownerFreedom: 60,
      ownerFreedomRationale: "Requires moderate owner involvement day to day.",
      risk: 70,
      riskRationale: "Low regulatory burden and steady demand year-round.",
      verdict: "Strong opportunity with consistent lead flow.",
    });
    expect(tooHigh.success).toBe(false);

    const valid = qualitativeScoreSchema.safeParse({
      scalability: 80,
      scalabilityRationale: "This business can scale well beyond one operator.",
      ownerFreedom: 60,
      ownerFreedomRationale: "Requires moderate owner involvement day to day.",
      risk: 70,
      riskRationale: "Low regulatory burden and steady demand year-round.",
      verdict: "Strong opportunity with consistent lead flow.",
    });
    expect(valid.success).toBe(true);
  });
});
