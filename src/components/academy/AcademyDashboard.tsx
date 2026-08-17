"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  acceptDocumentAction,
  bookEventAction,
  cancelBookingAction,
  issueCertificateAction,
} from "@/lib/actions/academy";
import { nextOpenRequirement } from "@/lib/academy/rules";
import { certificateVerifyUrl } from "@/lib/academy/qr";
import type { CertificateRecord, DashboardData, RankCode, RankRecord, RequirementView } from "@/lib/academy/types";
import { cloneWalkCatalog } from "@/lib/academy/visual-fixture";
import { AboutAcademy } from "@/components/academy/AboutAcademy";
import { AcademySidebar } from "@/components/academy/AcademySidebar";
import { ActivationPlate } from "@/components/academy/ActivationPlate";
import { CertificateView } from "@/components/academy/CertificateView";
import { CompletionConfetti } from "@/components/academy/CompletionConfetti";
import { DemoWalkLadder } from "@/components/academy/DemoWalkLadder";
import { DocumentSheet } from "@/components/academy/DocumentSheet";
import { MobileAcademyHeader } from "@/components/academy/MobileAcademyHeader";
import { NextActionBar } from "@/components/academy/NextActionBar";
import { RankLadder } from "@/components/academy/RankLadder";
import { RequirementTimeline } from "@/components/academy/RequirementTimeline";
import { TeamChatCard } from "@/components/academy/TeamChatCard";
import { eventDay, teamFullName, walkCompletedRequirement } from "@/components/academy/helpers";

function demoCertificate(profile: DashboardData["profile"], rank: RankRecord): CertificateRecord {
  return {
    id: `walk-${rank.id}`,
    userId: profile.id,
    rankId: rank.id,
    rankCode: rank.code,
    referenceCode: `GA-${rank.code}-0847`,
    verificationCode: `walk-${rank.code}`,
    issuedAt: new Date().toISOString(),
    status: "issued",
    memberName: profile.fullName,
  };
}

function seedWalk(data: DashboardData): Record<RankCode, RequirementView[]> {
  const catalog = cloneWalkCatalog();
  catalog[data.selectedRank.code] = data.requirements.map((item) => ({
    ...item,
    matchingEvents: [...item.matchingEvents],
  }));
  return catalog;
}

