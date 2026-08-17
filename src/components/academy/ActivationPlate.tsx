import type { ProgressStatus, RankRecord, RequirementView } from "@/lib/academy/types";
import { GentrepMark } from "@/components/academy/GentrepMark";

export function ActivationPlate({
  rank,
  requirements,
  doneCount,
  bookedCount,
  missedCount,
  complete,
}: {
  rank: RankRecord;
  requirements: RequirementView[];
  doneCount: number;
  bookedCount: number;
  missedCount: number;
  complete: boolean;
}) {
  return (
    <section className={`plate hatch${complete ? " done" : ""}`}>
      <GentrepMark
        markOnly
        height={210}
        className="plate-mark"
        style={{
          position: "absolute",
          top: "50%",
          left: "72%",
          transform: "translateY(-50%)",
          opacity: 0.16,
          zIndex: -1,
          pointerEvents: "none",
          maxWidth: "none",
        }}
      />
      <div className="rule-row">
        <i />
        <span>{rank.eyebrow}</span>
      </div>
      <h1 className="ant plate-title">{rank.fullName}</h1>
      <div className="plate-sub">
        {rank.phase}
        {rank.abbr ? ` · ${rank.abbr}` : ""}
      </div>
      <div className="plate-foot">
        <b>{complete ? "All done." : `${doneCount} of ${requirements.length} done`}</b>
        <span className="pips">
          {requirements.map((item) => (
            <i key={item.id} className={`pip ${pipClass(item.status)}`} />
          ))}
        </span>
      </div>
      <div
        className="bar"
        role="progressbar"
        aria-valuenow={doneCount}
        aria-valuemin={0}
        aria-valuemax={requirements.length}
        aria-label={`${rank.fullName} progress`}
        aria-valuetext={`${doneCount} of ${requirements.length} complete`}
      >
        <i style={{ width: `${requirements.length ? (doneCount / requirements.length) * 100 : 0}%` }} />
      </div>
      <div className="plate-note">
        {[bookedCount ? `${bookedCount} booked` : null, missedCount ? `${missedCount} missed` : null]
          .filter(Boolean)
          .join(" · ") || "\u00a0"}
      </div>
    </section>
  );
}

function pipClass(status: ProgressStatus) {
  if (status === "waitlisted") return "booked";
  return status;
}
