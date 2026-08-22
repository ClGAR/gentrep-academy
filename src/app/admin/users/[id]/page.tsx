import { notFound } from "next/navigation";
import { UserRecord } from "@/components/admin/UserRecord";
import { hasCapability } from "@/lib/admin/rbac";
import { loadClinicianOptions, loadUserRecord } from "@/lib/admin/queries";
import { requireCapability } from "@/lib/auth/guards";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId, roles } = await requireCapability(["users.directory", "users.read_assigned"]);
  const { id } = await params;
  const record = await loadUserRecord({ memberId: id, actorId: userId, roles });
  if (!record) notFound();
  const clinicians = hasCapability(roles, "users.write_roles") ? await loadClinicianOptions() : [];
  return <UserRecord record={record} roles={roles} clinicians={clinicians} />;
}
