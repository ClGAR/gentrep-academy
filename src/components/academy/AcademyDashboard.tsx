"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import {
  acceptDocumentAction,
  bookEventAction,
  cancelBookingAction,
  issueCertificateAction,
} from "@/lib/actions/academy";
import { signOut } from "@/lib/actions/auth";
import { nextOpenRequirement } from "@/lib/academy/rules";
import { TYPE_LABELS, type DashboardData, type DocumentRecord, type EventRecord, type RequirementView } from "@/lib/academy/types";
import { RankMark } from "@/components/academy/RankMark";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function eventDay(startsAt: string) {
  const date = new Date(startsAt);
  return {
    month: date.toLocaleDateString("en-PH", { month: "short" }).toUpperCase(),
    day: String(date.getDate()),
    when: date.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" }),
    weekday: date.toLocaleDateString("en-PH", { weekday: "short", day: "numeric", month: "short" }),
  };
}

export function AcademyDashboard({ data }: { data: DashboardData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState("");
  const [openReq, setOpenReq] = useState<string | null>(null);
  const [docId, setDocId] = useState<string | null>(null);
  const [lang, setLang] = useState<"en" | "tl">("en");
  const [watched, setWatched] = useState<Record<string, boolean>>({});
  const [about, setAbout] = useState(false);
  const [certOpen, setCertOpen] = useState(false);
  const [error, setError] = useState("");
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

  const next = nextOpenRequirement(data.requirements);
  const doneCount = data.requirements.filter((item) => item.status === "done").length;
  const bookedCount = data.requirements.filter((item) => item.status === "booked" || item.status === "waitlisted").length;
  const missedCount = data.requirements.filter((item) => item.status === "missed").length;
  const complete = data.requirements.length > 0 && doneCount === data.requirements.length;
  const selectedCert = data.certificates.find((item) => item.rankId === data.selectedRank.id) ?? data.certificates[0] ?? null;
  const openDoc = data.documents.find((doc) => doc.id === (data.requirements.find((item) => item.id === docId)?.documentId ?? docId)) ?? null;
  const openRequirement = data.requirements.find((item) => item.id === docId) ?? null;

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  function goRank(code: string, locked: string | null) {
    if (locked && code !== data.selectedRank.code) {
      flash(locked);
      return;
    }
    router.push(`/academy/ranks/${code.toLowerCase()}`);
  }

  function doNext() {
    if (!next) return;
    if (next.type === "document") {
      setDocId(next.id);
      return;
    }
    setOpenReq(next.id);
    window.setTimeout(() => {
      cardRefs.current[next.id]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 40);
  }

  function run(action: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    setError("");
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "That did not save.");
        return;
      }
      flash(success);
      router.refresh();
    });
  }

  return (
    <div className="ga">
      <a className="skip" href="#reqs">
        Skip to what it takes
      </a>
      <div className="shell">
        <aside className="side" aria-label="Academy navigation">
          <div className="brand">
            <RankMark kind="seal" metal="bronze" size={24} />
            <span className="serif">Academy</span>
          </div>
          <div className="who">
            <span className="avatar">{initials(data.profile.fullName)}</span>
            <span>
              <b>{data.profile.fullName}</b>
              <em> {data.profile.teamName ?? "Unassigned"}</em>
            </span>
          </div>
          <nav className="side-nav" aria-label="Ranks">
            {data.ranks.map((rank) => {
              const locked = rank.code === data.selectedRank.code ? data.lockedReason : null;
              const on = rank.code === data.selectedRank.code;
              return (
                <button
                  key={rank.id}
                  className={`tap side-rank${on ? " on" : ""}`}
                  aria-current={on ? "page" : undefined}
                  onClick={() => goRank(rank.code, rank.code === data.selectedRank.code ? null : data.lockedReason && rank.sortOrder > data.selectedRank.sortOrder ? data.lockedReason : null)}
                >
                  <span>{rank.name}</span>
                  {locked ? <span className="lock">Locked</span> : null}
                </button>
              );
            })}
          </nav>
          <button className="gg-button gg-button--secondary" onClick={() => setAbout(true)}>
            About Academy
          </button>
          {data.profile.roles.includes("staff") || data.profile.roles.includes("admin") ? (
            <a className="gg-link" href="/staff/events">Staff roster</a>
          ) : null}
          {data.profile.roles.includes("trainer") || data.profile.roles.includes("admin") ? (
            <a className="gg-link" href="/trainer/verifications">Trainer desk</a>
          ) : null}
          {data.profile.roles.includes("admin") ? <a className="gg-link" href="/admin">Admin</a> : null}
          <form action={signOut}>
            <button className="gg-button gg-button--secondary gg-button--wide" type="submit">
              Sign out
            </button>
          </form>
          {!complete && next ? (
            <div className="side-next">
              <div className="eyebrow-dark">Do this next</div>
              <b>{next.title}</b>
              <button className="gg-button gg-button--primary gg-button--wide" onClick={doNext}>
                {next.type === "document" ? "Watch the video" : "Pick a date"}
              </button>
            </div>
          ) : null}
        </aside>

        <main className="col">
          <header className="mast only-mobile">
            <div className="brand">
              <RankMark kind={data.selectedRank.insigniaKind} metal={data.selectedRank.metal} size={26} />
              <span className="serif big">Academy</span>
            </div>
            <button className="gg-button gg-button--secondary gg-button--sm" onClick={() => setAbout(true)}>
              About
            </button>
          </header>
          <p className="sub only-mobile">
            {data.profile.fullName} · {data.profile.teamName ?? "Unassigned"}
          </p>
          <nav className="ladder noscroll only-mobile" aria-label="Ranks">
            {data.ranks.map((rank) => {
              const on = rank.code === data.selectedRank.code;
              return (
                <button
                  key={rank.id}
                  className={`tap rung${on ? " on" : ""}`}
                  aria-current={on ? "page" : undefined}
                  onClick={() => goRank(rank.code, null)}
                >
                  <RankMark kind={rank.insigniaKind} metal={rank.metal} size={18} />
                  <span>{rank.name}</span>
                </button>
              );
            })}
          </nav>

          {data.lockedReason ? <div className="gg-alert">{data.lockedReason}</div> : null}
          {error ? <div className="gg-alert gg-alert--error">{error}</div> : null}

          <section className={`plate${complete ? " done" : ""}`}>
            <div className="rule-row">
              <i />
              <span>{data.selectedRank.eyebrow}</span>
            </div>
            <h1 className="plate-title">{data.selectedRank.fullName}</h1>
            <div className="plate-sub">
              {data.selectedRank.phase}
              {data.selectedRank.abbr ? ` · ${data.selectedRank.abbr}` : ""}
            </div>
            <div className="plate-foot">
              <b>{complete ? "All done." : `${doneCount} of ${data.requirements.length} done`}</b>
              <span className="pips">
                {data.requirements.map((item) => (
                  <i key={item.id} className={`pip ${item.status}`} />
                ))}
              </span>
            </div>
            <div
              className="bar"
              role="progressbar"
              aria-valuenow={doneCount}
              aria-valuemin={0}
              aria-valuemax={data.requirements.length}
              aria-label={`${data.selectedRank.fullName} progress`}
            >
              <i style={{ width: `${data.requirements.length ? (doneCount / data.requirements.length) * 100 : 0}%` }} />
            </div>
            <div className="plate-note">
              {[bookedCount ? `${bookedCount} booked` : null, missedCount ? `${missedCount} missed` : null]
                .filter(Boolean)
                .join(" · ") || "\u00a0"}
            </div>
          </section>

          {data.profile.teamTelegramUrl ? (
            <button
              className="tap chat"
              onClick={() => {
                flash(`Opening ${data.profile.teamName ?? "team"} on Telegram…`);
                window.open(data.profile.teamTelegramUrl ?? "https://t.me/", "_blank", "noopener,noreferrer");
              }}
            >
              <span className="tg">
                <MessageCircle size={20} />
              </span>
              <span className="grow left">
                <b>{data.profile.teamName ?? "Team"} chat</b>
                <em>ask before you go</em>
              </span>
            </button>
          ) : null}

          <div className="bar-title">
            <h2 className="sec" id="reqs" tabIndex={-1}>
              What it takes
            </h2>
          </div>
          {data.requirements.length === 0 ? (
            <div className="gg-empty">No requirements are posted for this rank yet.</div>
          ) : (
            <ol className="reqs">
              {data.requirements.map((req, index) => (
                <RequirementCard
                  key={req.id}
                  req={req}
                  index={index}
                  total={data.requirements.length}
                  isNext={next?.id === req.id}
                  expanded={openReq === req.id || next?.id === req.id}
                  pending={pending}
                  onOpenDoc={() => setDocId(req.id)}
                  onToggle={() => setOpenReq((value) => (value === req.id ? null : req.id))}
                  onBook={(event) =>
                    run(() => bookEventAction({ eventId: event.id, requirementId: req.id }), `Seat reserved · ${eventDay(event.startsAt).weekday}`)
                  }
                  onWaitlist={(event) =>
                    run(() => bookEventAction({ eventId: event.id, requirementId: req.id }), "Added to the waitlist")
                  }
                  onCancel={() => {
                    const bookingId = req.bookedEvent?.id;
                    if (!bookingId) return;
                    flash("Open the date and cancel from the booking row.");
                  }}
                  cardRef={(node) => {
                    cardRefs.current[req.id] = node;
                  }}
                />
              ))}
            </ol>
          )}

          {complete ? (
            <div style={{ marginTop: 18 }}>
              <button
                className="gg-button gg-button--primary gg-button--wide"
                onClick={() => {
                  if (selectedCert) {
                    router.push(`/academy/certificates/${selectedCert.id}`);
                    return;
                  }
                  run(
                    () => issueCertificateAction({ memberId: data.profile.id, rankId: data.selectedRank.id }),
                    "Certificate ready.",
                  );
                  setCertOpen(true);
                }}
              >
                View certificate
              </button>
            </div>
          ) : null}
        </main>
      </div>

      {!complete && next ? (
        <div className="foot only-mobile">
          <div className="foot-in">
            <div className="grow">
              <div className="eyebrow-dark">Next</div>
              <b className="foot-title">{next.title}</b>
            </div>
            <button className="gg-button gg-button--primary" onClick={doNext}>
              {next.type === "document" ? "Watch" : "Pick a date"}
            </button>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="toast" role="status" aria-live="polite">
          <b>Saved</b>
          {toast}
        </div>
      ) : null}

      {openRequirement && (
        <DocumentSheet
          requirement={openRequirement}
          document={openDoc ?? undefined}
          lang={lang}
          watched={!!watched[openRequirement.id]}
          pending={pending}
          onLang={setLang}
          onWatch={() => setWatched((value) => ({ ...value, [openRequirement.id]: true }))}
          onClose={() => setDocId(null)}
          onAgree={() => {
            if (!openDoc) return;
            run(
              () =>
                acceptDocumentAction({
                  documentId: openDoc.id,
                  requirementId: openRequirement.id,
                  language: lang,
                  watched: !!watched[openRequirement.id],
                }),
              "Agreement recorded.",
            );
            setDocId(null);
          }}
        />
      )}

      {about ? <AboutSheet ranks={data.ranks} onClose={() => setAbout(false)} /> : null}
      {certOpen && selectedCert ? (
        <CertificatePreview
          name={data.profile.fullName}
          rank={data.selectedRank.fullName}
          citation={data.selectedRank.citation}
          reference={selectedCert.referenceCode}
          href={`/academy/certificates/${selectedCert.id}`}
          onClose={() => setCertOpen(false)}
        />
      ) : null}
    </div>
  );
}

