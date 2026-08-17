"use client";

import type { RankCode, RankRecord } from "@/lib/academy/types";

export function DemoWalkLadder({
  ranks,
  selectedName,
  onComplete,
  onCertificate,
  onReset,
}: {
  ranks: RankRecord[];
  selectedName: string;
  onComplete: (code: RankCode) => void;
  onCertificate: () => void;
  onReset: () => void;
}) {
  return (
    <div className="demo no-print">
      <div className="demo-label">Demo · walk the ladder</div>
      <p className="demo-note">
        Completes a rank the way it would really be earned — documents agreed, attendance recorded, demonstrations signed
        off, derived ones by a trainee&apos;s certificate — then issues the certificate.
      </p>
      <div className="demo-row">
        {ranks.map((rank) => (
          <button key={rank.id} className="tap demo-btn" type="button" onClick={() => onComplete(rank.code)}>
            Complete {rank.name}
          </button>
        ))}
      </div>
      <div className="demo-row">
        <button className="tap demo-btn" type="button" onClick={onCertificate}>
          Certificate for {selectedName}
        </button>
        <button className="tap demo-btn" type="button" onClick={onReset}>
          Reset all
        </button>
      </div>
    </div>
  );
}
