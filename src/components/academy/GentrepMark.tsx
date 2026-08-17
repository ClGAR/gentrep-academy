import type { CSSProperties } from "react";
import { GA } from "@/components/academy/tokens";
import { GENTREP_MARK_PATH, GENTREP_WORDMARK_PATH } from "@/components/academy/gentrep-paths";

export function GentrepMark({
  height = 28,
  color = "currentColor",
  markOnly = false,
  className,
  style,
}: {
  height?: number;
  color?: string;
  markOnly?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const aspect = markOnly ? 289 / 356 : 1688 / 508;
  return (
    <svg
      viewBox={markOnly ? "8 1 289 356" : "0 0 1688 508"}
      height={height}
      width={height * aspect}
      className={className}
      style={{ display: "block", overflow: "visible", flexShrink: 0, ...style }}
      role={markOnly ? "presentation" : "img"}
      aria-hidden={markOnly ? true : undefined}
      aria-label={markOnly ? undefined : "Gentrep"}
    >
      {!markOnly ? (
        <path d={GENTREP_WORDMARK_PATH} fill={color} fillRule="evenodd" />
      ) : null}
      <path d={GENTREP_MARK_PATH} fill={GA.mark} fillRule="evenodd" />
    </svg>
  );
}
