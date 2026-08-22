"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/actions/auth";
import { academyDeskLinks, navFor, type PortalNavItem } from "@/lib/admin/rbac";
import type { PortalProfile } from "@/lib/admin/types";

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
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavList({
  items,
  pathname,
  onNavigate,
}: {
  items: PortalNavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const work = items.filter((item) => item.section === "work");
  const system = items.filter((item) => item.section === "system");
  return (
    <>
      <p className="admin-rail__label">Work</p>
      {work.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`admin-nav${isActive(pathname, item.href) ? " is-active" : ""}`}
          onClick={onNavigate}
        >
          {item.label}
        </Link>
      ))}
      {system.length > 0 ? (
        <>
          <p className="admin-rail__label">System</p>
          {system.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav${isActive(pathname, item.href) ? " is-active" : ""}`}
              onClick={onNavigate}
            >
              {item.label}
            </Link>
          ))}
        </>
      ) : null}
    </>
  );
}

export function AdminShell({
  profile,
  children,
}: {
  profile: PortalProfile;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = navFor(profile.roles);
  const desks = academyDeskLinks(profile.roles);

  return (
    <div className={`admin-app${open ? " is-open" : ""}`}>
      <a className="skip" href="#admin-main">
        Skip to content
      </a>
      {open ? (
        <button className="admin-scrim" type="button" aria-label="Close menu" onClick={() => setOpen(false)} />
      ) : null}
      <aside className="admin-rail" id="admin-nav">
        <div className="admin-rail__brand">
          <strong>GutGuard</strong>
          <em>Admin</em>
        </div>
        <p className="admin-rail__sub">
          {profile.persona} · Lifestyle operations
        </p>
        <nav className="admin-rail__nav" aria-label="Admin">
          <NavList items={items} pathname={pathname} onNavigate={() => setOpen(false)} />
        </nav>
        {desks.length > 0 ? (
          <div className="admin-rail__desks">
            <p className="admin-rail__label">Academy</p>
            {desks.map((desk) => (
              <a
                key={desk.href}
                href={desk.href}
                className={`admin-nav${isActive(pathname, desk.href) ? " is-active" : ""}`}
              >
                {desk.label}
              </a>
            ))}
          </div>
        ) : null}
        <div className="admin-rail__foot">
          <div className="admin-who">
            <span className="avatar" aria-hidden="true">
              {initials(profile.fullName)}
            </span>
            <div>
              <b>{profile.fullName}</b>
              <span>{profile.email ?? profile.persona}</span>
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
            aria-controls="admin-nav"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            Menu
          </button>
          <p className="admin-top__mark">Lifestyle operations</p>
        </header>
        <main id="admin-main" className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}
