export type CrmRoute =
  | "dashboard"
  | "traffic"
  | "leads"
  | "lead-detail"
  | "sales"
  | "clients"
  | "client-detail"
  | "orgs"
  | "orders"
  | "documents"
  | "doc-review"
  | "packages"
  | "products"
  | "product-editor"
  | "outsourcing"
  | "outsourcing-detail"
  | "breaches"
  | "breach-detail"
  | "requests"
  | "request-detail"
  | "inbox"
  | "tasks"
  | "calendar"
  | "reports"
  | "accounting"
  | "blog"
  | "blog-editor"
  | "newsletter"
  | "employees"
  | "platform"
  | "automations"
  | "settings"
  | "admin";

export type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "outline";

export type NavItem = {
  badge?: string;
  icon: string;
  label: string;
  route: CrmRoute;
};

export type NavGroup = {
  items: NavItem[];
  label?: string;
};

export type Kpi = {
  delta?: string;
  icon: string;
  label: string;
  route?: CrmRoute;
  tone: Tone;
  value: string;
};

export type Status = {
  label: string;
  tone: Tone;
};

export type Filter = {
  label: string;
};

export type TableRow = {
  actionRoute?: CrmRoute;
  avatar?: string;
  cells: string[];
  meta?: string;
  primary: string;
  secondary?: string;
  status?: Status;
  tag?: Status;
};

export type GenericModule = {
  action: string;
  columns: string[];
  emptyMessage?: string;
  filters: Filter[];
  icon: string;
  kpis: Kpi[];
  route: CrmRoute;
  rows: TableRow[];
  subtitle: string;
  title: string;
};

export type CrmDashboardAlert = {
  icon: string;
  route: CrmRoute;
  subtitle: string;
  tag: string;
  title: string;
  tone: Tone;
};

export type CrmActivityItem = {
  icon: string;
  subtitle: string;
  title: string;
  tone: Tone;
  when: string;
};

export type CrmTodoItem = {
  due: string;
  tag: string;
  title: string;
  tone: Tone;
};

export type CrmListModule = {
  action: string;
  columns: string[];
  emptyMessage: string;
  icon: string;
  kpis?: Kpi[];
  rows: TableRow[];
  subtitle: string;
  title: string;
};

export type CrmDashboardData = {
  activity: CrmActivityItem[];
  alerts: CrmDashboardAlert[];
  funnel: [string, string, string][];
  kpis: Kpi[];
  revenueBars: [string, string][];
  todos: CrmTodoItem[];
};

export type CrmDatabaseData = {
  dashboard: CrmDashboardData;
  generatedAt: string;
  lists: {
    accounting: CrmListModule;
    blog: CrmListModule;
    breaches: CrmListModule;
    clients: CrmListModule;
    documents: CrmListModule;
    leads: CrmListModule;
    newsletter: CrmListModule;
    outsourcing: CrmListModule;
    platform: CrmListModule;
    products: CrmListModule;
    requests: CrmListModule;
  };
  modules: Partial<Record<CrmRoute, GenericModule>>;
};

export const navGroups: NavGroup[] = [
  {
    items: [{ route: "dashboard", label: "Dashboard", icon: "LayoutDashboard" }],
  },
  {
    label: "Pozyskiwanie",
    items: [
      { route: "traffic", label: "Ruch i marketing", icon: "LineChart" },
      { route: "leads", label: "Leady", icon: "UserPlus", badge: "12" },
      { route: "sales", label: "Sprzedaż", icon: "TrendingUp" },
    ],
  },
  {
    label: "Klienci i sprawy",
    items: [
      { route: "clients", label: "Klienci", icon: "Building2" },
      { route: "orgs", label: "Organizacje", icon: "Network" },
      { route: "orders", label: "Zamówienia", icon: "ShoppingCart" },
      { route: "documents", label: "Dokumenty", icon: "FileText", badge: "8" },
      { route: "packages", label: "Pakiety RODO", icon: "Package" },
      { route: "products", label: "Produkty / sklep", icon: "Tag" },
      { route: "outsourcing", label: "Outsourcing IOD", icon: "ShieldCheck" },
      { route: "breaches", label: "Naruszenia", icon: "TriangleAlert", badge: "3" },
      { route: "requests", label: "Żądania osób", icon: "UserCog", badge: "5" },
    ],
  },
  {
    label: "Komunikacja",
    items: [
      { route: "inbox", label: "Skrzynka", icon: "Inbox", badge: "9" },
      { route: "tasks", label: "Zadania", icon: "SquareCheckBig" },
      { route: "calendar", label: "Kalendarz", icon: "CalendarDays" },
    ],
  },
  {
    label: "Analiza i finanse",
    items: [
      { route: "reports", label: "Raporty", icon: "ChartColumn" },
      { route: "accounting", label: "Księgowość", icon: "Wallet" },
    ],
  },
  {
    label: "Treści i marketing",
    items: [
      { route: "blog", label: "Baza wiedzy / Blog", icon: "Newspaper" },
      { route: "newsletter", label: "Newsletter", icon: "Mail" },
    ],
  },
  {
    label: "Zespół i system",
    items: [
      { route: "employees", label: "Pracownicy", icon: "Users" },
      { route: "platform", label: "Platforma klienta", icon: "MonitorSmartphone" },
      { route: "automations", label: "Automatyzacje", icon: "Workflow" },
      { route: "settings", label: "Ustawienia", icon: "Settings" },
      { route: "admin", label: "Administracja", icon: "ShieldHalf" },
    ],
  },
];

