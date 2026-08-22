"use client";

import Link from "next/link";
import type { RankRecord } from "@/lib/academy/types";
import { RankMark } from "@/components/academy/RankMark";
import { rankInsigniaSize } from "@/components/academy/helpers";

const PROOF_ROWS = [
  ["Review and agree", "You review the item and agree in the app; the record is kept"],
  ["Attend", "Authorized event staff records whether you attended"],
  ["Show it", "Your assigned trainer watches and signs it off"],
  ["Earned by your trainee", "Their certificate, not your word"],
] as const;

const CHANGE_ROWS = [
  ["Cannot make it?", "Open the date and cancel. The seat goes back to someone else."],
  ["Want a different date?", "Cancel your current booking first, then reserve another posted date."],
  ["Session full?", "Join the waitlist. Your place appears in the Academy when it changes."],
  ["Missed one?", "Pick another date. Nothing else you've done is lost."],
  ["No dates posted?", "That one is waiting on us, not on you."],
  ["How long does a level take?", "Work through each posted requirement at the pace available to you."],
] as const;

export function AboutAcademy({ ranks }: { ranks: RankRecord[] }) {
  return (
    <article className="about-page">
      <p className="eyebrow-dark">Gentrep Academy</p>
      <h1 className="ant h1">About Gentrep Academy</h1>
      <p className="fine">Read this once. About five minutes.</p>
      <p className="lead">
        The Academy is where you learn this business, one level at a time. Every level is a short course made of items you review, sessions you attend in person, and demonstrations your assigned trainer verifies. You never record your own attendance or sign-off — that is what makes each completion worth something.
      </p>
      <h2 className="sec mt">The five levels</h2>
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
      <h2 className="sec mt">How a course is proven</h2>
      <div className="about-table">
        {PROOF_ROWS.map(([title, body]) => (
          <div key={title}>
            <b>{title}</b>
            <span>{body}</span>
          </div>
        ))}
      </div>
      <h2 className="sec mt">If something changes</h2>
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
      <Link className="tap btn navy wide" href="/academy">
        Back to the Academy
      </Link>
    </article>
  );
}
