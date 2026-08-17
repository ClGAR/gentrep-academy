"use client";

import type { MutableRefObject } from "react";
import type { EventRecord, RankRecord, RequirementView } from "@/lib/academy/types";
import { RankMark } from "@/components/academy/RankMark";
import { RequirementCard } from "@/components/academy/RequirementCard";
import { rankInsigniaSize } from "@/components/academy/helpers";

export function RequirementTimeline({
  requirements,
  nextId,
  openReq,
  pending,
  selectedRank,
  complete,
  cardRefs,
  onOpenDoc,
  onToggle,
  onBook,
  onWaitlist,
  onCancel,
  onSeeCertificate,
}: {
  requirements: RequirementView[];
  nextId: string | undefined;
  openReq: string | null;
  pending: boolean;
  selectedRank: RankRecord;
  complete: boolean;
  cardRefs: MutableRefObject<Record<string, HTMLElement | null>>;
  onOpenDoc: (id: string) => void;
  onToggle: (id: string) => void;
  onBook: (req: RequirementView, event: EventRecord) => void;
  onWaitlist: (req: RequirementView, event: EventRecord) => void;
  onCancel: (req: RequirementView) => void;
  onSeeCertificate: () => void;
}) {
  return (
    <>
      <div className="bar-title">
        <h2 className="sec" id="reqs" tabIndex={-1}>
          What it takes
        </h2>
      </div>
      <p className="sr-only">
        {requirements.filter((item) => item.status === "done").length} of {requirements.length} requirements complete.
      </p>
      {requirements.length === 0 ? (
        <div className="ga-empty">No requirements are posted for this rank yet.</div>
      ) : (
        <ol className="reqs">
          {requirements.map((req, index) => (
            <RequirementCard
              key={req.id}
              req={req}
              index={index}
              total={requirements.length}
              isNext={nextId === req.id}
              expanded={openReq === req.id}
              pending={pending}
              prevDone={index > 0 && requirements[index - 1]?.status === "done"}
              isLast={index === requirements.length - 1}
              onOpenDoc={() => onOpenDoc(req.id)}
              onToggle={() => onToggle(req.id)}
              onBook={(event) => onBook(req, event)}
              onWaitlist={(event) => onWaitlist(req, event)}
              onCancel={() => onCancel(req)}
              cardRef={(node) => {
                cardRefs.current[req.id] = node;
              }}
            />
          ))}
        </ol>
      )}
      <div className="bar-title">
        <span className="sec">Then</span>
      </div>
      <div className={`outcome${complete ? " done" : ""}`}>
        <RankMark
          kind={selectedRank.insigniaKind}
          metal={selectedRank.metal}
          count={selectedRank.insigniaCount}
          size={rankInsigniaSize(selectedRank.code, "plate")}
        />
        <p>
          {complete
            ? `Done — ${selectedRank.opensText}`
            : `Finish all ${requirements.length} and you're ${selectedRank.pinLabel}. ${selectedRank.opensText}`}
        </p>
      </div>
      {complete ? (
        <button className="tap btn navy wide" onClick={onSeeCertificate}>
          See my certificate
        </button>
      ) : null}
    </>
  );
}
