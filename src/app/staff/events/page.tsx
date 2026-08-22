import { StaffRoster } from "@/components/ops/StaffRoster";
import { OperationsShell } from "@/components/ops/OperationsShell";
import { loadPortalProfile } from "@/lib/admin/queries";
import { loadStaffRoster } from "@/lib/academy/queries";
import { requireRole } from "@/lib/auth/guards";

export default async function StaffEventsPage() {
  const { userId, roles } = await requireRole("staff");
  const [roster, profile] = await Promise.all([loadStaffRoster(), loadPortalProfile(userId)]);
  const rows = roster.ok ? roster.data : [];
  return (
    <OperationsShell
      active="staff"
      eyebrow="Staff"
      title="Check-in"
      description="Record attendance only for members who are present at events assigned to you."
      roles={roles}
      profile={profile}
      summary={{ label: "Assigned", value: rows.length }}
    >
      <header className="admin-section-head">
        <h2>Member check-in</h2>
        <span>Roster</span>
      </header>
      {roster.ok ? (
        <StaffRoster rows={rows} />
      ) : (
        <div className="gg-alert gg-alert--error" role="alert">
          {roster.error}
        </div>
      )}
    </OperationsShell>
  );
}
