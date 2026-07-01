import "server-only";

import type {
  BreachIncidentStatus,
  BreachRiskLevel,
  CrmLeadStatus,
  CrmPriority,
  CrmTaskStatus,
  DataSubjectRequestStatus,
  DataSubjectRequestType,
  DocumentGenerationStatus,
  DocumentTemplateStatus,
  GeneratedDocumentStatus,
  InvoiceStatus,
  OrderItemStatus,
  OrderStatus,
  PaymentStatus,
  ProductStatus,
  ProductType,
  UserRole,
} from "@prisma/client";
import type { Prisma } from "@prisma/client";

import type {
  CrmActivityItem,
  CrmDatabaseData,
  CrmDashboardAlert,
  CrmListModule,
  CrmRoute,
  GenericModule,
  TableRow,
  Tone,
} from "@/components/crm/crm-data";
import { formatMoney } from "@/lib/shop/money";
import { getAllowedCrmRoutes, canMutateCrm, crmRoleLabel, type CrmActor } from "@/server/crm/permissions";
import { getPrisma } from "@/server/db/prisma";
import { listIodCrmLeads } from "@/server/leads/iod";

const defaultFilters = ["Wszystkie", "Aktywne", "Pilne", "Moje", "Do akceptacji"].map((label) => ({ label }));

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Admin",
  CLIENT: "Klient",
  LAWYER: "Prawnik",
  OPERATOR: "Operator",
  READ_ONLY: "Tylko odczyt",
};

const leadStatusLabels: Record<CrmLeadStatus, string> = {
  ARCHIVED: "Archiwum",
  CONTACTED: "Po kontakcie",
  CONTACT_REQUIRED: "Do kontaktu",
  LOST: "Przegrany",
  NEW: "Nowy",
  OFFER_SENT: "Oferta wyslana",
  QUALIFIED: "Zakwalifikowany",
  WON: "Wygrany",
};

const priorityLabels: Record<CrmPriority, string> = {
  CRITICAL: "Krytyczny",
  HIGH: "Wysoki",
  LOW: "Niski",
  MEDIUM: "Sredni",
};

const taskStatusLabels: Record<CrmTaskStatus, string> = {
  BLOCKED: "Zablokowane",
  CANCELLED: "Anulowane",
  DONE: "Zrobione",
  IN_PROGRESS: "W trakcie",
  OPEN: "Otwarte",
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

const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  CANCELLED: "Anulowana",
  DRAFT: "Szkic",
  FAILED: "Blad",
  ISSUED: "Wystawiona",
};

const productStatusLabels: Record<ProductStatus, string> = {
  ACTIVE: "Aktywny",
  ARCHIVED: "Archiwum",
  DRAFT: "Szkic",
};

const productTypeLabels: Record<ProductType, string> = {
  DOCUMENT: "Dokument",
  PACKAGE: "Pakiet",
  SERVICE: "Usluga",
  SUBSCRIPTION: "Abonament",
  TEMPLATE: "Szablon",
};

const templateStatusLabels: Record<DocumentTemplateStatus, string> = {
  ACTIVE: "Aktywny",
  ARCHIVED: "Archiwum",
  DRAFT: "Szkic",
};

const jobStatusLabels: Record<DocumentGenerationStatus, string> = {
  COMPLETED: "Zakonczony",
  FAILED: "Blad",
  PENDING: "Oczekuje",
  PROCESSING: "W trakcie",
};

const generatedStatusLabels: Record<GeneratedDocumentStatus, string> = {
  ARCHIVED: "Archiwum",
  DELIVERED: "Dostarczony",
  DRAFT: "Szkic",
  GENERATED: "Wygenerowany",
};

const breachStatusLabels: Record<BreachIncidentStatus, string> = {
  ARCHIVED: "Archiwum",
  CLOSED: "Zamkniete",
  INVESTIGATING: "Analiza",
  NEW: "Nowe",
  NOTIFICATION_REQUIRED: "Wymaga zgloszenia",
  NOTIFIED_AUTHORITY: "Zgloszone UODO",
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
  IDENTITY_VERIFICATION: "Weryfikacja",
  IN_PROGRESS: "W trakcie",
  NEW: "Nowe",
  READY_FOR_REVIEW: "Do review",
  RESPONDED: "Odpowiedz wyslana",
  WAITING_FOR_CLIENT: "Czeka na klienta",
};

