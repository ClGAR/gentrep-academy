import { StaffRoster } from "@/components/ops/StaffRoster";
import { loadStaffRoster } from "@/lib/academy/queries";
import { requireRole } from "@/lib/auth/guards";
import { signOut } from "@/lib/actions/auth";

export default async function StaffEventsPage() {
  await requireRole("staff");
  const rows = await loadStaffRoster();
  return (
    <main className="ops-shell">
      <p className="eyebrow-dark">Staff</p>
      <h1 className="sec">Assigned events</h1>
      <p className="helper">Check members in only after they are present. Members cannot mark themselves.</p>
      <StaffRoster rows={rows} />
      <p style={{ marginTop: 24 }}>
        <a href="/academy">Back to academy</a>
      </p>
      <form action={signOut}>
        <button className="gg-button gg-button--secondary" type="submit">
          Sign out
        </button>
      </form>
    </main>
  );
}
