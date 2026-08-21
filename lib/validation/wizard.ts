import { z } from "zod";

export const businessIdeaSchema = z.string().min(10, "Tell us a bit more about the idea").max(2000);

export const locationSchema = z.object({
  country: z.string().min(2).max(60),
  region: z.string().min(1).max(60),
  city: z.string().min(1).max(80),
  serviceRadius: z.string().max(60).optional().default(""),
  scope: z.enum(["local", "regional", "national", "online"]),
});

export const businessModelSchema = z.object({
  industry: z.string().min(2).max(80),
  businessType: z.enum([
    "service", "ecommerce", "retail", "manufacturing", "rental",
    "construction", "professional_services", "software", "marketplace",
    "subscription", "other",
  ]),
});

export const ownerGoalsSchema = z.object({
  targetAnnualIncome: z.coerce.number().min(0).max(10_000_000),
  targetAnnualRevenue: z.coerce.number().min(0).max(100_000_000),
  desiredWeeklyHours: z.coerce.number().min(0).max(168),
  desiredEmployees: z.coerce.number().min(0).max(1000),
  involvement: z.enum(["owner_operator", "manage_small_team", "manager_run", "mostly_passive", "sell_eventually"]),
});

export const capitalSchema = z.object({
  band: z.enum(["under_5k", "5k_10k", "10k_25k", "25k_50k", "50k_100k", "100k_plus"]),
  customAmount: z.coerce.number().min(0).max(100_000_000).optional(),
});

export const experienceSchema = z.object({
  industryExperience: z.string().max(500).default(""),
  salesExperience: z.string().max(500).default(""),
  managementExperience: z.string().max(500).default(""),
  existingEquipment: z.string().max(500).default(""),
  existingNetwork: z.string().max(500).default(""),
});

export const preferencesSchema = z.object({
  cashFlow: z.coerce.number().int().min(1).max(5),
  scalability: z.coerce.number().int().min(1).max(5),
  flexibility: z.coerce.number().int().min(1).max(5),
  passivePotential: z.coerce.number().int().min(1).max(5),
  lowStartupCost: z.coerce.number().int().min(1).max(5),
  highProfitMargin: z.coerce.number().int().min(1).max(5),
  recurringRevenue: z.coerce.number().int().min(1).max(5),
  exitPotential: z.coerce.number().int().min(1).max(5),
});

export const wizardStepSchemas = {
  1: z.object({ businessIdea: businessIdeaSchema }),
  2: z.object({ location: locationSchema }),
  3: z.object({ businessModel: businessModelSchema }),
  4: z.object({ ownerGoals: ownerGoalsSchema }),
  5: z.object({ capital: capitalSchema }),
  6: z.object({ experience: experienceSchema }),
  7: z.object({ preferences: preferencesSchema }),
} as const;

export const defaultPreferences = {
  cashFlow: 3,
  scalability: 3,
  flexibility: 3,
  passivePotential: 3,
  lowStartupCost: 3,
  highProfitMargin: 3,
  recurringRevenue: 3,
  exitPotential: 3,
};