export const routeAliases: Partial<Record<CrmRoute, CrmRoute>> = {
  "lead-detail": "leads",
  "client-detail": "clients",
  "doc-review": "documents",
  "breach-detail": "breaches",
  "request-detail": "requests",
  "outsourcing-detail": "outsourcing",
  "product-editor": "products",
};

export const dashboardKpis: Kpi[] = [
  { icon: "UserPlus", label: "Nowe leady dziś", value: "12", delta: "+4", tone: "brand", route: "leads" },
  { icon: "PhoneCall", label: "Leady do kontaktu", value: "8", delta: "3 pilne", tone: "warning", route: "leads" },
  { icon: "ShoppingCart", label: "Zamówienia w toku", value: "22", tone: "brand", route: "orders" },
  { icon: "FileSearch", label: "Dokumenty do sprawdzenia", value: "8", delta: "2 > 48h", tone: "danger", route: "documents" },
  { icon: "TriangleAlert", label: "Aktywne naruszenia", value: "3", delta: "1 krytyczne", tone: "danger", route: "breaches" },
  { icon: "Timer", label: "Naruszenia - termin 72h", value: "1", delta: "za 4h", tone: "danger", route: "breaches" },
  { icon: "UserCog", label: "Żądania osób w toku", value: "5", tone: "brand", route: "requests" },
  { icon: "Wallet", label: "Przychód miesięczny", value: "142,8k", delta: "+18%", tone: "success", route: "accounting" },
  { icon: "ShieldCheck", label: "Aktywne abonamenty IOD", value: "19", delta: "+2", tone: "success", route: "outsourcing" },
  { icon: "ListTodo", label: "Zaległe zadania", value: "4", delta: "pilne", tone: "warning", route: "tasks" },
];

export const dashboardAlerts = [
  {
    icon: "TriangleAlert",
    route: "breach-detail" as CrmRoute,
    tag: "72h",
    tone: "danger" as Tone,
    title: "Naruszenie NAR-2024-038 - termin 72h za 4 godz.",
    subtitle: "MedCare Sp. z o.o. - ryzyko wysokie - IOD: K. Lis",
  },
  {
    icon: "UserCog",
    route: "request-detail" as CrmRoute,
    tag: "2 dni",
    tone: "warning" as Tone,
    title: "Żądanie usunięcia danych - termin za 2 dni",
    subtitle: "ZAD-2024-112 - ShopFast - brak weryfikacji tożsamości",
  },
  {
    icon: "PhoneMissed",
    route: "leads" as CrmRoute,
    tag: ">24h",
    tone: "warning" as Tone,
    title: "4 leady bez kontaktu ponad 24h",
    subtitle: "w tym 2 gorące leady po checkerze",
  },
  {
    icon: "FileClock",
    route: "documents" as CrmRoute,
    tag: ">48h",
    tone: "brand" as Tone,
    title: "2 dokumenty czekają na sprawdzenie > 48h",
    subtitle: "ZAM-2415 ShopFast - DPIA",
  },
  {
    icon: "CreditCard",
    route: "accounting" as CrmRoute,
    tag: "Zaległa",
    tone: "danger" as Tone,
    title: "Płatność zaległa - FV/2024/0418",
    subtitle: "OdszkodowaniaPL - 2 460 zł - 9 dni po terminie",
  },
];

export const funnel = [
  ["Wejścia na stronę", "24 180", "100%"],
  ["Uruchomienia checkera", "5 920", "58%"],
  ["Ukończenia checkera", "3 410", "42%"],
  ["Leady", "918", "30%"],
  ["Konsultacje", "342", "20%"],
  ["Zamówienia", "186", "13%"],
  ["Płatności", "164", "10%"],
];

export const revenueBars = [
  ["Pakiety", "100%"],
  ["Dokumenty", "82%"],
  ["Outsourcing IOD", "64%"],
  ["Konsultacje", "38%"],
  ["Szkolenia", "22%"],
  ["Inne", "14%"],
];

