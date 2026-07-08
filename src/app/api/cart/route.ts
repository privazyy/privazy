import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { safeCommerceError } from "@/server/commerce/errors";
import { assertCheckoutEnabled } from "@/server/commerce/flags";
import { CART_COOKIE_NAME, getCartViewByToken } from "@/server/shop/cart";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    assertCheckoutEnabled();
    const cookieStore = await cookies();
    const cart = await getCartViewByToken(cookieStore.get(CART_COOKIE_NAME)?.value);

    return NextResponse.json(cart, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    const safe = safeCommerceError(error);
    return NextResponse.json(safe.body, { status: safe.status });
  }
}
