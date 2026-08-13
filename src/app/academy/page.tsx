import { AcademyDashboard } from "@/components/academy/AcademyDashboard";
import { loadDashboard } from "@/lib/academy/queries";
import { requireUser } from "@/lib/auth/guards";

export default async function AcademyPage() {
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