function RequirementCard({
  req,
  index,
  total,
  isNext,
  expanded,
  pending,
  onOpenDoc,
  onToggle,
  onBook,
  onWaitlist,
  cardRef,
}: {
  req: RequirementView;
  index: number;
  total: number;
  isNext: boolean;
  expanded: boolean;
  pending: boolean;
  onOpenDoc: () => void;
  onToggle: () => void;
  onBook: (event: EventRecord) => void;
  onWaitlist: (event: EventRecord) => void;
  onCancel: () => void;
  cardRef: (node: HTMLElement | null) => void;
}) {
  const futureEvents = req.matchingEvents.filter((event) => event.status === "scheduled");

  return (
    <li className="req">
      <div className="spine" aria-hidden="true">
        <span className="rail" />
        <span className={`node ${req.status}`}>{req.status === "done" ? "✓" : req.status === "missed" ? "!" : ""}</span>
      </div>
      <article
        ref={cardRef}
        className={`req-card${req.status === "missed" ? " missed" : isNext || expanded ? " active" : ""}`}
      >
        <div className="req-type">{isNext ? `Do this next · ${TYPE_LABELS[req.type]}` : TYPE_LABELS[req.type]}</div>
        <h3>
          {req.title}
          <span className="sr-only">
            . Requirement {index + 1} of {total}. {req.helper}
          </span>
        </h3>
        <p className="helper">{req.helper}</p>
        {req.type === "document" && req.status !== "done" ? (
          <button className="gg-button gg-button--primary" onClick={onOpenDoc}>
            Watch and agree
          </button>
        ) : null}
        {req.type === "attendance" && req.status !== "done" ? (
          <button className="gg-button gg-button--primary" onClick={onToggle}>
            {expanded ? "Hide dates" : "Pick a date"}
          </button>
        ) : null}
        {req.type === "demonstration" && req.status !== "done" ? (
          <p className="helper">A trainer has to sign this off. It will not complete from this screen.</p>
        ) : null}
        {req.type === "derived" && req.status !== "done" ? (
          <p className="helper">This completes when a trainee you trained is certified.</p>
        ) : null}
        {expanded && req.type === "attendance" ? (
          futureEvents.length === 0 ? (
            <div className="gg-empty">No dates posted yet. That one is waiting on us, not on you.</div>
          ) : (
            futureEvents.map((event) => {
              const meta = eventDay(event.startsAt);
              const remaining = event.capacity - event.bookedCount;
              const mine = req.bookedEvent?.id === event.id;
              const full = remaining <= 0;
              return (
                <div key={event.id} className={`ev${mine ? " mine" : ""}`}>
                  <div className="datebox">
                    <em>{meta.month}</em>
                    <b>{meta.day}</b>
                  </div>
                  <div>
                    <div className="ev-place">{event.venue}</div>
                    <div className="ev-meta">
                      {meta.when} · {event.hostName}
                    </div>
                    <div className="ev-seats">{full ? "Full — join the waitlist" : `${remaining} seats left`}</div>
                  </div>
                  <button
                    className={`gg-button gg-button--sm${mine ? " gg-button--booked" : " gg-button--primary"}`}
                    disabled={pending || mine}
                    onClick={() => (full ? onWaitlist(event) : onBook(event))}
                  >
                    {mine ? "Booked" : full ? "Waitlist" : "Book"}
                  </button>
                </div>
              );
            })
          )
        ) : null}
        {req.bookingId && (req.status === "booked" || req.status === "waitlisted") ? (
          <CancelRow bookingId={req.bookingId} />
        ) : null}
      </article>
    </li>
  );
}