export const dashboardTodos = [
  ["Zatwierdź dokument DPIA - ShopFast", "Dokument", "do 12:00", "brand"],
  ["Kontakt z leadem MedCare", "Sprzedaż", "do 14:00", "success"],
  ["Ocena ryzyka - naruszenie NAR-2024-038", "Naruszenie", "pilne - 16:40", "danger"],
  ["Konsultacja IOD - Przedszkole Tęcza", "Konsultacja", "13:00", "brand"],
  ["Wyślij raport miesięczny IOD - Grupa Wręga", "Outsourcing", "do 17:00", "warning"],
] satisfies [string, string, string, Tone][];

export const dashboardActivity = [
  ["Checker IOD", "utworzył nowy lead - TechSoft", "2 min temu", "UserPlus", "brand"],
  ["ShopFast", "przesłał dane do zamówienia ZAM-2415", "18 min temu", "FileUp", "brand"],
  ["Platforma klienta", "utworzyła zgłoszenie naruszenia od MedCare", "34 min temu", "TriangleAlert", "danger"],
  ["D. Wójcik", "oznaczył dokument jako gotowy", "1 godz. temu", "FileCheck", "success"],
  ["Płatność", "FV/2024/0421 opłacona", "2 godz. temu", "CreditCard", "success"],
] satisfies [string, string, string, string, Tone][];

