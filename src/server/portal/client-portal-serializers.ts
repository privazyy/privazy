import "server-only";

import type { Prisma } from "@prisma/client";

export const portalOrderListInclude = {
  _count: { select: { items: true } },
} satisfies Prisma.PortalOrderInclude;

export const portalOrderDetailInclude = {
  items: {
    include: {
      documentInput: { select: { id: true, status: true, updatedAt: true } },
      generatedDocument: { select: { id: true, status: true, type: true, updatedAt: true, docxFileKey: true, pdfFileKey: true, zipFileKey: true } },
      template: { select: { id: true, name: true, type: true, version: true } },
    },
    orderBy: { createdAt: "asc" as const },
  },
  organization: { select: { id: true, name: true } },
} satisfies Prisma.PortalOrderInclude;

export const portalDocumentInputInclude = {
  orderItem: {
    select: {
      id: true,
      name: true,
      fulfillmentStatus: true,
      order: { select: { id: true, orderNumber: true, paymentStatus: true, createdAt: true } },
    },
  },
  template: { select: { id: true, name: true, type: true, version: true } },
} satisfies Prisma.PortalDocumentInputInclude;

export const portalGeneratedDocumentInclude = {
  template: { select: { id: true, name: true, type: true, version: true } },
  portalOrderItems: {
    select: {
      id: true,
      name: true,
      order: { select: { id: true, orderNumber: true } },
    },
    take: 1,
  },
} satisfies Prisma.GeneratedDocumentInclude;

export const portalOrganizationInclude = {
  contactPersons: {
    select: { id: true, fullName: true, email: true, phone: true, role: true, isPrimary: true },
    orderBy: [{ isPrimary: "desc" as const }, { createdAt: "asc" as const }],
  },
} satisfies Prisma.OrganizationInclude;

type PortalOrderListRecord = Prisma.PortalOrderGetPayload<{ include: typeof portalOrderListInclude }>;
type PortalOrderDetailRecord = Prisma.PortalOrderGetPayload<{ include: typeof portalOrderDetailInclude }>;
type PortalDocumentInputRecord = Prisma.PortalDocumentInputGetPayload<{ include: typeof portalDocumentInputInclude }>;
type PortalGeneratedDocumentRecord = Prisma.GeneratedDocumentGetPayload<{ include: typeof portalGeneratedDocumentInclude }>;
type PortalOrganizationRecord = Prisma.OrganizationGetPayload<{ include: typeof portalOrganizationInclude }>;

export function serializePortalOrderListItem(order: PortalOrderListRecord) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    invoiceStatus: order.invoiceStatus,
    currency: order.currency,
    totalGrossCents: order.totalGrossCents,
    itemsCount: order._count.items,
    paidAt: order.paidAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

export function serializePortalOrderDetail(order: PortalOrderDetailRecord) {
  return {
    ...serializePortalOrderListItem({ ...order, _count: { items: order.items.length } }),
    organization: order.organization,
    items: order.items.map((item) => ({
      id: item.id,
      name: item.name,
      documentType: item.documentType,
      quantity: item.quantity,
      totalGrossCents: item.totalGrossCents,
      fulfillmentStatus: item.fulfillmentStatus,
      template: item.template,
      documentInput: item.documentInput,
      generatedDocument: item.generatedDocument
        ? {
            id: item.generatedDocument.id,
            type: item.generatedDocument.type,
            status: item.generatedDocument.status,
            updatedAt: item.generatedDocument.updatedAt,
            downloads: {
              docx: Boolean(item.generatedDocument.docxFileKey),
              pdf: Boolean(item.generatedDocument.pdfFileKey),
              zip: Boolean(item.generatedDocument.zipFileKey),
            },
          }
        : null,
    })),
  };
}

export function serializePortalDocumentInput(input: PortalDocumentInputRecord) {
  return {
    id: input.id,
    status: input.status,
    documentType: input.documentType,
    validationSummary: input.validationSummary,
    submittedAt: input.submittedAt,
    lockedAt: input.lockedAt,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
    orderItem: input.orderItem,
    template: input.template,
  };
}

export function serializePortalGeneratedDocument(document: PortalGeneratedDocumentRecord) {
  const orderItem = document.portalOrderItems[0] ?? null;
  return {
    id: document.id,
    type: document.type,
    status: document.status,
    templateVersion: document.templateVersion,
    template: document.template,
    orderItem,
    downloads: {
      docx: Boolean(document.docxFileKey),
      pdf: Boolean(document.pdfFileKey),
      zip: Boolean(document.zipFileKey),
    },
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function serializePortalOrganization(organization: PortalOrganizationRecord) {
  return {
    id: organization.id,
    name: organization.name,
    legalName: organization.legalName,
    nip: organization.nip,
    regon: organization.regon,
    website: organization.website,
    email: organization.email,
    phone: organization.phone,
    addressLine1: organization.addressLine1,
    addressLine2: organization.addressLine2,
    postalCode: organization.postalCode,
    city: organization.city,
    country: organization.country,
    industry: organization.industry,
    size: organization.size,
    status: organization.status,
    contactPersons: organization.contactPersons,
    updatedAt: organization.updatedAt,
  };
}
