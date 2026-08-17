"use client";

import { useEffect, useState } from "react";
import { isFutureJwtMessage } from "@/lib/supabase/jwt";

const RETRY_KEY = "ga-session-open-retries";
const MAX_RELOADS = 3;

function readRetryCount() {
  if (typeof window === "undefined") return 0;
  return Number(sessionStorage.getItem(RETRY_KEY) ?? "0");
}

export function AcademyLoadError({
  error,
  futureJwt = false,
}: {
  error: string;
  futureJwt?: boolean;
}) {
  const opening = futureJwt || isFutureJwtMessage(error);
  const [retryCount] = useState(readRetryCount);
  const gaveUp = opening && retryCount >= MAX_RELOADS;

  useEffect(() => {
    if (!opening) {
      sessionStorage.removeItem(RETRY_KEY);
      return;
    }
    if (retryCount >= MAX_RELOADS) {
      sessionStorage.removeItem(RETRY_KEY);
      return;
    }
    sessionStorage.setItem(RETRY_KEY, String(retryCount + 1));
    const timer = window.setTimeout(() => {
      window.location.reload();
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [opening, retryCount]);

  if (opening && !gaveUp) {
    return (
      <main className="auth-shell">
        <p className="eyebrow-dark">Gentrep Academy</p>
        <h1 className="sec">Opening the Academy</h1>
        <p className="helper">Confirming your session. This page will refresh on its own.</p>
      </main>
    );
  }

  return (
    <main className="auth-shell">
      <p className="eyebrow-dark">Gentrep Academy</p>
      <h1 className="sec">{opening ? "Could not open your session" : "Academy unavailable"}</h1>
      <div className="gg-alert gg-alert--error" role="alert">
        <span className="gg-alert__kicker">Error</span>
        {opening
          ? "Sign in again. Your session did not finish opening."
          : error}
      </div>
    </main>
  );
}
