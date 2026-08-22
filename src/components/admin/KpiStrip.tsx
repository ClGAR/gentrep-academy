export function KpiStrip({
  items,
}: {
  items: Array<{ label: string; value: string | number; hint?: string }>;
}) {
  if (items.length === 0) return null;
  return (
    <section className="admin-kpis" aria-label="Snapshot">
      {items.map((item) => (
        <article key={item.label} className="admin-kpi">
          <p className="admin-kpi__label">{item.label}</p>
          <strong className="admin-kpi__value">{item.value}</strong>
          {item.hint ? <p className="helper">{item.hint}</p> : null}
        </article>
      ))}
    </section>
  );
}
