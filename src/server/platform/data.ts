import "server-only";

import type {
  BreachIncidentStatus,
  BreachRiskLevel,
  ClientMessageThreadStatus,
  ClientTimelineEventType,
  CrmPriority,
  CrmTaskStatus,
  DataSubjectRequestStatus,
  DataSubjectRequestType,
  DocumentType,
  FormSubmissionStatus,
  GeneratedDocumentStatus,
  OrderItemStatus,
  OrderStatus,
  PaymentStatus,
} from "@prisma/client";

import { formatMoney } from "@/lib/shop/money";
import { getPrisma } from "@/server/db/prisma";

export type PlatformTone = "brand" | "danger" | "neutral" | "outline" | "success" | "warning";

export type DownloadFormat = {
  available: boolean;
  href: string;
  label: string;
};

const documentTypeLabels: Record<DocumentType, string> = {
  AUTHORIZATION_TEMPLATE: "Upowaznienie do przetwarzania danych",
  CLEAN_DESK_POLICY: "Polityka czystego biurka",
  COOKIE_POLICY: "Polityka cookies",
  DATA_BREACH_PROCEDURE: "Procedura naruszen",
  DATA_SUBJECT_REQUEST_PROCEDURE: "Procedura zadan osob",
  DPIA: "DPIA",
  IT_SECURITY_INSTRUCTION: "Instrukcja bezpieczenstwa IT",
  PRIVACY_POLICY: "Polityka prywatnosci",
  PROCESSING_AGREEMENT: "Umowa powierzenia",
  PROCESSING_REGISTER: "Rejestr czynnosci",
  RODO_POLICY: "Polityka RODO",
  TRAINING_MATERIAL: "Material szkoleniowy",
};

const generatedDocumentStatusLabels: Record<GeneratedDocumentStatus, string> = {
  ARCHIVED: "Archiwum",
  DELIVERED: "Dostarczony",
  DRAFT: "Szkic",
  GENERATED: "Wygenerowany",
};

const orderStatusLabels: Record<OrderStatus, string> = {
  CANCELLED: "Anulowane",
  COMPLETED: "Zakonczone",
  FULFILLING: "W realizacji",
  PAID: "Oplacone",
  PAYMENT_FAILED: "Platnosc nieudana",
  PENDING_PAYMENT: "Czeka na platnosc",
  REFUNDED: "Zwrocone",
};

const orderItemStatusLabels: Record<OrderItemStatus, string> = {
  CANCELLED: "Anulowane",
  FULFILLED: "Wydane",
  IN_PROGRESS: "W opracowaniu",
  INPUT_REQUIRED: "Czeka na dane",
  PENDING_PAYMENT: "Czeka na platnosc",
  READY: "Gotowe",
  REFUNDED: "Zwrocone",
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  CANCELLED: "Anulowana",
  FAILED: "Nieudana",
  PAID: "Oplacona",
  PENDING: "Oczekuje",
  PROCESSING: "Przetwarzana",
  REFUNDED: "Zwrocona",
};

const formStatusLabels: Record<FormSubmissionStatus, string> = {
  COMPLETED: "Zakonczony",
  DRAFT: "Szkic",
  FAILED: "Blad",
  PROCESSING: "Przetwarzany",
  SUBMITTED: "Wyslany",
};

const breachStatusLabels: Record<BreachIncidentStatus, string> = {
  ARCHIVED: "Archiwum",
  CLOSED: "Zamkniete",
  INVESTIGATING: "Analiza",
  NEW: "Nowe",
  NOTIFICATION_REQUIRED: "Wymaga zgloszenia",
  NOTIFIED_AUTHORITY: "Zgloszone do organu",
  NOTIFIED_DATA_SUBJECTS: "Zawiadomiono osoby",
  RISK_ASSESSMENT: "Ocena ryzyka",
  TRIAGE: "Triage",
};

const breachRiskLabels: Record<BreachRiskLevel, string> = {
  CRITICAL: "Krytyczne",
  HIGH: "Wysokie",
  LOW: "Niskie",
  MEDIUM: "Srednie",
};

const requestTypeLabels: Record<DataSubjectRequestType, string> = {
  ACCESS: "Dostep",
  CONSENT_WITHDRAWAL: "Cofniecie zgody",
  ERASURE: "Usuniecie",
  OBJECTION: "Sprzeciw",
  OTHER: "Inne",
  PORTABILITY: "Przeniesienie",
  RECTIFICATION: "Sprostowanie",
  RESTRICTION: "Ograniczenie",
};

const requestStatusLabels: Record<DataSubjectRequestStatus, string> = {
  ARCHIVED: "Archiwum",
  CLOSED: "Zamkniete",
  IDENTITY_VERIFICATION: "Weryfikacja tozsamosci",
  IN_PROGRESS: "W trakcie",
  NEW: "Nowe",
  READY_FOR_REVIEW: "Do sprawdzenia",
  RESPONDED: "Odpowiedz wyslana",
  WAITING_FOR_CLIENT: "Czeka na klienta",
};

