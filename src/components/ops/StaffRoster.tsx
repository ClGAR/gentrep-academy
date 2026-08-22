"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordAttendanceAction } from "@/lib/actions/academy";
import type { StaffRosterRow } from "@/lib/academy/queries";

export function StaffRoster({ rows }: { rows: StaffRosterRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);

  if (rows.length === 0) {
    return (
      <div className="gg-empty">
        <b>No assigned bookings yet.</b>
        <span>Bookings for events assigned to you will appear here.</span>
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
      <div className="admin-table-wrap">
        <table className="ops-table">
          <thead>
            <tr>
              <th scope="col">Session</th>
              <th scope="col">Member</th>
              <th scope="col">Status</th>
              <th scope="col">Check in</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.bookingId}>
                <td>
                  <b>{row.eventTitle}</b>
                  <span className="ops-cell-meta">{row.venue}</span>
                </td>
                <td>{row.memberName}</td>
                <td>
                  <span className={`gg-badge gg-badge--${row.status}`}>
                    {row.status}
                  </span>
                </td>
                <td>
                  {row.status === "booked" || row.status === "waitlisted" ? (
                    <div className="ops-actions">
                      <button
                        className="gg-button gg-button--primary gg-button--sm"
                        disabled={pending}
                        onClick={() =>
                          startTransition(async () => {
                            setFeedback(null);
                            const result = await recordAttendanceAction({
                              bookingId: row.bookingId,
                              status: "attended",
                            });
                            if (!result.ok) {
                              setFeedback({ kind: "error", message: result.error });
                              return;
                            }
                            setFeedback({ kind: "success", message: `${row.memberName} marked present.` });
                            router.refresh();
                          })
                        }
                      >
                        {pending ? "Saving…" : "Present"}
                      </button>
                      <button
                        className="gg-button gg-button--danger gg-button--sm"
                        disabled={pending}
                        onClick={() =>
                          startTransition(async () => {
                            setFeedback(null);
                            const result = await recordAttendanceAction({
                              bookingId: row.bookingId,
                              status: "absent",
                            });
                            if (!result.ok) {
                              setFeedback({ kind: "error", message: result.error });
                              return;
                            }
                            setFeedback({ kind: "success", message: `${row.memberName} marked absent.` });
                            router.refresh();
                          })
                        }
                      >
                        {pending ? "Saving…" : "Absent"}
                      </button>
                    </div>
                  ) : (
                    <span className="ops-cell-meta">Recorded</span>
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