export async function getCrmDatabaseData(actor: CrmActor): Promise<CrmDatabaseData> {
  const prisma = getPrisma();
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const nextSevenDays = new Date(now.getTime() + 7 * 86_400_000);
  const nextTwelveHours = new Date(now.getTime() + 12 * 60 * 60 * 1000);

  const [
    iodLeads,
    crmLeads,
    organizations,
    users,
    products,
    templates,
    orders,
    payments,
    invoices,
    jobs,
    generatedDocuments,
    formSubmissions,
    tasks,
    notes,
    activities,
    messages,
    calendarEvents,
    breaches,
    dataSubjectRequests,
    auditLogs,
    counts,
  ] = await Promise.all([
    listIodCrmLeads(100),
    prisma.crmLead.findMany({
      include: { formSubmission: true, organization: true, owner: true },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
    prisma.organization.findMany({
      include: {
        _count: {
          select: {
            auditLogs: true,
            billingProfiles: true,
            breachIncidents: true,
            clientProfiles: true,
            crmNotes: true,
            crmTasks: true,
            dataSubjectRequests: true,
            formSubmissions: true,
            generatedDocuments: true,
            generationJobs: true,
            orders: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
    prisma.user.findMany({
      include: {
        _count: {
          select: {
            assignedBreachIncidents: true,
            assignedCrmTasks: true,
            assignedDataSubjectRequests: true,
            ownedCrmLeads: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
    prisma.product.findMany({
      orderBy: [{ productType: "asc" }, { priceNetCents: "asc" }],
      take: 100,
    }),
    prisma.documentTemplate.findMany({
      include: { approvedBy: true, createdBy: true },
      orderBy: [{ status: "asc" }, { type: "asc" }, { version: "desc" }],
      take: 100,
    }),
    prisma.order.findMany({
      include: {
        invoices: { orderBy: { createdAt: "desc" } },
        items: { orderBy: { createdAt: "asc" } },
        organization: true,
        payments: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.payment.findMany({
      include: { order: { include: { organization: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.invoice.findMany({
      include: { order: true, organization: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.documentGenerationJob.findMany({
      include: { generatedDocument: true, organization: true, template: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.generatedDocument.findMany({
      include: { createdBy: true, organization: true, template: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.formSubmission.findMany({
      include: { createdBy: true, organization: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.crmTask.findMany({
      include: { createdBy: true, organization: true, owner: true },
      orderBy: [{ status: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }],
      take: 100,
    }),
    prisma.crmNote.findMany({
      include: { createdBy: true, organization: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.crmActivity.findMany({
      include: { actor: true, organization: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.crmMessage.findMany({
      include: { createdBy: true, organization: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.crmCalendarEvent.findMany({
      include: { organization: true, owner: true },
      orderBy: { startsAt: "asc" },
      take: 100,
    }),
    prisma.breachIncident.findMany({
      include: { assignedTo: true, organization: true },
      orderBy: [{ status: "asc" }, { authorityDueAt: "asc" }, { createdAt: "desc" }],
      take: 100,
    }),
    prisma.dataSubjectRequest.findMany({
      include: { assignedTo: true, organization: true },
      orderBy: [{ status: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }],
      take: 100,
    }),
    prisma.auditLog.findMany({
      include: { organization: true, user: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    getCounts(),
  ]);

  const inputRequiredOrders = orders.filter((order) => order.items.some((item) => item.status === "INPUT_REQUIRED")).length;
  const paidOrders = orders.filter((order) => order.status === "PAID").length;
  const pendingPaymentOrders = orders.filter((order) => order.status === "PENDING_PAYMENT" || order.status === "PAYMENT_FAILED").length;
  const activeJobs = jobs.filter((job) => job.status === "PENDING" || job.status === "PROCESSING").length;
  const failedJobs = jobs.filter((job) => job.status === "FAILED").length;
  const activeTemplates = templates.filter((template) => template.status === "ACTIVE").length;
  const documentsForReview = generatedDocuments.filter((document) => document.status === "GENERATED").length;
  const activeBreaches = breaches.filter((incident) => !["CLOSED", "ARCHIVED"].includes(incident.status)).length;
  const urgentBreaches = breaches.filter((incident) => incident.authorityDueAt && incident.authorityDueAt <= nextTwelveHours && !["CLOSED", "ARCHIVED"].includes(incident.status)).length;
  const activeRequests = dataSubjectRequests.filter((request) => !["CLOSED", "ARCHIVED"].includes(request.status)).length;
  const urgentRequests = dataSubjectRequests.filter((request) => request.dueAt <= nextSevenDays && !["CLOSED", "ARCHIVED"].includes(request.status)).length;
  const dueTodayTasks = tasks.filter((task) => task.dueAt && task.dueAt >= todayStart && task.dueAt <= todayEnd && task.status !== "DONE").length;
  const overdueTasks = tasks.filter((task) => task.dueAt && task.dueAt < now && task.status !== "DONE").length;
  const paidRevenueGross = orders.filter((order) => order.status === "PAID" || order.status === "COMPLETED").reduce((sum, order) => sum + order.totalGrossCents, 0);
  const paidRevenueNet = orders.filter((order) => order.status === "PAID" || order.status === "COMPLETED").reduce((sum, order) => sum + order.subtotalNetCents, 0);
  const hotLeads = crmLeads.filter((lead) => lead.priority === "HIGH" || lead.priority === "CRITICAL").length + iodLeads.filter((lead) => lead.hot).length;
  const leadPipelineCents =
    crmLeads.reduce((sum, lead) => sum + lead.valueCents, 0) +
    iodLeads.reduce((sum, lead) => sum + Math.round(lead.value * 100), 0);
  const wonLeads = crmLeads.filter((lead) => lead.status === "WON").length;
  const leadConversion = crmLeads.length > 0 ? Math.round((wonLeads / crmLeads.length) * 100) : 0;

  const leadRows = buildLeadRows(crmLeads, iodLeads);
  const clientRows = organizations.map<TableRow>((organization) => {
    const hasActivity =
      organization._count.formSubmissions +
        organization._count.generatedDocuments +
        organization._count.generationJobs +
        organization._count.orders +
        organization._count.crmTasks >
      0;
    const status = hasActivity ? "Aktywny" : "Bez aktywnosci";

    return {
      actionRoute: "client-detail",
      cells: [
        organization.nip ?? "-",
        organization.email ?? "-",
        organization.phone ?? "-",
        String(organization._count.orders),
        String(organization._count.generatedDocuments),
        String(organization._count.crmTasks),
        status,
        "",
      ],
      primary: organization.name,
      secondary: [organization.city, organization.country].filter(Boolean).join(", ") || organization.id,
      status: { label: status, tone: hasActivity ? "success" : "neutral" },
    };
  });

  const orderRows: TableRow[] = orders.map((order) => {
    const latestPayment = order.payments[0];
    const invoice = order.invoices[0];
    const status = orderStatusLabels[order.status];

    return {
      actionRoute: "client-detail",
      cells: [
        order.organization.name,
        status,
        latestPayment ? paymentStatusLabels[latestPayment.status] : "-",
        formatMoney(order.totalGrossCents, order.currency),
        `${order.items.length} / ${Array.from(new Set(order.items.map((item) => orderItemStatusLabels[item.status]))).join(", ")}`,
        invoice ? `${invoice.invoiceNumber} (${invoiceStatusLabels[invoice.status]})` : "-",
        formatDate(order.createdAt),
        "",
      ],
      primary: order.orderNumber,
      secondary: order.email,
      status: { label: status, tone: statusTone(status) },
      tag: latestPayment ? { label: paymentStatusLabels[latestPayment.status], tone: statusTone(paymentStatusLabels[latestPayment.status]) } : undefined,
    };
  });

  const documentRows: TableRow[] = generatedDocuments.map((document) => {
    const status = generatedStatusLabels[document.status];

    return {
      actionRoute: "doc-review",
      cells: [
        document.organization.name,
        document.type,
        status,
        `v${document.templateVersion}`,
        document.createdBy.name ?? document.createdBy.email,
        formatDate(document.createdAt),
        document.pdfFileKey ? "PDF + DOCX" : "DOCX",
        "",
      ],
      primary: document.template.name,
      secondary: document.id,
      status: { label: status, tone: statusTone(status) },
    };
  });

  const jobRows: TableRow[] = jobs.filter((job) => !job.generatedDocument || job.status !== "COMPLETED").map((job) => {
    const status = jobStatusLabels[job.status];

    return {
      actionRoute: "doc-review",
      cells: [
        job.organization.name,
        job.template.type,
        status,
        `v${job.template.version}`,
        "Generator",
        formatDate(job.createdAt),
        job.errorMessage ?? (job.completedAt ? formatDate(job.completedAt) : "W toku"),
        "",
      ],
      primary: job.id,
      secondary: job.template.name,
      status: { label: status, tone: statusTone(status) },
      tag: job.errorMessage ? { label: "Wymaga uwagi", tone: "danger" } : undefined,
    };
  });

  const productRows: TableRow[] = products.map((product) => {
    const status = productStatusLabels[product.status];

    return {
      actionRoute: "product-editor",
      cells: [
        productTypeLabels[product.productType],
        formatMoney(product.priceNetCents, product.currency),
        formatMoney(product.priceNetCents + Math.round((product.priceNetCents * product.vatRateBps) / 10_000), product.currency),
        status,
        product.expectedDelivery,
        formatDate(product.updatedAt),
        "",
      ],
      primary: product.name,
      secondary: product.slug,
      status: { label: status, tone: statusTone(status) },
    };
  });

  const packageRows = productRows.filter((row) => row.cells[0] === productTypeLabels.PACKAGE);

  const templateRows: TableRow[] = templates.map((template) => {
    const status = templateStatusLabels[template.status];

    return {
      actionRoute: "product-editor",
      cells: [
        "Szablon dokumentu",
        "-",
        "-",
        status,
        `v${template.version}`,
        formatDate(template.updatedAt),
        "",
      ],
      primary: template.name,
      secondary: template.fileKey,
      status: { label: status, tone: statusTone(status) },
    };
  });

  const breachRows: TableRow[] = breaches.map((incident) => {
    const status = breachStatusLabels[incident.status];
    const risk = breachRiskLabels[incident.riskLevel];

    return {
      actionRoute: "breach-detail",
      cells: [
        incident.organization.name,
        incident.assignedTo?.name ?? incident.assignedTo?.email ?? "-",
        status,
        risk,
        incident.authorityDueAt ? formatDateTime(incident.authorityDueAt) : "-",
        incident.closedAt ? formatDate(incident.closedAt) : "-",
        "",
      ],
      primary: incident.incidentNumber,
      secondary: incident.title,
      status: { label: status, tone: statusTone(status) },
      tag: { label: risk, tone: breachRiskTone(incident.riskLevel) },
    };
  });

  const requestRows: TableRow[] = dataSubjectRequests.map((request) => {
    const status = requestStatusLabels[request.status];

    return {
      actionRoute: "request-detail",
      cells: [
        request.organization.name,
        requestTypeLabels[request.type],
        request.subjectEmail ?? "-",
        request.channel,
        status,
        formatDate(request.dueAt),
        request.assignedTo?.name ?? request.assignedTo?.email ?? "-",
        "",
      ],
      primary: request.requestNumber,
      secondary: request.subjectName,
      status: { label: status, tone: statusTone(status) },
      tag: request.dueAt <= nextSevenDays && !["CLOSED", "ARCHIVED"].includes(request.status) ? { label: "Termin", tone: "warning" } : undefined,
    };
  });

  const taskRows: TableRow[] = tasks.map((task) => {
    const status = taskStatusLabels[task.status];

    return {
      cells: [
        status,
        priorityLabels[task.priority],
        task.owner?.name ?? task.owner?.email ?? "-",
        task.dueAt ? formatDateTime(task.dueAt) : "-",
        task.entityType ?? "-",
        task.organization?.name ?? "-",
        "",
      ],
      primary: task.title,
      secondary: task.description ?? task.id,
      status: { label: status, tone: statusTone(status) },
      tag: { label: priorityLabels[task.priority], tone: priorityTone(task.priority) },
    };
  });

  const messageRows: TableRow[] = messages.map((message) => ({
    cells: [
      message.organization?.name ?? "-",
      message.toEmail,
      message.status,
      message.sentAt ? formatDateTime(message.sentAt) : "-",
      message.entityType ?? "-",
      "",
    ],
    primary: message.subject,
    secondary: message.createdBy?.name ?? message.createdBy?.email ?? message.id,
    status: { label: message.status, tone: statusTone(message.status) },
  }));

  const calendarRows: TableRow[] = calendarEvents.map((event) => ({
    cells: [
      formatDateTime(event.startsAt),
      event.endsAt ? formatDateTime(event.endsAt) : "-",
      event.owner?.name ?? event.owner?.email ?? "-",
      event.organization?.name ?? "-",
      event.status,
      "",
    ],
    primary: event.title,
    secondary: event.description ?? event.id,
    status: { label: event.status, tone: statusTone(event.status) },
  }));

  const invoiceRows: TableRow[] = invoices.map((invoice) => {
    const status = invoiceStatusLabels[invoice.status];

    return {
      cells: [
        invoice.organization.name,
        invoice.order.orderNumber,
        formatMoney(invoice.subtotalNetCents, invoice.currency),
        formatMoney(invoice.vatCents, invoice.currency),
        formatMoney(invoice.totalGrossCents, invoice.currency),
        status,
        invoice.issuedAt ? formatDate(invoice.issuedAt) : "-",
        "",
      ],
      primary: invoice.invoiceNumber,
      secondary: invoice.externalUrl ?? invoice.id,
      status: { label: status, tone: statusTone(status) },
    };
  });

  const auditRows: TableRow[] = auditLogs.map((log) => ({
    cells: [
      log.entityType,
      log.entityId,
      log.user?.name ?? log.user?.email ?? "-",
      log.organization?.name ?? "-",
      log.ipAddress ?? "-",
      formatDateTime(log.createdAt),
      "",
    ],
    primary: log.action,
    secondary: log.id,
    status: { label: "Zapisany", tone: "success" },
  }));

  const userRows: TableRow[] = users.map((user) => {
    const role = roleLabels[user.role];

    return {
      cells: [
        user.email,
        role,
        String(user._count.assignedCrmTasks),
        String(user._count.ownedCrmLeads),
        String(user._count.assignedBreachIncidents + user._count.assignedDataSubjectRequests),
        formatDate(user.updatedAt),
        "",
      ],
      primary: user.name ?? user.email,
      secondary: user.id,
      status: { label: role, tone: user.role === "ADMIN" ? "danger" : "brand" },
    };
  });

  const activity: CrmActivityItem[] = [
    ...activities.slice(0, 5).map((activityItem) => ({
      icon: "Activity",
      subtitle: activityItem.description ?? `${activityItem.entityType ?? "CRM"} ${activityItem.entityId ?? ""}`.trim(),
      title: activityItem.action,
      tone: "brand" as Tone,
      when: formatDateTime(activityItem.createdAt),
    })),
    ...notes.slice(0, Math.max(0, 5 - activities.length)).map((note) => ({
      icon: "MessageSquareText",
      subtitle: note.organization?.name ?? `${note.entityType ?? "CRM"} ${note.entityId ?? ""}`.trim(),
      title: note.body.slice(0, 96),
      tone: "neutral" as Tone,
      when: formatDateTime(note.createdAt),
    })),
    ...auditLogs.slice(0, Math.max(0, 5 - activities.length - notes.length)).map((log) => ({
      icon: "ShieldHalf",
      subtitle: `${log.entityType} ${log.entityId}`,
      title: log.action,
      tone: "neutral" as Tone,
      when: formatDateTime(log.createdAt),
    })),
  ];

  const alerts = buildAlerts({
    activeJobs,
    failedJobs,
    hotLeads,
    pendingPaymentOrders,
    urgentBreaches,
    urgentRequests,
    overdueTasks,
  });

  const lists: CrmDatabaseData["lists"] = {
    accounting: {
      action: "Wystaw fakture",
      columns: ["Nr faktury", "Klient", "Zamowienie", "Netto", "VAT", "Brutto", "Status", "Wystawiono", ""],
      emptyMessage: "Brak faktur w bazie danych.",
      icon: "Wallet",
      kpis: [
        { icon: "Wallet", label: "Faktury", value: String(counts.invoices), tone: "brand" },
        { icon: "CreditCard", label: "Platnosci", value: String(counts.payments), tone: "neutral" },
        { icon: "BadgeCheck", label: "Oplacone", value: String(payments.filter((payment) => payment.status === "PAID").length), tone: "success" },
        { icon: "TriangleAlert", label: "Nieudane", value: String(payments.filter((payment) => payment.status === "FAILED").length), tone: "danger" },
      ],
      rows: invoiceRows,
      subtitle: "Faktury i platnosci z modeli Invoice oraz Payment.",
      title: "Ksiegowosc",
    },
    blog: emptyListModule({
      action: "Nowy artykul",
      columns: ["Artykul", "Status", "Autor", "SEO", "Ruch", "Leady", ""],
      icon: "Newspaper",
      title: "Baza wiedzy / Blog",
      subtitle: "Blog jest nadal zrodlem kodowym, bez tabeli CRM do edycji tresci.",
    }),
    breaches: {
      action: "Dodaj naruszenie",
      columns: ["Nr sprawy", "Klient", "Odpowiedzialny", "Status", "Ryzyko", "Termin 72h", "Zamknieto", ""],
      emptyMessage: "Brak naruszen w bazie danych.",
      icon: "TriangleAlert",
      kpis: [
        { icon: "TriangleAlert", label: "Aktywne", value: String(activeBreaches), tone: activeBreaches > 0 ? "danger" : "neutral" },
        { icon: "Timer", label: "Blisko 72h", value: String(urgentBreaches), tone: urgentBreaches > 0 ? "danger" : "neutral" },
        { icon: "ShieldCheck", label: "Zamkniete", value: String(breaches.filter((incident) => incident.status === "CLOSED").length), tone: "success" },
        { icon: "Activity", label: "Wszystkie", value: String(counts.breachIncidents), tone: "brand" },
      ],
      rows: breachRows,
      subtitle: "Naruszenia ochrony danych z terminem 72h i decyzjami notyfikacyjnymi.",
      title: "Naruszenia",
    },
    clients: {
      action: "Dodaj klienta",
      columns: ["Klient", "NIP", "E-mail", "Telefon", "Zamowienia", "Dokumenty", "Zadania", "Status", ""],
      emptyMessage: "Brak organizacji w bazie danych.",
      icon: "Building2",
      kpis: [
        { icon: "Building2", label: "Organizacje", value: String(counts.organizations), tone: "brand" },
        { icon: "UserPlus", label: "Profile klientow", value: String(counts.clientProfiles), tone: "neutral" },
        { icon: "ShoppingCart", label: "Zamowienia", value: String(counts.orders), tone: "brand" },
        { icon: "FileText", label: "Dokumenty", value: String(counts.generatedDocuments), tone: "success" },
      ],
      rows: clientRows,
      subtitle: "Organizacje, dane kontaktowe i powiazane rekordy z bazy.",
      title: "Klienci",
    },
    documents: {
      action: "Dodaj dokument",
      columns: ["Dokument", "Klient", "Typ", "Status", "Wersja", "Utworzyl", "Utworzono", "Plik", ""],
      emptyMessage: "Brak wygenerowanych dokumentow w bazie danych.",
      icon: "FileText",
      kpis: [
        { icon: "FileText", label: "Dokumenty", value: String(counts.generatedDocuments), tone: "brand" },
        { icon: "FileSearch", label: "Joby aktywne", value: String(activeJobs), tone: activeJobs > 0 ? "warning" : "neutral" },
        { icon: "TriangleAlert", label: "Joby failed", value: String(failedJobs), tone: failedJobs > 0 ? "danger" : "neutral" },
        { icon: "Package", label: "Szablony aktywne", value: String(activeTemplates), tone: "success" },
      ],
      rows: [...documentRows, ...jobRows],
      subtitle: "Wygenerowane dokumenty z GeneratedDocument oraz statusy generatorow.",
      title: "Dokumenty",
    },
    leads: {
      action: "Dodaj lead",
      columns: ["Firma / kontakt", "Zrodlo", "Branza", "Wynik", "Wartosc", "Status", "Priorytet", "Opiekun", "Nastepny kontakt", ""],
      emptyMessage: "Brak leadow w bazie danych.",
      icon: "UserPlus",
      kpis: [
        { icon: "UserPlus", label: "Leady", value: String(leadRows.length), tone: "brand" },
        { icon: "Flame", label: "Gorace", value: String(hotLeads), tone: hotLeads > 0 ? "danger" : "neutral" },
        { icon: "Wallet", label: "Pipeline", value: formatCompactMoney(leadPipelineCents), tone: leadPipelineCents > 0 ? "success" : "neutral" },
        { icon: "Target", label: "Konwersja", value: crmLeads.length > 0 ? `${leadConversion}%` : "-", tone: leadConversion > 0 ? "success" : "neutral" },
      ],
      rows: leadRows,
      subtitle: "Leady CRM oraz leady IOD z formularza checkera.",
      title: "Leady",
    },
    newsletter: emptyListModule({
      action: "Nowa kampania",
      columns: ["Lista / kampania", "Segment", "Status", "Odbiorcy", "Open rate", ""],
      icon: "Mail",
      title: "Newsletter",
      subtitle: "Brak tabel newslettera i kampanii w aktualnym schemacie.",
    }),
    outsourcing: emptyListModule({
      action: "Dodaj abonament",
      columns: ["Klient", "Pakiet", "Przypisany IOD", "Status", "SLA", "Incydenty", "Zadania", "Przeglad", "Oplata", ""],
      icon: "ShieldCheck",
      title: "Outsourcing IOD",
      subtitle: "Abonamenty IOD wymagaja osobnego modelu subskrypcji w kolejnej fazie.",
    }),
    platform: {
      action: "Podglad portalu",
      columns: ["Klient", "Profile", "Formularze", "Dokumenty", "Joby", "Audyt", "Status", "ID", ""],
      emptyMessage: "Brak organizacji do pokazania w platformie klienta.",
      icon: "MonitorSmartphone",
      kpis: [
        { icon: "MonitorSmartphone", label: "Konta organizacji", value: String(counts.organizations), tone: "brand" },
        { icon: "Users", label: "Profile klientow", value: String(counts.clientProfiles), tone: "neutral" },
        { icon: "FileText", label: "Dokumenty", value: String(counts.generatedDocuments), tone: "success" },
        { icon: "Activity", label: "Audyt", value: String(counts.auditLogs), tone: "neutral" },
      ],
      rows: organizations.map((organization) => {
        const hasActivity =
          organization._count.formSubmissions + organization._count.generatedDocuments + organization._count.generationJobs + organization._count.orders > 0;
        const status = hasActivity ? "Aktywna" : "Bez aktywnosci";

        return {
          cells: [
            String(organization._count.clientProfiles),
            String(organization._count.formSubmissions),
            String(organization._count.generatedDocuments),
            String(organization._count.generationJobs),
            String(organization._count.auditLogs),
            status,
            organization.id,
            "",
          ],
          primary: organization.name,
          secondary: organization.email ?? organization.nip ?? organization.id,
          status: { label: status, tone: hasActivity ? "success" : "neutral" },
        };
      }),
      subtitle: "Widok platformy klienta oparty o organizacje i powiazane rekordy.",
      title: "Platforma klienta",
    },
    products: {
      action: "Dodaj produkt",
      columns: ["Produkt", "Typ", "Netto", "Brutto", "Status", "Dostawa", "Aktualizacja", ""],
      emptyMessage: "Brak produktow w bazie danych.",
      icon: "Tag",
      kpis: [
        { icon: "Tag", label: "Produkty", value: String(counts.products), tone: "brand" },
        { icon: "BadgeCheck", label: "Aktywne", value: String(products.filter((product) => product.status === "ACTIVE").length), tone: "success" },
        { icon: "Package", label: "Pakiety", value: String(products.filter((product) => product.productType === "PACKAGE").length), tone: "brand" },
        { icon: "FileText", label: "Szablony", value: String(counts.templates), tone: "neutral" },
      ],
      rows: [...productRows, ...templateRows],
      subtitle: "Produkty sklepu z bazy, nie statyczny katalog UI.",
      title: "Produkty / sklep",
    },
    requests: {
      action: "Dodaj zadanie osoby",
      columns: ["Nr sprawy", "Klient", "Typ", "E-mail", "Kanal", "Status", "Termin", "Opiekun", ""],
      emptyMessage: "Brak zadan osob w bazie danych.",
      icon: "UserCog",
      kpis: [
        { icon: "UserCog", label: "Aktywne", value: String(activeRequests), tone: activeRequests > 0 ? "warning" : "neutral" },
        { icon: "Timer", label: "Blisko terminu", value: String(urgentRequests), tone: urgentRequests > 0 ? "danger" : "neutral" },
        { icon: "BadgeCheck", label: "Zamkniete", value: String(dataSubjectRequests.filter((request) => request.status === "CLOSED").length), tone: "success" },
        { icon: "FileText", label: "Wszystkie", value: String(counts.dataSubjectRequests), tone: "brand" },
      ],
      rows: requestRows,
      subtitle: "Zadania osob z terminem miesiecznym, weryfikacja tozsamosci i review.",
      title: "Zadania osob",
    },
  };

  const modules: Partial<Record<CrmRoute, GenericModule>> = {
    admin: makeModule({
      action: "Eksport audytu",
      columns: ["Zdarzenie", "Encja", "ID encji", "Uzytkownik", "Organizacja", "IP", "Czas", ""],
      emptyMessage: "Brak logow audytu w bazie danych.",
      icon: "ShieldHalf",
      kpis: [
        { icon: "Activity", label: "Zdarzenia audytu", value: String(counts.auditLogs), tone: "brand" },
        { icon: "Users", label: "Uzytkownicy", value: String(counts.users), tone: "neutral" },
        { icon: "Building2", label: "Organizacje", value: String(counts.organizations), tone: "neutral" },
        { icon: "Lock", label: "Role CRM", value: "4", tone: "brand" },
      ],
      route: "admin",
      rows: auditRows,
      subtitle: "AuditLog z filtrowalnymi zdarzeniami systemowymi i CRM.",
      title: "Audit log",
    }),
    automations: makeModule({
      action: "Nowa automatyzacja",
      columns: ["Automatyzacja", "Trigger", "Status", "Ostatni event", ""],
      emptyMessage: "Brak tabel automatyzacji; eventy sa reprezentowane przez CrmActivity i Inngest.",
      icon: "Workflow",
      kpis: [
        { icon: "Workflow", label: "Eventy CRM", value: String(counts.crmActivities), tone: "brand" },
        { icon: "FileSearch", label: "Joby dokumentow", value: String(counts.generationJobs), tone: "neutral" },
        { icon: "ShoppingCart", label: "Zamowienia", value: String(counts.orders), tone: "neutral" },
        { icon: "TriangleAlert", label: "Alerty", value: String(alerts.length), tone: alerts.length > 0 ? "warning" : "neutral" },
      ],
      route: "automations",
      rows: [],
      subtitle: "Przygotowane punkty zdarzen: order/paid, document/generate.requested i CrmActivity.",
      title: "Automatyzacje",
    }),
    inbox: makeModule({
      action: "Wyslij wiadomosc",
      columns: ["Wiadomosc", "Klient", "Do", "Status", "Wyslano", "Powiazanie", ""],
      emptyMessage: "Brak wiadomosci w bazie danych.",
      icon: "Inbox",
      kpis: [
        { icon: "Inbox", label: "Wiadomosci", value: String(counts.crmMessages), tone: "brand" },
        { icon: "Send", label: "Wyslane", value: String(messages.filter((message) => message.status === "SENT").length), tone: "success" },
        { icon: "TriangleAlert", label: "Failed", value: String(messages.filter((message) => message.status === "FAILED").length), tone: "danger" },
        { icon: "Edit3", label: "Szkice", value: String(messages.filter((message) => message.status === "DRAFT").length), tone: "neutral" },
      ],
      route: "inbox",
      rows: messageRows,
      subtitle: "Wiadomosci CRM powiazane z klientem albo encja operacyjna.",
      title: "Skrzynka",
    }),
    calendar: makeModule({
      action: "Nowe wydarzenie",
      columns: ["Wydarzenie", "Start", "Koniec", "Opiekun", "Klient", "Status", ""],
      emptyMessage: "Brak wydarzen kalendarza w bazie danych.",
      icon: "CalendarDays",
      kpis: [
        { icon: "CalendarDays", label: "Wydarzenia", value: String(counts.crmCalendarEvents), tone: "brand" },
        { icon: "Clock3", label: "Dzis", value: String(calendarEvents.filter((event) => event.startsAt >= todayStart && event.startsAt <= todayEnd).length), tone: "warning" },
        { icon: "UserCheck", label: "Moje", value: String(calendarEvents.filter((event) => event.ownerId === actor.id).length), tone: "neutral" },
        { icon: "Timer", label: "Nadchodzace", value: String(calendarEvents.filter((event) => event.startsAt >= now).length), tone: "brand" },
      ],
      route: "calendar",
      rows: calendarRows,
      subtitle: "Terminy, konsultacje, follow-upy i deadline'y operacyjne.",
      title: "Kalendarz",
    }),
    employees: makeModule({
      action: "Zaproś pracownika",
      columns: ["Pracownik", "E-mail", "Rola", "Zadania", "Leady", "Sprawy", "Aktualizacja", ""],
      emptyMessage: "Brak uzytkownikow w bazie danych.",
      icon: "Users",
      kpis: [
        { icon: "Users", label: "Uzytkownicy", value: String(counts.users), tone: "brand" },
        { icon: "ShieldCheck", label: "Administratorzy", value: String(users.filter((user) => user.role === "ADMIN").length), tone: "danger" },
        { icon: "Scale", label: "Prawnicy", value: String(users.filter((user) => user.role === "LAWYER").length), tone: "brand" },
        { icon: "UserCheck", label: "Operatorzy", value: String(users.filter((user) => user.role === "OPERATOR").length), tone: "neutral" },
      ],
      route: "employees",
      rows: userRows,
      subtitle: "Uzytkownicy systemu, role i przypisane obciazenie operacyjne.",
      title: "Pracownicy",
    }),
    orgs: makeModule({
      action: "Dodaj organizacje",
      columns: lists.clients.columns,
      emptyMessage: lists.clients.emptyMessage,
      icon: "Network",
      kpis: lists.clients.kpis ?? [],
      route: "orgs",
      rows: lists.clients.rows,
      subtitle: "Organizacje zapisane w tabeli Organization.",
      title: "Organizacje",
    }),
    orders: makeModule({
      action: "Nowe zamowienie",
      columns: ["Zamowienie", "Klient", "Status", "Platnosc", "Brutto", "Pozycje", "Faktura", "Utworzono", ""],
      emptyMessage: "Brak zamowien w bazie danych.",
      icon: "ShoppingCart",
      kpis: [
        { icon: "ShoppingCart", label: "Zamowienia", value: String(counts.orders), tone: "brand" },
        { icon: "BadgeCheck", label: "Oplacone", value: String(paidOrders), tone: "success" },
        { icon: "FileQuestion", label: "Czeka na dane", value: String(inputRequiredOrders), tone: inputRequiredOrders > 0 ? "warning" : "neutral" },
        { icon: "CreditCard", label: "Problem platnosci", value: String(pendingPaymentOrders), tone: pendingPaymentOrders > 0 ? "danger" : "neutral" },
      ],
      route: "orders",
      rows: orderRows,
      subtitle: "Zamowienia sklepu, platnosci, pozycje i faktury z bazy.",
      title: "Zamowienia",
    }),
    packages: makeModule({
      action: "Nowy pakiet",
      columns: lists.products.columns,
      emptyMessage: "Brak pakietow w bazie danych.",
      icon: "Package",
      kpis: [
        { icon: "Package", label: "Pakiety", value: String(packageRows.length), tone: "brand" },
        { icon: "BadgeCheck", label: "Aktywne", value: String(products.filter((product) => product.productType === "PACKAGE" && product.status === "ACTIVE").length), tone: "success" },
        { icon: "ShoppingCart", label: "Zamowienia", value: String(counts.orders), tone: "neutral" },
        { icon: "Wallet", label: "Przychod", value: formatCompactMoney(paidRevenueGross), tone: paidRevenueGross > 0 ? "success" : "neutral" },
      ],
      route: "packages",
      rows: packageRows,
      subtitle: "Pakiety sa produktami typu PACKAGE z tabeli Product.",
      title: "Pakiety RODO",
    }),
    reports: makeModule({
      action: "Nowy raport",
      columns: ["Raport", "Zakres", "Wartosc", "Status", "Komentarz", ""],
      emptyMessage: "Raporty sa liczone dynamicznie z bazy.",
      icon: "ChartColumn",
      kpis: [
        { icon: "Wallet", label: "Przychod brutto", value: formatCompactMoney(paidRevenueGross), tone: paidRevenueGross > 0 ? "success" : "neutral" },
        { icon: "Wallet", label: "Przychod netto", value: formatCompactMoney(paidRevenueNet), tone: paidRevenueNet > 0 ? "success" : "neutral" },
        { icon: "Target", label: "Konwersja leadow", value: crmLeads.length > 0 ? `${leadConversion}%` : "-", tone: leadConversion > 0 ? "success" : "neutral" },
        { icon: "TriangleAlert", label: "Bledy generatorow", value: String(failedJobs), tone: failedJobs > 0 ? "danger" : "neutral" },
      ],
      route: "reports",
      rows: [
        reportRow("Leady wedlug statusu", "CRM", `${counts.crmLeads} rekordow`, counts.crmLeads > 0 ? "Aktywny" : "Brak danych"),
        reportRow("Zamowienia wedlug statusu", "Sklep", `${counts.orders} rekordow`, counts.orders > 0 ? "Aktywny" : "Brak danych"),
        reportRow("Przychod miesieczny", "Sklep", formatMoney(paidRevenueGross), paidRevenueGross > 0 ? "Aktywny" : "Brak danych"),
        reportRow("Dokumenty wedlug statusu", "Generator", `${counts.generatedDocuments} rekordow`, counts.generatedDocuments > 0 ? "Aktywny" : "Brak danych"),
        reportRow("Naruszenia aktywne", "RODO", `${activeBreaches} aktywne`, activeBreaches > 0 ? "Wymaga uwagi" : "OK"),
        reportRow("Zadania osob aktywne", "RODO", `${activeRequests} aktywne`, activeRequests > 0 ? "Wymaga uwagi" : "OK"),
      ],
      subtitle: "Podstawowe raporty liczone z aktualnych tabel operacyjnych.",
      title: "Raporty",
    }),
    settings: makeModule({
      action: "Zmien ustawienie",
      columns: ["Konfiguracja", "Zrodlo", "Wartosc", "Status", ""],
      emptyMessage: "Brak oddzielnych tabel konfiguracji systemu.",
      icon: "Settings",
      kpis: [
        { icon: "Users", label: "Uzytkownicy", value: String(counts.users), tone: "brand" },
        { icon: "ShieldCheck", label: "Role CRM", value: "4", tone: "neutral" },
        { icon: "Activity", label: "Audit log", value: String(counts.auditLogs), tone: "neutral" },
        { icon: "Database", label: "Modele operacyjne", value: "8", tone: "brand" },
      ],
      route: "settings",
      rows: [
        {
          cells: ["Prisma enum", "ADMIN, LAWYER, OPERATOR, READ_ONLY", "Aktywne", ""],
          primary: "Role CRM",
          secondary: "UserRole",
          status: { label: "Aktywne", tone: "success" },
        },
        {
          cells: ["Prisma models", "CrmTask, CrmNote, CrmActivity, BreachIncident, DataSubjectRequest", "Aktywne", ""],
          primary: "Operacyjne modele CRM",
          secondary: "schema.prisma",
          status: { label: "Aktywne", tone: "success" },
        },
      ],
      subtitle: "Ustawienia pokazujace role i modele dostepne w schemacie Prisma.",
      title: "Ustawienia",
    }),
    tasks: makeModule({
      action: "Utworz zadanie",
      columns: ["Zadanie", "Status", "Priorytet", "Wlasciciel", "Termin", "Powiazanie", "Klient", ""],
      emptyMessage: "Brak zadan operacyjnych w bazie danych.",
      icon: "SquareCheckBig",
      kpis: [
        { icon: "SquareCheckBig", label: "Zadania", value: String(counts.crmTasks), tone: "brand" },
        { icon: "Clock3", label: "Dzis", value: String(dueTodayTasks), tone: dueTodayTasks > 0 ? "warning" : "neutral" },
        { icon: "TriangleAlert", label: "Zalegle", value: String(overdueTasks), tone: overdueTasks > 0 ? "danger" : "neutral" },
        { icon: "UserCheck", label: "Moje", value: String(tasks.filter((task) => task.ownerId === actor.id && task.status !== "DONE").length), tone: "brand" },
      ],
      route: "tasks",
      rows: taskRows,
      subtitle: "Wspolny system zadan powiazany z dowolna encja CRM.",
      title: "Zadania",
    }),
    sales: makeModule({
      action: "Nowa oferta",
      columns: lists.leads.columns,
      emptyMessage: lists.leads.emptyMessage,
      icon: "TrendingUp",
      kpis: lists.leads.kpis ?? [],
      route: "sales",
      rows: leadRows,
      subtitle: "Pipeline sprzedazy liczony z leadow CRM i leadow IOD.",
      title: "Sprzedaz",
    }),
    traffic: makeModule({
      action: "Nowa kampania",
      columns: ["Zgloszenie", "Klient", "Typ formularza", "Utworzyl", "Status", "Utworzono", ""],
      emptyMessage: "Brak zgloszen formularzy w bazie danych.",
      icon: "LineChart",
      kpis: [
        { icon: "FileInput", label: "Formularze", value: String(counts.formSubmissions), tone: "brand" },
        { icon: "UserPlus", label: "Leady IOD", value: String(iodLeads.length), tone: "success" },
        { icon: "Building2", label: "Organizacje", value: String(counts.organizations), tone: "neutral" },
        { icon: "Activity", label: "Audyt", value: String(counts.auditLogs), tone: "neutral" },
      ],
      route: "traffic",
      rows: formSubmissions.map((submission) => {
        const status = submission.status.toLowerCase();

        return {
          cells: [
            submission.organization.name,
            submission.formType,
            submission.createdBy?.name ?? submission.createdBy?.email ?? "-",
            status,
            formatDate(submission.createdAt),
            "",
          ],
          primary: submission.id,
          secondary: "FormSubmission",
          status: { label: status, tone: statusTone(status) },
        };
      }),
      subtitle: "Ruch i marketing jako realne zgloszenia formularzy zapisane w bazie.",
      title: "Ruch i marketing",
    }),
  };

  return {
    actor: {
      email: actor.email,
      id: actor.id,
      initials: initials(actor.name ?? actor.email),
      name: actor.name ?? actor.email,
      role: crmRoleLabel(actor.role),
    },
    dashboard: {
      activity,
      alerts,
      funnel: [
        ["Organizacje", String(counts.organizations), "100%"],
        ["Leady", String(leadRows.length), percentWidth(leadRows.length, counts.organizations || leadRows.length)],
        ["Zamowienia", String(counts.orders), percentWidth(counts.orders, leadRows.length || counts.orders)],
        ["Oplacone", String(paidOrders), percentWidth(paidOrders, counts.orders || paidOrders)],
        ["Dokumenty", String(counts.generatedDocuments), percentWidth(counts.generatedDocuments, counts.orders || counts.generatedDocuments)],
      ],
      kpis: [
        { icon: "UserPlus", label: "Nowe leady", value: String(leadRows.length), delta: hotLeads > 0 ? `${hotLeads} gorace` : undefined, tone: hotLeads > 0 ? "danger" : "brand", route: "leads" },
        { icon: "PhoneCall", label: "Leady do kontaktu", value: String(crmLeads.filter((lead) => lead.status === "CONTACT_REQUIRED" || lead.status === "NEW").length), tone: "warning", route: "leads" },
        { icon: "ShoppingCart", label: "Zamowienia oplacone", value: String(paidOrders), tone: "success", route: "orders" },
        { icon: "FileQuestion", label: "Czeka na formularz", value: String(inputRequiredOrders), tone: inputRequiredOrders > 0 ? "warning" : "neutral", route: "orders" },
        { icon: "FileSearch", label: "Dokumenty w generowaniu", value: String(activeJobs), tone: activeJobs > 0 ? "warning" : "neutral", route: "documents" },
        { icon: "TriangleAlert", label: "Dokumenty failed", value: String(failedJobs), tone: failedJobs > 0 ? "danger" : "neutral", route: "documents" },
        { icon: "FileCheck2", label: "Dokumenty do review", value: String(documentsForReview), tone: documentsForReview > 0 ? "warning" : "neutral", route: "documents" },
        { icon: "ShieldAlert", label: "Aktywne naruszenia", value: String(activeBreaches), tone: activeBreaches > 0 ? "danger" : "neutral", route: "breaches" },
        { icon: "Timer", label: "Naruszenia 72h", value: String(urgentBreaches), tone: urgentBreaches > 0 ? "danger" : "neutral", route: "breaches" },
        { icon: "UserCog", label: "Zadania osob aktywne", value: String(activeRequests), tone: activeRequests > 0 ? "warning" : "neutral", route: "requests" },
        { icon: "CalendarClock", label: "Zadania osob blisko terminu", value: String(urgentRequests), tone: urgentRequests > 0 ? "danger" : "neutral", route: "requests" },
        { icon: "ListTodo", label: "Zadania na dzis", value: String(dueTodayTasks), tone: dueTodayTasks > 0 ? "warning" : "neutral", route: "tasks" },
        { icon: "Wallet", label: "Przychod brutto", value: formatCompactMoney(paidRevenueGross), tone: paidRevenueGross > 0 ? "success" : "neutral", route: "accounting" },
        { icon: "ReceiptText", label: "Przychod netto", value: formatCompactMoney(paidRevenueNet), tone: paidRevenueNet > 0 ? "success" : "neutral", route: "accounting" },
      ],
      revenueBars: [
        ["Przychod brutto", percentWidth(paidRevenueGross, Math.max(paidRevenueGross, paidRevenueNet, 1))],
        ["Przychod netto", percentWidth(paidRevenueNet, Math.max(paidRevenueGross, 1))],
        ["Pipeline leadow", percentWidth(leadPipelineCents, Math.max(leadPipelineCents, paidRevenueGross, 1))],
        ["Zamowienia oplacone", percentWidth(paidOrders, counts.orders || 1)],
        ["Dokumenty gotowe", percentWidth(counts.generatedDocuments, counts.generationJobs || 1)],
      ],
      todos: [
        ...tasks
          .filter((task) => task.status !== "DONE" && task.dueAt && task.dueAt <= todayEnd)
          .slice(0, 5)
          .map((task) => ({
            due: task.dueAt ? formatDateTime(task.dueAt) : "-",
            tag: priorityLabels[task.priority],
            title: task.title,
            tone: priorityTone(task.priority),
          })),
        ...(failedJobs > 0
          ? [{ due: "teraz", tag: "Dokumenty", title: "Sprawdz joby generowania z bledem", tone: "danger" as Tone }]
          : []),
        ...(urgentBreaches > 0
          ? [{ due: "72h", tag: "Naruszenia", title: "Zweryfikuj naruszenia blisko terminu 72h", tone: "danger" as Tone }]
          : []),
      ].slice(0, 8),
    },
    generatedAt: now.toISOString(),
    lists,
    modules,
    permissions: {
      allowedRoutes: getAllowedCrmRoutes(actor.role).filter((route): route is CrmRoute => isCrmRoute(route)),
      canMutate: canMutateCrm(actor, "tasks") || actor.role === "ADMIN",
      role: actor.role,
    },
  };

  async function getCounts() {
    const [
      organizationsCount,
      clientProfiles,
      usersCount,
      productsCount,
      templatesCount,
      ordersCount,
      paymentsCount,
      invoicesCount,
      generationJobs,
      generatedDocumentsCount,
      formSubmissionsCount,
      crmLeadsCount,
      crmTasksCount,
      crmNotesCount,
      crmActivitiesCount,
      crmMessagesCount,
      crmCalendarEventsCount,
      breachIncidentsCount,
      dataSubjectRequestsCount,
      auditLogsCount,
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.clientProfile.count(),
      prisma.user.count(),
      prisma.product.count(),
      prisma.documentTemplate.count(),
      prisma.order.count(),
      prisma.payment.count(),
      prisma.invoice.count(),
      prisma.documentGenerationJob.count(),
      prisma.generatedDocument.count(),
      prisma.formSubmission.count(),
      prisma.crmLead.count(),
      prisma.crmTask.count(),
      prisma.crmNote.count(),
      prisma.crmActivity.count(),
      prisma.crmMessage.count(),
      prisma.crmCalendarEvent.count(),
      prisma.breachIncident.count(),
      prisma.dataSubjectRequest.count(),
      prisma.auditLog.count(),
    ]);

    return {
      auditLogs: auditLogsCount,
      breachIncidents: breachIncidentsCount,
      clientProfiles,
      crmActivities: crmActivitiesCount,
      crmCalendarEvents: crmCalendarEventsCount,
      crmLeads: crmLeadsCount,
      crmMessages: crmMessagesCount,
      crmNotes: crmNotesCount,
      crmTasks: crmTasksCount,
      dataSubjectRequests: dataSubjectRequestsCount,
      formSubmissions: formSubmissionsCount,
      generatedDocuments: generatedDocumentsCount,
      generationJobs,
      invoices: invoicesCount,
      orders: ordersCount,
      payments: paymentsCount,
      products: productsCount,
      organizations: organizationsCount,
      templates: templatesCount,
      users: usersCount,
    };
  }
}

type CrmLeadRowSource = Prisma.CrmLeadGetPayload<{
  include: { organization: true; owner: true };
}>;

type IodLeadRowSource = Awaited<ReturnType<typeof listIodCrmLeads>>[number];

function buildLeadRows(crmLeads: CrmLeadRowSource[], iodLeads: IodLeadRowSource[]): TableRow[] {
  const crmRows: TableRow[] = crmLeads.map((lead) => {
    const status = leadStatusLabels[lead.status];
    const priority = priorityLabels[lead.priority];

    return {
      actionRoute: "lead-detail",
      cells: [
        lead.source ?? "CRM",
        "-",
        "-",
        formatMoney(lead.valueCents),
        status,
        priority,
        lead.owner?.name ?? lead.owner?.email ?? "-",
        lead.nextFollowUpAt ? formatDateTime(lead.nextFollowUpAt) : "-",
        "",
      ],
      primary: lead.organization.name,
      secondary: `CRM ${lead.id.slice(0, 8)}`,
      status: { label: status, tone: statusTone(status) },
      tag: { label: priority, tone: priorityTone(lead.priority) },
    };
  });

  const iodRows: TableRow[] = iodLeads.map((lead) => ({
    actionRoute: "lead-detail",
    cells: [
      lead.source,
      lead.industry,
      lead.resultLabel,
      formatMoney(Math.round(lead.value * 100)),
      lead.stage,
      lead.hot ? "Wysoki" : "Sredni",
      lead.owner,
      lead.lastActivity,
      "",
    ],
    primary: lead.company,
    secondary: `IOD ${lead.id.slice(0, 8)}`,
    status: { label: lead.stage, tone: statusTone(lead.stage) },
    tag: { label: lead.hot ? "Goracy" : "Standard", tone: lead.hot ? "danger" : "neutral" },
  }));

  return [...crmRows, ...iodRows];
}

function buildAlerts(input: {
  activeJobs: number;
  failedJobs: number;
  hotLeads: number;
  overdueTasks: number;
  pendingPaymentOrders: number;
  urgentBreaches: number;
  urgentRequests: number;
}): CrmDashboardAlert[] {
  const alerts: CrmDashboardAlert[] = [];

  if (input.failedJobs > 0) {
    alerts.push({
      icon: "TriangleAlert",
      route: "documents",
      subtitle: `${input.failedJobs} jobow generowania dokumentu ma status FAILED.`,
      tag: "Blad",
      title: "Bledy generowania dokumentow",
      tone: "danger",
    });
  }
  if (input.urgentBreaches > 0) {
    alerts.push({
      icon: "Timer",
      route: "breaches",
      subtitle: `${input.urgentBreaches} naruszen jest blisko terminu 72h.`,
      tag: "72h",
      title: "Naruszenia blisko terminu",
      tone: "danger",
    });
  }
  if (input.urgentRequests > 0) {
    alerts.push({
      icon: "UserCog",
      route: "requests",
      subtitle: `${input.urgentRequests} zadan osob ma bliski termin odpowiedzi.`,
      tag: "RODO",
      title: "Zadania osob blisko terminu",
      tone: "warning",
    });
  }
  if (input.overdueTasks > 0) {
    alerts.push({
      icon: "ListTodo",
      route: "tasks",
      subtitle: `${input.overdueTasks} zadan CRM jest po terminie.`,
      tag: "Zalegle",
      title: "Zalegle zadania",
      tone: "warning",
    });
  }
  if (input.hotLeads > 0) {
    alerts.push({
      icon: "Flame",
      route: "leads",
      subtitle: `${input.hotLeads} leadow wymaga szybkiej kwalifikacji.`,
      tag: "Lead",
      title: "Gorace leady",
      tone: "danger",
    });
  }
  if (input.pendingPaymentOrders > 0) {
    alerts.push({
      icon: "CreditCard",
      route: "orders",
      subtitle: `${input.pendingPaymentOrders} zamowien wymaga kontroli platnosci.`,
      tag: "Platnosc",
      title: "Zamowienia bez potwierdzonej platnosci",
      tone: "warning",
    });
  }
  if (input.activeJobs > 0) {
    alerts.push({
      icon: "Clock3",
      route: "documents",
      subtitle: `${input.activeJobs} jobow dokumentow jest w toku.`,
      tag: "Job",
      title: "Aktywne generowanie dokumentow",
      tone: "brand",
    });
  }

  return alerts;
}

function makeModule(input: Omit<GenericModule, "filters"> & { filters?: GenericModule["filters"] }): GenericModule {
  return {
    ...input,
    filters: input.filters ?? defaultFilters,
  };
}

function emptyListModule(input: Omit<CrmListModule, "emptyMessage" | "kpis" | "rows"> & { emptyMessage?: string }): CrmListModule {
  return {
    ...input,
    emptyMessage: input.emptyMessage ?? input.subtitle,
    kpis: [
      { icon: input.icon, label: input.title, value: "0", tone: "neutral" },
      { icon: "Database", label: "Rekordy w bazie", value: "0", tone: "neutral" },
      { icon: "Plug", label: "Zrodlo danych", value: "Brak tabeli", tone: "warning" },
      { icon: "Clock3", label: "Aktywne", value: "0", tone: "neutral" },
    ],
    rows: [],
  };
}

function reportRow(name: string, scope: string, value: string, status: string): TableRow {
  return {
    cells: [scope, value, status, "-", ""],
    primary: name,
    secondary: "computed",
    status: { label: status, tone: statusTone(status) },
  };
}

function isCrmRoute(route: string): route is CrmRoute {
  return [
    "dashboard",
    "traffic",
    "leads",
    "lead-detail",
    "sales",
    "clients",
    "client-detail",
    "orgs",
    "orders",
    "documents",
    "doc-review",
    "packages",
    "products",
    "product-editor",
    "outsourcing",
    "outsourcing-detail",
    "breaches",
    "breach-detail",
    "requests",
    "request-detail",
    "inbox",
    "tasks",
    "calendar",
    "reports",
    "accounting",
    "blog",
    "blog-editor",
    "newsletter",
    "employees",
    "platform",
    "automations",
    "settings",
    "admin",
  ].includes(route);
}

function initials(value: string) {
  return value
    .split(/\s+|-/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatCompactMoney(cents: number) {
  if (cents === 0) return "0 zl";
  if (cents >= 10_000_000) return `${Math.round(cents / 100_000) / 10} mln zl`;
  if (cents >= 100_000) return `${Math.round(cents / 1000)}k zl`;
  return formatMoney(cents);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  }).format(value);
}

function percentWidth(value: number, max: number) {
  if (max <= 0 || value <= 0) return "0%";
  return `${Math.max(8, Math.min(100, Math.round((value / max) * 100)))}%`;
}

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function endOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

function priorityTone(priority: CrmPriority): Tone {
  if (priority === "CRITICAL") return "danger";
  if (priority === "HIGH") return "warning";
  if (priority === "LOW") return "neutral";
  return "brand";
}

function breachRiskTone(risk: BreachRiskLevel): Tone {
  if (risk === "CRITICAL" || risk === "HIGH") return "danger";
  if (risk === "MEDIUM") return "warning";
  return "neutral";
}

function statusTone(label: string): Tone {
  const normalized = label.toLowerCase();
  if (
    normalized.includes("blad") ||
    normalized.includes("failed") ||
    normalized.includes("zaleg") ||
    normalized.includes("wysok") ||
    normalized.includes("gorac") ||
    normalized.includes("kryty") ||
    normalized.includes("nieudana")
  ) {
    return "danger";
  }
  if (
    normalized.includes("oczek") ||
    normalized.includes("trakcie") ||
    normalized.includes("weryfik") ||
    normalized.includes("szkic") ||
    normalized.includes("processing") ||
    normalized.includes("kontakt") ||
    normalized.includes("termin")
  ) {
    return "warning";
  }
  if (
    normalized.includes("akty") ||
    normalized.includes("zako") ||
    normalized.includes("wygener") ||
    normalized.includes("dostar") ||
    normalized.includes("completed") ||
    normalized.includes("submitted") ||
    normalized.includes("oplac") ||
    normalized.includes("wystaw") ||
    normalized.includes("wygran") ||
    normalized.includes("ok")
  ) {
    return "success";
  }
  return "brand";
}
