import "server-only";

export type CreatePaymentInput = {
  amountGrossCents: number;
  currency: string;
  orderId: string;
  orderNumber: string;
  publicAccessToken: string;
};

export type CreatePaymentResult = {
  paymentId: string;
  paymentUrl: string;
  status: "PENDING" | "PROCESSING";
};

export type PaymentWebhookResult = {
  orderNumber: string;
  status: "PAID" | "FAILED" | "IGNORED";
};

export interface PaymentProviderClient {
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  getPaymentStatus(paymentId: string): Promise<string>;
  handleWebhook(request: Request): Promise<PaymentWebhookResult>;
  refundPayment(paymentId: string): Promise<{ status: "REFUND_NOT_IMPLEMENTED" }>;
}
