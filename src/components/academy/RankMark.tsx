export function RankMark({
  kind,
  metal,
  size = 24,
}: {
  kind: "seal" | "bars" | "field";
  metal: "bronze" | "silver" | "gold";
  size?: number;
}) {
  const fill = metal === "gold" ? "#b08d5b" : metal === "bronze" ? "#8c5a2b" : "#7e8a9c";
  if (kind === "bars") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="8" width="18" height="3" rx="1" fill={fill} />
        <rect x="3" y="13" width="18" height="3" rx="1" fill={fill} />
      </svg>
    );
  }
  if (kind === "field") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2 22 12 12 22 2 12 Z" fill={fill} />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill={fill} />
    </svg>
  );
}
