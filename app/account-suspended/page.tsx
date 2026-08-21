import { signOutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/config/app";

export const metadata = { title: "Account Suspended" };

export default function AccountSuspendedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold">Your account has been suspended</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        Contact {appConfig.supportEmail} if you believe this is a mistake.
      </p>
      <form action={signOutAction} className="mt-6">
        <Button type="submit" variant="outline">Log Out</Button>
      </form>
    </div>
  );
}
