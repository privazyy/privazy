import "server-only";

export type CreatePaymentInput = {
  amountGrossCents: number;
  currency: string;
  orderId: string;
  orderNumber: string;
  publicAccessToken: string;
};

export type CreatePaymentResult = {
  mode: "MOCK";
  paymentId: string;
  paymentUrl: string;
  status: "PENDING" | "SUCCEEDED";
};

export type PaymentWebhookEvent = {
  amountGrossCents: number;
  currency: string;
  eventId: string;
  eventType: string;
  outcome: "failed" | "succeeded";
  payloadHash: string;
  paymentId: string;
};

export type PaymentWebhookResult = {
  orderNumber: string;
  providerEventId: string;
  status: "FAILED" | "IGNORED" | "REJECTED" | "SUCCEEDED";
};

export interface PaymentProvider {
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  getPaymentStatus(paymentId: string): Promise<string>;
  verifyWebhook(request: Request): Promise<PaymentWebhookEvent>;
  handleWebhookEvent(event: PaymentWebhookEvent): Promise<PaymentWebhookResult>;
}
