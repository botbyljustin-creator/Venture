import { Button } from "@/components/ui/button";

export function StepFooter({
  pending,
  onBack,
  nextLabel = "Continue",
}: {
  pending: boolean;
  onBack?: () => void;
  nextLabel?: string;
}) {
  return (
    <div className="mt-6 flex justify-between">
      {onBack ? (
        <Button type="button" variant="outline" onClick={onBack} disabled={pending}>
          Back
        </Button>
      ) : (
        <span />
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : nextLabel}
      </Button>
    </div>
  );
}
