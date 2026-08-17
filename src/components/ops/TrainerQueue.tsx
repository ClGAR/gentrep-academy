"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { verifyDemonstrationAction } from "@/lib/actions/academy";
import type { TrainerQueueRow } from "@/lib/academy/queries";

export function TrainerQueue({ rows }: { rows: TrainerQueueRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);

  if (rows.length === 0) {
    return (
      <div className="gg-empty">
        <b>No assigned demonstrations.</b>
        <span>Demonstrations for members assigned to you will appear here.</span>
      </div>
    );
  }

  return (
    <>
      {feedback ? (
        <div
          className={`gg-alert${feedback.kind === "error" ? " gg-alert--error" : ""}`}
          role={feedback.kind === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          {feedback.message}
        </div>
      ) : null}
      <div className="ops-table-wrap">
        <table className="ops-table">
          <thead>
            <tr>
              <th scope="col">Member</th>
              <th scope="col">Requirement</th>
              <th scope="col">Status</th>
              <th scope="col">Verify</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.memberId}-${row.requirementId}`}>
                <td>{row.memberName}</td>
                <td>{row.requirementTitle}</td>
                <td>
                  <span className={`gg-badge gg-badge--${row.status}`}>
                    {row.status === "done" ? "confirmed" : row.status}
                  </span>
                </td>
                <td>
                  {row.status === "done" ? (
                    <span className="ops-cell-meta">Recorded</span>
                  ) : (
                    <div className="ops-actions">
                      <button
                        className="gg-button gg-button--primary gg-button--sm"
                        disabled={pending}
                        onClick={() =>
                          startTransition(async () => {
                            setFeedback(null);
                            const result = await verifyDemonstrationAction({
                              memberId: row.memberId,
                              requirementId: row.requirementId,
                              status: "confirmed",
                            });
                            if (!result.ok) {
                              setFeedback({ kind: "error", message: result.error });
                              return;
                            }
                            setFeedback({ kind: "success", message: `${row.memberName}'s demonstration confirmed.` });
                            router.refresh();
                          })
                        }
                      >
                        {pending ? "Saving…" : "Confirm"}
                      </button>
                      <button
                        className="gg-button gg-button--danger gg-button--sm"
                        disabled={pending}
                        onClick={() =>
                          startTransition(async () => {
                            setFeedback(null);
                            const result = await verifyDemonstrationAction({
                              memberId: row.memberId,
                              requirementId: row.requirementId,
                              status: "rejected",
                            });
                            if (!result.ok) {
                              setFeedback({ kind: "error", message: result.error });
                              return;
                            }
                            setFeedback({ kind: "success", message: `${row.memberName}'s demonstration returned for review.` });
                            router.refresh();
                          })
                        }
                      >
                        {pending ? "Saving…" : "Reject"}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
