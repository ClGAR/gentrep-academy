"use client";

import type { DocumentRecord, RequirementView } from "@/lib/academy/types";
import { AcademyDialog } from "@/components/academy/AcademyDialog";
import { GA, GA_GRADIENT } from "@/components/academy/tokens";

export function DocumentSheet({
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
  const title = lang === "tl" && document?.titleTl ? document.titleTl : (document?.title ?? requirement.title);
  const blurb = lang === "tl" && document?.blurbTl ? document.blurbTl : (document?.blurb ?? requirement.note);
  const body = lang === "tl" && document?.bodyTl ? document.bodyTl : document?.body;
  const versionLabel = lang === "tl" && document?.titleTl ? document.titleTl : document?.version;
  const hasDoc = Boolean(body);
  const minutes = requirement.minutes ?? document?.minutes ?? "";

  return (
    <AcademyDialog label={title} onClose={onClose}>
      <div className="sheet-head">
        <div>
          <h2 className="h2">{title}</h2>
          <p className="fine">{blurb}</p>
        </div>
        <button className="tap pill" onClick={onClose} aria-label="Close">
          Close
        </button>
      </div>
      <div className="langs" role="group" aria-label="Language">
        {(
          [
            ["en", "English"],
            ["tl", "Tagalog"],
          ] as const
        ).map(([code, label]) => (
          <button
            key={code}
            className={`tap lang${lang === code ? " on" : ""}`}
            onClick={() => onLang(code)}
            aria-pressed={lang === code}
          >
            {label}
          </button>
        ))}
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
        style={{ background: watched ? GA.goodBg : GA_GRADIENT }}
      >
        <div>
          <span className="play" style={{ background: watched ? GA.good : "rgba(255,255,255,.25)" }}>
            {watched ? "✓" : "▶"}
          </span>
          <em style={{ color: watched ? GA.good : "#fff" }}>
            {watched
              ? lang === "tl"
                ? "Napanood na"
                : "Watched"
              : `${lang === "tl" ? "I-play · " : "Play · "}${minutes}`}
          </em>
        </div>
      </div>
      {hasDoc ? (
        <>
          {versionLabel ? <div className="eyebrow-dark mt">{versionLabel}</div> : null}
          <div className="doc" lang={lang} style={{ opacity: watched ? 1 : 0.5 }}>
            {body}
          </div>
          {!watched ? (
            <p className="fine">{lang === "tl" ? "Panoorin muna ang video." : "Watch the video first."}</p>
          ) : null}
        </>
      ) : (
        <p className="fine">This item is a video orientation. Play it, then continue.</p>
      )}
      <button className="tap btn primary wide" disabled={!watched || pending} onClick={onAgree}>
        {hasDoc
          ? lang === "tl"
            ? "Nabasa ko ito at sumasang-ayon ako"
            : "I have read this and I agree"
          : lang === "tl"
            ? "Tapos — napanood ko na"
            : "Done — I've watched it"}
      </button>
      {hasDoc ? (
        <p className="fine center">
          {lang === "tl"
            ? "Ang pangalan mo, ang petsa, ang bersyon, at kung anong wika mo ito binasa ay nakatala."
            : "Your name, the date, the version, and the language you read it in are kept on file."}
        </p>
      ) : null}
    </AcademyDialog>
  );
}
