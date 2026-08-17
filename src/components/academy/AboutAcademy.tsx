"use client";

import type { RankRecord } from "@/lib/academy/types";
import { AcademyDialog } from "@/components/academy/AcademyDialog";
import { RankMark } from "@/components/academy/RankMark";
import { rankInsigniaSize } from "@/components/academy/helpers";

const PROOF_ROWS = [
  ["Watch and agree", "You agree in the app; the record is kept"],
  ["Attend", "The scan at the door"],
  ["Show it", "An upline watches and signs it off"],
  ["Earned by your trainee", "Their certificate, not your word"],
] as const;

const CHANGE_ROWS = [
  ["Cannot make it?", "Open the date and cancel. The seat goes back to someone else."],
  ["Want a different date?", "Tap Switch. No need to cancel first."],
  ["Session full?", "Join the waitlist and you'll be told when a seat opens."],
  ["Missed one?", "Pick another date. Nothing else you've done is lost."],
  ["No dates posted?", "That one is waiting on us, not on you."],
  ["Is there a deadline?", "No. Most finish a level in about three weeks."],
] as const;

export function AboutAcademy({
  ranks,
  onClose,
}: {
  ranks: RankRecord[];
  onClose: () => void;
}) {
  return (
    <AcademyDialog label="About Gentrep Academy" onClose={onClose}>
      <div className="sheet-head">
        <div>
          <h2 className="ant h1">About Gentrep Academy</h2>
          <p className="fine">Read this once. About five minutes.</p>
        </div>
        <button className="tap pill" onClick={onClose} aria-label="Close">
          Close
        </button>
      </div>
      <p className="lead">
        The Academy is where you learn this business, one level at a time. Every level is a short course: sessions you attend in person, and a scan at the door that records you were there. You never tick your own boxes — that is what makes them worth something.
      </p>
      <h3 className="sec mt">The five levels</h3>
      {ranks.map((rank) => (
        <div className="about-lvl" key={rank.id}>
          <RankMark
            kind={rank.insigniaKind}
            metal={rank.metal}
            count={rank.insigniaCount}
            size={rankInsigniaSize(rank.code, "about")}
            mark={false}
          />
          <div>
            <b>{rank.fullName}</b>
            <em>{rank.phase}</em>
          </div>
        </div>
      ))}
      <h3 className="sec mt">How a course is proven</h3>
      <div className="about-table">
        {PROOF_ROWS.map(([title, body]) => (
          <div key={title}>
            <b>{title}</b>
            <span>{body}</span>
          </div>
        ))}
      </div>
      <h3 className="sec mt">If something changes</h3>
      <div className="about-table">
        {CHANGE_ROWS.map(([title, body]) => (
          <div key={title}>
            <b>{title}</b>
            <span>{body}</span>
          </div>
        ))}
      </div>
      <div className="closing">
        The app only keeps the record. What you actually learn happens in the room — from the people, the stories and the questions you ask there.{" "}
        <b>See you Saturday.</b>
      </div>
      <button className="tap btn navy wide" onClick={onClose}>
        Got it
      </button>
    </AcademyDialog>
  );
}
