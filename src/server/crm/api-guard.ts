import "server-only";

import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { auth } from "@/server/auth";
import { canMutateCrmApi, canReadCrmApi, type CrmApiUser } from "@/server/crm/permissions";

export type CrmApiErrorCode =
  | "AUTHENTICATION_REQUIRED"
  | "INSUFFICIENT_PERMISSIONS"
  | "VALIDATION_ERROR"
  | "METHOD_NOT_ALLOWED"
  | "INTERNAL_ERROR";

export type CrmApiSuccess<T> = {
  data: T;
  ok: true;
};

export type CrmApiFailure = {
  error: {
    code: CrmApiErrorCode;
    message: string;
  };
  ok: false;
};

export class CrmApiAuthError extends Error {
  constructor(
    public readonly status: 401 | 403,
    public readonly code: Extract<CrmApiErrorCode, "AUTHENTICATION_REQUIRED" | "INSUFFICIENT_PERMISSIONS">,
    message: string,
  ) {
    super(message);
    this.name = "CrmApiAuthError";
  }
}

type CrmApiHandler<T> = (request: Request, user: CrmApiUser) => Promise<NextResponse<CrmApiSuccess<T> | CrmApiFailure>>;

export async function requireCrmApiRead() {
  const user = await getCrmApiUser();

  if (!canReadCrmApi(user)) {
    throw new CrmApiAuthError(403, "INSUFFICIENT_PERMISSIONS", "Ta rola nie ma dostepu do CRM API.");
  }

  return user;
}

export async function requireCrmApiMutation() {
  const user = await getCrmApiUser();

  if (!canMutateCrmApi(user)) {
    throw new CrmApiAuthError(403, "INSUFFICIENT_PERMISSIONS", "Ta rola nie moze wykonywac mutacji CRM API.");
  }

  return user;
}

export function withCrmApiRead<T>(handler: CrmApiHandler<T>) {
  return async (request: Request) => {
    try {
      const user = await requireCrmApiRead();

      return handler(request, user);
    } catch (error) {
      return crmApiError(error);
    }
  };
}

export function withCrmApiMutation<T>(handler: CrmApiHandler<T>) {
  return async (request: Request) => {
    try {
      const user = await requireCrmApiMutation();

      return handler(request, user);
    } catch (error) {
      return crmApiError(error);
    }
  };
}

export function crmApiData<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<CrmApiSuccess<T>>({ ok: true, data }, init);
}

export function crmApiMethodNotAllowed(message = "Ta metoda CRM API nie jest jeszcze dostepna.") {
  return NextResponse.json<CrmApiFailure>(
    {
      ok: false,
      error: {
        code: "METHOD_NOT_ALLOWED",
        message,
      },
    },
    { status: 405 },
  );
}

export function crmApiError(error: unknown) {
  if (error instanceof CrmApiAuthError) {
    return NextResponse.json<CrmApiFailure>(
      {
        ok: false,
        error: {
          code: error.code,
          message: error.status === 401 ? "Wymagane jest zalogowanie." : "Brak uprawnien do CRM API.",
        },
      },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json<CrmApiFailure>(
      {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Nieprawidlowe parametry zapytania.",
        },
      },
      { status: 400 },
    );
  }

  console.error("CRM API request failed", error);

  return NextResponse.json<CrmApiFailure>(
    {
      ok: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Nie udalo sie obsluzyc zapytania CRM API.",
      },
    },
    { status: 500 },
  );
}

async function getCrmApiUser() {
  const session = await auth();
  const user = session?.user;

  if (!user?.id) {
    throw new CrmApiAuthError(401, "AUTHENTICATION_REQUIRED", "Authentication required");
  }

  return {
    id: user.id,
    role: user.role,
  };
}
