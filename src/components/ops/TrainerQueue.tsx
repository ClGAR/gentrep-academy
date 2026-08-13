"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { verifyDemonstrationAction } from "@/lib/actions/academy";
import type { TrainerQueueRow } from "@/lib/academy/queries";

export function TrainerQueue({ rows }: { rows: TrainerQueueRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (rows.length === 0) {
    return <div className="gg-empty">No assigned demonstrations.</div>;
  }

  return (
    <table className="ops-table">
      <thead>
        <tr>
          <th>Member</th>
          <th>Requirement</th>
          <th>Status</th>
          <th>Verify</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={`${row.memberId}-${row.requirementId}`}>
            <td>{row.memberName}</td>
            <td>{row.requirementTitle}</td>
            <td>{row.status}</td>
            <td>
              {row.status === "done" ? (
                "Confirmed"
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="gg-button gg-button--primary gg-button--sm"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await verifyDemonstrationAction({
                          memberId: row.memberId,
                          requirementId: row.requirementId,
                          status: "confirmed",
                        });
                        router.refresh();
                      })
                    }
                  >
                    Confirm
                  </button>
                  <button
                    className="gg-button gg-button--danger gg-button--sm"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await verifyDemonstrationAction({
                          memberId: row.memberId,
                          requirementId: row.requirementId,
                          status: "rejected",
                        });
                        router.refresh();
                      })
                    }
                  >
                    Reject
                  </button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