const taskStatusLabels: Record<CrmTaskStatus, string> = {
  BLOCKED: "Zablokowane",
  CANCELLED: "Anulowane",
  DONE: "Zrobione",
  IN_PROGRESS: "W trakcie",
  OPEN: "Otwarte",
};

const priorityLabels: Record<CrmPriority, string> = {
  CRITICAL: "Krytyczny",
  HIGH: "Wysoki",
  LOW: "Niski",
  MEDIUM: "Sredni",
};

const threadStatusLabels: Record<ClientMessageThreadStatus, string> = {
  CLOSED: "Zamkniety",
  OPEN: "Otwarty",
};

const timelineTypeLabels: Record<ClientTimelineEventType, string> = {
  BREACH_CREATED: "Naruszenie",
  DOCUMENT_DOWNLOADED: "Dokument",
  DOCUMENT_FORM_SUBMITTED: "Formularz",
  MESSAGE_SENT: "Wiadomosc",
  ORGANIZATION_UPDATED: "Organizacja",
  REQUEST_CREATED: "Zadanie osoby",
  SYSTEM: "System",
  TASK_COMPLETED: "Zadanie",
};

const activeTaskStatuses: CrmTaskStatus[] = ["OPEN", "IN_PROGRESS", "BLOCKED"];
const activeBreachStatuses: BreachIncidentStatus[] = [
  "NEW",
  "TRIAGE",
  "RISK_ASSESSMENT",
  "INVESTIGATING",
  "NOTIFICATION_REQUIRED",
  "NOTIFIED_AUTHORITY",
  "NOTIFIED_DATA_SUBJECTS",
];
const activeRequestStatuses: DataSubjectRequestStatus[] = [
  "NEW",
  "IDENTITY_VERIFICATION",
  "IN_PROGRESS",
  "WAITING_FOR_CLIENT",
  "READY_FOR_REVIEW",
];

export function formatDate(value?: Date | null) {
  if (!value) return "Brak terminu";
  return new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" }).format(value);
}

