"use client";

export function CertificateActions({
  verifyUrl,
  name,
  rank,
}: {
  verifyUrl: string;
  name: string;
  rank: string;
}) {
  return (
    <div className="no-print" style={{ display: "grid", gap: 8, marginTop: 16 }}>
      <button
        className="gg-button gg-button--primary gg-button--wide"
        onClick={() => window.print()}
      >
        Download as PDF
      </button>
      <p className="helper" style={{ textAlign: "center" }}>
        In the print window choose <b>Save as PDF</b> as the destination.
      </p>
      <button
        className="gg-button gg-button--secondary gg-button--wide"
        onClick={async () => {
          const text = `${name} — ${rank}, Gentrep Academy.`;
          try {
            if (navigator.share) {
              await navigator.share({ title: "Gentrep Academy", text, url: verifyUrl });
              return;
            }
          } catch (error) {
            if (error instanceof Error && error.name === "AbortError") return;
          }
          try {
            await navigator.clipboard.writeText(`${text} ${verifyUrl}`);
          } catch {
            window.prompt("Copy this verification link", verifyUrl);
          }
        }}
      >
        Share
      </button>
      <a className="gg-button gg-button--secondary gg-button--wide" href="/academy">
        Close
      </a>
    </div>
  );
}
