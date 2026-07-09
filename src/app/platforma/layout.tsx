import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/server/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = session?.user?.role;

  if (!session?.user?.id || !role) {
    redirect("/");
  }

  if (role !== "CLIENT") {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-[var(--surface-page)] px-4 py-6 text-[var(--text-body)] sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[var(--container-wide)]">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm">
          <Link className="rounded-[var(--radius-sm)] px-3 py-2 font-semibold text-[var(--brand-ink)]" href="/platforma/naruszenia">
            Naruszenia
          </Link>
          <Link className="rounded-[var(--radius-sm)] px-3 py-2 text-[var(--text-muted)]" href="/client">
            Portal
          </Link>
        </nav>
        {children}
      </div>
    </main>
  );
}
