import "server-only";

import type { UserRole } from "@prisma/client";

import { CommerceError } from "@/server/commerce/errors";
import { auth } from "@/server/auth";
import type { InvoiceActor } from "@/server/invoices/service";

const knownRoles = new Set<UserRole>([
  "ADMIN",
  "LAWYER",
  "OPERATOR",
  "CLIENT",
  "READ_ONLY",
]);

export async function requireInvoiceActor(): Promise<InvoiceActor> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new CommerceError(
      "unauthorized",
      "Wymagane logowanie.",
      401,
    );
  }
  if (!session.user.role || !knownRoles.has(session.user.role)) {
    throw new CommerceError(
      "forbidden",
      "Brak rozpoznanej roli użytkownika.",
      403,
    );
  }

  return {
    role: session.user.role,
    userId: session.user.id,
  };
}
