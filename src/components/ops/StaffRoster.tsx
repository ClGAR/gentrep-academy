"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordAttendanceAction } from "@/lib/actions/academy";
import type { StaffRosterRow } from "@/lib/academy/queries";

export function StaffRoster({ rows }: { rows: StaffRosterRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (rows.length === 0) {
    return <div className="gg-empty">No assigned bookings yet.</div>;
  }

  return (
    <table className="ops-table">
      <thead>
        <tr>
          <th>Session</th>
          <th>Member</th>
          <th>Status</th>
          <th>Check in</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.bookingId}>
            <td>
              <b>{row.eventTitle}</b>
              <div className="helper">{row.venue}</div>
            </td>
            <td>{row.memberName}</td>
            <td>{row.status}</td>
            <td>
              {row.status === "booked" || row.status === "waitlisted" ? (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="gg-button gg-button--primary gg-button--sm"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await recordAttendanceAction({ bookingId: row.bookingId, status: "attended" });
                        router.refresh();
                      })
                    }
                  >
                    Present
                  </button>
                  <button
                    className="gg-button gg-button--danger gg-button--sm"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await recordAttendanceAction({ bookingId: row.bookingId, status: "absent" });
                        router.refresh();
                      })
                    }
                  >
                    Absent
                  </button>
                </div>
              ) : (
                row.status
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
