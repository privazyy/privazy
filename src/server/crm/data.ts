import "server-only";

import type { DocumentGenerationStatus, DocumentTemplateStatus, GeneratedDocumentStatus, UserRole } from "@prisma/client";

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
import { listIodCrmLeads } from "@/server/leads/iod";

const defaultFilters = ["Wszystkie", "Aktywne", "Pilne", "Moje", "Do akceptacji"].map((label) => ({ label }));

const ownerNames: Record<string, string> = {
  AK: "Anna Kowalczyk",
  JZ: "Joanna Zielińska",
  MW: "Marek Wójcik",
};

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

export async function getCrmDatabaseData(): Promise<CrmDatabaseData> {
  const prisma = getPrisma();

  const [
    leads,
    organizations,
    users,
    templates,
    jobs,
    generatedDocuments,
    formSubmissions,
    auditLogs,
    counts,
  ] = await Promise.all([
    listIodCrmLeads(100),
    prisma.organization.findMany({
      include: {
        _count: {
          select: {
            auditLogs: true,
            clientProfiles: true,
            formSubmissions: true,
            generatedDocuments: true,
            generationJobs: true,
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
        template: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.generatedDocument.findMany({
      include: {
        createdBy: true,
        organization: true,
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
      lead.source,
      lead.industry,
      lead.resultLabel,
      formatCurrency(lead.value),
      lead.stage,
      lead.hot ? "Gorący" : "Standard",
      ownerNames[lead.owner] ?? lead.owner,
      lead.lastActivity,
      "",
    ],
    primary: lead.company,
    secondary: `ID ${lead.id.slice(0, 8)}`,
    status: { label: lead.stage, tone: statusTone(lead.stage) },
    tag: { label: lead.hot ? "Gorący" : "Standard", tone: lead.hot ? "danger" : "neutral" },
  }));

  const clientRows: TableRow[] = organizations.map((organization) => {
    const hasActivity =
      organization._count.formSubmissions + organization._count.generatedDocuments + organization._count.generationJobs > 0;
    const status = hasActivity ? "Aktywny" : "Bez aktywności";

    return {
      actionRoute: "client-detail",
      cells: [
        organization.nip ?? "-",
        organization.email ?? "-",
        organization.phone ?? "-",
        String(organization._count.formSubmissions),
        String(organization._count.generatedDocuments),
        String(organization._count.generationJobs),
        status,
        "",
      ],
      primary: organization.name,
      secondary: [organization.city, organization.country].filter(Boolean).join(", ") || organization.id,
      status: { label: status, tone: hasActivity ? "success" : "neutral" },
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
        document.pdfFileKey ? "PDF" : "DOCX",
        "",
      ],
      primary: document.template.name,
      secondary: document.id,
      status: { label: status, tone: statusTone(status) },
    };
  });

  const orderRows: TableRow[] = jobs.map((job) => {
    const status = jobStatusLabels[job.status];

    return {
      cells: [
        job.organization.name,
        job.template.name,
        status,
        formatDate(job.createdAt),
        job.completedAt ? formatDate(job.completedAt) : "-",
        job.errorMessage ?? "-",
        "",
      ],
      primary: job.id,
      secondary: job.template.type,
      status: { label: status, tone: statusTone(status) },
      tag: job.errorMessage ? { label: "Wymaga uwagi", tone: "danger" } : undefined,
    };
  });

  const templateRows: TableRow[] = templates.map((template) => {
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
      secondary: template.fileKey,
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

  const activeJobs = jobs.filter((job) => job.status === "PENDING" || job.status === "PROCESSING").length;
  const failedJobs = jobs.filter((job) => job.status === "FAILED").length;
  const activeTemplates = templates.filter((template) => template.status === "ACTIVE").length;
  const hotLeads = leads.filter((lead) => lead.hot).length;
  const pipelineValue = leads.reduce((sum, lead) => sum + lead.value, 0);

  const lists: CrmDatabaseData["lists"] = {
    accounting: emptyListModule({
      action: "Wystaw fakturę",
      columns: ["Nr faktury", "Klient", "Zamówienie", "Netto", "VAT", "Brutto", "Status", "Termin", "Opłacono"],
      icon: "Wallet",
      title: "Księgowość",
      subtitle: "Brak tabel faktur i płatności w aktualnym schemacie Prisma.",
    }),
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
      columns: ["Klient", "NIP", "E-mail", "Telefon", "Formularze", "Dokumenty", "Joby", "Status", ""],
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
      columns: ["Dokument", "Klient", "Typ", "Status", "Wersja", "Utworzył", "Utworzono", "Plik", ""],
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
    leads: {
      action: "Dodaj lead",
      columns: ["Firma / kontakt", "Źródło", "Branża", "Wynik checkera", "Wartość", "Status", "Priorytet", "Opiekun", "Ostatnia aktywność", ""],
      emptyMessage: "Brak leadów IOD z formularza w bazie danych.",
      icon: "UserPlus",
      kpis: [
        { icon: "UserPlus", label: "Leady IOD", value: String(leads.length), tone: "brand" },
        { icon: "Flame", label: "Gorące leady", value: String(hotLeads), tone: hotLeads > 0 ? "danger" : "neutral" },
        { icon: "Wallet", label: "Wartość pipeline", value: formatCompactCurrency(pipelineValue), tone: pipelineValue > 0 ? "success" : "neutral" },
        { icon: "Building2", label: "Firmy w CRM", value: String(counts.organizations), tone: "brand" },
      ],
      rows: leadRows,
      subtitle: "Leady pochodzą z tabeli FormSubmission dla formularza checkera IOD.",
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
      columns: ["Job", "Klient", "Szablon", "Status", "Utworzono", "Zakończono", "Błąd", ""],
      emptyMessage: "Brak jobów generowania dokumentów w bazie danych.",
      icon: "ShoppingCart",
      kpis: [
        { icon: "ShoppingCart", label: "Joby generowania", value: String(counts.generationJobs), tone: "brand" },
        { icon: "Clock3", label: "Aktywne", value: String(activeJobs), tone: activeJobs > 0 ? "warning" : "neutral" },
        { icon: "BadgeCheck", label: "Zakończone", value: String(jobs.filter((job) => job.status === "COMPLETED").length), tone: "success" },
        { icon: "TriangleAlert", label: "Błędy", value: String(failedJobs), tone: failedJobs > 0 ? "danger" : "neutral" },
      ],
      route: "orders",
      rows: orderRows,
      subtitle: "Zamówienia operacyjne odpowiadają jobom generowania dokumentów.",
      title: "Zamówienia",
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
    tasks: makeEmptyModule("tasks", "SquareCheckBig", "Zadania", "W aktualnym schemacie nie ma jeszcze tabel zadań operacyjnych.", "Utwórz zadanie", [
      "Zadanie",
      "Status",
      "Właściciel",
      "Termin",
      "",
    ]),
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
        ["Formularze", String(counts.formSubmissions), percentWidth(counts.formSubmissions, counts.organizations || counts.formSubmissions)],
        ["Leady IOD", String(leads.length), percentWidth(leads.length, counts.formSubmissions || leads.length)],
        ["Joby dokumentów", String(counts.generationJobs), percentWidth(counts.generationJobs, counts.formSubmissions || counts.generationJobs)],
        ["Dokumenty", String(counts.generatedDocuments), percentWidth(counts.generatedDocuments, counts.generationJobs || counts.generatedDocuments)],
      ],
      kpis: [
        { icon: "UserPlus", label: "Leady IOD", value: String(leads.length), delta: hotLeads > 0 ? `${hotLeads} gorące` : undefined, tone: hotLeads > 0 ? "danger" : "brand", route: "leads" },
        { icon: "Building2", label: "Organizacje", value: String(counts.organizations), tone: "brand", route: "clients" },
        { icon: "FileText", label: "Dokumenty", value: String(counts.generatedDocuments), tone: "success", route: "documents" },
        { icon: "Clock3", label: "Joby aktywne", value: String(activeJobs), tone: activeJobs > 0 ? "warning" : "neutral", route: "orders" },
        { icon: "TriangleAlert", label: "Joby z błędem", value: String(failedJobs), tone: failedJobs > 0 ? "danger" : "neutral", route: "documents" },
        { icon: "Tag", label: "Szablony", value: String(counts.templates), tone: "brand", route: "products" },
        { icon: "Users", label: "Użytkownicy", value: String(counts.users), tone: "neutral", route: "employees" },
        { icon: "Activity", label: "Logi audytu", value: String(counts.auditLogs), tone: "neutral", route: "admin" },
        { icon: "Wallet", label: "Pipeline leadów", value: formatCompactCurrency(pipelineValue), tone: pipelineValue > 0 ? "success" : "neutral", route: "sales" },
        { icon: "FileInput", label: "Formularze", value: String(counts.formSubmissions), tone: "brand", route: "traffic" },
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
      usersCount,
      templatesCount,
      generationJobs,
      generatedDocumentsCount,
      formSubmissionsCount,
      auditLogsCount,
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.clientProfile.count(),
      prisma.user.count(),
      prisma.documentTemplate.count(),
      prisma.documentGenerationJob.count(),
      prisma.generatedDocument.count(),
      prisma.formSubmission.count(),
      prisma.auditLog.count(),
    ]);

    return {
      auditLogs: auditLogsCount,
      clientProfiles,
      formSubmissions: formSubmissionsCount,
      generatedDocuments: generatedDocumentsCount,
      generationJobs,
      organizations: organizationsCount,
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

function statusTone(label: string): Tone {
  const normalized = label.toLowerCase();
  if (normalized.includes("błąd") || normalized.includes("failed") || normalized.includes("zaleg") || normalized.includes("wysok") || normalized.includes("gorą")) return "danger";
  if (normalized.includes("oczek") || normalized.includes("trakcie") || normalized.includes("weryfik") || normalized.includes("szkic") || normalized.includes("processing")) return "warning";
  if (normalized.includes("akty") || normalized.includes("zako") || normalized.includes("wygener") || normalized.includes("dostar") || normalized.includes("completed") || normalized.includes("submitted")) return "success";
  return "brand";
}
