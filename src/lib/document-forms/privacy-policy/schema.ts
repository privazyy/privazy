import { z } from "zod";

const optionalText = z.string().trim().max(2000).optional().default("");
const requiredText = z.string().trim().min(1, "To pole jest wymagane.").max(2000);
const emailText = z.string().trim().email("Podaj poprawny adres e-mail.").max(320);
const yesNo = z.boolean().default(false);

export const websiteTypes = [
  "company_site",
  "online_store",
  "saas_app",
  "blog_content",
  "contact_form",
  "newsletter",
  "user_account",
  "payments",
  "recruitment",
  "other",
] as const;

export const dataSubjectCategories = [
  "website_users",
  "customers",
  "prospects",
  "newsletter_subscribers",
  "job_candidates",
  "contractors",
  "account_users",
] as const;

export const processingPurposes = [
  "contact_form",
  "orders",
  "account",
  "newsletter",
  "own_marketing",
  "analytics",
  "complaints",
  "tax_accounting",
  "claims",
  "recruitment",
] as const;

export const legalBases = [
  "contract",
  "legal_obligation",
  "legitimate_interest",
  "consent",
  "pre_contract",
] as const;

export const recipientTools = [
  "hosting",
  "email",
  "payments",
  "accounting",
  "crm",
  "analytics",
  "marketing",
  "forms",
  "it_providers",
] as const;

export const preferredContactChannels = ["email", "form", "postal", "phone"] as const;

export const privacyPolicyFormSchema = z.object({
  controller: z.object({
    name: requiredText,
    legalForm: requiredText,
    taxId: optionalText,
    address: requiredText,
    contactEmail: emailText,
    phone: optionalText,
  }),
  dpo: z.object({
    hasDpo: yesNo,
    dpoDetails: optionalText,
    contactPoint: optionalText,
  }),
  website: z.object({
    types: z.array(z.enum(websiteTypes)).min(1, "Wybierz co najmniej jeden typ strony lub aplikacji."),
    otherDescription: optionalText,
  }),
  dataSubjects: z.array(z.enum(dataSubjectCategories)).min(1, "Wybierz co najmniej jedna kategorie osob."),
  purposes: z.array(z.enum(processingPurposes)).min(1, "Wybierz co najmniej jeden cel przetwarzania."),
  legalBases: z.array(z.enum(legalBases)).min(1, "Wybierz co najmniej jedna podstawe prawna."),
  recipients: z.object({
    tools: z.array(z.enum(recipientTools)).default([]),
    additionalRecipients: optionalText,
  }),
  transfers: z.object({
    outsideEea: yesNo,
    providers: optionalText,
    basis: optionalText,
    description: optionalText,
  }),
  retention: z.object({
    contact: optionalText,
    orders: optionalText,
    invoices: optionalText,
    newsletter: optionalText,
    account: optionalText,
    claims: optionalText,
    recruitment: optionalText,
  }),
  rights: z.object({
    requestEmail: emailText,
    preferredChannel: z.enum(preferredContactChannels),
  }),
  cookies: z.object({
    usesCookies: yesNo,
    analytics: yesNo,
    marketing: yesNo,
    consentManagement: yesNo,
    cookiePolicyUrl: optionalText,
  }),
  additional: z.object({
    customText: optionalText,
    effectiveDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Podaj date w formacie RRRR-MM-DD."),
  }),
});

export type PrivacyPolicyFormData = z.infer<typeof privacyPolicyFormSchema>;

export const privacyPolicyDraftSchema = z.record(z.string(), z.unknown());

export function getDefaultPrivacyPolicyFormData(): PrivacyPolicyFormData {
  return {
    controller: {
      name: "",
      legalForm: "",
      taxId: "",
      address: "",
      contactEmail: "",
      phone: "",
    },
    dpo: {
      hasDpo: false,
      dpoDetails: "",
      contactPoint: "",
    },
    website: {
      types: [],
      otherDescription: "",
    },
    dataSubjects: [],
    purposes: [],
    legalBases: [],
    recipients: {
      tools: [],
      additionalRecipients: "",
    },
    transfers: {
      outsideEea: false,
      providers: "",
      basis: "",
      description: "",
    },
    retention: {
      contact: "",
      orders: "",
      invoices: "",
      newsletter: "",
      account: "",
      claims: "",
      recruitment: "",
    },
    rights: {
      requestEmail: "",
      preferredChannel: "email",
    },
    cookies: {
      usesCookies: true,
      analytics: false,
      marketing: false,
      consentManagement: false,
      cookiePolicyUrl: "",
    },
    additional: {
      customText: "",
      effectiveDate: new Date().toISOString().slice(0, 10),
    },
  };
}
