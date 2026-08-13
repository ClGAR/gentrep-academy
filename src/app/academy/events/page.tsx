import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";

export default async function EventsPage() {
  await requireUser();
  redirect("/academy");
}