function CancelRow({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <p className="helper">
      Seat reserved. Cancel to return it to the waitlist.
      <button
        className="gg-button gg-button--secondary gg-button--sm"
        style={{ marginTop: 8 }}
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            await cancelBookingAction({ bookingId });
            router.refresh();
          });
        }}
      >
        Cancel seat
      </button>
    </p>
  );
}

function DocumentSheet({
  requirement,
  document,
  lang,
  watched,
  pending,
  onLang,
  onWatch,
  onClose,
  onAgree,
}: {
  requirement: RequirementView;
  document: DocumentRecord | undefined;
  lang: "en" | "tl";
  watched: boolean;
  pending: boolean;
  onLang: (lang: "en" | "tl") => void;
  onWatch: () => void;
  onClose: () => void;
  onAgree: () => void;
}) {
  const title = lang === "tl" && document?.titleTl ? document.titleTl : document?.title ?? requirement.title;
  const blurb = lang === "tl" && document?.blurbTl ? document.blurbTl : document?.blurb ?? requirement.note;
  const body = lang === "tl" && document?.bodyTl ? document.bodyTl : document?.body;
  return (
    <div className="backdrop" role="presentation" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <div className="sheet-head">
          <div>
            <h2 className="sec">{title}</h2>
            <p className="helper">{blurb}</p>
          </div>
          <button className="gg-button gg-button--secondary" onClick={onClose} aria-label="Close">
            Close
          </button>
        </div>
        <div className="langs" role="group" aria-label="Language">
          <button className={`lang${lang === "en" ? " on" : ""}`} aria-pressed={lang === "en"} onClick={() => onLang("en")}>
            English
          </button>
          <button className={`lang${lang === "tl" ? " on" : ""}`} aria-pressed={lang === "tl"} onClick={() => onLang("tl")}>
            Tagalog
          </button>
        </div>
        <div
          className="video tap"
          role="button"
          tabIndex={0}
          aria-pressed={watched}
          onClick={onWatch}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onWatch();
            }
          }}
        >
          <span>{watched ? (lang === "tl" ? "Napanood na" : "Watched") : `${lang === "tl" ? "I-play" : "Play"} · ${requirement.minutes ?? document?.minutes ?? ""}`}</span>
        </div>
        {body ? <div className="doc">{body}</div> : <p className="helper">This item is a video orientation. Play it, then continue.</p>}
        <button className="gg-button gg-button--primary gg-button--wide" disabled={!watched || pending} onClick={onAgree}>
          {lang === "tl" ? "Sumasang-ayon ako" : "I agree"}
        </button>
      </div>
    </div>
  );
}

