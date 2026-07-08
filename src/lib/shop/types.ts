import type { MoneyBreakdown } from "@/lib/shop/money";

export type CartItemView = {
  currency: string;
  expectedDelivery: string;
  id: string;
  line: Omit<MoneyBreakdown, "discountCents">;
  name: string;
  productSlug: string;
  productType: string;
  quantity: number;
  shortDescription: string;
  status: string;
  unitNetCents: number;
  vatRateBps: number;
};

export type CartView = {
  coupon: { code: string; id: string } | null;
  currency: string;
  discountCents: number;
  id: string | null;
  itemCount: number;
  items: CartItemView[];
  status: string;
  subtotalNetCents: number;
  totalGrossCents: number;
  vatCents: number;
};

export type PublicOrderView = {
  billing: {
    city: string;
    companyName: string | null;
    customerType: string;
    email: string;
    name: string;
    nip: string | null;
    postalCode: string;
  };
  currency: string;
  discountCents: number;
  invoice: {
    invoiceNumber: string | null;
    mode: string;
    pdfAvailable: boolean;
    provider: string;
    status: string;
  } | null;
  items: Array<{
    inputFormPath: string | null;
    productName: string;
    productSlug: string;
    quantity: number;
    status: string;
    totalGrossCents: number;
  }>;
  orderNumber: string;
  paymentStatus: string;
  payments: Array<{
    amountGrossCents: number;
    paymentUrl: string | null;
    status: string;
  }>;
  status: string;
  subtotalNetCents: number;
  totalGrossCents: number;
  vatCents: number;
  wantsInvoice: boolean;
};
