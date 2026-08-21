import { getProjectBundle } from "@/lib/projects/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SalesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { salesKit } = await getProjectBundle(id);

  if (!salesKit) return <p className="text-muted-foreground">Sales kit not available yet.</p>;

  const blocks: { title: string; body: string }[] = [
    { title: "Elevator Pitch", body: salesKit.elevatorPitch },
    { title: "30-Second Pitch", body: salesKit.thirtySecondPitch },
    { title: "Phone Script", body: salesKit.phoneScript },
    { title: "Cold Email", body: salesKit.coldEmail },
    { title: "Text Message", body: salesKit.textMessage },
    { title: "Follow-Up Message", body: salesKit.followUpMessage },
    { title: "Estimate Follow-Up", body: salesKit.estimateFollowUp },
    { title: "Referral Request", body: salesKit.referralRequest },
    { title: "Upsell Script", body: salesKit.upsellScript },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {blocks.map((b) => (
          <Card key={b.title}>
            <CardHeader><CardTitle className="text-base">{b.title}</CardTitle></CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{b.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Objection Handling</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {salesKit.objectionResponses.map((o) => (
            <div key={o.objection} className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-medium">&ldquo;{o.objection}&rdquo;</p>
              <p className="mt-1 text-sm text-muted-foreground">{o.response}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
