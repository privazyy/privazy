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

export type CrmActorView = {
  email: string;
  id: string;
  initials: string;
  name: string;
  role: string;
};

export type CrmPermissionView = {
  allowedRoutes: CrmRoute[];
  canMutate: boolean;
  role: string;
};

export type CrmDatabaseData = {
  actor: CrmActorView;
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
  permissions: CrmPermissionView;
};

export const navGroups: NavGroup[] = [
  {
    items: [{ route: "dashboard", label: "Dashboard", icon: "LayoutDashboard" }],
  },
  {
    label: "Pozyskiwanie",
    items: [
      { route: "traffic", label: "Ruch i marketing", icon: "LineChart" },
      { route: "leads", label: "Leady", icon: "UserPlus" },
      { route: "sales", label: "Sprzedaz", icon: "TrendingUp" },
    ],
  },
  {
    label: "Klienci i sprawy",
    items: [
      { route: "clients", label: "Klienci", icon: "Building2" },
      { route: "orgs", label: "Organizacje", icon: "Network" },
      { route: "orders", label: "Zamowienia", icon: "ShoppingCart" },
      { route: "documents", label: "Dokumenty", icon: "FileText" },
      { route: "packages", label: "Pakiety RODO", icon: "Package" },
      { route: "products", label: "Produkty / sklep", icon: "Tag" },
      { route: "outsourcing", label: "Outsourcing IOD", icon: "ShieldCheck" },
      { route: "breaches", label: "Naruszenia", icon: "TriangleAlert" },
      { route: "requests", label: "Zadania osob", icon: "UserCog" },
    ],
  },
  {
    label: "Komunikacja",
    items: [
      { route: "inbox", label: "Skrzynka", icon: "Inbox" },
      { route: "tasks", label: "Zadania", icon: "SquareCheckBig" },
      { route: "calendar", label: "Kalendarz", icon: "CalendarDays" },
    ],
  },
  {
    label: "Analiza i finanse",
    items: [
      { route: "reports", label: "Raporty", icon: "ChartColumn" },
      { route: "accounting", label: "Ksiegowosc", icon: "Wallet" },
    ],
  },
  {
    label: "Tresci i marketing",
    items: [
      { route: "blog", label: "Baza wiedzy / Blog", icon: "Newspaper" },
      { route: "newsletter", label: "Newsletter", icon: "Mail" },
    ],
  },
  {
    label: "Zespol i system",
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
  "blog-editor": "blog",
  "breach-detail": "breaches",
  "client-detail": "clients",
  "doc-review": "documents",
  "lead-detail": "leads",
  "outsourcing-detail": "outsourcing",
  "product-editor": "products",
  "request-detail": "requests",
};
