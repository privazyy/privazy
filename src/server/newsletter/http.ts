import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { NewsletterServiceError } from "@/server/newsletter/newsletter-service";

export async function parseJson(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new NewsletterServiceError(400, "INVALID_JSON", "Nieprawidlowy format JSON.");
  }
}

export function newsletterErrorResponse(error: unknown) {
  if (error instanceof NewsletterServiceError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...("details" in error && error.details ? { details: error.details } : {}),
      },
      { status: error.status },
    );
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: "Nieprawidlowe dane wejsciowe.", code: "VALIDATION_ERROR", details: error.flatten() },
      { status: 400 },
    );
  }

  console.error("Newsletter request failed", error);
  return NextResponse.json(
    { error: "Nie udalo sie przetworzyc zgloszenia.", code: "INTERNAL_ERROR" },
    { status: 500 },
  );
}
