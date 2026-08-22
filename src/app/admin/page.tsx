import Link from "next/link";
import { AdminHero } from "@/components/admin/AdminHero";
import { AuditFeed } from "@/components/admin/AuditFeed";
import { KpiStrip } from "@/components/admin/KpiStrip";
import { hasCapability, personaLabel, primaryPortalRole } from "@/lib/admin/rbac";
import { loadPortalOverview } from "@/lib/admin/queries";
import { requirePortalAccess } from "@/lib/auth/guards";

export default async function AdminHomePage() {
  const { roles } = await requirePortalAccess();
  const overview = await loadPortalOverview(roles);
  const persona = personaLabel(roles);
  const primary = primaryPortalRole(roles);

  const kpis =
    primary === "clinician"
      ? [
          { label: "Caseload", value: overview.assignedMembers, hint: "Assigned members" },
          { label: "In review", value: overview.entriesInReview, hint: "Protocols waiting on you" },
          { label: "Live content", value: overview.publishedEntries, hint: "Published entries" },
        ]
      : primary === "support"
        ? [
            { label: "Open tickets", value: overview.openTickets, hint: "Needs a reply or hold" },
            { label: "People", value: overview.members, hint: "Searchable directory" },
            { label: "Live content", value: overview.publishedEntries, hint: "Answers you can cite" },
          ]
        : [
            { label: "People", value: overview.members, hint: "All profiles" },
            { label: "Tickets", value: overview.openTickets, hint: "Open or pending" },
            { label: "In review", value: overview.entriesInReview, hint: "Clinical gate" },
            { label: "Published", value: overview.publishedEntries, hint: "Live CMS" },
          ];

  const [headline, ...rest] = kpis;
  const nextLinks = [
    hasCapability(roles, "users.directory") ? { href: "/admin/users", label: "Search people" } : null,
    hasCapability(roles, "caseload.read") ? { href: "/admin/caseload", label: "Open caseload" } : null,
    hasCapability(roles, "tickets.read") ? { href: "/admin/tickets", label: "Work tickets" } : null,
    hasCapability(roles, "content.read") ? { href: "/admin/content", label: "Review content" } : null,
  ].filter(Boolean) as Array<{ href: string; label: string }>;

  return (
    <div className="admin-stack">
      <AdminHero
        kicker={`Admin · ${persona}`}
        title="Today"
        lede="One desk. Only the work this role can finish."
        summary={{ label: headline.label, value: headline.value }}
      />
      {rest.length > 0 ? <KpiStrip items={rest} /> : null}
      {nextLinks.length > 0 ? (
        <section>
          <header className="admin-section-head">
            <h2>Start here</h2>
            <span>Work</span>
          </header>
          <nav className="admin-tabs" aria-label="Start here">
            {nextLinks.map((link, index) => (
              <Link key={link.href} href={link.href} className={index === 0 ? "on" : undefined}>
                {link.label}
              </Link>
            ))}
          </nav>
        </section>
      ) : null}
      {hasCapability(roles, "audit.read") ? (
        <section className="admin-card">
          <header className="admin-section-head">
            <h2>Recent audit</h2>
            <span>System</span>
          </header>
          <AuditFeed rows={overview.recentAudit} />
        </section>
      ) : null}
    </div>
  );
}
