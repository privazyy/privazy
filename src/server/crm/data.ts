import "server-only";

import type {
  CrmTaskStatus,
  DocumentGenerationStatus,
  DocumentTemplateStatus,
  FulfillmentStatus,
  GeneratedDocumentReviewStatus,
  GeneratedDocumentStatus,
  InvoiceStatus,
  OrderStatus,
  PaymentReviewStatus,
  PaymentStatus,
  ProductKind,
  ProductStatus,
  UserRole,
} from "@prisma/client";

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
import { getPrisma } from "@/server/db/prisma";

const defaultFilters = ["Wszystkie", "Aktywne", "Pilne", "Moje", "Do akceptacji"].map((label) => ({ label }));

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Admin",
  CLIENT: "Klient",
  LAWYER: "Prawnik",
  OPERATOR: "Operator",
  READ_ONLY: "Tylko odczyt",
};

const templateStatusLabels: Record<DocumentTemplateStatus, string> = {
  ACTIVE: "Aktywny",
  ARCHIVED: "Archiwum",
  DRAFT: "Szkic",
};

const jobStatusLabels: Record<DocumentGenerationStatus, string> = {
  COMPLETED: "Zakończony",
  FAILED: "Błąd",
  PENDING: "Oczekuje",
  PROCESSING: "W trakcie",
};

const generatedStatusLabels: Record<GeneratedDocumentStatus, string> = {
  ARCHIVED: "Archiwum",
  DELIVERED: "Dostarczony",
  DRAFT: "Szkic",
  GENERATED: "Wygenerowany",
};

const orderStatusLabels: Record<OrderStatus, string> = {
  ARCHIVED: "Archiwum",
  CANCELLED: "Anulowane",
  COMPLETED: "Zamkniete",
  DRAFT: "Szkic",
  IN_PROGRESS: "W toku",
  PLACED: "Zlozone",
};

const fulfillmentStatusLabels: Record<FulfillmentStatus, string> = {
  CANCELLED: "Anulowane",
  DELIVERED: "Dostarczone",
  IN_PROGRESS: "W realizacji",
  IN_REVIEW: "Review",
  READY: "Gotowe",
  WAITING_FOR_INPUT: "Czeka na dane",
  WAITING_FOR_PAYMENT: "Czeka na platnosc",
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  CANCELLED: "Anulowana",
  FAILED: "Blad",
  PAID: "Oplacona",
  PENDING: "Oczekuje",
  PROCESSING: "W trakcie",
  REFUNDED: "Zwrocona",
};

const paymentReviewLabels: Record<PaymentReviewStatus, string> = {
  FLAGGED: "Flaga",
  REVIEWED: "Sprawdzona",
  UNREVIEWED: "Nie sprawdzono",
};

const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  CANCELLED: "Anulowana",
  FAILED: "Blad",
  ISSUED: "Wystawiona",
  NOT_REQUESTED: "Nie zamowiono",
  REQUESTED: "Zamowiona",
};

const reviewStatusLabels: Record<GeneratedDocumentReviewStatus, string> = {
  APPROVED: "Zatwierdzony",
  NOT_REQUIRED: "Nie wymagany",
  PENDING: "Do review",
  REJECTED: "Odrzucony",
};

const productKindLabels: Record<ProductKind, string> = {
  DOCUMENT: "Dokument",
  PACKAGE: "Pakiet",
  SERVICE: "Usluga",
};

const productStatusLabels: Record<ProductStatus, string> = {
  ACTIVE: "Aktywny",
  ARCHIVED: "Archiwum",
};

