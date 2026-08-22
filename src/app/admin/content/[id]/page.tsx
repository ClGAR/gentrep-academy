import { notFound } from "next/navigation";
import { CmsEditor } from "@/components/admin/CmsEditor";
import { hasCapability } from "@/lib/admin/rbac";
import { loadCmsEntry } from "@/lib/admin/queries";
import { requireCapability } from "@/lib/auth/guards";

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { roles } = await requireCapability("content.read");
  const { id } = await params;
  const entry = await loadCmsEntry(id);
  if (!entry) notFound();
  if (!hasCapability(roles, "content.write") && entry.status !== "published") notFound();
  return <CmsEditor entry={entry} roles={roles} />;
}
