"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

export function AcademyDialogCloseButton({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <button
      className="tap dialog-close"
      type="button"
      onClick={onClose}
      aria-label="Close"
    >
      <X aria-hidden="true" />
    </button>
  );
}

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
  const titleId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    previousRef.current = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    const background = [
      document.querySelector<HTMLElement>(".ga .shell"),
      document.querySelector<HTMLElement>(".ga .foot"),
    ].filter((element): element is HTMLElement => Boolean(element));
    const backgroundState = background.map((element) => ({
      element,
      inert: element.inert,
      ariaHidden: element.getAttribute("aria-hidden"),
    }));
    background.forEach((element) => {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    });
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
      backgroundState.forEach(({ element, inert, ariaHidden }) => {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", ariaHidden);
      });
      previousRef.current?.focus?.({ preventScroll: true });
    };
  }, []);

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={onClose}>
      <div
        className="sheet up"
        ref={sheetRef}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="grab only-mobile" />
        <span className="sr-only" id={titleId}>
          {label}
        </span>
        {children}
      </div>
    </div>
  );
}
