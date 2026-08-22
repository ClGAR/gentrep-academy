import { TrainerQueue } from "@/components/ops/TrainerQueue";
import { OperationsShell } from "@/components/ops/OperationsShell";
import { loadPortalProfile } from "@/lib/admin/queries";
import { loadTrainerQueue } from "@/lib/academy/queries";
import { requireRole } from "@/lib/auth/guards";

export default async function TrainerPage() {
  const { userId, roles } = await requireRole("trainer");
  const [queue, profile] = await Promise.all([loadTrainerQueue(), loadPortalProfile(userId)]);
  const rows = queue.ok ? queue.data : [];
  return (
    <OperationsShell
      active="trainer"
      eyebrow="Trainer"
      title="Queue"
      description="Confirm or reject demonstrations only for members currently assigned to you."
      roles={roles}
      profile={profile}
      summary={{ label: "Assigned", value: rows.length }}
    >
      <header className="admin-section-head">
        <h2>Assigned demonstrations</h2>
        <span>Verify</span>
      </header>
      {queue.ok ? (
        <TrainerQueue rows={rows} />
      ) : (
        <div className="gg-alert gg-alert--error" role="alert">
          {queue.error}
        </div>
      )}
    </OperationsShell>
  );
}
