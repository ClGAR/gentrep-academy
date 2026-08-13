import { TrainerQueue } from "@/components/ops/TrainerQueue";
import { loadTrainerQueue } from "@/lib/academy/queries";
import { requireRole } from "@/lib/auth/guards";
import { signOut } from "@/lib/actions/auth";

export default async function TrainerPage() {
  await requireRole("trainer");
  const rows = await loadTrainerQueue();
  return (
    <main className="ops-shell">
      <p className="eyebrow-dark">Trainer</p>
      <h1 className="sec">Demonstration verifications</h1>
      <p className="helper">Confirm or reject assigned demonstrations. Members cannot sign themselves off.</p>
      <TrainerQueue rows={rows} />
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
