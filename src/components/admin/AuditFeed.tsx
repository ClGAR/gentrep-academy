import type { AuditRow } from "@/lib/admin/types";

export function AuditFeed({ rows }: { rows: AuditRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="gg-empty">
        <b>No audited writes yet</b>
        <span>Privileged RPCs append here. This log cannot be edited.</span>
      </div>
    );
  }
  return (
    <ol className="admin-feed">
      {rows.map((row) => (
        <li key={row.id}>
          <b>{row.action}</b>
          <span className="helper">
            {row.actorName ?? "System"} · {row.entityType}
            {row.entityId ? ` · ${row.entityId.slice(0, 8)}` : ""} · {new Date(row.createdAt).toLocaleString()}
          </span>
        </li>
      ))}
    </ol>
  );
}
