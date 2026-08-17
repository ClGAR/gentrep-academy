"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function AcademyDialog({
  label,
  onClose,
  children,
}: {
  label: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const previousRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    previousRef.current = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => {
      sheetRef.current?.focus({ preventScroll: true });
    }, 40);

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !sheetRef.current) return;
      const nodes = [...sheetRef.current.querySelectorAll<HTMLElement>(
        "button:not([disabled]),input,[tabindex]:not([tabindex='-1'])",
      )].filter((node) => node.offsetParent !== null);
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === sheetRef.current)) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previousRef.current?.focus?.({ preventScroll: true });
    };
  }, []);

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={label} onClick={onClose}>
      <div
        className="sheet up"
        ref={sheetRef}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="grab only-mobile" />
        {children}
      </div>
    </div>
  );
}
