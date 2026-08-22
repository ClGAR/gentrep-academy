import { AdminHero } from "@/components/admin/AdminHero";
import { AuditFeed } from "@/components/admin/AuditFeed";
import { loadAuditLog } from "@/lib/admin/queries";
import { requireCapability } from "@/lib/auth/guards";

export default async function AuditPage() {
  await requireCapability("audit.read");
  const rows = await loadAuditLog();
  return (
    <div className="admin-stack">
      <AdminHero
        kicker="System"
        title="Audit"
        lede="Privileged writes only. Super Admin can read; nobody can edit the log from this desk."
        summary={{ label: "Events", value: rows.length }}
      />
      <section className="admin-card">
        <AuditFeed rows={rows} />
      </section>
    </div>
  );
}
