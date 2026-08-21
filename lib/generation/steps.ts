export const GENERATION_STEPS = [
  { key: "classification", label: "Analyzing Business Model" },
  { key: "startup_costs", label: "Estimating Startup Costs" },
  { key: "pricing", label: "Building Pricing Strategy" },
  { key: "financials", label: "Calculating Financial Model" },
  { key: "scoring", label: "Evaluating Venture Score & Risk" },
  { key: "marketing", label: "Creating Marketing Plan" },
  { key: "launch", label: "Building Launch Plan" },
  { key: "finalizing", label: "Finalizing Your Report" },
] as const;

export type GenerationStepKey = (typeof GENERATION_STEPS)[number]["key"];

export interface GenerationStatus {
  currentStep: GenerationStepKey | "done";
  completedSteps: GenerationStepKey[];
  error?: string;
}
