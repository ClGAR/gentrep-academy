import { AdminHero } from "@/components/admin/AdminHero";
import { UserDirectory } from "@/components/admin/UserDirectory";
import { loadDirectory } from "@/lib/admin/queries";
import { requireCapability } from "@/lib/auth/guards";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { userId, roles } = await requireCapability("users.directory");
  const params = await searchParams;
  const query = params.q ?? "";
  const status = params.status ?? "all";
  const rows = await loadDirectory({ q: query, status, roles, actorId: userId });

  return (
    <div className="admin-stack">
      <AdminHero
        kicker="People"
        title="Directory"
        lede="Search first. Open a record only when you have an action."
        summary={{ label: "Matches", value: rows.length }}
      />
      <UserDirectory rows={rows} roles={roles} query={query} status={status} />
    </div>
  );
}
