import { AcademyDashboard } from "@/components/academy/AcademyDashboard";
import { loadDashboard } from "@/lib/academy/queries";
import { chairmanVisualFixture } from "@/lib/academy/visual-fixture";
import { requireUser } from "@/lib/auth/guards";

export default async function AcademyPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const params = await searchParams;
  if (process.env.NODE_ENV !== "production" && params.preview === "chairman") {
    return (
      <AcademyDashboard
        data={chairmanVisualFixture}
        enableDemoWalk
      />
    );
  }
  await requireUser();
  const result = await loadDashboard();
  if (!result.ok) {
    return (
      <main className="auth-shell">
        <div className="gg-alert gg-alert--error">{result.error}</div>
      </main>
    );
  }
  return <AcademyDashboard data={result.data} />;
}
