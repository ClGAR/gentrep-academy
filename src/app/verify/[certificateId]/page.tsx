import { redirect } from "next/navigation";

export default async function LegacyVerifyPage({
  params,
}: {
  params: Promise<{ certificateId: string }>;
}) {
  const { certificateId } = await params;
  redirect(`/certificates/verify/${encodeURIComponent(certificateId)}`);
}