export function formatDateTime(value?: Date | null) {
  if (!value) return "Brak daty";
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

export function formatCurrency(cents: number, currency = "PLN") {
  return formatMoney(cents, currency);
}

export function documentTypeLabel(type: DocumentType) {
  return documentTypeLabels[type];
}

export function statusLabel(status: string) {
  return (
    generatedDocumentStatusLabels[status as GeneratedDocumentStatus] ??
    orderStatusLabels[status as OrderStatus] ??
    orderItemStatusLabels[status as OrderItemStatus] ??
    paymentStatusLabels[status as PaymentStatus] ??
    formStatusLabels[status as FormSubmissionStatus] ??
    breachStatusLabels[status as BreachIncidentStatus] ??
    requestStatusLabels[status as DataSubjectRequestStatus] ??
    taskStatusLabels[status as CrmTaskStatus] ??
    threadStatusLabels[status as ClientMessageThreadStatus] ??
    status
  );
}

export function riskLabel(risk: BreachRiskLevel) {
  return breachRiskLabels[risk];
}

export function requestTypeLabel(type: DataSubjectRequestType) {
  return requestTypeLabels[type];
}

export function priorityLabel(priority: CrmPriority) {
  return priorityLabels[priority];
}

export function timelineTypeLabel(type: ClientTimelineEventType) {
  return timelineTypeLabels[type];
}

export function toneForStatus(status: string): PlatformTone {
  if (["DELIVERED", "GENERATED", "PAID", "COMPLETED", "FULFILLED", "DONE", "RESPONDED", "CLOSED"].includes(status)) {
    return "success";
  }

  if (["FAILED", "PAYMENT_FAILED", "CANCELLED", "CRITICAL", "NOTIFICATION_REQUIRED", "BLOCKED"].includes(status)) {
    return "danger";
  }

  if (["PENDING", "PENDING_PAYMENT", "INPUT_REQUIRED", "WAITING_FOR_CLIENT", "IDENTITY_VERIFICATION", "HIGH"].includes(status)) {
    return "warning";
  }

  if (["OPEN", "NEW", "IN_PROGRESS", "TRIAGE", "RISK_ASSESSMENT", "INVESTIGATING"].includes(status)) {
    return "brand";
  }

  return "neutral";
}

export function toneForDate(value?: Date | null): PlatformTone {
  if (!value) return "neutral";

  const now = Date.now();
  const diff = value.getTime() - now;
  if (diff < 0) return "danger";
  if (diff < 3 * 86_400_000) return "warning";
  return "success";
}

function downloadFormats(document: { docxFileKey: string | null; id: string; pdfFileKey: string | null; zipFileKey: string | null }) {
  return [
    { available: Boolean(document.docxFileKey), href: `/api/platforma/dokumenty/${document.id}/download?format=docx`, label: "DOCX" },
    { available: Boolean(document.pdfFileKey), href: `/api/platforma/dokumenty/${document.id}/download?format=pdf`, label: "PDF" },
    { available: Boolean(document.zipFileKey), href: `/api/platforma/dokumenty/${document.id}/download?format=zip`, label: "ZIP" },
  ] satisfies DownloadFormat[];
}

export async function getClientPortalDashboard(organizationId: string) {
  const prisma = getPrisma();
  const now = new Date();
  const soon = new Date(now.getTime() + 7 * 86_400_000);

  const [
    documentsCount,
    pendingInputCount,
    activeBreachesCount,
    activeRequestsCount,
    openMessagesCount,
    openTasksCount,
    latestDocuments,
    urgentTasks,
    latestBreaches,
    latestRequests,
    timeline,
  ] = await Promise.all([
    prisma.generatedDocument.count({ where: { organizationId } }),
    prisma.orderItem.count({
      where: {
        order: { organizationId },
        status: { in: ["INPUT_REQUIRED", "IN_PROGRESS"] },
      },
    }),
    prisma.breachIncident.count({ where: { organizationId, status: { in: activeBreachStatuses } } }),
    prisma.dataSubjectRequest.count({ where: { organizationId, status: { in: activeRequestStatuses } } }),
    prisma.clientMessageThread.count({ where: { organizationId, status: "OPEN" } }),
    prisma.crmTask.count({ where: { organizationId, status: { in: activeTaskStatuses } } }),
    prisma.generatedDocument.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        createdAt: true,
        docxFileKey: true,
        id: true,
        pdfFileKey: true,
        status: true,
        template: { select: { name: true } },
        templateVersion: true,
        type: true,
        zipFileKey: true,
      },
      take: 4,
      where: { organizationId },
    }),
    prisma.crmTask.findMany({
      orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
      select: {
        description: true,
        dueAt: true,
        entityId: true,
        entityType: true,
        id: true,
        priority: true,
        status: true,
        title: true,
      },
      take: 6,
      where: {
        dueAt: { lte: soon },
        organizationId,
        status: { in: activeTaskStatuses },
      },
    }),
    prisma.breachIncident.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        authorityDueAt: true,
        createdAt: true,
        id: true,
        incidentNumber: true,
        riskLevel: true,
        status: true,
        title: true,
      },
      take: 4,
      where: { organizationId },
    }),
    prisma.dataSubjectRequest.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        dueAt: true,
        id: true,
        requestNumber: true,
        status: true,
        subjectName: true,
        type: true,
      },
      take: 4,
      where: { organizationId },
    }),
    prisma.clientTimelineEvent.findMany({
      include: { actor: { select: { email: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
      where: { organizationId },
    }),
  ]);

  return {
    latestBreaches,
    latestDocuments: latestDocuments.map((document) => ({
      ...document,
      downloads: downloadFormats(document),
      label: document.template?.name ?? documentTypeLabel(document.type),
    })),
    latestRequests,
    metrics: [
      { href: "/platforma/dokumenty", label: "Dokumenty", tone: "brand" as const, value: documentsCount },
      { href: "/platforma/dokumenty", label: "Formularze do uzupelnienia", tone: "warning" as const, value: pendingInputCount },
      { href: "/platforma/naruszenia", label: "Aktywne naruszenia", tone: activeBreachesCount > 0 ? "danger" as const : "success" as const, value: activeBreachesCount },
      { href: "/platforma/zadania-osob", label: "Aktywne zadania osob", tone: activeRequestsCount > 0 ? "warning" as const : "success" as const, value: activeRequestsCount },
      { href: "/platforma/wiadomosci", label: "Otwarte watki", tone: openMessagesCount > 0 ? "brand" as const : "neutral" as const, value: openMessagesCount },
      { href: "/platforma/zadania", label: "Zadania do domkniecia", tone: openTasksCount > 0 ? "warning" as const : "success" as const, value: openTasksCount },
    ],
    timeline,
    urgentTasks,
  };
}

