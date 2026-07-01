import "server-only";

export type InvoiceProviderIssueInput = {
  orderId: string;
};

export type InvoiceProviderIssueResult = {
  invoiceId: string;
  invoiceNumber: string;
  status: "DRAFT" | "ISSUED";
};

export interface InvoiceProviderClient {
  issueInvoice(input: InvoiceProviderIssueInput): Promise<InvoiceProviderIssueResult>;
}