export function AcademyDashboard({
  data,
  enableDemoWalk = false,
}: {
  data: DashboardData;
  enableDemoWalk?: boolean;
}) {
  const router = useRouter();
  const fixture = enableDemoWalk;
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState("");
  const [live, setLive] = useState("");
  const [openReq, setOpenReq] = useState<string | null>(null);
  const [docId, setDocId] = useState<string | null>(null);
  const [lang, setLang] = useState<"en" | "tl">("en");
  const [watched, setWatched] = useState<Record<string, boolean>>({});
  const [about, setAbout] = useState(false);
  const [certOpen, setCertOpen] = useState(false);
  const [error, setError] = useState("");
  const [confetti, setConfetti] = useState(0);
  const [walkSelected, setWalkSelected] = useState<RankCode | null>(fixture ? data.selectedRank.code : null);
  const [walkByRank, setWalkByRank] = useState<Record<RankCode, RequirementView[]> | null>(
    fixture ? seedWalk(data) : null,
  );
  const [walkCerts, setWalkCerts] = useState<CertificateRecord[] | null>(fixture ? [] : null);
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const wasComplete = useRef(false);

  const selectedCode = walkSelected ?? data.selectedRank.code;

  const selectedRank = data.ranks.find((rank) => rank.code === selectedCode) ?? data.selectedRank;
  const requirements = walkByRank?.[selectedCode] ?? data.requirements;
  const certificates = walkCerts ?? data.certificates;
  const completedWalkRankIds = new Set(
    (walkCerts ?? []).map((certificate) => certificate.rankId),
  );
  const rankProgress = fixture
    ? [
        ...data.rankProgress.filter(
          (item) => !completedWalkRankIds.has(item.rankId),
        ),
        ...(walkCerts ?? []).map((certificate) => ({
          rankId: certificate.rankId,
          rankCode: certificate.rankCode,
          status: "complete" as const,
          completedAt: certificate.issuedAt,
        })),
      ]
    : data.rankProgress;
  const view: DashboardData = {
    ...data,
    selectedRank,
    requirements,
    rankProgress,
    certificates,
  };

  const next = nextOpenRequirement(view.requirements);
  const doneCount = view.requirements.filter((item) => item.status === "done").length;
  const bookedCount = view.requirements.filter((item) => item.status === "booked" || item.status === "waitlisted").length;
  const missedCount = view.requirements.filter((item) => item.status === "missed").length;
  const complete = view.requirements.length > 0 && doneCount === view.requirements.length;
  const selectedCert =
    view.certificates.find((item) => item.rankId === view.selectedRank.id && item.status === "issued") ?? null;
  const openDoc =
    view.documents.find((doc) => doc.id === (view.requirements.find((item) => item.id === docId)?.documentId ?? docId)) ??
    null;
  const openRequirement = view.requirements.find((item) => item.id === docId) ?? null;

  useEffect(() => {
    if (complete && !wasComplete.current) {
      setConfetti((value) => value + 1);
    }
    wasComplete.current = complete;
  }, [complete]);

  function flash(message: string) {
    setToast(message);
    setLive(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  function goRank(code: string, locked: string | null) {
    if (locked && code !== view.selectedRank.code) {
      flash(locked);
      return;
    }
    if (fixture) {
      setWalkSelected(code as RankCode);
      setCertOpen(false);
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
    }, 60);
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

  function issueSelectedCertificate() {
    setError("");
    startTransition(async () => {
      const result = await issueCertificateAction({
        memberId: view.profile.id,
        rankId: view.selectedRank.id,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const certificateId = result.data?.id;
      if (!certificateId) {
        setError("The certificate was issued, but its record could not be opened.");
        router.refresh();
        return;
      }
      router.push(`/academy/certificates/${certificateId}`);
    });
  }

  function openCertificate() {
    if (!fixture) return;
    if (!selectedCert) {
      const issued = demoCertificate(view.profile, view.selectedRank);
      setWalkCerts((current) => {
        const list = current ?? view.certificates;
        if (list.some((item) => item.rankId === issued.rankId && item.status === "issued")) return list;
        return [...list, issued];
      });
    }
    setCertOpen(true);
  }

  function seeCertificate() {
    const revokedCertificate = view.certificates.find(
      (item) =>
        item.rankId === view.selectedRank.id && item.status === "revoked",
    );
    if (revokedCertificate) {
      setError("This certificate is unavailable. Contact an administrator.");
      return;
    }
    if (fixture) {
      openCertificate();
      return;
    }
    if (selectedCert) {
      setCertOpen(true);
      return;
    }
    issueSelectedCertificate();
  }

  function completeRank(code: RankCode) {
    if (!fixture) return;
    const rank = view.ranks.find((item) => item.code === code);
    if (!rank) return;
    setWalkByRank((current) => {
      const nextWalk = { ...(current ?? seedWalk(data)) };
      nextWalk[code] = (nextWalk[code] ?? []).map(walkCompletedRequirement);
      return nextWalk;
    });
    setWalkCerts((current) => {
      const list = current ?? data.certificates;
      const issued = demoCertificate(data.profile, rank);
      if (list.some((item) => item.rankId === rank.id && item.status === "issued")) return list;
      return [...list, issued];
    });
    setWalkSelected(code);
    setOpenReq(null);
    setDocId(null);
    setConfetti((value) => value + 1);
    flash(`${rank.fullName} complete. Certificate ready.`);
    window.setTimeout(() => setCertOpen(true), 420);
  }

  function resetWalk() {
    if (!fixture) return;
    setWalkByRank(seedWalk(data));
    setWalkCerts([]);
    setWalkSelected("BASE");
    setOpenReq(null);
    setDocId(null);
    setCertOpen(false);
    flash("Reset");
  }

  function cancelRequirement(req: RequirementView) {
    if (!req.bookingId) return;
    run(() => cancelBookingAction({ bookingId: req.bookingId as string }), "Seat released");
  }

  const certForView =
    selectedCert ??
    (fixture ? demoCertificate(view.profile, view.selectedRank) : null);

  return (
    <div className="ga" lang="en">
      <CompletionConfetti fire={confetti} />
      <span className="sr-only" role="status" aria-live="polite">
        {live}
      </span>
      <a className="skip" href="#reqs">
        Skip to what it takes
      </a>
      <div className="shell">
        <AcademySidebar
          data={view}
          next={next}
          complete={complete}
          onAbout={() => setAbout(true)}
          onRank={goRank}
          onNext={doNext}
        />
        <main className="col">
          <MobileAcademyHeader
            name={view.profile.fullName}
            teamName={view.profile.teamName}
            onAbout={() => setAbout(true)}
          />
          <RankLadder
            ranks={view.ranks}
            selectedCode={view.selectedRank.code}
            rankProgress={view.rankProgress}
            onRank={goRank}
          />
          {error ? <div className="ga-alert error">{error}</div> : null}
          <ActivationPlate
            rank={view.selectedRank}
            requirements={view.requirements}
            doneCount={doneCount}
            bookedCount={bookedCount}
            missedCount={missedCount}
            complete={complete}
          />
          {view.profile.teamTelegramUrl ? (
            <TeamChatCard
              teamName={teamFullName(view.profile.teamName)}
              memberCount={view.profile.teamMemberCount}
              onOpen={() => {
                flash(`Opening ${view.profile.teamName ?? "team"} on Telegram…`);
                window.open(view.profile.teamTelegramUrl ?? "https://t.me/", "_blank", "noopener,noreferrer");
              }}
            />
          ) : null}
          <RequirementTimeline
            requirements={view.requirements}
            nextId={next?.id}
            openReq={openReq}
            pending={pending}
            selectedRank={view.selectedRank}
            complete={complete}
            cardRefs={cardRefs}
            onOpenDoc={setDocId}
            onToggle={(id) => setOpenReq((value) => (value === id ? null : id))}
            onBook={(req, event) =>
              run(
                () => bookEventAction({ eventId: event.id, requirementId: req.id }),
                `Seat reserved · ${eventDay(event.startsAt).weekday} ${eventDay(event.startsAt).day} ${eventDay(event.startsAt).month}`,
              )
            }
            onWaitlist={(req, event) =>
              run(() => bookEventAction({ eventId: event.id, requirementId: req.id }), "Added to the waitlist")
            }
            onCancel={cancelRequirement}
            onSeeCertificate={seeCertificate}
          />
          {fixture ? (
            <DemoWalkLadder
              ranks={view.ranks}
              selectedName={view.selectedRank.name}
              onComplete={completeRank}
              onCertificate={openCertificate}
              onReset={resetWalk}
            />
          ) : null}
        </main>
      </div>

      {!complete && next ? <NextActionBar next={next} onNext={doNext} /> : null}

      {toast ? <div className="fade toast">{toast}</div> : null}

      {openRequirement ? (
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
      ) : null}

      {about ? <AboutAcademy ranks={view.ranks} onClose={() => setAbout(false)} /> : null}

      {certOpen && certForView ? (
        <CertificateView
          name={view.profile.fullName}
          rank={view.selectedRank}
          citation={view.selectedRank.citation}
          issuedAt={new Date(certForView.issuedAt).toLocaleDateString("en-PH", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          cardTail={view.profile.memberCard?.slice(-9) ?? "—"}
          reference={certForView.referenceCode}
          verifyUrl={certificateVerifyUrl(certForView.verificationCode)}
          requirements={view.requirements}
          onClose={() => setCertOpen(false)}
        />
      ) : null}
    </div>
  );
}
