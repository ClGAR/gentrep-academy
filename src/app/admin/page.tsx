import { loadAdminSummary } from "@/lib/academy/queries";
import { requireRole } from "@/lib/auth/guards";
import { OperationsShell } from "@/components/ops/OperationsShell";

export default async function AdminPage() {
  const { roles } = await requireRole("admin");
  const summary = await loadAdminSummary();
  return (
    <OperationsShell
      active="admin"
      eyebrow="Admin"
      title="Academy operations"
      description="A read-only overview of the live Academy. Privileged changes remain protected by audited database functions."
      roles={roles}
      metrics={
        summary.ok
          ? [
              { value: summary.data.members, label: "Profiles" },
              { value: summary.data.events, label: "Training events" },
              { value: summary.data.certificates, label: "Certificates issued" },
            ]
          : undefined
      }
    >
      {!summary.ok ? (
        <div className="gg-alert gg-alert--error" role="alert">
          {summary.error}
        </div>
      ) : null}
      <div className="ops-panel-head">
        <div>
          <p className="eyebrow-dark">Control boundary</p>
          <h2>Audited operations only</h2>
        </div>
      </div>
      <p className="helper">
        Routine privileged changes must use audited database functions. Table Editor is reserved for controlled setup or emergency technical correction.
      </p>
    </OperationsShell>
  );
}
