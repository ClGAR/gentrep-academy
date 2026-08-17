import { TrainerQueue } from "@/components/ops/TrainerQueue";
import { OperationsShell } from "@/components/ops/OperationsShell";
import { loadTrainerQueue } from "@/lib/academy/queries";
import { requireRole } from "@/lib/auth/guards";

export default async function TrainerPage() {
  const { roles } = await requireRole("trainer");
  const queue = await loadTrainerQueue();
  return (
    <OperationsShell
      active="trainer"
      eyebrow="Trainer"
      title="Demonstration verifications"
      description="Confirm or reject demonstrations only for members currently assigned to you."
      roles={roles}
    >
      <div className="ops-panel-head">
        <div>
          <p className="eyebrow-dark">Queue</p>
          <h2>Assigned demonstrations</h2>
        </div>
      </div>
      {queue.ok ? (
        <TrainerQueue rows={queue.data} />
      ) : (
        <div className="gg-alert gg-alert--error" role="alert">
          {queue.error}
        </div>
      )}
    </OperationsShell>
  );
}
