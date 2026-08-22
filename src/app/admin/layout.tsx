import "./admin.css";
import { AdminShell } from "@/components/admin/AdminShell";
import { loadPortalProfile } from "@/lib/admin/queries";
import { requirePortalAccess } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { userId, roles } = await requirePortalAccess();
  const profile = await loadPortalProfile(userId);
  if (!profile) {
    return children;
  }
  return (
    <AdminShell profile={{ ...profile, roles }}>
      {children}
    </AdminShell>
  );
}
