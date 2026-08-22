import { AdminHero } from "@/components/admin/AdminHero";
import { TicketInbox } from "@/components/admin/TicketInbox";
import { hasCapability } from "@/lib/admin/rbac";
import { loadPublishedAnswers, loadTickets } from "@/lib/admin/queries";
import { requireCapability } from "@/lib/auth/guards";

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { roles } = await requireCapability("tickets.read");
  const params = await searchParams;
  const status = params.status ?? "all";
  const [rows, answers] = await Promise.all([loadTickets({ status }), loadPublishedAnswers()]);
  return (
    <div className="admin-stack">
      <AdminHero
        kicker="Support"
        title="Tickets"
        lede="Identity and holds live here. Clinical notes do not."
        summary={{ label: "In view", value: rows.length }}
      />
      <TicketInbox rows={rows} status={status} canWrite={hasCapability(roles, "tickets.write")} />
      <section className="admin-card">
        <header className="admin-section-head">
          <h2>Cite</h2>
          <span>Published</span>
        </header>
        <p className="helper">Published FAQ and education only. Do not invent product claims.</p>
        {answers.length === 0 ? (
          <div className="gg-empty">
            <b>No published answers</b>
            <span>Ask Super Admin to publish FAQ or education for this desk.</span>
          </div>
        ) : (
          <div className="admin-cite">
            {answers.map((answer) => (
              <article key={answer.id}>
                <p className="eyebrow-dark">{answer.collection}</p>
                <b>{answer.title}</b>
                {answer.excerpt ? <p className="helper">{answer.excerpt}</p> : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
