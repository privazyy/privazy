import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { safeCommerceError } from "@/server/commerce/errors";
import { enforceCommerceRateLimit } from "@/server/commerce/rate-limit";
import { checkoutPayloadSchema, createCheckoutOrder } from "@/server/shop/checkout";
import { CART_COOKIE_NAME } from "@/server/shop/cart";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    enforceCommerceRateLimit(request, "checkout-create", { limit: 10 });
  } catch (error) {
    const safe = safeCommerceError(error);
    return NextResponse.json(safe.body, { status: safe.status });
  }

  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidlowy format danych." }, { status: 400 });
  }

  const parsed = checkoutPayloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Uzupelnij wymagane dane zamowienia.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const cookieStore = await cookies();
    const checkout = await createCheckoutOrder({
      cartToken: cookieStore.get(CART_COOKIE_NAME)?.value,
      payload: parsed.data,
    });
    const response = NextResponse.json(checkout, { status: 201 });

    response.cookies.delete(CART_COOKIE_NAME);
    return response;
  } catch (error) {
    console.error("Checkout create failed", {
      errorCode:
        error && typeof error === "object" && "code" in error
          ? String(error.code)
          : undefined,
      errorName: error instanceof Error ? error.name : "UnknownError",
      missingColumn:
        error &&
        typeof error === "object" &&
        "meta" in error &&
        error.meta &&
        typeof error.meta === "object" &&
        "column" in error.meta
          ? String(error.meta.column)
          : undefined,
    });
    const safe = safeCommerceError(error);
    return NextResponse.json(safe.body, { status: safe.status });
  }
}