function AboutSheet({
  ranks,
  onClose,
}: {
  ranks: DashboardData["ranks"];
  onClose: () => void;
}) {
  return (
    <div className="backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label="About Gentrep Academy" onClick={(event) => event.stopPropagation()}>
        <div className="sheet-head">
          <div>
            <h2 className="sec">About Gentrep Academy</h2>
            <p className="helper">Read this once. About five minutes.</p>
          </div>
          <button className="gg-button gg-button--secondary" onClick={onClose} aria-label="Close">
            Close
          </button>
        </div>
        <h3 className="sec">Levels</h3>
        <div className="about-table">
          {ranks.map((rank) => (
            <div key={rank.id}>
              <b>
                {rank.name} · {rank.fullName}
              </b>
              <span>{rank.phase}. {rank.opensText}</span>
            </div>
          ))}
        </div>
        <h3 className="sec">How a requirement is recorded</h3>
        <div className="about-table">
          <div><b>Watch and agree</b><span>You agree in the app; the record is kept</span></div>
          <div><b>Attend</b><span>The scan at the door</span></div>
          <div><b>Show it</b><span>An upline watches and signs it off</span></div>
          <div><b>Earned by your trainee</b><span>Their certificate, not your word</span></div>
        </div>
        <h3 className="sec">If something changes</h3>
        <div className="about-table">
          <div><b>Cannot make it?</b><span>Open the date and cancel. The seat goes back to someone else.</span></div>
          <div><b>Want a different date?</b><span>Tap Switch. No need to cancel first.</span></div>
          <div><b>Session full?</b><span>Join the waitlist and you&apos;ll be told when a seat opens.</span></div>
          <div><b>Missed one?</b><span>Pick another date. Nothing else you&apos;ve done is lost.</span></div>
          <div><b>No dates posted?</b><span>That one is waiting on us, not on you.</span></div>
          <div><b>Is there a deadline?</b><span>No. Most finish a level in about three weeks.</span></div>
        </div>
        <p className="closing">
          The app only keeps the record. What you actually learn happens in the room — from the people, the stories and the questions you ask there. <b>See you Saturday.</b>
        </p>
        <button className="gg-button gg-button--primary gg-button--wide" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
}

function CertificatePreview({
  name,
  rank,
  citation,
  reference,
  href,
  onClose,
}: {
  name: string;
  rank: string;
  citation: string;
  reference: string;
  href: string;
  onClose: () => void;
}) {
  return (
    <div className="backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label="Certificate" onClick={(event) => event.stopPropagation()}>
        <div className="cert">
          <div className="eyebrow-dark">Gentrep Academy</div>
          <p>hereby certifies</p>
          <div className="cert-name">{name}</div>
          <div className="cert-rank">{rank}</div>
          <p>{citation}</p>
          <div className="cert-record">
            <div>
              <em>Reference</em>
              <b>{reference}</b>
            </div>
          </div>
          <p className="cert-fine">An internal distinction of the Gentrep Academy.</p>
        </div>
        <div className="no-print" style={{ display: "grid", gap: 8, marginTop: 12 }}>
          <a className="gg-button gg-button--primary" href={href}>
            Open printable certificate
          </a>
          <button className="gg-button gg-button--secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
