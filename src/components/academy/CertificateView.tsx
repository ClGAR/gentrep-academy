"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { RankRecord, RequirementView } from "@/lib/academy/types";
import { AcademyDialog } from "@/components/academy/AcademyDialog";
import { CertificateCard } from "@/components/academy/CertificateCard";
import { CertificateActions } from "@/components/academy/CertificateActions";
import { GA } from "@/components/academy/tokens";

export function CertificateView({
  name,
  rank,
  citation,
  issuedAt,
  cardTail,
  reference,
  verifyUrl,
  requirements,
  onClose,
}: {
  name: string;
  rank: RankRecord;
  citation: string;
  issuedAt: string;
  cardTail: string;
  reference: string;
  verifyUrl: string;
  requirements?: RequirementView[];
  onClose: () => void;
}) {
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 240,
      color: { dark: GA.ink, light: "#ffffff" },
    }).then((url) => {
      if (!cancelled) setQr(url);
    });
    return () => {
      cancelled = true;
    };
  }, [verifyUrl]);

  return (
    <AcademyDialog label="Certificate" onClose={onClose}>
      <CertificateCard
        name={name}
        rank={rank}
        citation={citation}
        issuedAt={issuedAt}
        cardTail={cardTail}
        reference={reference}
        qrSrc={qr}
        requirements={requirements}
      />
      <CertificateActions verifyUrl={verifyUrl} name={name} rank={rank.officerTitle ?? rank.fullName} onClose={onClose} />
    </AcademyDialog>
  );
}
