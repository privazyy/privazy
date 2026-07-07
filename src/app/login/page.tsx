import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/server/auth";

export const metadata: Metadata = {
  title: "Logowanie | privazy.",
};

export default function LoginPage() {
  async function signInWithCredentials(formData: FormData) {
    "use server";

    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/admin",
    });
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <form action={signInWithCredentials} className="space-y-5 rounded-[8px] border border-border bg-card p-6 shadow-sm">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">privazy.</p>
          <h1 className="mt-3 text-2xl font-semibold text-foreground">Logowanie</h1>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Haslo</Label>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        <Button type="submit" className="w-full">
          Zaloguj
        </Button>
      </form>
    </main>
  );
}
