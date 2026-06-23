import "server-only";

export interface DocumentPdfConverter {
  convertDocxToPdf(input: { docxFileKey: string; outputFileKey: string }): Promise<{
    pdfFileKey: string;
  }>;
}

export class NotConfiguredPdfConverter implements DocumentPdfConverter {
  async convertDocxToPdf(): Promise<{ pdfFileKey: string }> {
    throw new Error("PDF conversion is not configured yet. Plug in LibreOffice worker or conversion API.");
  }
}
