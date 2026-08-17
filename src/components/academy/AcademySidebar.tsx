"use client";

import { signOut } from "@/lib/actions/auth";
import type { DashboardData, RequirementView } from "@/lib/academy/types";
import { GentrepMark } from "@/components/academy/GentrepMark";
import { RankMark } from "@/components/academy/RankMark";
import { GA } from "@/components/academy/tokens";
import {
  initials,
  rankInsigniaSize,
  rankIsComplete,
  rankLockMessage,
  requirementActionLabel,
  teamFullName,
} from "@/components/academy/helpers";

export function AcademySidebar({
  data,
  next,
  complete,
  onAbout,
  onRank,
  onNext,
}: {
  data: DashboardData;
  next: RequirementView | null;
  complete: boolean;
  onAbout: () => void;
  onRank: (code: string, locked: string | null) => void;
  onNext: () => void;
}) {
  return (
    <aside className="side" aria-label="Academy navigation">
      <div className="brand">
        <GentrepMark height={24} color={GA.navy} />
        <span className="serif">Academy</span>
      </div>
      <div className="who">
        <span className="avatar">{initials(data.profile.fullName)}</span>
        <span>
          <b>{data.profile.fullName}</b>
          <em>{teamFullName(data.profile.teamName)}</em>
        </span>
      </div>
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
      </nav>
      <button className="tap side-btn" onClick={onAbout}>
        About Gentrep Academy
      </button>
      {(data.profile.roles.includes("staff") ||
        data.profile.roles.includes("trainer") ||
        data.profile.roles.includes("admin")) && (
        <div className="ops-links">
          {data.profile.roles.includes("staff") || data.profile.roles.includes("admin") ? (
            <a className="tap side-btn" href="/staff/events">
              Staff roster
            </a>
          ) : null}
          {data.profile.roles.includes("trainer") || data.profile.roles.includes("admin") ? (
            <a className="tap side-btn" href="/trainer/verifications">
              Trainer desk
            </a>
          ) : null}
          {data.profile.roles.includes("admin") ? (
            <a className="tap side-btn" href="/admin">
              Admin
            </a>
          ) : null}
          <form action={signOut}>
            <button className="tap side-btn" type="submit">
              Sign out
            </button>
          </form>
        </div>
      )}
      {!(data.profile.roles.includes("staff") ||
        data.profile.roles.includes("trainer") ||
        data.profile.roles.includes("admin")) && (
        <form action={signOut}>
          <button className="tap side-btn" type="submit">
            Sign out
          </button>
        </form>
      )}
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
