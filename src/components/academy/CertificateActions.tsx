"use client";

export function CertificateActions({
  verifyUrl,
  name,
  rank,
  onClose,
}: {
  verifyUrl: string;
  name: string;
  rank: string;
  onClose?: () => void;
}) {
  return (
    <div className="no-print">
      <button
        className="tap btn navy wide"
        onClick={() => {
          window.print();
        }}
      >
        Download as PDF
      </button>
      <p className="fine center">
        In the print window choose <b>Save as PDF</b> as the destination.
      </p>
      <button
        className="tap btn tg wide"
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
      {onClose ? (
        <button className="tap btn outline wide" onClick={onClose}>
          Close
        </button>
      ) : (
        <a className="tap btn outline wide" href="/academy">
          Close
        </a>
      )}
    </div>
  );
}
