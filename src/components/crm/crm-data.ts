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
  id?: string;
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
    label: "CRM operacyjny",
    items: [
      { route: "leads", label: "Leady", icon: "UserPlus" },
      { route: "clients", label: "Klienci", icon: "Building2" },
      { route: "tasks", label: "Zadania", icon: "SquareCheckBig" },
    ],
  },
  {
    label: "Kontrola",
    items: [{ route: "admin", label: "Audit log", icon: "ShieldHalf" }],
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
