import type { Route } from "next";
import { redirect } from "next/navigation";

export default function ClientPage() {
  redirect("/platforma" as Route);
}
