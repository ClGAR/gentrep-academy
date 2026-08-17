import { certificateQrDataUrl } from "@/lib/academy/qr";
import { loadPublicCertificate } from "@/lib/academy/queries";

export const dynamic = "force-dynamic";

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ certificateCode: string }>;
}) {
  const { certificateCode } = await params;
  const result = await loadPublicCertificate(certificateCode);
  if (!result.ok) {
    return (
      <main className="verify-shell">
        <p className="eyebrow-dark">Public verification</p>
        <h1>{result.kind === "not-found" ? "Certificate not found" : "Verification unavailable"}</h1>
        <p className="helper">
          {result.kind === "not-found"
            ? "This link does not match a Gentrep Academy certificate."
            : "The verification service could not be reached. Try this link again shortly."}
        </p>
      </main>
    );
  }
  const cert = result.data;

  const qr = cert.status === "issued" ? await certificateQrDataUrl(certificateCode) : null;

  return (
    <main className="verify-shell">
      <p className="eyebrow-dark">Public verification</p>
      <h1>{cert.status === "issued" ? "Valid certificate" : "Revoked certificate"}</h1>
      <p className="helper">
        {cert.status === "issued"
          ? "This record was issued by Gentrep Academy."
          : "This record is no longer valid. Contact Gentrep Academy for details."}
      </p>
      <div className="verify-record">
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
        <div className="verify-qr">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="Certificate verification QR code" width={140} height={140} />
        </div>
      ) : null}
      <p className="cert-fine" style={{ marginTop: 20 }}>
        Public verification shows only the certificate record. Team, booking, and audit data remain private.
      </p>
    </main>
  );
}
