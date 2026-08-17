import { loadAdminSummary } from "@/lib/academy/queries";
import { requireRole } from "@/lib/auth/guards";
import { signOut } from "@/lib/actions/auth";

export default async function AdminPage() {
  await requireRole("admin");
  const summary = await loadAdminSummary();
  return (
    <main className="ops-shell">
      <p className="eyebrow-dark">Admin</p>
      <h1 className="sec">Academy operations</h1>
      <p className="helper">
        Members, ranks, events, and certificates are managed in Supabase with audited server actions. This screen is the working MVP desk.
      </p>
      <div className="about-table">
        <div>
          <b>{summary.members}</b>
          <span>Profiles</span>
        </div>
        <div>
          <b>{summary.events}</b>
          <span>Training events</span>
        </div>
        <div>
          <b>{summary.certificates}</b>
          <span>Certificates issued</span>
        </div>
      </div>
      <p className="helper">
        Routine privileged changes must use audited database functions. Table Editor is reserved for controlled setup or emergency technical correction.
      </p>
      <p>
        <a href="/academy">Member dashboard</a> · <a href="/staff/events">Staff</a> ·{" "}
        <a href="/trainer/verifications">Trainer</a>
      </p>
      <form action={signOut}>
        <button className="gg-button gg-button--secondary" type="submit">
          Sign out
        </button>
      </form>
    </main>
  );
}
