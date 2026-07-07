import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { auth } from "@/server/auth";
import { getPostLoginPath } from "@/server/auth/permissions";
import { normalizeCallbackUrl } from "@/server/auth/routes";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Logowanie | PRIVAZY",
  description: "Logowanie do prywatnych powierzchni PRIVAZY.",
};

type LoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const session = await auth();

  if (session?.user?.role) {
    redirect((params.callbackUrl ? normalizeCallbackUrl(params.callbackUrl) : getPostLoginPath(session.user.role)) as Route);
  }

  return (
    <main className="min-h-screen bg-[var(--surface-page)] px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col justify-center">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Card padding="lg" variant="flat">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-[var(--text-strong)]">Logowanie</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
              Dostep do CRM i prywatnych paneli wymaga konta PRIVAZY.
            </p>
          </div>
          <LoginForm callbackUrl={normalizeCallbackUrl(params.callbackUrl)} hasError={Boolean(params.error)} />
        </Card>
      </div>
    </main>
  );
}