export async function getClientDocuments(organizationId: string) {
  const prisma = getPrisma();
  const [documents, formItems] = await Promise.all([
    prisma.generatedDocument.findMany({
      include: {
        _count: { select: { downloads: true } },
        template: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      where: { organizationId },
    }),
    prisma.orderItem.findMany({
      include: {
        formSubmissions: {
          orderBy: { createdAt: "desc" },
          select: { createdAt: true, id: true, status: true },
          take: 1,
        },
        order: { select: { createdAt: true, id: true, orderNumber: true, status: true } },
      },
      orderBy: { updatedAt: "desc" },
      where: {
        order: { organizationId },
        status: { in: ["INPUT_REQUIRED", "IN_PROGRESS", "READY"] },
      },
    }),
  ]);

  return {
    documents: documents.map((document) => ({
      createdAt: document.createdAt,
      downloads: downloadFormats(document),
      downloadsCount: document._count.downloads,
      id: document.id,
      label: document.template?.name ?? documentTypeLabel(document.type),
      status: document.status,
      templateVersion: document.templateVersion,
      type: document.type,
      updatedAt: document.updatedAt,
    })),
    formItems: formItems.map((item) => ({
      id: item.id,
      latestSubmission: item.formSubmissions[0] ?? null,
      order: item.order,
      productName: item.productName,
      status: item.status,
      updatedAt: item.updatedAt,
    })),
  };
}

export async function getClientDocumentDetail(organizationId: string, id: string) {
  const document = await getPrisma().generatedDocument.findFirst({
    include: {
      _count: { select: { downloads: true } },
      downloads: {
        include: { user: { select: { email: true, name: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      generationJob: { select: { completedAt: true, createdAt: true, errorMessage: true, status: true } },
      template: { select: { name: true, type: true, version: true } },
    },
    where: { id, organizationId },
  });

  if (!document) return null;

  return {
    createdAt: document.createdAt,
    downloads: downloadFormats(document),
    downloadsCount: document._count.downloads,
    id: document.id,
    job: document.generationJob,
    label: document.template?.name ?? documentTypeLabel(document.type),
    recentDownloads: document.downloads,
    status: document.status,
    template: document.template,
    templateVersion: document.templateVersion,
    type: document.type,
    updatedAt: document.updatedAt,
  };
}

export async function getClientDocumentForm(organizationId: string, orderItemId: string) {
  return getPrisma().orderItem.findFirst({
    include: {
      formSubmissions: {
        orderBy: { createdAt: "desc" },
        select: { createdAt: true, data: true, id: true, status: true },
        take: 5,
      },
      order: { select: { createdAt: true, id: true, orderNumber: true, status: true } },
    },
    where: { id: orderItemId, order: { organizationId } },
  });
}

export async function getClientOrders(organizationId: string) {
  return getPrisma().order.findMany({
    include: {
      _count: { select: { invoices: true, items: true, payments: true } },
      items: { select: { id: true, productName: true, status: true, totalGrossCents: true } },
    },
    orderBy: { createdAt: "desc" },
    where: { organizationId },
  });
}

export async function getClientOrderDetail(organizationId: string, id: string) {
  return getPrisma().order.findFirst({
    include: {
      billingProfile: true,
      invoices: { orderBy: { createdAt: "desc" } },
      items: { orderBy: { createdAt: "asc" } },
      payments: { orderBy: { createdAt: "desc" } },
    },
    where: { id, organizationId },
  });
}

export async function getClientBreaches(organizationId: string) {
  return getPrisma().breachIncident.findMany({
    orderBy: { createdAt: "desc" },
    where: { organizationId },
  });
}

export async function getClientBreachDetail(organizationId: string, id: string) {
  return getPrisma().breachIncident.findFirst({
    include: {
      assignedTo: { select: { email: true, name: true } },
      createdBy: { select: { email: true, name: true } },
    },
    where: { id, organizationId },
  });
}

export async function getClientRequests(organizationId: string) {
  return getPrisma().dataSubjectRequest.findMany({
    orderBy: { createdAt: "desc" },
    where: { organizationId },
  });
}

export async function getClientRequestDetail(organizationId: string, id: string) {
  return getPrisma().dataSubjectRequest.findFirst({
    include: {
      assignedTo: { select: { email: true, name: true } },
      createdBy: { select: { email: true, name: true } },
    },
    where: { id, organizationId },
  });
}

export async function getClientMessages(organizationId: string) {
  return getPrisma().clientMessageThread.findMany({
    include: {
      createdBy: { select: { email: true, name: true } },
      messages: {
        include: { senderUser: { select: { email: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { lastMessageAt: "desc" },
    where: { organizationId },
  });
}

export async function getClientTasks(organizationId: string) {
  return getPrisma().crmTask.findMany({
    include: { owner: { select: { email: true, name: true } } },
    orderBy: [{ status: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }],
    where: { organizationId },
  });
}

export async function getClientTimeline(organizationId: string, take = 30) {
  return getPrisma().clientTimelineEvent.findMany({
    include: { actor: { select: { email: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take,
    where: { organizationId },
  });
}

export async function getClientOrganizationSettings(organizationId: string) {
  return getPrisma().organization.findUnique({
    include: {
      clientProfiles: {
        include: { user: { select: { email: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    where: { id: organizationId },
  });
}
