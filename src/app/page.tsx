import { redirect } from "next/navigation";
import { getAuthUserId } from "@/lib/academy/queries";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }
  const userId = await getAuthUserId();
  redirect(userId ? "/academy" : "/login");
}
