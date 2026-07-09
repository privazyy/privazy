import { redirect } from "next/navigation";

import { auth, signIn } from "@/server/auth";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.role === "CLIENT") redirect("/platforma");
  if (session?.user?.id) redirect("/admin");

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--surface-page)] px-4">
      <form
        action={async (formData) => {
          "use server";
          await signIn("credentials", {
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
            redirectTo: "/platforma",
          });
        }}
        className="w-full max-w-sm rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5"
      >
        <h1 className="text-xl font-bold text-[var(--text-strong)]">Logowanie</h1>
        <label className="mt-5 block text-sm font-semibold">
          E-mail
          <input className="mt-1 h-10 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] px-3" name="email" required type="email" />
        </label>
        <label className="mt-4 block text-sm font-semibold">
          Haslo
          <input className="mt-1 h-10 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] px-3" name="password" required type="password" />
        </label>
        <button className="mt-5 w-full rounded-[var(--radius-sm)] bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white" type="submit">
          Zaloguj
        </button>
      </form>
    </main>
  );
}
