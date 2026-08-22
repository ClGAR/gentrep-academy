import type { ReactNode } from "react";
import Link from "next/link";

export type AdminCrumb = { href?: string; label: string };

export function AdminHero({
  kicker,
  title,
  lede,
  summary,
  aside,
  crumbs,
}: {
  kicker: string;
  title: ReactNode;
  lede?: ReactNode;
  summary?: { label: string; value: string | number };
  aside?: ReactNode;
  crumbs?: AdminCrumb[];
}) {
  return (
    <header className="admin-hero">
      {crumbs && crumbs.length > 0 ? (
        <nav className="admin-crumbs" aria-label="Breadcrumb">
          {crumbs.map((crumb, index) => (
            <span key={`${crumb.label}-${index}`}>
              {index > 0 ? (
                <span className="admin-crumbs__sep" aria-hidden="true">
                  /
                </span>
              ) : null}
              {crumb.href ? (
                <Link href={crumb.href}>{crumb.label}</Link>
              ) : (
                <span className="admin-crumbs__cur">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      ) : null}
      <div className="admin-hero__row">
        <div>
          <p className="admin-hero__kicker">{kicker}</p>
          <h1>{title}</h1>
          {lede ? <p className="admin-hero__lede">{lede}</p> : null}
        </div>
        {summary ? (
          <p className="admin-summary">
            {summary.label}
            <strong>{summary.value}</strong>
          </p>
        ) : null}
        {!summary && aside ? <div className="admin-hero__aside">{aside}</div> : null}
      </div>
    </header>
  );
}
