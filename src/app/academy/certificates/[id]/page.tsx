import { CertificateActions } from "@/components/academy/CertificateActions";
import { CertificateCard } from "@/components/academy/CertificateCard";
import { certificateQrDataUrl, certificateVerifyUrl } from "@/lib/academy/qr";
import { loadDashboard } from "@/lib/academy/queries";
import { requireUser } from "@/lib/auth/guards";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await requireUser();
  const { id } = await params;
  const dashboard = await loadDashboard();
  if (!dashboard.ok) {
    return (
      <main className="auth-shell">
        <div className="gg-alert gg-alert--error">{dashboard.error}</div>
      </main>
    );
  }
  const cert = dashboard.data.certificates.find((item) => item.id === id);
  if (!cert || cert.userId !== userId) {
    return (
      <main className="auth-shell">
        <div className="gg-alert gg-alert--error">Certificate not found.</div>
      </main>
    );
  }
  const rank = dashboard.data.ranks.find((item) => item.id === cert.rankId);
  const qr = await certificateQrDataUrl(cert.verificationCode);
  const verifyUrl = certificateVerifyUrl(cert.verificationCode);
  const rankDashboard =
    rank && rank.code !== dashboard.data.selectedRank.code
      ? await loadDashboard(rank.code)
      : dashboard;
  const requirements =
    rankDashboard.ok && rankDashboard.data.selectedRank.id === cert.rankId
      ? rankDashboard.data.requirements
      : undefined;

  return (
    <main className="ga">
      <div className="col">
        {rank ? (
          <CertificateCard
            name={dashboard.data.profile.fullName}
            rank={rank}
            citation={rank.citation}
            issuedAt={new Date(cert.issuedAt).toLocaleDateString("en-PH", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            cardTail={dashboard.data.profile.memberCard?.slice(-9) ?? "—"}
            reference={cert.referenceCode}
            qrSrc={qr}
            requirements={requirements}
          />
        ) : null}
        <CertificateActions
          verifyUrl={verifyUrl}
          name={dashboard.data.profile.fullName}
          rank={rank?.officerTitle ?? rank?.fullName ?? ""}
        />
      </div>
    </main>
  );
}
