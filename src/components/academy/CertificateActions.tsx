"use client";

import { useState } from "react";

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
  const [status, setStatus] = useState("");
  const [sharing, setSharing] = useState(false);

  return (
    <div className="no-print">
      <button
        className="tap btn navy wide"
        onClick={() => {
          setStatus("Opening the print dialog…");
          window.print();
        }}
      >
        Download as PDF
      </button>
      <p className="fine center">
        In the print window choose <b>Save as PDF</b> as the destination.
      </p>
      <button
        className="tap btn primary wide"
        disabled={sharing}
        onClick={async () => {
          const text = `${name} — ${rank}, Gentrep Academy.`;
          setSharing(true);
          setStatus("");
          try {
            if (navigator.share) {
              await navigator.share({ title: "Gentrep Academy", text, url: verifyUrl });
              setStatus("Share completed.");
              setSharing(false);
              return;
            }
          } catch (error) {
            if (error instanceof Error && error.name === "AbortError") {
              setStatus("");
              setSharing(false);
              return;
            }
          }
          try {
            await navigator.clipboard.writeText(`${text} ${verifyUrl}`);
            setStatus("Copied — paste it anywhere.");
          } catch {
            window.prompt("Copy this verification link", verifyUrl);
            setStatus("Copy the verification link from the prompt.");
          } finally {
            setSharing(false);
          }
        }}
      >
        {sharing ? "Sharing…" : "Share"}
      </button>
      {status ? (
        <p className="fine center" role="status" aria-live="polite">
          {status}
        </p>
      ) : null}
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
