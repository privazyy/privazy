import "server-only";

import PizZip from "pizzip";

import { renderDocxTemplate } from "@/server/documents/docx";

export type DocumentRenderFormat = "DOCX" | "PDF" | "HTML" | "ZIP";

export interface DocumentRenderer {
  readonly format: DocumentRenderFormat;
  render(input: { templateBuffer?: Buffer; variables: Record<string, string> }): Promise<{
    body: Buffer | string;
    contentType: string;
    extension: string;
  }>;
}

export class DocxRenderer implements DocumentRenderer {
  readonly format = "DOCX" as const;

  async render(input: { templateBuffer?: Buffer; variables: Record<string, string> }) {
    const body = input.templateBuffer
      ? renderDocxTemplate(input.templateBuffer, input.variables)
      : renderPrivacyPolicySampleDocx(input.variables);

    return {
      body,
      contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      extension: "docx",
    };
  }
}

export class HtmlRenderer implements DocumentRenderer {
  readonly format = "HTML" as const;

  async render(input: { variables: Record<string, string> }) {
    const rows = Object.entries(input.variables)
      .map(([key, value]) => `<h2>${escapeHtml(key)}</h2><p>${escapeHtml(value).replace(/\n/g, "<br />")}</p>`)
      .join("");

    return {
      body: `<!doctype html><html lang="pl"><head><meta charset="utf-8" /><title>Preview dokumentu</title></head><body>${rows}</body></html>`,
      contentType: "text/html; charset=utf-8",
      extension: "html",
    };
  }
}

export class NotConfiguredPdfRenderer implements DocumentRenderer {
  readonly format = "PDF" as const;

  async render(): Promise<{ body: Buffer; contentType: string; extension: string }> {
    throw new Error("PDF renderer is not configured. Add a reviewed conversion worker before enabling PDF output.");
  }
}

export class ZipRenderer implements DocumentRenderer {
  readonly format = "ZIP" as const;

  async render(): Promise<{ body: Buffer; contentType: string; extension: string }> {
    throw new Error("ZIP renderer is a foundation placeholder for document bundles.");
  }
}

function renderPrivacyPolicySampleDocx(variables: Record<string, string>) {
  const zip = new PizZip();
  const paragraphs = [
    "Polityka prywatnosci RODO - szablon development/sample",
    "",
    "Administrator",
    variables.controller_name,
    variables.controller_legal_form,
    variables.controller_tax_id,
    variables.controller_address,
    variables.controller_contact_email,
    "",
    "Kontakt RODO",
    variables.dpo_status,
    variables.dpo_contact,
    "",
    "Charakter serwisu",
    variables.website_types,
    "",
    "Kategorie osob",
    variables.data_subjects,
    "",
    "Cele przetwarzania",
    variables.processing_purposes,
    "",
    "Podstawy prawne",
    variables.legal_bases,
    "",
    "Odbiorcy i narzedzia",
    variables.recipients,
    "",
    "Transfery poza EOG",
    variables.transfers_status,
    variables.transfers_details,
    "",
    "Okresy przechowywania",
    variables.retention_periods,
    "",
    "Prawa osob",
    `Kontakt: ${variables.rights_contact}`,
    `Kanal: ${variables.rights_channel}`,
    "",
    "Cookies i analityka",
    variables.cookies_status,
    variables.cookies_details,
    "",
    "Dodatkowe postanowienia",
    variables.additional_text,
    `Data wejscia w zycie: ${variables.effective_date}`,
    "",
    variables.legal_disclaimer,
  ];

  zip.file("[Content_Types].xml", contentTypesXml());
  zip.folder("_rels")?.file(".rels", relsXml());
  zip.folder("word")?.file("document.xml", documentXml(paragraphs));

  return zip.generate({ type: "nodebuffer", compression: "DEFLATE" }) as Buffer;
}

function documentXml(paragraphs: string[]) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paragraphs.map((paragraph) => `<w:p><w:r><w:t xml:space="preserve">${escapeXml(paragraph)}</w:t></w:r></w:p>`).join("\n")}
    <w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>
  </w:body>
</w:document>`;
}

function contentTypesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;
}

function relsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
}

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeHtml(value: string) {
  return escapeXml(value).replace(/"/g, "&quot;");
}