export const genericModules: Record<string, GenericModule> = {
  traffic: {
    route: "traffic",
    icon: "LineChart",
    title: "Ruch i marketing",
    subtitle: "Źródła ruchu, konwersje z checkera i bloga, koszt leada oraz ROAS kampanii.",
    action: "Nowa kampania",
    kpis: [
      { icon: "Users", label: "Użytkownicy 30 dni", value: "24 180", delta: "+12%", tone: "success" },
      { icon: "Target", label: "Konwersja na lead", value: "3,8%", delta: "+0,4 pp", tone: "success" },
      { icon: "Wallet", label: "Koszt leada", value: "38 zł", delta: "-6%", tone: "success" },
      { icon: "TrendingUp", label: "ROAS", value: "412%", delta: "+22%", tone: "success" },
    ],
    filters: ["Wszystkie źródła", "Google Ads", "SEO", "Blog", "Social", "Remarketing"].map((label) => ({ label })),
    columns: ["Źródło / kampania", "Użytkownicy", "Leady", "Status", "Konwersja", ""],
    rows: [
      { primary: "Google Ads - IOD", secondary: "Search - CPC", cells: ["6 240", "142", "ROAS 380%", "2,3%", ""], status: { label: "Aktywna", tone: "success" } },
      { primary: "SEO - organiczne", secondary: "Organic", cells: ["9 870", "198", "ROAS 720%", "2,0%", ""], status: { label: "Aktywna", tone: "success" } },
      { primary: "Blog - poradniki", secondary: "Content", cells: ["4 120", "96", "ROAS 510%", "2,3%", ""], status: { label: "Aktywna", tone: "success" } },
      { primary: "Remarketing", secondary: "Display", cells: ["1 980", "34", "ROAS 290%", "1,7%", ""], status: { label: "Optymalizacja", tone: "warning" } },
      { primary: "Social - LinkedIn", secondary: "Paid social", cells: ["1 970", "21", "ROAS 140%", "1,1%", ""], status: { label: "Do poprawy", tone: "danger" } },
    ],
  },
  sales: {
    route: "sales",
    icon: "TrendingUp",
    title: "Sprzedaż",
    subtitle: "Pipeline ofert i szans sprzedaży - od kontaktu po podpisaną umowę.",
    action: "Nowa oferta",
    kpis: [
      { icon: "TrendingUp", label: "Wartość pipeline", value: "318 400 zł", delta: "+24%", tone: "success" },
      { icon: "Send", label: "Oferty wysłane", value: "27", tone: "neutral" },
      { icon: "Target", label: "Konwersja lead-klient", value: "22%", delta: "+3 pp", tone: "success" },
      { icon: "ShoppingCart", label: "Śr. wartość zamówienia", value: "2 340 zł", tone: "neutral" },
    ],
    filters: ["Wszystkie", "Moje", "Negocjacje", "Oferta wysłana", "Wygrane"].map((label) => ({ label })),
    columns: ["Szansa / klient", "Wartość", "Opiekun", "Status", "Priorytet", ""],
    rows: [
      { primary: "MedCare Sp. z o.o.", secondary: "Pakiet Pro + IOD", cells: ["12 900 zł", "M. Nowak", "Negocjacje", "Wysoki", ""], status: { label: "Negocjacje", tone: "brand" }, tag: { label: "Wysoki", tone: "warning" } },
      { primary: "Przedszkole Tęcza", secondary: "Pakiet Standard", cells: ["2 400 zł", "K. Lis", "Oferta wysłana", "Średni", ""], status: { label: "Oferta wysłana", tone: "brand" }, tag: { label: "Średni", tone: "brand" } },
      { primary: "ShopFast e-commerce", secondary: "Pakiet Pro", cells: ["4 900 zł", "M. Nowak", "Kwalifikacja", "Wysoki", ""], status: { label: "Kwalifikacja", tone: "warning" }, tag: { label: "Wysoki", tone: "warning" } },
      { primary: "Kancelaria Wręga", secondary: "Outsourcing IOD", cells: ["1 500 zł / mc", "K. Lis", "Wygrana", "-", ""], status: { label: "Wygrana", tone: "success" } },
    ],
  },
  orgs: {
    route: "orgs",
    icon: "Network",
    title: "Organizacje",
    subtitle: "Struktury klientów wielooddziałowych - sieci, oddziały i lokalizacje.",
    action: "Dodaj organizację",
    kpis: [
      { icon: "Network", label: "Organizacje", value: "34", tone: "neutral" },
      { icon: "MapPin", label: "Oddziały", value: "118", tone: "neutral" },
      { icon: "TriangleAlert", label: "Z aktywnymi sprawami", value: "9", delta: "3 pilne", tone: "warning" },
      { icon: "FileText", label: "Śr. dokumentów", value: "11", tone: "neutral" },
    ],
    filters: ["Wszystkie", "Sieci medyczne", "Edukacja", "Oddziały", "Kancelarie"].map((label) => ({ label })),
    columns: ["Organizacja", "Jednostki", "Opiekun", "Status", "Sprawy", ""],
    rows: [
      { primary: "MedCare Group", secondary: "Sieć placówek", cells: ["14 placówek", "M. Nowak", "Aktywna", "2 incydenty", ""], status: { label: "Aktywna", tone: "success" }, tag: { label: "2 incydenty", tone: "danger" } },
      { primary: "Tęcza - przedszkola", secondary: "Edukacja", cells: ["6 placówek", "K. Lis", "Onboarding", "-", ""], status: { label: "Onboarding", tone: "brand" } },
      { primary: "Grupa Wręga", secondary: "Kancelaria", cells: ["3 biura", "K. Lis", "Aktywna", "-", ""], status: { label: "Aktywna", tone: "success" } },
      { primary: "OdszkodowaniaPL", secondary: "Sieć agentów", cells: ["22 agentów", "M. Nowak", "Aktywna", "1 żądanie", ""], status: { label: "Aktywna", tone: "success" }, tag: { label: "1 żądanie", tone: "brand" } },
    ],
  },
  orders: {
    route: "orders",
    icon: "ShoppingCart",
    title: "Zamówienia",
    subtitle: "Zamówienia dokumentów i usług - realizacja, płatność i termin 48h.",
    action: "Nowe zamówienie",
    kpis: [
      { icon: "ShoppingCart", label: "Nowe zamówienia", value: "14", delta: "+5", tone: "success" },
      { icon: "Clock3", label: "W realizacji", value: "22", tone: "brand" },
      { icon: "FileQuestion", label: "Czeka na dane", value: "7", tone: "warning" },
      { icon: "TriangleAlert", label: "Przekroczone 48h", value: "2", delta: "pilne", tone: "danger" },
    ],
    filters: ["Wszystkie", "Opłacone", "Czeka na dane", "Do wysyłki", "Przekroczone 48h"].map((label) => ({ label })),
    columns: ["Zamówienie", "Kwota", "Opiekun", "Status realizacji", "48h", ""],
    rows: [
      { primary: "ZAM-2418 - MedCare", secondary: "Pakiet Pro", cells: ["4 900 zł", "D. Wójcik", "W sprawdzaniu", "12h", ""], status: { label: "W sprawdzaniu", tone: "brand" }, tag: { label: "12h", tone: "success" } },
      { primary: "ZAM-2417 - Tęcza", secondary: "Pakiet Standard", cells: ["2 400 zł", "D. Wójcik", "Czeka na dane", "-", ""], status: { label: "Czeka na dane", tone: "warning" } },
      { primary: "ZAM-2415 - ShopFast", secondary: "DPIA + RCPD", cells: ["1 200 zł", "A. Zięba", "Do poprawy", "-3h", ""], status: { label: "Do poprawy", tone: "danger" }, tag: { label: "-3h", tone: "danger" } },
      { primary: "ZAM-2412 - Wręga", secondary: "Umowa powierzenia", cells: ["390 zł", "A. Zięba", "Do wysyłki", "28h", ""], status: { label: "Do wysyłki", tone: "brand" }, tag: { label: "28h", tone: "success" } },
    ],
  },
  packages: {
    route: "packages",
    icon: "Package",
    title: "Pakiety RODO",
    subtitle: "Konfiguracja pakietów Mikro, Standard, Pro i pakietów branżowych.",
    action: "Nowy pakiet",
    kpis: [
      { icon: "Package", label: "Aktywne pakiety", value: "7", tone: "neutral" },
      { icon: "ShoppingCart", label: "Sprzedane (mies.)", value: "86", delta: "+14", tone: "success" },
      { icon: "Wallet", label: "Przychód z pakietów", value: "198 400 zł", delta: "+18%", tone: "success" },
      { icon: "Target", label: "Konwersja w sklepie", value: "4,1%", delta: "+0,3 pp", tone: "success" },
    ],
    filters: ["Wszystkie", "Aktywne", "Robocze", "Branżowe", "Ukryte"].map((label) => ({ label })),
    columns: ["Pakiet", "Cena", "Czas realizacji", "Status", "Sprzedaż", ""],
    rows: [
      { primary: "Pakiet Mikro", secondary: "6 dokumentów", cells: ["990 zł", "3 dni", "Aktywny", "38 szt.", ""], status: { label: "Aktywny", tone: "success" } },
      { primary: "Pakiet Standard", secondary: "11 dokumentów", cells: ["2 400 zł", "5 dni", "Aktywny", "31 szt.", ""], status: { label: "Aktywny", tone: "success" } },
      { primary: "Pakiet Pro", secondary: "18 dokumentów + IOD", cells: ["4 900 zł", "7 dni", "Aktywny", "17 szt.", ""], status: { label: "Aktywny", tone: "success" } },
      { primary: "Pakiet Edukacja", secondary: "13 dokumentów", cells: ["2 100 zł", "5 dni", "Roboczy", "-", ""], status: { label: "Roboczy", tone: "warning" } },
    ],
  },
  calendar: {
    route: "calendar",
    icon: "CalendarDays",
    title: "Kalendarz",
    subtitle: "Terminy 72h, żądania osób, konsultacje, audyty, follow-upy i spotkania.",
    action: "Nowe wydarzenie",
    kpis: [
      { icon: "CalendarDays", label: "Dziś", value: "7 wydarzeń", tone: "neutral" },
      { icon: "Timer", label: "Terminy 72h", value: "2", delta: "pilne", tone: "danger" },
      { icon: "Headphones", label: "Konsultacje", value: "9", tone: "brand" },
      { icon: "PhoneCall", label: "Follow-upy leadów", value: "14", tone: "warning" },
    ],
    filters: ["Wszystkie", "Sprzedaż", "Naruszenia", "Żądania", "Outsourcing", "Wewnętrzne"].map((label) => ({ label })),
    columns: ["Wydarzenie", "Data / godzina", "Powiązanie", "Status", "Kategoria", ""],
    rows: [
      { primary: "Termin 72h - NAR-2024-038", secondary: "Naruszenie", cells: ["Dziś, 16:40", "MedCare", "Pilne", "Naruszenie", ""], status: { label: "Pilne", tone: "danger" }, actionRoute: "breach-detail" },
      { primary: "Konsultacja IOD - Tęcza", secondary: "Konsultacja", cells: ["Dziś, 13:00", "Przedszkole Tęcza", "Potwierdzone", "Outsourcing", ""], status: { label: "Potwierdzone", tone: "success" } },
      { primary: "Follow-up - ShopFast", secondary: "Sprzedaż", cells: ["Jutro, 10:30", "Lead #4821", "Zaplanowane", "Sprzedaż", ""], status: { label: "Zaplanowane", tone: "brand" } },
      { primary: "Audyt - Grupa Wręga", secondary: "Audyt", cells: ["01.07, 09:00", "Kancelaria Wręga", "Zaplanowane", "Wewnętrzne", ""], status: { label: "Zaplanowane", tone: "brand" } },
    ],
  },
  reports: {
    route: "reports",
    icon: "ChartColumn",
    title: "Raporty",
    subtitle: "Raporty zarządcze: sprzedaż, marketing, dokumenty, SLA, finanse i retencja.",
    action: "Nowy raport",
    kpis: [
      { icon: "FileText", label: "Raporty zapisane", value: "18", tone: "neutral" },
      { icon: "Send", label: "Zaplanowane wysyłki", value: "5", tone: "neutral" },
      { icon: "Gauge", label: "SLA dotrzymane", value: "94%", delta: "+2 pp", tone: "success" },
      { icon: "RefreshCw", label: "Retencja klientów", value: "91%", delta: "+1 pp", tone: "success" },
    ],
    filters: ["Wszystkie", "Sprzedaż", "Marketing", "Dokumenty", "Finanse", "SLA"].map((label) => ({ label })),
    columns: ["Raport", "Ostatnie wygenerowanie", "Autor", "Status", "Format", ""],
    rows: [
      { primary: "Sprzedaż - miesięczny", secondary: "01-28.06", cells: ["Wczoraj, 18:00", "System", "Gotowy", "PDF", ""], status: { label: "Gotowy", tone: "success" } },
      { primary: "SLA - naruszenia i żądania", secondary: "Czerwiec", cells: ["Dziś, 08:00", "System", "Gotowy", "CSV", ""], status: { label: "Gotowy", tone: "success" } },
      { primary: "Finanse - MRR i przychód", secondary: "Q2 2024", cells: ["27.06", "A. Kowalczyk", "Gotowy", "PDF", ""], status: { label: "Gotowy", tone: "success" } },
      { primary: "Marketing - kanały", secondary: "Czerwiec", cells: ["-", "-", "W kolejce", "-", ""], status: { label: "W kolejce", tone: "warning" } },
    ],
  },
  employees: {
    route: "employees",
    icon: "Users",
    title: "Pracownicy",
    subtitle: "Zespół PRIVAZY - obłożenie, role, przypisani klienci i uprawnienia.",
    action: "Zaproś pracownika",
    kpis: [
      { icon: "Users", label: "Aktywni", value: "14", tone: "neutral" },
      { icon: "Gauge", label: "Śr. obłożenie", value: "78%", tone: "warning" },
      { icon: "Mail", label: "Zaproszeni", value: "2", tone: "brand" },
      { icon: "ShieldCheck", label: "Role", value: "9", tone: "neutral" },
    ],
    filters: ["Wszyscy", "IOD", "Sprzedaż", "Dokumenty", "Księgowość", "Marketing"].map((label) => ({ label })),
    columns: ["Pracownik", "Aktywne zadania", "Przypisani klienci", "Status", "Obłożenie", ""],
    rows: [
      { primary: "Marek Nowak", secondary: "Sales", cells: ["12 zadań", "9 klientów", "Aktywny", "86%", ""], status: { label: "Aktywny", tone: "success" }, tag: { label: "86%", tone: "warning" } },
      { primary: "Katarzyna Lis", secondary: "IOD / DPO", cells: ["18 zadań", "14 klientów", "Aktywny", "92%", ""], status: { label: "Aktywny", tone: "success" }, tag: { label: "92%", tone: "danger" } },
      { primary: "Dawid Wójcik", secondary: "Document Specialist", cells: ["9 zadań", "-", "Aktywny", "64%", ""], status: { label: "Aktywny", tone: "success" } },
      { primary: "Aleksandra Zięba", secondary: "Document Specialist", cells: ["11 zadań", "-", "Aktywny", "71%", ""], status: { label: "Aktywny", tone: "success" } },
    ],
  },
  admin: {
    route: "admin",
    icon: "ShieldHalf",
    title: "Administracja systemu",
    subtitle: "Bezpieczeństwo, sesje, integracje, logi audytowe i retencja danych.",
    action: "Log audytowy",
    kpis: [
      { icon: "Monitor", label: "Aktywne sesje", value: "11", tone: "neutral" },
      { icon: "LogIn", label: "Logowania 24h", value: "38", tone: "brand" },
      { icon: "Download", label: "Eksporty danych", value: "7", tone: "warning" },
      { icon: "Plug", label: "Integracje aktywne", value: "6", tone: "success" },
    ],
    filters: ["Logi audytowe", "Logowania", "Eksporty", "Dostęp do danych", "Integracje"].map((label) => ({ label })),
    columns: ["Zdarzenie", "Moduł", "Czas", "Status", "IP", ""],
    rows: [
      { primary: "Eksport listy klientów", secondary: "A. Kowalczyk", cells: ["Klienci", "Dziś, 09:12", "OK", "10.0.4.18", ""], status: { label: "OK", tone: "success" } },
      { primary: "Logowanie", secondary: "K. Lis", cells: ["System", "Dziś, 08:40", "OK", "10.0.4.22", ""], status: { label: "OK", tone: "success" } },
      { primary: "Pobranie dokumentu", secondary: "D. Wójcik", cells: ["Dokumenty", "Wczoraj, 16:30", "OK", "10.0.4.31", ""], status: { label: "OK", tone: "success" } },
      { primary: "Zmiana uprawnień", secondary: "A. Kowalczyk", cells: ["Administracja", "Wczoraj, 11:05", "Wrażliwe", "10.0.4.18", ""], status: { label: "Wrażliwe", tone: "warning" } },
    ],
  },
};

