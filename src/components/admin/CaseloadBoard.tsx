"use client";

import { useRouter } from "next/navigation";
import type { CaseloadRow } from "@/lib/admin/types";
import { StatusChip, statusTone } from "@/components/admin/StatusChip";

export function CaseloadBoard({ rows }: { rows: CaseloadRow[] }) {
  const router = useRouter();
  if (rows.length === 0) {
    return (
      <div className="gg-empty">
        <b>No assigned members</b>
        <span>Super Admin assigns a clinician from the member record.</span>
      </div>
    );
  }
  return (
    <div className="admin-card-list">
      {rows.map((row) => (
        <button
          key={row.memberId}
          className="admin-card admin-card--editorial admin-card--button"
          type="button"
          onClick={() => router.push(`/admin/users/${row.memberId}`)}
        >
          <p className="eyebrow-dark">{row.rankName ?? "Member"}</p>
          <h2>{row.memberName}</h2>
          <p className="helper">
            Last clinical note {row.lastNoteAt ? new Date(row.lastNoteAt).toLocaleDateString() : "never"}
            {row.openTickets > 0 ? ` · ${row.openTickets} open tickets` : ""}
          </p>
          <StatusChip value={row.accountStatus} tone={statusTone(row.accountStatus)} />
        </button>
      ))}
    </div>
  );
}
