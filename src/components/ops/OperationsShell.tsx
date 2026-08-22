"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/actions/auth";
import { AdminHero } from "@/components/admin/AdminHero";
import type { AppRole } from "@/lib/academy/types";

type OperationsArea = "staff" | "trainer";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin" || pathname.startsWith("/admin/");
  if (href === "/academy") return pathname === "/academy" || pathname.startsWith("/academy/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function OperationsShell({
  active,
  eyebrow,
  title,
  description,
  roles,
  profile,
  summary,
  children,
}: {
  active: OperationsArea;
  eyebrow: string;
  title: string;
  description: string;
  roles: AppRole[];
  profile?: { fullName: string; email: string | null; persona: string } | null;
  summary?: { label: string; value: string | number };
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isAdmin = roles.includes("admin");
  const work = [
    isAdmin ? { href: "/admin", label: "Today" } : null,
    isAdmin || roles.includes("staff") ? { href: "/staff/events", label: "Staff check-in" } : null,
    isAdmin || roles.includes("trainer") ? { href: "/trainer/verifications", label: "Trainer queue" } : null,
  ].filter(Boolean) as Array<{ href: string; label: string }>;
  const name = profile?.fullName ?? eyebrow;
  const brand = active === "trainer" ? "Trainer" : "Staff";

  return (
    <div className={`admin-app${open ? " is-open" : ""}`}>
      <a className="skip" href="#ops-content">
        Skip to content
      </a>
      {open ? (
        <button className="admin-scrim" type="button" aria-label="Close menu" onClick={() => setOpen(false)} />
      ) : null}
      <aside className="admin-rail" id="ops-nav">
        <div className="admin-rail__brand">
          <strong>GutGuard</strong>
          <em>{brand}</em>
        </div>
        <p className="admin-rail__sub">{profile?.persona ?? eyebrow} · Academy operations</p>
        <nav className="admin-rail__nav" aria-label="Operations">
          <p className="admin-rail__label">Work</p>
          {work.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`admin-nav${isActive(pathname, item.href) ? " is-active" : ""}`}
            >
              {item.label}
            </a>
          ))}
          <p className="admin-rail__label">Academy</p>
          <a
            href="/academy"
            className={`admin-nav${isActive(pathname, "/academy") ? " is-active" : ""}`}
          >
            Member dashboard
          </a>
        </nav>
        <div className="admin-rail__foot">
          <div className="admin-who">
            <span className="avatar" aria-hidden="true">
              {initials(name)}
            </span>
            <div>
              <b>{name}</b>
              <span>{profile?.email ?? eyebrow}</span>
            </div>
          </div>
          <form action={signOut}>
            <button className="gg-button gg-button--primary gg-button--wide" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <div className="admin-canvas">
        <header className="admin-top">
          <button
            className="gg-button gg-button--secondary gg-button--sm admin-menu"
            type="button"
            aria-controls="ops-nav"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            Menu
          </button>
          <p className="admin-top__mark">Academy operations</p>
        </header>
        <main id="ops-content" className="admin-main" tabIndex={-1}>
          <div className="admin-stack">
            <AdminHero kicker={eyebrow} title={title} lede={description} summary={summary} />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
