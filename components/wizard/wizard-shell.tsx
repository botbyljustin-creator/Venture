"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { saveWizardStepAction } from "@/lib/projects/actions";
import { startGenerationAction } from "@/lib/generation/actions";
import type { ProjectInputs } from "@/types/venture";
import { StepIdea } from "./steps/step-idea";
import { StepLocation } from "./steps/step-location";
import { StepBusinessModel } from "./steps/step-business-model";
import { StepGoals } from "./steps/step-goals";
import { StepCapital } from "./steps/step-capital";
import { StepExperience } from "./steps/step-experience";
import { StepPreferences } from "./steps/step-preferences";

const STEP_LABELS = [
  "Business Idea",
  "Location",
  "Business Model",
  "Owner Goals",
  "Available Capital",
  "Experience",
  "Preferences",
];

export interface WizardInitialData {
  businessIdea: string;
  location: Partial<ProjectInputs["location"]>;
  businessModel: Partial<ProjectInputs["businessModel"]>;
  ownerGoals: Partial<ProjectInputs["ownerGoals"]>;
  capital: Partial<ProjectInputs["capital"]>;
  experience: Partial<ProjectInputs["experience"]>;
  preferences: ProjectInputs["preferences"];
}

export function WizardShell({
  projectId,
  initialStep,
  initialData,
}: {
  projectId: string;
  initialStep: number;
  initialData: WizardInitialData;
}) {
  const [step, setStep] = useState(Math.min(Math.max(initialStep, 1), 7));
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const progressPct = (step / 7) * 100;

  function goBack() {
    setStep((s) => Math.max(1, s - 1));
  }

  function handleStepSubmit(key: keyof WizardInitialData, value: unknown) {
    setData((prev) => ({ ...prev, [key]: value }));
    startTransition(async () => {
      const result = await saveWizardStepAction(projectId, step, { [key]: value });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (step < 7) {
        setStep(step + 1);
      } else {
        toast.success("Starting your analysis…");
        await startGenerationAction(projectId);
        router.push(`/ventures/${projectId}/generating`);
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">{STEP_LABELS[step - 1]}</span>
          <span className="text-muted-foreground">Step {step} of 7</span>
        </div>
        <Progress value={progressPct} />
      </div>

      {step === 1 && (
        <StepIdea
          defaultValue={data.businessIdea}
          pending={isPending}
          onSubmit={(v) => handleStepSubmit("businessIdea", v)}
        />
      )}
      {step === 2 && (
        <StepLocation
          defaultValue={data.location}
          pending={isPending}
          onBack={goBack}
          onSubmit={(v) => handleStepSubmit("location", v)}
        />
      )}
      {step === 3 && (
        <StepBusinessModel
          defaultValue={data.businessModel}
          pending={isPending}
          onBack={goBack}
          onSubmit={(v) => handleStepSubmit("businessModel", v)}
        />
      )}
      {step === 4 && (
        <StepGoals
          defaultValue={data.ownerGoals}
          pending={isPending}
          onBack={goBack}
          onSubmit={(v) => handleStepSubmit("ownerGoals", v)}
        />
      )}
      {step === 5 && (
        <StepCapital
          defaultValue={data.capital}
          pending={isPending}
          onBack={goBack}
          onSubmit={(v) => handleStepSubmit("capital", v)}
        />
      )}
      {step === 6 && (
        <StepExperience
          defaultValue={data.experience}
          pending={isPending}
          onBack={goBack}
          onSubmit={(v) => handleStepSubmit("experience", v)}
        />
      )}
      {step === 7 && (
        <StepPreferences
          defaultValue={data.preferences}
          pending={isPending}
          onBack={goBack}
          onSubmit={(v) => handleStepSubmit("preferences", v)}
        />
      )}
    </div>
  );
}
