import { AdminHero } from "@/components/admin/AdminHero";
import { CaseloadBoard } from "@/components/admin/CaseloadBoard";
import { loadCaseload } from "@/lib/admin/queries";
import { requireCapability } from "@/lib/auth/guards";

export default async function CaseloadPage() {
  const { userId, roles } = await requireCapability("caseload.read");
  const rows = await loadCaseload(userId, roles);
  return (
    <div className="admin-stack">
      <AdminHero
        kicker="Care"
        title="Caseload"
        lede="Assigned members only. Clinical notes stay off the support desk."
        summary={{ label: "Assigned", value: rows.length }}
      />
      <CaseloadBoard rows={rows} />
    </div>
  );
}
