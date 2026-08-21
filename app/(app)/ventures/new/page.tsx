import { createDraftProjectAction } from "@/lib/projects/actions";

export const metadata = { title: "New Venture" };

export default async function NewVenturePage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;
  await createDraftProjectAction(template);
  return null;
}
