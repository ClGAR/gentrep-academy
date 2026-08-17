"use client";

import { BookOpen, Check } from "lucide-react";
import type { DocumentRecord, RequirementView } from "@/lib/academy/types";
import {
  AcademyDialog,
  AcademyDialogCloseButton,
} from "@/components/academy/AcademyDialog";
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
        <AcademyDialogCloseButton onClose={onClose} />
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
      <button
        className="video tap"
        type="button"
        aria-pressed={watched}
        onClick={onWatch}
        style={{ background: watched ? GA.goodBg : GA_GRADIENT }}
      >
        <div>
          <span className="play" style={{ background: watched ? GA.good : "rgba(244,241,234,.24)" }}>
            {watched ? <Check aria-hidden="true" /> : <BookOpen aria-hidden="true" />}
          </span>
          <em style={{ color: watched ? GA.good : GA.paper }}>
            {watched
              ? lang === "tl"
                ? "Nasuri na"
                : "Reviewed"
              : `${lang === "tl" ? "Suriin · " : "Review · "}${minutes}`}
          </em>
        </div>
      </button>
      {hasDoc ? (
        <>
          {versionLabel ? <div className="eyebrow-dark mt">{versionLabel}</div> : null}
          <div className="doc" lang={lang} style={{ opacity: watched ? 1 : 0.5 }}>
            {body}
          </div>
          {!watched ? (
            <p className="fine">{lang === "tl" ? "Suriin muna ang item na ito." : "Review this item first."}</p>
          ) : null}
        </>
      ) : (
        <p className="fine">This orientation has no written agreement. Review it, then continue.</p>
      )}
      <button className="tap btn primary wide" disabled={!watched || pending} onClick={onAgree}>
        {hasDoc
          ? lang === "tl"
            ? "Nabasa ko ito at sumasang-ayon ako"
            : "I have read this and I agree"
          : lang === "tl"
            ? "Tapos — nasuri ko na"
            : "Done — I've reviewed it"}
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