export const leadRows = [
  ["TechSoft Sp. z o.o.", "Marcin Dąbek", "Checker IOD", "IT / SaaS", "IOD wymagany", "12 900 zł", "Nowy", "Wysoki", "-", "Dziś 16:00", "lead-detail"],
  ["ShopFast e-commerce", "Anna Lewandowska", "Koszyk porzucony", "E-commerce", "IOD niewymagany", "4 900 zł", "Do kontaktu", "Wysoki", "M. Nowak", "Dziś 14:00", "lead-detail"],
  ["Przychodnia ZdrowieMed", "dr Paweł Górski", "Checker IOD", "Placówka medyczna", "IOD wymagany", "3 200 zł", "Zakwalifikowany", "Krytyczny", "K. Lis", "Jutro 10:00", "lead-detail"],
  ["Przedszkole Tęcza", "Beata Kowal", "Formularz outsourcingu", "Edukacja", "IOD wymagany", "1 500 zł / mc", "Oferta wysłana", "Średni", "K. Lis", "02.07", "lead-detail"],
  ["Kancelaria Wręga", "mec. Jan Wręga", "Polecenie", "Kancelaria", "IOD niewymagany", "8 200 zł", "Decyzja", "Wysoki", "M. Nowak", "Dziś 12:00", "lead-detail"],
  ["LogiTrans", "Ewa Maj", "Google Ads", "Transport", "IOD niewymagany", "990 zł", "Skontaktowano", "Niski", "M. Nowak", "03.07", "lead-detail"],
] satisfies [string, string, string, string, string, string, string, string, string, string, CrmRoute][];

