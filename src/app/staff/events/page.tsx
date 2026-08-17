import { StaffRoster } from "@/components/ops/StaffRoster";
import { OperationsShell } from "@/components/ops/OperationsShell";
import { loadStaffRoster } from "@/lib/academy/queries";
import { requireRole } from "@/lib/auth/guards";

export default async function StaffEventsPage() {
  const { roles } = await requireRole("staff");
  const roster = await loadStaffRoster();
  return (
    <OperationsShell
      active="staff"
      eyebrow="Staff"
      title="Assigned events"
      description="Record attendance only for members who are present at events assigned to you."
      roles={roles}
    >
      <div className="ops-panel-head">
        <div>
          <p className="eyebrow-dark">Roster</p>
          <h2>Member check-in</h2>
        </div>
      </div>
      {roster.ok ? (
        <StaffRoster rows={roster.data} />
      ) : (
        <div className="gg-alert gg-alert--error" role="alert">
          {roster.error}
        </div>
      )}
    </OperationsShell>
  );
}