export async function getCrmDatabaseData(): Promise<CrmDatabaseData> {
  const prisma = getPrisma();

  const [
    leads,
    organizations,
    users,
    products,
    orders,
    payments,
    invoices,
    templates,
    jobs,
    generatedDocuments,
    formSubmissions,
    tasks,
    auditLogs,
    counts,
  ] = await Promise.all([
    prisma.lead.findMany({
      include: {
        assignedTo: {
          select: {
            email: true,
            name: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.organization.findMany({
      include: {
        owner: {
          select: {
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            auditLogs: true,
            clientProfiles: true,
            contactPersons: true,
            formSubmissions: true,
            generatedDocuments: true,
            generationJobs: true,
            leads: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
    prisma.user.findMany({
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
    prisma.product.findMany({
      orderBy: [{ status: "asc" }, { kind: "asc" }, { name: "asc" }],
      take: 100,
    }),
    prisma.order.findMany({
      include: {
        organization: { select: { id: true, name: true, email: true } },
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { items: true, payments: true, invoices: true, generatedDocuments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.payment.findMany({
      include: {
        order: { select: { id: true, orderNumber: true, organization: { select: { id: true, name: true } } } },
        _count: { select: { events: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.invoice.findMany({
      include: {
        order: { select: { id: true, orderNumber: true, organization: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.documentTemplate.findMany({
      include: {
        approvedBy: true,
        createdBy: true,
      },
      orderBy: [{ status: "asc" }, { type: "asc" }, { version: "desc" }],
      take: 100,
    }),
    prisma.documentGenerationJob.findMany({
      include: {
        generatedDocument: true,
        organization: true,
        order: true,
        orderItem: true,
        template: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.generatedDocument.findMany({
      include: {
        createdBy: true,
        files: true,
        downloads: true,
        organization: true,
        order: true,
        orderItem: true,
        template: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.formSubmission.findMany({
      include: {
        createdBy: true,
        organization: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.crmTask.findMany({
      include: {
        assignedTo: { select: { email: true, name: true } },
        createdBy: { select: { email: true, name: true } },
        lead: { select: { id: true, companyName: true, fullName: true } },
        organization: { select: { id: true, name: true } },
      },
      orderBy: [{ status: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }],
      take: 100,
    }),
    prisma.auditLog.findMany({
      include: {
        organization: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    getCounts(),
  ]);

  const leadRows: TableRow[] = leads.map((lead) => ({
    actionRoute: "lead-detail",
    cells: [
      leadSourceLabel(lead.source),
      lead.industry ?? "-",
      lead.fullName,
      lead.estimatedValue ? formatCurrency(Number(lead.estimatedValue)) : "-",
      leadStatusLabel(lead.status),
      leadPriorityLabel(lead.priority),
      lead.assignedTo?.name ?? lead.assignedTo?.email ?? "Nieprzypisany",
      formatDateTime(lead.updatedAt),
      "",
    ],
    id: lead.id,
    primary: lead.companyName,
    secondary: `${lead.fullName} · ${lead.email}`,
    status: { label: leadStatusLabel(lead.status), tone: statusTone(leadStatusLabel(lead.status)) },
    tag: {
      label: leadPriorityLabel(lead.priority),
      tone: ["HIGH", "URGENT"].includes(lead.priority) ? "danger" : "neutral",
    },
  }));

  const clientRows: TableRow[] = organizations.map((organization) => {
    const status = organizationStatusLabel(organization.status);

    return {
      actionRoute: "client-detail",
      cells: [
        organization.nip ?? "-",
        organization.email ?? "-",
        organization.phone ?? "-",
        organization.industry ?? "-",
        status,
        organization.owner?.name ?? organization.owner?.email ?? "Nieprzypisany",
        formatDate(organization.createdAt),
        String(organization._count.leads),
        "",
      ],
      id: organization.id,
      primary: organization.name,
      secondary: [organization.city, organization.country].filter(Boolean).join(", ") || organization.id,
      status: { label: status, tone: organization.status === "ACTIVE" ? "success" : organization.status === "ARCHIVED" ? "neutral" : "brand" },
    };
  });

  const documentRows: TableRow[] = generatedDocuments.map((document) => {
    const status = generatedStatusLabels[document.status];
    const review = reviewStatusLabels[document.reviewStatus];

    return {
      actionRoute: "generated-document-detail",
      cells: [
        document.organization.name,
        document.type,
        status,
        review,
        document.order?.orderNumber ?? "-",
        String(document.files.length),
        String(document.downloads.length),
        formatDate(document.createdAt),
        "",
      ],
      primary: document.template.name,
      secondary: document.orderItem?.name ?? document.id,
      status: { label: status, tone: statusTone(status) },
      tag: { label: review, tone: document.reviewStatus === "REJECTED" ? "danger" : document.reviewStatus === "APPROVED" ? "success" : "warning" },
    };
  });

  const orderRows: TableRow[] = orders.map((order) => {
    const status = orderStatusLabels[order.status];
    const fulfillment = fulfillmentStatusLabels[order.fulfillmentStatus];

    return {
      actionRoute: "order-detail",
      cells: [
        order.organization.name,
        order.customerEmail,
        status,
        paymentStatusLabels[order.paymentStatus],
        invoiceStatusLabels[order.invoiceStatus],
        fulfillment,
        formatCents(order.totalGrossCents, order.currency),
        String(order._count.items),
        order.owner?.name ?? order.owner?.email ?? "-",
        formatDate(order.createdAt),
        "",
      ],
      id: order.id,
      primary: order.orderNumber,
      secondary: order.buyerName,
      status: { label: status, tone: statusTone(status) },
      tag: { label: fulfillment, tone: statusTone(fulfillment) },
    };
  });

  const paymentRows: TableRow[] = payments.map((payment) => {
    const status = paymentStatusLabels[payment.status];
    const review = paymentReviewLabels[payment.reviewStatus];

    return {
      actionRoute: "payment-detail",
      cells: [
        payment.order.orderNumber,
        payment.order.organization.name,
        payment.provider,
        payment.mode,
        status,
        formatCents(payment.amountCents, payment.currency),
        String(payment._count.events),
        review,
        formatDate(payment.createdAt),
        "",
      ],
      id: payment.id,
      primary: payment.id,
      secondary: payment.providerPaymentId ?? "mock/sandbox",
      status: { label: status, tone: statusTone(status) },
      tag: { label: review, tone: payment.reviewStatus === "FLAGGED" ? "danger" : payment.reviewStatus === "REVIEWED" ? "success" : "neutral" },
    };
  });

  const invoiceRows: TableRow[] = invoices.map((invoice) => {
    const status = invoiceStatusLabels[invoice.status];

    return {
      actionRoute: "invoice-detail",
      cells: [
        invoice.order.orderNumber,
        invoice.order.organization.name,
        invoice.buyerName,
        invoice.mode,
        status,
        formatCents(invoice.totalGrossCents, invoice.currency),
        invoice.issuedAt ? formatDate(invoice.issuedAt) : "-",
        formatDate(invoice.createdAt),
        "",
      ],
      id: invoice.id,
      primary: invoice.invoiceNumber ?? invoice.id,
      secondary: invoice.buyerTaxId ?? invoice.buyerEmail ?? "mock/sandbox",
      status: { label: status, tone: statusTone(status) },
    };
  });

  const documentJobRows: TableRow[] = jobs.map((job) => {
    const status = jobStatusLabels[job.status];

    return {
      actionRoute: "document-job-detail",
      cells: [
        job.organization.name,
        job.order?.orderNumber ?? "-",
        job.orderItem?.name ?? "-",
        job.template.name,
        status,
        String(job.retryCount),
        formatDate(job.createdAt),
        job.completedAt ? formatDate(job.completedAt) : "-",
        job.errorMessage ? "Safe error" : "-",
        "",
      ],
      id: job.id,
      primary: job.id,
      secondary: job.template.type,
      status: { label: status, tone: statusTone(status) },
      tag: job.errorMessage ? { label: "Wymaga uwagi", tone: "danger" } : undefined,
    };
  });

  const templateRows: TableRow[] = (products.length > 0 ? products : templates).map((item) => {
    if ("sku" in item) {
      const status = productStatusLabels[item.status];
      return {
        actionRoute: "product-editor",
        cells: [
          productKindLabels[item.kind],
          item.documentType ?? "-",
          formatCents(item.priceCents, item.currency),
          `${item.vatRateBps / 100}%`,
          status,
          formatDate(item.updatedAt),
          "",
        ],
        primary: item.name,
        secondary: item.sku,
        status: { label: status, tone: statusTone(status) },
      };
    }
    const template = item;
    const status = templateStatusLabels[template.status];

    return {
      actionRoute: "product-editor",
      cells: [
        template.type,
        `v${template.version}`,
        status,
        template.createdBy.name ?? template.createdBy.email,
        template.approvedBy?.name ?? template.approvedBy?.email ?? "-",
        formatDate(template.updatedAt),
        "",
      ],
      primary: template.name,
      secondary: `Template ${template.id}`,
      status: { label: status, tone: statusTone(status) },
    };
  });

  const requestRows = formSubmissions
    .filter((submission) => {
      const formType = submission.formType.toLowerCase();
      return formType.includes("request") || formType.includes("zadanie") || formType.includes("data_subject");
    })
    .map<TableRow>((submission) => {
      const status = submission.status.toLowerCase();

      return {
        actionRoute: "request-detail",
        cells: [
          submission.organization.name,
          submission.formType,
          submission.createdBy?.name ?? submission.createdBy?.email ?? "-",
          status,
          formatDate(submission.createdAt),
          formatDate(submission.updatedAt),
          "",
        ],
        primary: submission.id,
        secondary: "FormSubmission",
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
      cells: [user.email, role, formatDate(user.createdAt), formatDate(user.updatedAt), ""],
      primary: user.name ?? user.email,
      secondary: user.id,
      status: { label: role, tone: user.role === "ADMIN" ? "danger" : "brand" },
    };
  });

  const formRows: TableRow[] = formSubmissions.map((submission) => {
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
  });

  const taskRows: TableRow[] = tasks.map((task) => {
    const status = taskStatusLabel(task.status);
    const due = task.dueAt ? formatDate(task.dueAt) : "-";
    const resource = task.lead?.companyName ?? task.organization?.name ?? "Bez powiazania";

    return {
      cells: [
        status,
        leadPriorityLabel(task.priority),
        task.assignedTo?.name ?? task.assignedTo?.email ?? "Nieprzypisane",
        due,
        resource,
        task.createdBy.name ?? task.createdBy.email,
        "",
      ],
      id: task.id,
      primary: task.title,
      secondary: task.description ?? resource,
      status: { label: status, tone: taskStatusTone(task.status, task.dueAt) },
      tag: { label: leadPriorityLabel(task.priority), tone: ["HIGH", "URGENT"].includes(task.priority) ? "danger" : "neutral" },
    };
  });

  const activeJobs = jobs.filter((job) => job.status === "PENDING" || job.status === "PROCESSING").length;
  const failedJobs = jobs.filter((job) => job.status === "FAILED").length;
  const activeOrders = orders.filter((order) => !["COMPLETED", "CANCELLED", "ARCHIVED"].includes(order.status)).length;
  const failedPayments = payments.filter((payment) => payment.status === "FAILED").length;
  const issuedInvoices = invoices.filter((invoice) => invoice.status === "ISSUED").length;
  const activeTemplates = templates.filter((template) => template.status === "ACTIVE").length;
  const hotLeads = leads.filter((lead) => ["HIGH", "URGENT"].includes(lead.priority)).length;
  const newLeads = leads.filter((lead) => lead.status === "NEW").length;
  const unassignedLeads = leads.filter((lead) => !lead.assignedToId && lead.status !== "ARCHIVED" && lead.status !== "CONVERTED").length;
  const activeClients = organizations.filter((organization) => organization.status === "ACTIVE").length;
  const pipelineValue = leads.reduce((sum, lead) => sum + Number(lead.estimatedValue ?? 0), 0);
  const now = new Date();
  const startOfTomorrow = new Date(now);
  startOfTomorrow.setHours(24, 0, 0, 0);
  const openTasks = tasks.filter((task) => task.status === "OPEN" || task.status === "IN_PROGRESS").length;
  const overdueTasks = tasks.filter((task) => task.dueAt && task.dueAt < now && !["DONE", "CANCELLED"].includes(task.status)).length;
  const todayTasks = tasks.filter((task) => task.dueAt && task.dueAt >= now && task.dueAt < startOfTomorrow && !["DONE", "CANCELLED"].includes(task.status)).length;

  const lists: CrmDatabaseData["lists"] = {
    accounting: {
      action: "Request mock invoice",
      columns: ["Faktura", "Zamowienie", "Klient", "Nabywca", "Tryb", "Status", "Brutto", "Wystawiono", "Utworzono", ""],
      emptyMessage: "Brak faktur w bazie danych.",
      icon: "Wallet",
      kpis: [
        { icon: "ReceiptText", label: "Faktury", value: String(counts.invoices), tone: "brand" },
        { icon: "BadgeCheck", label: "Wystawione", value: String(issuedInvoices), tone: "success" },
        { icon: "Clock3", label: "Oczekuje", value: String(invoices.filter((invoice) => invoice.status === "REQUESTED").length), tone: "warning" },
        { icon: "ShieldAlert", label: "Bledy", value: String(invoices.filter((invoice) => invoice.status === "FAILED").length), tone: "danger" },
      ],
      rows: invoiceRows,
      subtitle: "Widok ksiegowy oparty o faktury mock/sandbox powiazane z zamowieniami.",
      title: "Ksiegowosc",
    },
    blog: emptyListModule({
      action: "Nowy artykuł",
      columns: ["Artykuł", "Status", "Autor", "Główne słowo kl.", "SEO", "GEO", "Ruch", "Leady", ""],
      icon: "Newspaper",
      title: "Baza wiedzy / Blog",
      subtitle: "Treści blogowe są obecnie źródłem kodowym, nie tabelą bazy danych.",
    }),
    breaches: emptyListModule({
      action: "Dodaj naruszenie",
      columns: ["Nr sprawy", "Klient", "Zgłaszający", "Typ naruszenia", "Status", "Ryzyko", "IOD", "Termin 72h", ""],
      icon: "TriangleAlert",
      title: "Naruszenia",
      subtitle: "W aktualnym schemacie nie ma jeszcze tabeli naruszeń ochrony danych.",
    }),
    clients: {
      action: "Dodaj klienta",
      columns: ["Organizacja", "NIP", "E-mail", "Telefon", "Branża", "Status", "Opiekun", "Utworzono", "Leady", ""],
      emptyMessage: "Brak organizacji w bazie danych.",
      icon: "Building2",
      kpis: [
        { icon: "Building2", label: "Organizacje", value: String(counts.organizations), tone: "brand" },
        { icon: "UserPlus", label: "Profile klientów", value: String(counts.clientProfiles), tone: "neutral" },
        { icon: "FileText", label: "Wygenerowane dokumenty", value: String(counts.generatedDocuments), tone: "success" },
        { icon: "Activity", label: "Zdarzenia audytu", value: String(counts.auditLogs), tone: "neutral" },
      ],
      rows: clientRows,
      subtitle: "Organizacje, dane kontaktowe i liczba powiązanych obiektów z bazy.",
      title: "Klienci",
    },
    documents: {
      action: "Dodaj dokument",
      columns: ["Dokument", "Klient", "Typ", "Status", "Review", "Zamowienie", "Pliki", "Pobrania", "Utworzono", ""],
      emptyMessage: "Brak wygenerowanych dokumentów w bazie danych.",
      icon: "FileText",
      kpis: [
        { icon: "FileText", label: "Dokumenty", value: String(counts.generatedDocuments), tone: "brand" },
        { icon: "FileSearch", label: "Joby aktywne", value: String(activeJobs), tone: activeJobs > 0 ? "warning" : "neutral" },
        { icon: "TriangleAlert", label: "Joby z błędem", value: String(failedJobs), tone: failedJobs > 0 ? "danger" : "neutral" },
        { icon: "Package", label: "Szablony aktywne", value: String(activeTemplates), tone: "success" },
      ],
      rows: documentRows,
      subtitle: "Wygenerowane dokumenty zapisane w tabeli GeneratedDocument.",
      title: "Dokumenty",
    },
    invoices: {
      action: "Request mock invoice",
      columns: ["Faktura", "Zamowienie", "Klient", "Nabywca", "Tryb", "Status", "Brutto", "Wystawiono", "Utworzono", ""],
      emptyMessage: "Brak faktur w bazie danych.",
      icon: "ReceiptText",
      kpis: [
        { icon: "ReceiptText", label: "Faktury", value: String(counts.invoices), tone: "brand" },
        { icon: "BadgeCheck", label: "Wystawione", value: String(issuedInvoices), tone: "success" },
        { icon: "Clock3", label: "Oczekuje", value: String(invoices.filter((invoice) => invoice.status === "REQUESTED").length), tone: "warning" },
        { icon: "ShieldAlert", label: "Bledy", value: String(invoices.filter((invoice) => invoice.status === "FAILED").length), tone: "danger" },
      ],
      rows: invoiceRows,
      subtitle: "Faktury mock/sandbox powiazane z zamowieniami. Live issuing pozostaje disabled.",
      title: "Faktury",
    },
    leads: {
      action: "Dodaj lead",
      columns: ["Firma / kontakt", "Źródło", "Branża", "Wynik checkera", "Wartość", "Status", "Priorytet", "Opiekun", "Ostatnia aktywność", ""],
      emptyMessage: "Brak leadów w bazie danych.",
      icon: "UserPlus",
      kpis: [
        { icon: "UserPlus", label: "Wszystkie leady", value: String(leads.length), tone: "brand" },
        { icon: "Flame", label: "Gorące leady", value: String(hotLeads), tone: hotLeads > 0 ? "danger" : "neutral" },
        { icon: "Wallet", label: "Wartość pipeline", value: formatCompactCurrency(pipelineValue), tone: pipelineValue > 0 ? "success" : "neutral" },
        { icon: "Building2", label: "Firmy w CRM", value: String(counts.organizations), tone: "brand" },
      ],
      rows: leadRows,
      subtitle: "Leady ręczne i zgłoszenia z checkera IOD zapisane w tabeli Lead.",
      title: "Leady",
    },
    newsletter: emptyListModule({
      action: "Nowa kampania",
      columns: ["Lista / kampania", "Segment", "Status", "Odbiorcy", "Open rate", ""],
      icon: "Mail",
      title: "Newsletter",
      subtitle: "W aktualnym schemacie nie ma jeszcze tabel newslettera i kampanii.",
    }),
    outsourcing: emptyListModule({
      action: "Dodaj abonament",
      columns: ["Klient", "Pakiet", "Przypisany IOD", "Status", "SLA", "Incydenty", "Żądania", "Przegląd", "Opłata", ""],
      icon: "ShieldCheck",
      title: "Outsourcing IOD",
      subtitle: "W aktualnym schemacie nie ma jeszcze tabel abonamentów IOD.",
    }),
    platform: {
      action: "Podgląd portalu",
      columns: ["Klient", "Profile", "Formularze", "Dokumenty", "Joby", "Audyt", "Status", "ID", ""],
      emptyMessage: "Brak organizacji do pokazania w platformie klienta.",
      icon: "MonitorSmartphone",
      kpis: [
        { icon: "MonitorSmartphone", label: "Konta organizacji", value: String(counts.organizations), tone: "brand" },
        { icon: "Users", label: "Profile klientów", value: String(counts.clientProfiles), tone: "neutral" },
        { icon: "FileText", label: "Dokumenty", value: String(counts.generatedDocuments), tone: "success" },
        { icon: "Activity", label: "Zdarzenia audytu", value: String(counts.auditLogs), tone: "neutral" },
      ],
      rows: organizations.map((organization) => {
        const hasActivity =
          organization._count.formSubmissions + organization._count.generatedDocuments + organization._count.generationJobs > 0;
        const status = hasActivity ? "Aktywna" : "Bez aktywności";

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
      subtitle: "Widok platformy klienta oparty o organizacje i powiązane rekordy.",
      title: "Platforma klienta",
    },
    payments: {
      action: "Retry status",
      columns: ["Platnosc", "Zamowienie", "Klient", "Provider", "Tryb", "Status", "Kwota", "Eventy", "Review", "Utworzono", ""],
      emptyMessage: "Brak platnosci w bazie danych.",
      icon: "CreditCard",
      kpis: [
        { icon: "CreditCard", label: "Platnosci", value: String(counts.payments), tone: "brand" },
        { icon: "BadgeCheck", label: "Oplacone", value: String(payments.filter((payment) => payment.status === "PAID").length), tone: "success" },
        { icon: "ShieldAlert", label: "Bledy", value: String(failedPayments), tone: failedPayments > 0 ? "danger" : "neutral" },
        { icon: "Activity", label: "Eventy", value: String(payments.reduce((sum, payment) => sum + payment._count.events, 0)), tone: "neutral" },
      ],
      rows: paymentRows,
      subtitle: "Platnosci mock/sandbox i bezpieczne eventy bez raw webhook payload.",
      title: "Platnosci",
    },
    products: {
      action: "Dodaj produkt",
      columns: ["Produkt", "Typ", "Wersja", "Status", "Utworzył", "Zatwierdził", "Aktualizacja", ""],
      emptyMessage: "Brak szablonów dokumentów w bazie danych.",
      icon: "Tag",
      kpis: [
        { icon: "Tag", label: "Szablony", value: String(counts.templates), tone: "brand" },
        { icon: "BadgeCheck", label: "Aktywne", value: String(activeTemplates), tone: "success" },
        { icon: "FileText", label: "Dokumenty wygenerowane", value: String(counts.generatedDocuments), tone: "neutral" },
        { icon: "Clock3", label: "Joby aktywne", value: String(activeJobs), tone: activeJobs > 0 ? "warning" : "neutral" },
      ],
      rows: templateRows,
      subtitle: "Produkty CRM są zasilane z szablonów dokumentów w bazie.",
      title: "Produkty / sklep",
    },
    requests: {
      action: "Dodaj żądanie",
      columns: ["Nr sprawy", "Klient", "Typ formularza", "Utworzył", "Status", "Utworzono", "Aktualizacja", ""],
      emptyMessage: "Brak żądań osób w bazie danych.",
      icon: "UserCog",
      kpis: [
        { icon: "UserCog", label: "Żądania osób", value: String(requestRows.length), tone: requestRows.length > 0 ? "warning" : "neutral" },
        { icon: "FileText", label: "Wszystkie formularze", value: String(counts.formSubmissions), tone: "brand" },
        { icon: "Clock3", label: "W obsłudze", value: String(formSubmissions.filter((item) => item.status === "PROCESSING").length), tone: "warning" },
        { icon: "BadgeCheck", label: "Zakończone", value: String(formSubmissions.filter((item) => item.status === "COMPLETED").length), tone: "success" },
      ],
      rows: requestRows,
      subtitle: "Żądania osób są filtrowane z tabeli FormSubmission po typie formularza.",
      title: "Żądania osób",
    },
  };

  const modules: Partial<Record<CrmRoute, GenericModule>> = {
    admin: makeModule({
      action: "Log audytowy",
      columns: ["Zdarzenie", "Encja", "ID encji", "Użytkownik", "Organizacja", "IP", "Czas", ""],
      emptyMessage: "Brak logów audytu w bazie danych.",
      icon: "ShieldHalf",
      kpis: [
        { icon: "Activity", label: "Zdarzenia audytu", value: String(counts.auditLogs), tone: "brand" },
        { icon: "Users", label: "Użytkownicy", value: String(counts.users), tone: "neutral" },
        { icon: "Building2", label: "Organizacje", value: String(counts.organizations), tone: "neutral" },
        { icon: "Download", label: "Eksporty danych", value: "0", tone: "neutral" },
      ],
      route: "admin",
      rows: auditRows,
      subtitle: "Logi audytu zapisane w tabeli AuditLog.",
      title: "Administracja systemu",
    }),
    automations: makeEmptyModule("automations", "Workflow", "Automatyzacje", "W aktualnym schemacie nie ma jeszcze tabel automatyzacji.", "Nowa automatyzacja", [
      "Automatyzacja",
      "Trigger",
      "Akcje",
      "Status",
      "Uruchomienia",
    ]),
    inbox: makeEmptyModule("inbox", "Inbox", "Skrzynka", "W aktualnym schemacie nie ma jeszcze tabel wiadomości i wątków.", "Wyślij wiadomość", [
      "Wiadomość",
      "Klient",
      "Typ",
      "Status",
      "Otrzymano",
      "",
    ]),
    calendar: makeEmptyModule("calendar", "CalendarDays", "Kalendarz", "W aktualnym schemacie nie ma jeszcze tabel wydarzeń kalendarza.", "Nowe wydarzenie", [
      "Wydarzenie",
      "Data / godzina",
      "Powiązanie",
      "Status",
      "Kategoria",
      "",
    ]),
    employees: makeModule({
      action: "Zaproś pracownika",
      columns: ["Pracownik", "E-mail", "Rola", "Utworzono", "Aktualizacja", ""],
      emptyMessage: "Brak użytkowników w bazie danych.",
      icon: "Users",
      kpis: [
        { icon: "Users", label: "Użytkownicy", value: String(counts.users), tone: "brand" },
        { icon: "ShieldCheck", label: "Administratorzy", value: String(users.filter((user) => user.role === "ADMIN").length), tone: "danger" },
        { icon: "Scale", label: "Prawnicy", value: String(users.filter((user) => user.role === "LAWYER").length), tone: "brand" },
        { icon: "UserCheck", label: "Operatorzy", value: String(users.filter((user) => user.role === "OPERATOR").length), tone: "neutral" },
      ],
      route: "employees",
      rows: userRows,
      subtitle: "Użytkownicy systemu i role z tabeli User.",
      title: "Pracownicy",
    }),
    orgs: makeModule({
      action: "Dodaj organizację",
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
      action: "Nowe zamówienie",
      columns: ["Zamowienie", "Klient", "Email", "Order", "Payment", "Invoice", "Fulfillment", "Brutto", "Pozycje", "Owner", "Utworzono", ""],
      emptyMessage: "Brak zamowien w bazie danych.",
      icon: "ShoppingCart",
      kpis: [
        { icon: "ShoppingCart", label: "Zamowienia", value: String(counts.orders), tone: "brand" },
        { icon: "Clock3", label: "Aktywne", value: String(activeOrders), tone: activeOrders > 0 ? "warning" : "neutral" },
        { icon: "BadgeCheck", label: "Zamkniete", value: String(orders.filter((order) => order.status === "COMPLETED").length), tone: "success" },
        { icon: "CreditCard", label: "Platnosci", value: String(counts.payments), tone: "neutral" },
      ],
      route: "orders",
      rows: orderRows,
      subtitle: "Zamowienia operacyjne CRM z pozycjami, platnosciami, fakturami i dokumentami.",
      title: "Zamówienia",
    }),
    "document-jobs": makeModule({
      action: "Retry job",
      columns: ["Job", "Klient", "Zamowienie", "Pozycja", "Szablon", "Status", "Retry", "Utworzono", "Zakonczono", "Blad", ""],
      emptyMessage: "Brak jobow generowania dokumentow w bazie danych.",
      icon: "FileCog",
      kpis: [
        { icon: "FileCog", label: "Joby", value: String(counts.generationJobs), tone: "brand" },
        { icon: "Clock3", label: "Aktywne", value: String(activeJobs), tone: activeJobs > 0 ? "warning" : "neutral" },
        { icon: "BadgeCheck", label: "Zakonczone", value: String(jobs.filter((job) => job.status === "COMPLETED").length), tone: "success" },
        { icon: "TriangleAlert", label: "Bledy", value: String(failedJobs), tone: failedJobs > 0 ? "danger" : "neutral" },
      ],
      route: "document-jobs",
      rows: documentJobRows,
      subtitle: "Operacyjne joby generowania dokumentow, retry i safe error summary.",
      title: "Joby dokumentow",
    }),
    packages: makeModule({
      action: "Nowy pakiet",
      columns: lists.products.columns,
      emptyMessage: lists.products.emptyMessage,
      icon: "Package",
      kpis: lists.products.kpis ?? [],
      route: "packages",
      rows: lists.products.rows,
      subtitle: "Pakiety i produkty oparte o szablony dokumentów.",
      title: "Pakiety RODO",
    }),
    reports: makeEmptyModule("reports", "ChartColumn", "Raporty", "W aktualnym schemacie nie ma tabel zapisanych raportów.", "Nowy raport", [
      "Raport",
      "Ostatnie wygenerowanie",
      "Autor",
      "Status",
      "Format",
      "",
    ]),
    settings: makeModule({
      action: "Dodaj rolę",
      columns: ["Konfiguracja", "Źródło", "Wartość", "Status", ""],
      emptyMessage: "Brak oddzielnych tabel konfiguracji systemu w aktualnym schemacie.",
      icon: "Settings",
      kpis: [
        { icon: "Users", label: "Użytkownicy", value: String(counts.users), tone: "brand" },
        { icon: "ShieldCheck", label: "Role w schemacie", value: "5", tone: "neutral" },
        { icon: "Activity", label: "Logi audytu", value: String(counts.auditLogs), tone: "neutral" },
        { icon: "Database", label: "Modele Prisma", value: "8", tone: "brand" },
      ],
      route: "settings",
      rows: [
        {
          cells: ["Prisma enum", "ADMIN, LAWYER, OPERATOR, CLIENT, READ_ONLY", "Aktywne", ""],
          primary: "Role użytkowników",
          secondary: "UserRole",
          status: { label: "Aktywne", tone: "success" },
        },
        {
          cells: ["Prisma model", String(counts.auditLogs), "Aktywne", ""],
          primary: "Logi audytu",
          secondary: "AuditLog",
          status: { label: "Aktywne", tone: "success" },
        },
      ],
      subtitle: "Ustawienia pokazują faktyczne role i modele dostępne w schemacie Prisma.",
      title: "Ustawienia",
    }),
    tasks: makeModule({
      action: "Utworz zadanie",
      columns: ["Zadanie", "Status", "Priorytet", "Przypisane do", "Termin", "Powiazanie", "Utworzyl", ""],
      emptyMessage: "Brak zadan operacyjnych w bazie danych.",
      icon: "SquareCheckBig",
      kpis: [
        { icon: "SquareCheckBig", label: "Wszystkie zadania", value: String(counts.crmTasks), tone: "brand" },
        { icon: "Clock3", label: "Otwarte", value: String(openTasks), tone: openTasks > 0 ? "warning" : "neutral" },
        { icon: "TriangleAlert", label: "Zalegle", value: String(overdueTasks), tone: overdueTasks > 0 ? "danger" : "neutral" },
        { icon: "CalendarDays", label: "Na dzis", value: String(todayTasks), tone: todayTasks > 0 ? "brand" : "neutral" },
      ],
      route: "tasks",
      rows: taskRows,
      subtitle: "Zadania operacyjne zapisane w tabeli CrmTask z przypisaniem do leadow i organizacji.",
      title: "Zadania",
    }),
    sales: makeModule({
      action: "Nowa oferta",
      columns: ["Szansa / klient", "Źródło", "Branża", "Wynik", "Wartość", "Status", "Priorytet", "Opiekun", "Aktywność", ""],
      emptyMessage: lists.leads.emptyMessage,
      icon: "TrendingUp",
      kpis: lists.leads.kpis ?? [],
      route: "sales",
      rows: leadRows,
      subtitle: "Pipeline sprzedaży jest liczony z leadów zapisanych w bazie.",
      title: "Sprzedaż",
    }),
    traffic: makeModule({
      action: "Nowa kampania",
      columns: ["Zgłoszenie", "Klient", "Typ formularza", "Utworzył", "Status", "Utworzono", ""],
      emptyMessage: "Brak zgłoszeń formularzy w bazie danych.",
      icon: "LineChart",
      kpis: [
        { icon: "FileInput", label: "Formularze", value: String(counts.formSubmissions), tone: "brand" },
        { icon: "UserPlus", label: "Leady IOD", value: String(leads.length), tone: "success" },
        { icon: "Building2", label: "Organizacje", value: String(counts.organizations), tone: "neutral" },
        { icon: "Activity", label: "Audyt", value: String(counts.auditLogs), tone: "neutral" },
      ],
      route: "traffic",
      rows: formRows,
      subtitle: "Ruch i marketing są pokazane jako zgłoszenia formularzy zapisane w bazie.",
      title: "Ruch i marketing",
    }),
  };

  const alerts: CrmDashboardAlert[] = [];
  if (failedJobs > 0) {
    alerts.push({
      icon: "TriangleAlert",
      route: "documents",
      subtitle: `${failedJobs} jobów generowania dokumentu ma status FAILED.`,
      tag: "Błąd",
      title: "Błędy generowania dokumentów",
      tone: "danger",
    });
  }
  if (activeJobs > 0) {
    alerts.push({
      icon: "Clock3",
      route: "orders",
      subtitle: `${activeJobs} jobów oczekuje lub jest w trakcie przetwarzania.`,
      tag: "Aktywne",
      title: "Aktywne joby dokumentów",
      tone: "warning",
    });
  }
  if (hotLeads > 0) {
    alerts.push({
      icon: "Flame",
      route: "leads",
      subtitle: `${hotLeads} leadów wymaga szybkiej kwalifikacji.`,
      tag: "Lead",
      title: "Gorące leady IOD",
      tone: "danger",
    });
  }
  if (unassignedLeads > 0) {
    alerts.push({
      icon: "UserRoundSearch",
      route: "leads",
      subtitle: `${unassignedLeads} leadow nie ma jeszcze opiekuna.`,
      tag: "Bez opiekuna",
      title: "Leady wymagaja przypisania",
      tone: "warning",
    });
  }
  if (overdueTasks > 0) {
    alerts.push({
      icon: "TriangleAlert",
      route: "tasks",
      subtitle: `${overdueTasks} zadan operacyjnych jest po terminie.`,
      tag: "Zalegle",
      title: "Zalegle zadania CRM",
      tone: "danger",
    });
  }

  const activity: CrmActivityItem[] = [
    ...auditLogs.slice(0, 4).map((log) => ({
      icon: "Activity",
      subtitle: `${log.entityType} ${log.entityId}`,
      title: log.action,
      tone: "brand" as Tone,
      when: formatDateTime(log.createdAt),
    })),
    ...formSubmissions.slice(0, Math.max(0, 5 - auditLogs.length)).map((submission) => ({
      icon: "FileInput",
      subtitle: `${submission.organization.name} - ${submission.formType}`,
      title: "Nowe zgłoszenie formularza",
      tone: "success" as Tone,
      when: formatDateTime(submission.createdAt),
    })),
  ];

  return {
    dashboard: {
      activity,
      alerts,
      funnel: [
        ["Organizacje", String(counts.organizations), "100%"],
        ["Zamowienia", String(counts.orders), percentWidth(counts.orders, counts.organizations || counts.orders)],
        ["Platnosci", String(counts.payments), percentWidth(counts.payments, counts.orders || counts.payments)],
        ["Formularze", String(counts.formSubmissions), percentWidth(counts.formSubmissions, counts.organizations || counts.formSubmissions)],
        ["Leady IOD", String(leads.length), percentWidth(leads.length, counts.formSubmissions || leads.length)],
        ["Joby dokumentów", String(counts.generationJobs), percentWidth(counts.generationJobs, counts.formSubmissions || counts.generationJobs)],
        ["Dokumenty", String(counts.generatedDocuments), percentWidth(counts.generatedDocuments, counts.generationJobs || counts.generatedDocuments)],
      ],
      kpis: [
        { icon: "UserPlus", label: "Nowe leady", value: String(newLeads), delta: hotLeads > 0 ? `${hotLeads} gorace` : undefined, tone: hotLeads > 0 ? "danger" : "brand", route: "leads" },
        { icon: "UserRoundSearch", label: "Leady bez opiekuna", value: String(unassignedLeads), tone: unassignedLeads > 0 ? "warning" : "neutral", route: "leads" },
        { icon: "Building2", label: "Aktywni klienci", value: String(activeClients), tone: activeClients > 0 ? "success" : "neutral", route: "clients" },
        { icon: "SquareCheckBig", label: "Zadania otwarte", value: String(openTasks), tone: openTasks > 0 ? "warning" : "neutral", route: "tasks" },
        { icon: "TriangleAlert", label: "Zadania zalegle", value: String(overdueTasks), tone: overdueTasks > 0 ? "danger" : "neutral", route: "tasks" },
        { icon: "ShoppingCart", label: "Zamówienia", value: String(counts.orders), tone: "brand", route: "orders" },
        { icon: "CreditCard", label: "Płatności", value: String(counts.payments), tone: failedPayments > 0 ? "danger" : "neutral", route: "payments" },
        { icon: "ReceiptText", label: "Faktury", value: String(counts.invoices), tone: "neutral", route: "invoices" },
        { icon: "FileText", label: "Dokumenty", value: String(counts.generatedDocuments), tone: "success", route: "documents" },
        { icon: "Clock3", label: "Joby aktywne", value: String(activeJobs), tone: activeJobs > 0 ? "warning" : "neutral", route: "document-jobs" },
        { icon: "TriangleAlert", label: "Joby z błędem", value: String(failedJobs), tone: failedJobs > 0 ? "danger" : "neutral", route: "document-jobs" },
        { icon: "Activity", label: "Logi audytu", value: String(counts.auditLogs), tone: "neutral", route: "admin" },
      ],
      revenueBars: [
        ["Leady", percentWidth(leads.length, counts.formSubmissions || leads.length)],
        ["Dokumenty", percentWidth(counts.generatedDocuments, counts.templates || counts.generatedDocuments)],
        ["Szablony aktywne", percentWidth(activeTemplates, counts.templates || activeTemplates)],
        ["Joby zakończone", percentWidth(jobs.filter((job) => job.status === "COMPLETED").length, counts.generationJobs || 1)],
        ["Audyt", percentWidth(counts.auditLogs, Math.max(counts.auditLogs, counts.formSubmissions, 1))],
      ],
      todos: [
        ...(failedJobs > 0
          ? [{ due: "teraz", tag: "Dokumenty", title: "Sprawdź joby generowania z błędem", tone: "danger" as Tone }]
          : []),
        ...(activeJobs > 0
          ? [{ due: "dziś", tag: "Dokumenty", title: "Dokończ aktywne joby generowania dokumentów", tone: "warning" as Tone }]
          : []),
        ...(hotLeads > 0
          ? [{ due: "dziś", tag: "Sprzedaż", title: "Skontaktuj się z gorącymi leadami IOD", tone: "danger" as Tone }]
          : []),
      ],
    },
    generatedAt: new Date().toISOString(),
    lists,
    modules,
  };

  async function getCounts() {
    const [
      organizationsCount,
      clientProfiles,
      leadsCount,
      contactPersonsCount,
      crmTasksCount,
      usersCount,
      productsCount,
      ordersCount,
      paymentsCount,
      invoicesCount,
      templatesCount,
      generationJobs,
      generatedDocumentsCount,
      documentInputsCount,
      documentFilesCount,
      documentDownloadsCount,
      formSubmissionsCount,
      auditLogsCount,
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.clientProfile.count(),
      prisma.lead.count(),
      prisma.contactPerson.count(),
      prisma.crmTask.count(),
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.payment.count(),
      prisma.invoice.count(),
      prisma.documentTemplate.count(),
      prisma.documentGenerationJob.count(),
      prisma.generatedDocument.count(),
      prisma.documentInput.count(),
      prisma.generatedDocumentFile.count(),
      prisma.documentDownload.count(),
      prisma.formSubmission.count(),
      prisma.auditLog.count(),
    ]);

    return {
      auditLogs: auditLogsCount,
      clientProfiles,
      contactPersons: contactPersonsCount,
      crmTasks: crmTasksCount,
      leads: leadsCount,
      documentDownloads: documentDownloadsCount,
      documentFiles: documentFilesCount,
      documentInputs: documentInputsCount,
      formSubmissions: formSubmissionsCount,
      generatedDocuments: generatedDocumentsCount,
      generationJobs,
      invoices: invoicesCount,
      organizations: organizationsCount,
      orders: ordersCount,
      payments: paymentsCount,
      products: productsCount,
      templates: templatesCount,
      users: usersCount,
    };
  }
}

function makeModule(input: Omit<GenericModule, "filters"> & { filters?: GenericModule["filters"] }): GenericModule {
  return {
    ...input,
    filters: input.filters ?? defaultFilters,
  };
}

function makeEmptyModule(
  route: CrmRoute,
  icon: string,
  title: string,
  subtitle: string,
  action: string,
  columns: string[],
): GenericModule {
  return makeModule({
    action,
    columns,
    emptyMessage: subtitle,
    icon,
    kpis: [
      { icon, label: title, value: "0", tone: "neutral" },
      { icon: "Database", label: "Rekordy w bazie", value: "0", tone: "neutral" },
      { icon: "Plug", label: "Źródło danych", value: "Brak tabeli", tone: "warning" },
      { icon: "Clock3", label: "Aktywne", value: "0", tone: "neutral" },
    ],
    route,
    rows: [],
    subtitle,
    title,
  });
}

function emptyListModule(input: Omit<CrmListModule, "emptyMessage" | "kpis" | "rows"> & { emptyMessage?: string }): CrmListModule {
  return {
    ...input,
    emptyMessage: input.emptyMessage ?? input.subtitle,
    kpis: [
      { icon: input.icon, label: input.title, value: "0", tone: "neutral" },
      { icon: "Database", label: "Rekordy w bazie", value: "0", tone: "neutral" },
      { icon: "Plug", label: "Źródło danych", value: "Brak tabeli", tone: "warning" },
      { icon: "Clock3", label: "Aktywne", value: "0", tone: "neutral" },
    ],
    rows: [],
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pl-PL", {
    currency: "PLN",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function formatCompactCurrency(value: number) {
  if (value === 0) return "0 zł";
  if (value >= 100_000) return `${Math.round(value / 1000)}k zł`;
  return formatCurrency(value);
}

function formatCents(value: number, currency = "PLN") {
  return new Intl.NumberFormat("pl-PL", {
    currency,
    maximumFractionDigits: 2,
    style: "currency",
  }).format(value / 100);
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

function leadSourceLabel(source: string) {
  return {
    IOD_CHECKER: "Checker IOD",
    CONTACT_FORM: "Formularz kontaktowy",
    MANUAL: "Ręczny",
    WEBSITE: "Strona WWW",
    REFERRAL: "Polecenie",
    OTHER: "Inne",
  }[source] ?? source;
}

function leadStatusLabel(status: string) {
  return {
    NEW: "Nowy",
    TO_CONTACT: "Do kontaktu",
    CONTACTED: "Skontaktowano",
    QUALIFIED: "Zakwalifikowany",
    UNQUALIFIED: "Niezakwalifikowany",
    PROPOSAL_SENT: "Oferta wysłana",
    CONVERTED: "Przekonwertowany",
    WON: "Wygrany",
    LOST: "Utracony",
    ARCHIVED: "Archiwalny",
  }[status] ?? status;
}

function leadPriorityLabel(priority: string) {
  return {
    LOW: "Niski",
    NORMAL: "Standard",
    HIGH: "Wysoki",
    URGENT: "Pilny",
  }[priority] ?? priority;
}

function taskStatusLabel(status: CrmTaskStatus) {
  return {
    OPEN: "Otwarte",
    IN_PROGRESS: "W toku",
    DONE: "Zrobione",
    CANCELLED: "Anulowane",
  }[status];
}

function taskStatusTone(status: CrmTaskStatus, dueAt: Date | null): Tone {
  if (status === "DONE") return "success";
  if (status === "CANCELLED") return "neutral";
  if (dueAt && dueAt < new Date()) return "danger";
  if (status === "IN_PROGRESS") return "warning";
  return "brand";
}

function organizationStatusLabel(status: string) {
  return {
    PROSPECT: "Prospekt",
    ACTIVE: "Aktywna",
    INACTIVE: "Nieaktywna",
    ARCHIVED: "Archiwalna",
  }[status] ?? status;
}

function statusTone(label: string): Tone {
  const normalized = label.toLowerCase();
  if (normalized.includes("błąd") || normalized.includes("failed") || normalized.includes("zaleg") || normalized.includes("wysok") || normalized.includes("gorą")) return "danger";
  if (normalized.includes("oczek") || normalized.includes("trakcie") || normalized.includes("weryfik") || normalized.includes("szkic") || normalized.includes("processing")) return "warning";
  if (normalized.includes("akty") || normalized.includes("zako") || normalized.includes("wygener") || normalized.includes("dostar") || normalized.includes("completed") || normalized.includes("submitted")) return "success";
  return "brand";
}
