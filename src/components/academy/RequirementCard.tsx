"use client";

import { useState } from "react";
import { TYPE_LABELS, type EventRecord, type RequirementView } from "@/lib/academy/types";
import { RankMark } from "@/components/academy/RankMark";
import { GA } from "@/components/academy/tokens";
import { eventDay, rankInsigniaSize, remainingSeats, statusColor } from "@/components/academy/helpers";

export function RequirementCard({
  req,
  index,
  total,
  isNext,
  expanded,
  pending,
  prevDone,
  isLast,
  onOpenDoc,
  onToggle,
  onBook,
  onWaitlist,
  onCancel,
  cardRef,
}: {
  req: RequirementView;
  index: number;
  total: number;
  isNext: boolean;
  expanded: boolean;
  pending: boolean;
  prevDone: boolean;
  isLast: boolean;
  onOpenDoc: () => void;
  onToggle: () => void;
  onBook: (event: EventRecord) => void;
  onWaitlist: (event: EventRecord) => void;
  onCancel: () => void;
  cardRef: (node: HTMLElement | null) => void;
}) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const futureEvents = req.matchingEvents.filter((event) => event.status === "scheduled");
  const helperColor = statusColor(req.status);
  const railGold = prevDone && req.status === "done";

  return (
    <li className="req">
      <div className="spine" aria-hidden="true">
        <span
          className="rail"
          style={{
            background: railGold ? GA.gold : GA.line,
            top: index === 0 ? 30 : 0,
            bottom: isLast ? "calc(100% - 30px)" : -10,
          }}
        />
        <span className={`node ${req.status}`}>
          {req.status === "done"
            ? "✓"
            : req.status === "missed" || req.status === "rejected"
              ? "!"
              : ""}
        </span>
      </div>
      <article
        ref={cardRef}
        className={`req-card${
          req.status === "missed" || req.status === "rejected"
            ? " missed"
            : isNext || expanded
              ? " active"
              : ""
        }`}
      >
        <div className="req-head">
          <div className="req-type" style={{ color: isNext ? GA.blue : GA.mute }}>
            {isNext ? `Do this next · ${TYPE_LABELS[req.type]}` : TYPE_LABELS[req.type]}
          </div>
          <h3>
            {req.title}
            <span className="sr-only">
              . Requirement {index + 1} of {total}. {req.helper}
            </span>
          </h3>
          <p style={{ color: helperColor, fontWeight: req.status === "open" ? 400 : 600 }}>{req.helper}</p>
        </div>
        {req.type === "document" && req.status !== "done" ? (
          <div className="req-act">
            <button className="tap btn primary wide flat" onClick={onOpenDoc}>
              Watch the video
            </button>
          </div>
        ) : null}
        {req.type === "attendance" && req.status !== "done" ? (
          <div className="req-act">
            <button
              className="tap btn primary wide flat"
              aria-expanded={expanded}
              aria-controls={`d-${req.id}`}
              onClick={onToggle}
              style={
                req.status === "booked" || req.status === "waitlisted"
                  ? { background: "#fff", border: `1.5px solid ${GA.line}`, color: GA.navy }
                  : undefined
              }
            >
              {expanded
                ? "Hide dates"
                : req.status === "booked" || req.status === "waitlisted"
                  ? "Change date"
                  : req.status === "missed"
                    ? "Pick another date"
                    : `See ${futureEvents.length} dates`}
            </button>
          </div>
        ) : null}
        {expanded && req.type === "attendance" ? (
          <div className="dates fade" id={`d-${req.id}`} role="group" aria-label={`Dates for ${req.title}`}>
            {futureEvents.length === 0 ? (
              <p className="fine pad">GEMA hasn&apos;t posted a date for this yet. You&apos;ll be told when one appears.</p>
            ) : (
              futureEvents.map((event) => {
                const meta = eventDay(event.startsAt);
                const remaining = remainingSeats(event);
                const mine = req.bookedEvent?.id === event.id;
                const full = remaining <= 0;
                const mustReleaseCurrent = Boolean(req.bookingId) && !mine;
                return (
                  <div key={event.id} className={`ev${mine ? " mine" : ""}`}>
                    <div className="datebox">
                      <em>{meta.weekday}</em>
                      <b>{meta.day}</b>
                      <em>{meta.month}</em>
                    </div>
                    <div className="grow">
                      <div className="ev-place">{event.venue}</div>
                      <div className="ev-meta">
                        {meta.when} ·{" "}
                        <RankMark
                          kind={event.hostRankCode === "BASE" ? "seal" : event.hostRankCode === "CC" ? "field" : "bars"}
                          metal={event.hostRankCode === "BASE" ? "bronze" : event.hostRankCode === "CC" ? "gold" : "silver"}
                          count={event.hostRankCode === "TL" ? 1 : event.hostRankCode === "SL" ? 2 : event.hostRankCode === "PL" ? 3 : 1}
                          size={rankInsigniaSize(event.hostRankCode, "host")}
                          mark={false}
                        />{" "}
                        {event.hostName}
                      </div>
                      <div className="ev-seats" style={{ color: full ? GA.clay : remaining <= 5 ? GA.warn : GA.mute }}>
                        {full ? "Full — join the waitlist" : `${remaining} seats left`}
                      </div>
                    </div>
                    {mine ? (
                      confirmId === event.id ? (
                        <div className="confirm">
                          <button className="tap btn danger sm" disabled={pending} onClick={onCancel}>
                            Give it up
                          </button>
                          <button className="tap btn navy sm" onClick={() => setConfirmId(null)}>
                            Keep
                          </button>
                        </div>
                      ) : (
                        <button className="tap btn booked sm" onClick={() => setConfirmId(event.id)}>
                          {req.status === "waitlisted"
                            ? "Waitlisted · leave"
                            : "Booked · cancel"}
                        </button>
                      )
                    ) : (
                      <button
                        className="tap btn sm ev-act"
                        disabled={pending || mustReleaseCurrent}
                        aria-label={
                          mustReleaseCurrent
                            ? `Cancel your current booking before choosing ${meta.weekday} ${meta.day} ${meta.month}, ${event.venue}`
                            : `${full ? "Join waitlist for " : "Reserve seat for "}${req.title}, ${meta.weekday} ${meta.day} ${meta.month}, ${event.venue}`
                        }
                        onClick={() => (full ? onWaitlist(event) : onBook(event))}
                        style={
                          full
                            ? { background: "#fff", border: `1.5px solid ${GA.line}`, color: GA.navy }
                            : { background: GA.blue, color: "#fff" }
                        }
                      >
                        {mustReleaseCurrent
                          ? "Cancel first"
                          : full
                            ? "Waitlist"
                            : "Reserve"}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : null}
        {req.type === "demonstration" && req.status !== "done" ? (
          <div className="req-act">
            <p className="fine">Your upline records this on the day. Nothing to do here.</p>
          </div>
        ) : null}
        {req.type === "derived" && req.status !== "done" ? (
          <div className="req-act">
            <p className="fine">This completes when they certify. Their certificate, not your word.</p>
          </div>
        ) : null}
      </article>
    </li>
  );
}
