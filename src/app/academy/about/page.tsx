import { AboutAcademyPage } from "@/components/academy/AboutAcademyPage";
import { AcademyLoadError } from "@/components/academy/AcademyLoadState";
import { loadDashboard } from "@/lib/academy/queries";
import { chairmanVisualFixture } from "@/lib/academy/visual-fixture";
import { requireUser } from "@/lib/auth/guards";

export default async function AcademyAboutRoute({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const params = await searchParams;
  if (process.env.NODE_ENV !== "production" && params.preview === "chairman") {
    return <AboutAcademyPage data={chairmanVisualFixture} />;
  }
  await requireUser();
  const result = await loadDashboard();
  if (!result.ok) {
    return <AcademyLoadError error={result.error} futureJwt={result.futureJwt} />;
  }
  return <AboutAcademyPage data={result.data} />;
}