export const clientsRows = [
  ["MedCare Sp. z o.o.", "5213004567", "Placówka medyczna", "Aktywny", "K. Lis", "18", "2 incydenty", "Pro IOD", "client-detail"],
  ["ShopFast e-commerce", "7822119043", "E-commerce", "Onboarding", "M. Nowak", "11", "1 żądanie", "Pro", "client-detail"],
  ["Przedszkole Tęcza", "6671234589", "Edukacja", "Aktywny", "K. Lis", "13", "-", "Standard", "client-detail"],
  ["Kancelaria Wręga", "5252001122", "Kancelaria", "Aktywny", "M. Nowak", "11", "-", "Standard", "client-detail"],
  ["OdszkodowaniaPL", "9512887701", "Firma odszkodowawcza", "Zawieszony", "M. Nowak", "6", "1 żądanie", "Mikro", "client-detail"],
] satisfies [string, string, string, string, string, string, string, string, CrmRoute][];

export const documentRows = [
  ["Polityka ochrony danych", "MedCare", "Pakiet Pro", "Zatwierdzony", "v3", "D. Wójcik", "K. Lis", "-", "doc-review"],
  ["DPIA - monitoring pracowników", "ShopFast", "Dokument", "W sprawdzaniu", "v1", "D. Wójcik", "-", "Dziś 18:00", "doc-review"],
  ["Rejestr czynności przetwarzania", "Tęcza", "Pakiet Standard", "Wygenerowany", "v1", "A. Zięba", "-", "Jutro", "doc-review"],
  ["Procedura naruszeń", "MedCare", "Aktualizacja", "Do poprawy", "v2", "A. Zięba", "K. Lis", "-2h", "doc-review"],
  ["Umowa powierzenia (DPA)", "Wręga", "Dokument", "Wysłany", "v1", "D. Wójcik", "K. Lis", "-", "doc-review"],
] satisfies [string, string, string, string, string, string, string, string, CrmRoute][];

