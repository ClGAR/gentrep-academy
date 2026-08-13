import { AcademyDashboard } from "@/components/academy/AcademyDashboard";
import { loadDashboard } from "@/lib/academy/queries";
import { requireUser } from "@/lib/auth/guards";

export default async function RankPage({
  params,
}: {
  params: Promise<{ rank: string }>;
}) {
  await requireUser();
  const { rank } = await params;
  const result = await loadDashboard(rank.toUpperCase());
  if (!result.ok) {
    return (
      <main className="auth-shell">
        <div className="gg-alert gg-alert--error">{result.error}</div>
      </main>
    );
  }
  return <AcademyDashboard data={result.data} />;
}
