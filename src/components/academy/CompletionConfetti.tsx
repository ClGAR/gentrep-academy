"use client";

import { useEffect, useState } from "react";
import { GA } from "@/components/academy/tokens";

export function CompletionConfetti({ fire }: { fire: number }) {
  const [pieces, setPieces] = useState<
    Array<{
      id: string;
      left: number;
      tx: number;
      ty: number;
      rot: number;
      c: string;
      w: number;
      h: number;
      d: number;
      delay: number;
    }>
  >([]);

  useEffect(() => {
    if (!fire || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const colors = [GA.gold, GA.blue, GA.ink, GA.mark, GA.good, GA.card];
    const timer = window.setTimeout(() => {
      setPieces(
        Array.from({ length: 80 }, (_, index) => ({
          id: `${fire}-${index}`,
          left: 50 + (Math.random() - 0.5) * 70,
          tx: (Math.random() - 0.5) * 600,
          ty: 120 + Math.random() * 260,
          rot: (Math.random() - 0.5) * 900,
          c: colors[(Math.random() * colors.length) | 0] ?? GA.gold,
          w: 6 + Math.random() * 7,
          h: 9 + Math.random() * 12,
          d: 1.5 + Math.random() * 0.8,
          delay: Math.random() * 0.2,
        })),
      );
    }, 0);
    const hide = window.setTimeout(() => setPieces([]), 2800);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(hide);
    };
  }, [fire]);

  if (!pieces.length) return null;

  return (
    <div className="cf-wrap" aria-hidden="true">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="cf"
          style={{
            left: `${piece.left}%`,
            width: piece.w,
            height: piece.h,
            background: piece.c,
            ["--tx" as string]: `${piece.tx}px`,
            ["--ty" as string]: `${piece.ty}px`,
            ["--rot" as string]: `${piece.rot}deg`,
            animationDuration: `${piece.d}s`,
            animationDelay: `${piece.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
