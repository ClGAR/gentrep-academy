export function StatusChip({
  value,
  tone = "neutral",
}: {
  value: string;
  tone?: "neutral" | "good" | "warn" | "danger" | "gold";
}) {
  return <span className={`admin-chip admin-chip--${tone}`}>{value.replaceAll("_", " ")}</span>;
}

export function statusTone(status: string): "neutral" | "good" | "warn" | "danger" | "gold" {
  if (["active", "published", "resolved", "approved", "done"].includes(status)) return "good";
  if (["in_review", "pending", "invited", "waitlisted"].includes(status)) return "gold";
  if (["suspended", "rejected", "missed"].includes(status)) return "danger";
  if (["draft", "open", "urgent", "high"].includes(status)) return "warn";
  return "neutral";
}
