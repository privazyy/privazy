import "server-only";

import { NextResponse } from "next/server";

import { CrmServiceError, toSafeCrmError } from "@/server/crm/errors";

export async function parseJson(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new CrmServiceError(400, "INVALID_JSON", "Nieprawidlowy format JSON.");
  }
}

export function queryObject(request: Request) {
  return Object.fromEntries(new URL(request.url).searchParams.entries());
}

export function crmErrorResponse(error: unknown) {
  const safeError = toSafeCrmError(error);
  return NextResponse.json(safeError.body, { status: safeError.status });
}
