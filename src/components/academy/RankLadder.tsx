"use client";

import type {
  RankProgressRecord,
  RankRecord,
} from "@/lib/academy/types";
import { RankMark } from "@/components/academy/RankMark";
import { rankInsigniaSize, rankLockMessage } from "@/components/academy/helpers";

export function RankLadder({
  ranks,
  selectedCode,
  rankProgress,
  onRank,
}: {
  ranks: RankRecord[];
  selectedCode: RankRecord["code"];
  rankProgress: RankProgressRecord[];
  onRank: (code: string, locked: string | null) => void;
}) {
  return (
    <nav className="ladder noscroll only-mobile" aria-label="Ranks">
      {ranks.map((rank) => {
        const locked = rankLockMessage(
          rank,
          ranks,
          rankProgress,
        );
        const on = rank.code === selectedCode;
        return (
          <button
            key={rank.id}
            className={`tap rung${on ? " on" : ""}`}
            aria-current={on ? "page" : undefined}
            onClick={() => onRank(rank.code, locked)}
          >
            <RankMark
              kind={rank.insigniaKind}
              metal={rank.metal}
              count={rank.insigniaCount}
              size={rankInsigniaSize(rank.code, "ladder")}
              mark={false}
            />
            <span className="ant">{rank.name}</span>
            <span className="sr-only">
              {rank.fullName}, {rank.phase}
              {locked ? `, locked. ${locked}` : ""}
            </span>
            {locked ? <span className="lock">Locked</span> : null}
          </button>
        );
      })}
    </nav>
  );
}
