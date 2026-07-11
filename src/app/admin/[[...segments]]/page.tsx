import type { Route } from "next";
import { permanentRedirect } from "next/navigation";

export default async function LegacyAdminRedirect({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}) {
  const { segments = [] } = await params;
  const suffix = segments.length > 0 ? `/${segments.map(encodeURIComponent).join("/")}` : "";
  permanentRedirect(`/crm${suffix}` as Route);
}
