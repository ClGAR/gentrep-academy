import { AcademyDashboard } from "@/components/academy/AcademyDashboard";
import { AcademyLoadError } from "@/components/academy/AcademyLoadState";
import { loadDashboard } from "@/lib/academy/queries";
import { requireUser } from "@/lib/auth/guards";
import { redirect } from "next/navigation";

export default async function RankPage({
  params,
}: {
  params: Promise<{ rank: string }>;
}) {
  await requireUser();
  const { rank } = await params;
  const result = await loadDashboard(rank.toUpperCase());
  if (!result.ok) {
    return <AcademyLoadError error={result.error} futureJwt={result.futureJwt} />;
  }
  if (result.data.lockedReason) {
    redirect("/academy");
  }
  return <AcademyDashboard data={result.data} />;
}
