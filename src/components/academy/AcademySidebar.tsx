"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { DashboardData, RequirementView } from "@/lib/academy/types";
import { RankMark } from "@/components/academy/RankMark";
import {
  rankInsigniaSize,
  rankIsComplete,
  rankLockMessage,
  requirementActionLabel,
} from "@/components/academy/helpers";

export function AcademySidebar({
  data,
  next,
  complete,
  onRank,
  onNext,
}: {
  data: DashboardData;
  next: RequirementView | null;
  complete: boolean;
  onRank: (code: string, locked: string | null) => void;
  onNext: () => void;
}) {
  const aboutCurrent = usePathname() === "/academy/about";
  return (
    <aside className="side" aria-label="Academy navigation">
      <Link className="brand side-brand" href="/academy">
        <strong>GutGuard</strong>
        <em>Academy</em>
      </Link>
      <nav aria-label="Ranks" className="side-nav">
        {data.ranks.map((rank) => {
          const locked = rankLockMessage(
            rank,
            data.ranks,
            data.rankProgress,
          );
          const on = rank.code === data.selectedRank.code;
          const done = rankIsComplete(
            rank,
            data.rankProgress,
          );
          return (
            <button
              key={rank.id}
              className={`tap side-rank${on ? " on" : ""}`}
              aria-current={on ? "page" : undefined}
              onClick={() => onRank(rank.code, locked)}
            >
              <RankMark
                kind={rank.insigniaKind}
                metal={rank.metal}
                count={rank.insigniaCount}
                size={rankInsigniaSize(rank.code, "side")}
                mark={false}
              />
              <span className="grow">
                <b>{rank.fullName}</b>
                <em>{rank.phase}</em>
              </span>
              {locked ? <span className="lock">Locked</span> : null}
              {done ? <span className="tickmini">✓</span> : null}
            </button>
          );
        })}
        <Link
          className={`tap pill-btn side-about${aboutCurrent ? " on" : ""}`}
          href="/academy/about"
          aria-current={aboutCurrent ? "page" : undefined}
        >
          About Gentrep
        </Link>
      </nav>
      {!complete && next ? (
        <div className="side-next">
          <div className="eyebrow-dark">Do this next</div>
          <b>{next.title}</b>
          <button className="tap btn primary wide" onClick={onNext}>
            {requirementActionLabel(next)}
          </button>
        </div>
      ) : null}
    </aside>
  );
}
