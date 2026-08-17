"use client";

import { useId } from "react";
import { GA, METALS, type Metal } from "@/components/academy/tokens";

function coord(value: number) {
  return Number(value.toFixed(3));
}

function GentrepTriad({ cx, cy, s }: { cx: number; cy: number; s: number }) {
  return (
    <g
      fill={GA.mark}
      stroke={GA.mark}
      strokeWidth={coord(s * 0.15)}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line
        x1={coord(cx - s * 0.42)}
        y1={coord(cy + s * 0.3)}
        x2={coord(cx + s * 0.12)}
        y2={coord(cy - s * 0.46)}
      />
      <line
        x1={coord(cx - s * 0.42)}
        y1={coord(cy + s * 0.3)}
        x2={coord(cx + s * 0.44)}
        y2={coord(cy + s * 0.28)}
      />
      <circle cx={coord(cx + s * 0.12)} cy={coord(cy - s * 0.46)} r={coord(s * 0.19)} />
      <circle cx={coord(cx - s * 0.42)} cy={coord(cy + s * 0.3)} r={coord(s * 0.25)} />
      <circle cx={coord(cx + s * 0.44)} cy={coord(cy + s * 0.28)} r={coord(s * 0.33)} />
    </g>
  );
}

function useMetalPaint(metal: Metal) {
  const rawId = useId().replace(/:/g, "");
  const id = `ga-metal-${metal}-${rawId}`;
  const swatch = METALS[metal];
  return {
    id,
    swatch,
    defs: (
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor={swatch.hi} />
          <stop offset="42%" stopColor={swatch.mid} />
          <stop offset="72%" stopColor={swatch.lo} />
          <stop offset="100%" stopColor={swatch.mid} />
        </linearGradient>
      </defs>
    ),
  };
}

function SealMark({ size, metal }: { size: number; metal: Metal }) {
  const { id, swatch, defs } = useMetalPaint(metal);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" style={{ flexShrink: 0 }}>
      {defs}
      <circle cx="50" cy="50" r="46" fill={`url(#${id})`} stroke={swatch.lo} strokeWidth="2.4" />
      <circle cx="50" cy="50" r="38" fill="none" stroke={swatch.ink} strokeWidth="1.5" opacity=".32" />
      {Array.from({ length: 24 }).map((_, index) => {
        const angle = (index * 15 * Math.PI) / 180;
        const x1 = coord(50 + Math.cos(angle) * 39);
        const y1 = coord(50 + Math.sin(angle) * 39);
        const x2 = coord(50 + Math.cos(angle) * 45);
        const y2 = coord(50 + Math.sin(angle) * 45);
        return (
          <line
            key={index}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={swatch.ink}
            strokeWidth="1.3"
            opacity=".42"
          />
        );
      })}
      <GentrepTriad cx={50} cy={50} s={26} />
    </svg>
  );
}

function BarMark({
  count,
  size,
  metal,
  mark,
}: {
  count: number;
  size: number;
  metal: Metal;
  mark: boolean;
}) {
  const { id, swatch, defs } = useMetalPaint(metal);
  const bar = 21;
  const gap = 9;
  const width = 100;
  const height = count * bar + (count - 1) * gap;
  return (
    <svg
      width={size * 1.7}
      height={size * 1.7 * (height / width)}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {defs}
      {Array.from({ length: count }).map((_, index) => (
        <g key={index}>
          <rect
            x="1.5"
            y={coord(index * (bar + gap) + 1.2)}
            width={width - 3}
            height={bar - 2.4}
            rx={4}
            fill={`url(#${id})`}
            stroke={swatch.lo}
            strokeWidth="2.2"
          />
          <line
            x1="7"
            y1={coord(index * (bar + gap) + bar * 0.34)}
            x2={width - 7}
            y2={coord(index * (bar + gap) + bar * 0.34)}
            stroke={swatch.hi}
            strokeWidth="1.2"
            opacity=".55"
          />
        </g>
      ))}
      {mark ? <GentrepTriad cx={width / 2} cy={height / 2} s={height * 0.42} /> : null}
    </svg>
  );
}

function FieldMark({ size, metal, mark }: { size: number; metal: Metal; mark: boolean }) {
  const { id, swatch, defs } = useMetalPaint(metal);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" style={{ flexShrink: 0 }}>
      {defs}
      <path
        d="M50 4 L96 50 L50 96 L4 50 Z"
        fill={`url(#${id})`}
        stroke={swatch.lo}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path d="M50 15 L85 50 L50 85 L15 50 Z" fill="none" stroke={swatch.ink} strokeWidth="1.4" opacity=".3" />
      <path d="M50 4 L96 50 L50 50 Z" fill={swatch.hi} opacity=".28" />
      {mark ? <GentrepTriad cx={50} cy={50} s={26} /> : null}
    </svg>
  );
}

export function RankMark({
  kind,
  metal,
  size = 24,
  count = 1,
  mark = true,
}: {
  kind: "seal" | "bars" | "field";
  metal: Metal;
  size?: number;
  count?: number;
  mark?: boolean;
}) {
  if (kind === "seal") return <SealMark size={size} metal={metal} />;
  if (kind === "field") return <FieldMark size={size} metal={metal} mark={mark} />;
  return <BarMark count={count} size={size} metal={metal} mark={mark} />;
}
