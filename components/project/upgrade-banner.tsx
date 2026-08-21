import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckoutButton } from "@/components/billing/checkout-button";

export function UpgradeBanner({ feature, projectId }: { feature: string; projectId?: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
        <Lock className="h-8 w-8 text-muted-foreground" />
        <div>
          <p className="font-semibold">Unlock {feature}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Purchase this venture for $49, or upgrade to Pro for unlimited access to every venture.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <CheckoutButton plan="launch" projectId={projectId}>Unlock This Venture — $49</CheckoutButton>
          <CheckoutButton plan="pro" variant="outline">Upgrade to Pro — $19/mo</CheckoutButton>
        </div>
      </CardContent>
    </Card>
  );
}
