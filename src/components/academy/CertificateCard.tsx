import type { RankRecord, RequirementView } from "@/lib/academy/types";
import { GentrepMark } from "@/components/academy/GentrepMark";
import { RankMark } from "@/components/academy/RankMark";
import { GA } from "@/components/academy/tokens";
import { rankInsigniaSize } from "@/components/academy/helpers";

export function evidenceLine(requirements: RequirementView[]) {
  const counts: Partial<Record<RequirementView["type"], number>> = {};
  for (const req of requirements) {
    counts[req.type] = (counts[req.type] ?? 0) + 1;
  }
  const parts: string[] = [];
  if (counts.document) parts.push(`${counts.document} agreed`);
  if (counts.attendance) parts.push(`${counts.attendance} attended`);
  if (counts.demonstration) parts.push("1 demonstration witnessed");
  if (counts.derived) parts.push("1 trainee certified");
  return parts.join(" · ");
}

export function CertificateCard({
  name,
  rank,
  citation,
  issuedAt,
  cardTail,
  reference,
  qrSrc,
  requirements,
}: {
  name: string;
  rank: RankRecord;
  citation: string;
  issuedAt: string;
  cardTail: string;
  reference: string;
  qrSrc?: string | null;
  requirements?: RequirementView[];
}) {
  const evidence = requirements?.length ? evidenceLine(requirements) : null;
  const displayName = `${rank.abbr ? `${rank.abbr} ` : ""}${name}`;
  const rankLine = rank.officerTitle ? `${rank.officerTitle} · ${rank.fullName}` : "Activated Member";

  return (
    <div className="printroot">
      <div className="cert">
        <GentrepMark
          markOnly
          height={260}
          className="cert-mark"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            opacity: 0.05,
            zIndex: -1,
            pointerEvents: "none",
            maxWidth: "none",
          }}
        />
        <div className="cert-brand">
          <GentrepMark height={20} color={GA.navy} />
          <span className="serif">Academy</span>
        </div>
        <div className="cert-eyebrow">Certification</div>
        <div className="cert-ins">
          <RankMark
            kind={rank.insigniaKind}
            metal={rank.metal}
            count={rank.insigniaCount}
            size={rankInsigniaSize(rank.code, "cert")}
          />
        </div>
        <div className="cert-name">{displayName}</div>
        <div className="cert-rank">{rankLine}</div>
        <div className="cert-hr" />
        <p className="cert-cite">{citation}</p>
        {evidence ? <div className="cert-evidence">{evidence}</div> : null}
        <div className="cert-sigs">
          {["Academy Commandant", "Chief Operating Officer"].map((label) => (
            <div key={label}>
              <span />
              <em>{label}</em>
            </div>
          ))}
        </div>
        {qrSrc ? (
          <div className="cert-qr">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrSrc} alt="Certificate verification QR code" width={160} height={160} />
            <em>Scan to verify</em>
          </div>
        ) : null}
        <div className="cert-record">
          <div>
            <em>Dated</em>
            <b>{issuedAt}</b>
          </div>
          <div>
            <em>Card</em>
            <b>{cardTail}</b>
          </div>
          <div>
            <em>Reference</em>
            <b>{reference}</b>
          </div>
        </div>
        <p className="cert-fine">An internal distinction of the Gentrep Academy.</p>
      </div>
    </div>
  );
}
