import { certificateQrDataUrl } from "@/lib/academy/qr";
import { loadPublicCertificate } from "@/lib/academy/queries";

export const dynamic = "force-dynamic";

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ certificateId: string }>;
}) {
  const { certificateId } = await params;
  const cert = await loadPublicCertificate(certificateId);
  if (!cert) {
    return (
      <main className="auth-shell">
        <h1 className="sec">Certificate not found</h1>
        <p className="helper">This link is not a valid Gentrep Academy certificate.</p>
      </main>
    );
  }

  const qr = cert.status === "issued" ? await certificateQrDataUrl(cert.id) : null;

  return (
    <main className="auth-shell">
      <p className="eyebrow-dark">Public verification</p>
      <h1 className="sec">{cert.status === "issued" ? "Valid certificate" : "Revoked certificate"}</h1>
      <div className="about-table">
        <div>
          <b>{cert.memberName}</b>
          <span>Member</span>
        </div>
        <div>
          <b>{cert.rankName}</b>
          <span>Rank</span>
        </div>
        <div>
          <b>{cert.referenceCode}</b>
          <span>Reference</span>
        </div>
        <div>
          <b>{new Date(cert.issuedAt).toLocaleDateString("en-PH")}</b>
          <span>Issued</span>
        </div>
      </div>
      {qr ? (
        <div className="cert-qr" style={{ marginTop: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="" width={140} height={140} />
        </div>
      ) : null}
      <p className="cert-fine">This page does not show team, booking, or audit data.</p>
    </main>
  );
}
