import { CertificateActions } from "@/components/academy/CertificateActions";
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
  const qr = await certificateQrDataUrl(cert.id);
  const verifyUrl = certificateVerifyUrl(cert.id);

  return (
    <main className="col">
      <div className="cert printroot">
        <div className="eyebrow-dark">Gentrep Academy</div>
        <p>hereby certifies</p>
        <div className="cert-name">{dashboard.data.profile.fullName}</div>
        <div>{rank?.officerTitle ?? rank?.fullName}</div>
        <p>{rank?.citation}</p>
        <div className="cert-qr">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="Certificate verification QR code" width={160} height={160} />
          <em>Scan to verify</em>
        </div>
        <div className="cert-record">
          <div>
            <em>Dated</em>
            <b>{new Date(cert.issuedAt).toLocaleDateString("en-PH")}</b>
          </div>
          <div>
            <em>Card</em>
            <b>{dashboard.data.profile.memberCard?.slice(-9) ?? "—"}</b>
          </div>
          <div>
            <em>Reference</em>
            <b>{cert.referenceCode}</b>
          </div>
        </div>
        <p className="cert-fine">An internal distinction of the Gentrep Academy.</p>
      </div>
      <CertificateActions
        verifyUrl={verifyUrl}
        name={dashboard.data.profile.fullName}
        rank={rank?.fullName ?? ""}
      />
    </main>
  );
}
