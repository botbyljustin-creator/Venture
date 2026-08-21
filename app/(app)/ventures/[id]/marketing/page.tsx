import { getProjectBundle } from "@/lib/projects/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export default async function MarketingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { marketing } = await getProjectBundle(id);

  if (!marketing) return <p className="text-muted-foreground">Marketing plan not available yet.</p>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Acquisition Channels</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Channel</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Est. Monthly Cost</TableHead>
                <TableHead>Time to Results</TableHead>
                <TableHead>Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {marketing.channels.map((c) => (
                <TableRow key={c.channel}>
                  <TableCell className="font-medium">{c.channel}</TableCell>
                  <TableCell className="capitalize">{c.difficulty}</TableCell>
                  <TableCell>{c.expectedMonthlyCost}</TableCell>
                  <TableCell>{c.timeToResults}</TableCell>
                  <TableCell>
                    <Badge variant={c.priority === "high" ? "success" : c.priority === "medium" ? "warning" : "secondary"}>
                      {c.priority}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Brand & Positioning</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="font-medium">Business Name Ideas</p>
              <p className="mt-1 text-muted-foreground">{marketing.businessNameIdeas.join(" · ")}</p>
            </div>
            <div>
              <p className="font-medium">Taglines</p>
              <p className="mt-1 text-muted-foreground">{marketing.taglines.join(" · ")}</p>
            </div>
            <div>
              <p className="font-medium">Unique Selling Proposition</p>
              <p className="mt-1 text-muted-foreground">{marketing.uniqueSellingProposition}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Social & Ads</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="font-medium">Google Business Description</p>
              <p className="mt-1 text-muted-foreground">{marketing.googleBusinessDescription}</p>
            </div>
            <div>
              <p className="font-medium">Instagram Bio</p>
              <p className="mt-1 text-muted-foreground">{marketing.instagramBio}</p>
            </div>
            <div>
              <p className="font-medium">Ad Headlines</p>
              <ul className="mt-1 list-inside list-disc text-muted-foreground">
                {marketing.adHeadlines.map((h) => <li key={h}>{h}</li>)}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Social Post Ideas</CardTitle></CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            {marketing.socialPostIdeas.map((p) => (
              <li key={p} className="rounded-lg bg-muted/50 p-3">{p}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Website Copy</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="font-medium">{marketing.websiteCopy.homeHeadline}</p>
            <p className="text-muted-foreground">{marketing.websiteCopy.homeSubheadline}</p>
          </div>
          <div>
            <p className="font-medium">About Us</p>
            <p className="text-muted-foreground">{marketing.websiteCopy.aboutUs}</p>
          </div>
          <div>
            <p className="font-medium">Services Intro</p>
            <p className="text-muted-foreground">{marketing.websiteCopy.servicesIntro}</p>
          </div>
          <div>
            <p className="font-medium">FAQ</p>
            <div className="mt-2 space-y-2">
              {marketing.websiteCopy.faq.map((f) => (
                <div key={f.question}>
                  <p className="font-medium">{f.question}</p>
                  <p className="text-muted-foreground">{f.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
