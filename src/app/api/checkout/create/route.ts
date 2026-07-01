import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { checkoutPayloadSchema, createCheckoutOrder } from "@/server/shop/checkout";
import { CART_COOKIE_NAME } from "@/server/shop/cart";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
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
      meta: {
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
        referrer: request.headers.get("referer") ?? undefined,
        userAgent: request.headers.get("user-agent") ?? undefined,
      },
      payload: parsed.data,
    });
    const response = NextResponse.json(checkout, { status: 201 });

    response.cookies.delete(CART_COOKIE_NAME);
    return response;
  } catch (error) {
    console.error("Checkout create failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nie udalo sie utworzyc zamowienia." },
      { status: 500 },
    );
  }
}
