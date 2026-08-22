import { AdminHero } from "@/components/admin/AdminHero";
import { CmsLibrary } from "@/components/admin/CmsLibrary";
import { hasCapability } from "@/lib/admin/rbac";
import { loadCmsLibrary } from "@/lib/admin/queries";
import { requireCapability } from "@/lib/auth/guards";

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; collection?: string }>;
}) {
  const { roles } = await requireCapability("content.read");
  const params = await searchParams;
  const status = params.status ?? "all";
  const collection = params.collection ?? "all";
  const canWrite = hasCapability(roles, "content.write");
  const rows = await loadCmsLibrary({
    status,
    collection,
    publishedOnly: !canWrite,
  });

  return (
    <div className="admin-stack">
      <AdminHero
        kicker="CMS"
        title="Content"
        lede="Protocols and product copy wait for a dietitian. Only Super Admin can publish."
        summary={{ label: "Entries", value: rows.length }}
      />
      <CmsLibrary
        rows={rows}
        queryStatus={status}
        queryCollection={collection}
        canWrite={canWrite}
      />
    </div>
  );
}