export const breachRows = [
  ["NAR-2024-038", "MedCare Sp. z o.o.", "J. Bąk (HR)", "Utrata nośnika z danymi", "Ocena ryzyka", "Wysokie", "K. Lis", "4h", "breach-detail"],
  ["NAR-2024-037", "ShopFast", "System", "Nieuprawniony dostęp do bazy", "Decyzja", "Krytyczne", "K. Lis", "19h", "breach-detail"],
  ["NAR-2024-035", "OdszkodowaniaPL", "M. Kowal", "Błędna wysyłka e-mail", "Zgłoszenie wymagane", "Średnie", "K. Lis", "38h", "breach-detail"],
  ["NAR-2024-031", "LogiTrans", "T. Nowak", "Phishing - wyciek loginu", "Działania naprawcze", "Niskie", "-", "-", "breach-detail"],
] satisfies [string, string, string, string, string, string, string, string, CrmRoute][];

export const requestRows = [
  ["ZAD-2024-112", "ShopFast", "Anna Z.", "Usunięcie danych", "E-mail", "Weryfikacja tożsamości", "Wysoki", "2 dni", "request-detail"],
  ["ZAD-2024-111", "MedCare", "Paweł K.", "Dostęp do danych", "Platforma", "Analiza", "Średni", "7 dni", "request-detail"],
  ["ZAD-2024-110", "OdszkodowaniaPL", "Marek W.", "Sprzeciw", "Formularz", "Projekt odpowiedzi", "Średni", "5 dni", "request-detail"],
  ["ZAD-2024-108", "LogiTrans", "Ewa M.", "Przeniesienie", "E-mail", "Do akceptacji", "Niski", "9 dni", "request-detail"],
] satisfies [string, string, string, string, string, string, string, string, CrmRoute][];

