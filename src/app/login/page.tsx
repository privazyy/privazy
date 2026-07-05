import type { Metadata } from "next";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { getCurrentUser } from "@/server/auth/guards";
import { getPostLoginPath } from "@/server/auth/roles";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Logowanie | PRIVAZY",
  description: "Logowanie do panelu PRIVAZY.",
};

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(getPostLoginPath(user.role) as Route);
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
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Dostęp do CRM, dokumentów i platformy klienta wymaga konta PRIVAZY.
            </p>
          </div>
          <LoginForm />
        </Card>
      </div>
    </main>
  );
}
