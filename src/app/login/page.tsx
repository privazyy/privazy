import type { Route } from "next";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { auth } from "@/server/auth";

export const metadata: Metadata = {
  title: "Logowanie | PRIVAZY CRM",
};

function safeCallbackUrl(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/admin";
  }

  return value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = safeCallbackUrl(params.callbackUrl);
  const session = await auth();

  if (session?.user?.id) {
    redirect(callbackUrl as Route);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--surface-page)] px-4 py-10 text-[var(--text-body)]">
      <LoginForm callbackUrl={callbackUrl} />
    </main>
  );
}
