import { privacyPolicyLabels } from "@/lib/document-forms/privacy-policy/labels";
import type {
  dataSubjectCategories,
  legalBases,
  preferredContactChannels,
  PrivacyPolicyFormData,
  processingPurposes,
  recipientTools,
  websiteTypes,
} from "@/lib/document-forms/privacy-policy/schema";

type WebsiteType = (typeof websiteTypes)[number];
type DataSubjectCategory = (typeof dataSubjectCategories)[number];
type ProcessingPurpose = (typeof processingPurposes)[number];
type LegalBasis = (typeof legalBases)[number];
type RecipientTool = (typeof recipientTools)[number];
type PreferredContactChannel = (typeof preferredContactChannels)[number];

export type PrivacyPolicyTemplateVariables = {
  controller_name: string;
  controller_legal_form: string;
  controller_tax_id: string;
  controller_address: string;
  controller_contact_email: string;
  controller_phone: string;
  dpo_status: string;
  dpo_contact: string;
  website_types: string;
  data_subjects: string;
  processing_purposes: string;
  legal_bases: string;
  recipients: string;
  transfers_status: string;
  transfers_details: string;
  retention_periods: string;
  rights_contact: string;
  rights_channel: string;
  cookies_status: string;
  cookies_details: string;
  additional_text: string;
  effective_date: string;
  legal_disclaimer: string;
};

const empty = "nie wskazano";

export const privacyPolicyLegalDisclaimer =
  "Dokument jest generowany na podstawie danych podanych przez klienta i wymaga weryfikacji przed uzyciem w szczegolnych przypadkach. Generator nie stanowi indywidualnej porady prawnej ani obietnicy pelnej zgodnosci z RODO.";

export function mapPrivacyPolicyInputToTemplate(data: PrivacyPolicyFormData): PrivacyPolicyTemplateVariables {
  return {
    controller_name: text(data.controller.name),
    controller_legal_form: text(data.controller.legalForm),
    controller_tax_id: text(data.controller.taxId),
    controller_address: text(data.controller.address),
    controller_contact_email: text(data.controller.contactEmail),
    controller_phone: text(data.controller.phone),
    dpo_status: data.dpo.hasDpo ? "Wyznaczono inspektora ochrony danych." : "Nie wskazano wyznaczonego IOD.",
    dpo_contact: data.dpo.hasDpo ? text(data.dpo.dpoDetails) : text(data.dpo.contactPoint),
    website_types: list(data.website.types.map((item) => privacyPolicyLabels.websiteTypes[item as WebsiteType]), data.website.otherDescription),
    data_subjects: list(data.dataSubjects.map((item) => privacyPolicyLabels.dataSubjectCategories[item as DataSubjectCategory])),
    processing_purposes: list(data.purposes.map((item) => privacyPolicyLabels.processingPurposes[item as ProcessingPurpose])),
    legal_bases: list(data.legalBases.map((item) => privacyPolicyLabels.legalBases[item as LegalBasis])),
    recipients: list(
      data.recipients.tools.map((item) => privacyPolicyLabels.recipientTools[item as RecipientTool]),
      data.recipients.additionalRecipients,
    ),
    transfers_status: data.transfers.outsideEea ? "Moga wystepowac transfery poza EOG." : "Nie wskazano transferow poza EOG.",
    transfers_details: list([data.transfers.providers, data.transfers.basis, data.transfers.description]),
    retention_periods: retention(data),
    rights_contact: text(data.rights.requestEmail),
    rights_channel: privacyPolicyLabels.preferredContactChannels[data.rights.preferredChannel as PreferredContactChannel],
    cookies_status: data.cookies.usesCookies ? "Serwis wykorzystuje cookies lub podobne technologie." : "Nie wskazano wykorzystywania cookies.",
    cookies_details: list([
      data.cookies.analytics ? "analityka" : "",
      data.cookies.marketing ? "marketing" : "",
      data.cookies.consentManagement ? "consent management" : "",
      data.cookies.cookiePolicyUrl,
    ]),
    additional_text: text(data.additional.customText),
    effective_date: formatDate(data.additional.effectiveDate),
    legal_disclaimer: privacyPolicyLegalDisclaimer,
  };
}

function text(value: string | undefined) {
  return value?.trim() || empty;
}

function list(values: Array<string | undefined>, extra?: string) {
  const normalized = [...values, extra]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));

  if (!normalized.length) return empty;

  return normalized.map((value) => `- ${value}`).join("\n");
}

function retention(data: PrivacyPolicyFormData) {
  const rows = [
    ["kontakt", data.retention.contact],
    ["zamowienia", data.retention.orders],
    ["faktury", data.retention.invoices],
    ["newsletter", data.retention.newsletter],
    ["konto", data.retention.account],
    ["roszczenia", data.retention.claims],
    ["rekrutacja", data.retention.recruitment],
  ];

  return list(rows.map(([label, value]) => (value ? `${label}: ${value}` : "")));
}

function formatDate(value: string) {
  if (!value) return empty;
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}.${month}.${year}`;
}
