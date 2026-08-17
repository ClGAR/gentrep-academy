import type { ReactNode } from "react";
import { signOut } from "@/lib/actions/auth";
import type { AppRole } from "@/lib/academy/types";

type OperationsArea = "admin" | "staff" | "trainer";

const AREAS: Array<{
  id: OperationsArea;
  label: string;
  href: string;
  role: AppRole;
}> = [
  { id: "admin", label: "Overview", href: "/admin", role: "admin" },
  { id: "staff", label: "Event roster", href: "/staff/events", role: "staff" },
  {
    id: "trainer",
    label: "Trainer desk",
    href: "/trainer/verifications",
    role: "trainer",
  },
];

export function OperationsShell({
  active,
  eyebrow,
  title,
  description,
  roles,
  metrics,
  children,
}: {
  active: OperationsArea;
  eyebrow: string;
  title: string;
  description: string;
  roles: AppRole[];
  metrics?: Array<{ value: number | string; label: string }>;
  children: ReactNode;
}) {
  const isAdmin = roles.includes("admin");
  const availableAreas = AREAS.filter(
    (area) => isAdmin || roles.includes(area.role),
  );

  return (
    <main className="ops-shell">
      <a className="skip" href="#ops-content">
        Skip to operations
      </a>
      <header className="ops-hero">
        <div>
          <p className="eyebrow-dark">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {metrics?.length ? (
          <dl className="ops-metrics" aria-label="Operations summary">
            {metrics.map((metric) => (
              <div key={metric.label}>
                <dt>{metric.label}</dt>
                <dd>{metric.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </header>

      <nav className="ops-tabs" aria-label="Operations">
        <a href="/academy">Academy</a>
        {availableAreas.map((area) => (
          <a
            key={area.id}
            href={area.href}
            aria-current={active === area.id ? "page" : undefined}
          >
            {area.label}
          </a>
        ))}
      </nav>

      <section className="ops-panel" id="ops-content" tabIndex={-1}>
        {children}
      </section>

      <footer className="ops-footer">
        <span>Gentrep Academy operations</span>
        <form action={signOut}>
          <button className="gg-button gg-button--secondary" type="submit">
            Sign out
          </button>
        </form>
      </footer>
    </main>
  );
}
