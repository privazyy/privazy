import "server-only";

export type CreateInvoiceInput = {
  actorUserId: string;
  invoiceId: string;
};

export type InvoiceProviderResult = {
  externalId: string;
  invoiceId: string;
  invoiceNumber: string;
  issuedAt: Date;
  mode: "MOCK";
  provider: "MOCK";
  status: "ISSUED";
};

export interface InvoiceProviderAdapter {
  createInvoice(input: CreateInvoiceInput): Promise<InvoiceProviderResult>;
  getInvoiceStatus(invoiceId: string): Promise<string>;
  cancelInvoice?(invoiceId: string): Promise<string>;
  getInvoicePdf?(invoiceId: string): Promise<Uint8Array | null>;
  handleWebhookEvent?(event: unknown): Promise<void>;
}
