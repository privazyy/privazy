import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { CART_COOKIE_NAME, getCartViewByToken } from "@/server/shop/cart";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  const cart = await getCartViewByToken(cookieStore.get(CART_COOKIE_NAME)?.value);

  return NextResponse.json(cart);
}
