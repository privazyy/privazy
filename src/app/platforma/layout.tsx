import { redirect } from "next/navigation";

import { PortalShell } from "@/components/portal/portal-shell";
import { auth } from "@/server/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "CLIENT") redirect("/admin");

  return <PortalShell userLabel={session.user.name ?? session.user.email ?? "Konto"}>{children}</PortalShell>;
}
