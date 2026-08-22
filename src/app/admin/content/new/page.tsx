import { CmsEditor } from "@/components/admin/CmsEditor";
import { requireCapability } from "@/lib/auth/guards";

export default async function NewContentPage() {
  const { roles } = await requireCapability("content.write");
  return <CmsEditor entry={null} roles={roles} />;
}
