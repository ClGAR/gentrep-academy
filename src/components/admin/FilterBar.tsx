export function FilterBar({
  action,
  children,
}: {
  action: string;
  children: React.ReactNode;
}) {
  return (
    <form className="admin-toolbar" action={action} method="get">
      {children}
      <button className="gg-button gg-button--secondary gg-button--sm" type="submit">
        Apply
      </button>
    </form>
  );
}