export const accountingRows = [
  ["FV/2024/0421", "MedCare", "ZAM-2418", "3 983 zł", "917 zł", "4 900 zł", "Opłacona", "10.07", "24.06"],
  ["FV/2024/0420", "Tęcza", "Abonament IOD", "1 220 zł", "280 zł", "1 500 zł", "Wysłana", "05.07", "-"],
  ["FV/2024/0419", "LogiTrans", "ZAM-2412", "317 zł", "73 zł", "390 zł", "Wystawiona", "08.07", "-"],
  ["FV/2024/0418", "OdszkodowaniaPL", "ZAM-2409", "2 000 zł", "460 zł", "2 460 zł", "Zaległa", "19.06", "-"],
] satisfies [string, string, string, string, string, string, string, string, string][];

export const outsourcingRows = [
  ["MedCare Sp. z o.o.", "Pro IOD", "K. Lis", "Aktywny", "99%", "2", "1", "05.07", "1 500 zł", "outsourcing-detail"],
  ["Przedszkole Tęcza", "Standard IOD", "K. Lis", "Onboarding", "-", "0", "0", "10.07", "800 zł", "outsourcing-detail"],
  ["Kancelaria Wręga", "Pro IOD", "K. Lis", "Aktywny", "100%", "0", "0", "12.07", "1 500 zł", "outsourcing-detail"],
  ["OdszkodowaniaPL", "Mikro IOD", "D. Wójcik", "Zagrożony", "86%", "1", "1", "08.07", "600 zł", "outsourcing-detail"],
] satisfies [string, string, string, string, string, string, string, string, string, CrmRoute][];

export const productRows = [
  ["Polityka ochrony danych", "Dokument", "290 zł", "357 zł", "Aktywny", "64", "product-editor"],
  ["Analiza ryzyka (DPIA)", "Dokument", "390 zł", "480 zł", "Aktywny", "41", "product-editor"],
  ["Pakiet Standard", "Pakiet", "2 400 zł", "2 952 zł", "Aktywny", "31", "product-editor"],
  ["Konsultacja IOD 60 min", "Konsultacja", "350 zł", "431 zł", "Aktywny", "28", "product-editor"],
  ["Szkolenie RODO online", "Szkolenie", "590 zł", "726 zł", "Aktywny", "12", "product-editor"],
  ["Audyt zgodności", "Audyt", "2 400 zł", "2 952 zł", "Ukryty", "4", "product-editor"],
] satisfies [string, string, string, string, string, string, CrmRoute][];

export const blogRows = [
  ["Czy muszę powołać IOD? Przewodnik 2024", "Opublikowany", "K. Lis", "obowiązek IOD", "92", "88", "12 400", "41", "blog-editor"],
  ["RODO w placówce medycznej - checklist", "Opublikowany", "K. Lis", "RODO medycyna", "86", "79", "8 900", "28", "blog-editor"],
  ["Naruszenie ochrony danych - co robić w 72h", "Zaplanowany", "K. Lis", "naruszenie 72h", "81", "84", "-", "-", "blog-editor"],
  ["Rejestr czynności przetwarzania - wzór", "W sprawdzaniu", "D. Wójcik", "RCPD wzór", "74", "61", "-", "-", "blog-editor"],
] satisfies [string, string, string, string, string, string, string, string, CrmRoute][];

export const automationRows = [
  ["Lead z checkera -> przypisz sales -> zadanie 24h", "Nowy lead z checkera", "Utwórz lead - przypisz - zadanie kontaktu", "Aktywna", "1 240"],
  ["Wynik IOD wymagany -> lead wysokiego priorytetu", "Checker: IOD wymagany", "Ustaw priorytet - oznacz gorący", "Aktywna", "412"],
  ["Zakup pakietu -> zamówienie -> poproś o dane", "Płatność za pakiet", "Utwórz zamówienie - e-mail z formularzem", "Aktywna", "186"],
  ["Dokument wygenerowany -> przypisz do sprawdzenia", "Status: GENERATED", "Przypisz Document Specialist", "Aktywna", "203"],
  ["Lead bez kontaktu 24h -> alert managera", "Brak kontaktu > 24h", "Powiadom managera", "Wstrzymana", "88"],
] satisfies [string, string, string, string, string][];

export const platformRows = [
  ["MedCare Sp. z o.o.", "8", "6", "Dziś 09:31", "2", "18", "Aktywna", "Pro IOD"],
  ["ShopFast e-commerce", "4", "3", "Wczoraj", "1", "11", "Aktywna", "Pro"],
  ["Przedszkole Tęcza", "3", "2", "27.06", "0", "13", "Onboarding", "Standard"],
  ["Kancelaria Wręga", "5", "5", "Dziś 08:10", "0", "11", "Aktywna", "Standard"],
] satisfies [string, string, string, string, string, string, string, string][];
