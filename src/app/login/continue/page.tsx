import type { Route } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/guards";
import { getPostLoginPath } from "@/server/auth/roles";

export default async function LoginContinuePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login" as Route);
  }

  redirect(getPostLoginPath(user.role) as Route);
}
