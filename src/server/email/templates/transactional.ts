export type EmailTemplateName =
  | "lead.confirmation"
  | "lead.internal_new"
  | "order.created"
  | "payment.succeeded"
  | "payment.failed"
  | "invoice.issued"
  | "document.input_required"
  | "document.generation_started"
  | "document.ready"
  | "document.failed_internal"
  | "document.review_required"
  | "breach.created_internal"
  | "breach.deadline_reminder"
  | "dsr.created_internal"
  | "dsr.deadline_reminder"
  | "client.message.created"
  | "task.assigned"
  | "task.overdue"
  | "newsletter.double_opt_in"
  | "report.daily_crm"
  | "report.weekly_operations"
  | "transactional.custom";

export type RenderedEmail = {
  html: string;
  subject: string;
};

const portalUrl = (path = "") => `${siteUrl()}/platforma${path}`;
const adminUrl = (path = "") => `${siteUrl()}/admin${path}`;

export function renderEmailTemplate(template: EmailTemplateName, input: Record<string, string | number | null | undefined>): RenderedEmail {
  switch (template) {
    case "lead.confirmation":
      return simple("PRIVAZY: otrzymalismy zgloszenie", "Dziekujemy za kontakt. Zespol PRIVAZY sprawdzi zgloszenie i odezwie sie w kolejnym kroku.", adminUrl("/leads"));
    case "lead.internal_new":
      return simple("PRIVAZY CRM: nowy lead", `Nowy lead wymaga kwalifikacji. Zrodlo: ${input.source ?? "formularz"}.`, adminUrl("/leads"));
    case "order.created":
      return simple(`PRIVAZY: zamowienie ${input.orderNumber ?? ""} zostalo przyjete`, "Zamowienie zostalo zapisane. Status i kolejne kroki sa dostepne online.", String(input.statusUrl ?? portalUrl("/zamowienia")));
    case "payment.succeeded":
      return simple(`PRIVAZY: platnosc ${input.orderNumber ?? ""} potwierdzona`, "Platnosc zostala potwierdzona. Kolejny krok to uzupelnienie danych do dokumentu w portalu.", portalUrl("/dokumenty"));
    case "payment.failed":
      return simple(`PRIVAZY: platnosc ${input.orderNumber ?? ""} nie powiodla sie`, "Nie mamy potwierdzenia platnosci. Sprawdz status zamowienia albo sprobuj ponownie.", String(input.statusUrl ?? portalUrl("/zamowienia")));
    case "invoice.issued":
      return simple(`PRIVAZY: faktura ${input.invoiceNumber ?? ""}`, "Faktura zostala wystawiona i powiazana z zamowieniem. Szczegoly sa dostepne w statusie zamowienia.", String(input.statusUrl ?? portalUrl("/zamowienia")));
    case "document.input_required":
      return simple("PRIVAZY: uzupelnij dane do dokumentu", "Aby przygotowac dokument, uzupelnij formularz danych w portalu.", portalUrl("/dokumenty"));
    case "document.generation_started":
      return simple("PRIVAZY: generowanie dokumentu rozpoczete", "Rozpoczelismy przygotowanie dokumentu. Status bedzie widoczny w portalu.", portalUrl("/dokumenty"));
    case "document.ready":
      return simple("PRIVAZY: dokument jest gotowy", "Dokument jest gotowy do bezpiecznego pobrania po zalogowaniu. Nie dolaczamy dokumentow jako zalacznikow e-mail.", portalUrl("/dokumenty"));
    case "document.failed_internal":
      return simple("PRIVAZY CRM: blad generowania dokumentu", `Job ${input.jobId ?? ""} wymaga sprawdzenia operatora lub prawnika.`, adminUrl("/documents"));
    case "document.review_required":
      return simple("PRIVAZY CRM: dokument wymaga review", "Wygenerowany dokument wymaga weryfikacji przed udostepnieniem klientowi.", adminUrl("/documents"));
    case "breach.created_internal":
      return simple("PRIVAZY CRM: nowe naruszenie", "Nowe zgloszenie naruszenia wymaga triage i oceny prawnej. Automatyzacja nie podejmuje decyzji za IOD/prawnika.", adminUrl("/breaches"));
    case "breach.deadline_reminder":
      return simple("PRIVAZY CRM: termin 72h naruszenia", `Naruszenie ${input.incidentNumber ?? ""} zbliza sie do terminu lub jest po terminie.`, adminUrl("/breaches"));
    case "dsr.created_internal":
      return simple("PRIVAZY CRM: nowe zadanie osoby", "Nowe zadanie osoby wymaga weryfikacji i odpowiedzi w terminie.", adminUrl("/requests"));
    case "dsr.deadline_reminder":
      return simple("PRIVAZY CRM: termin zadania osoby", `Zadanie osoby ${input.requestNumber ?? ""} wymaga kontroli terminu.`, adminUrl("/requests"));
    case "client.message.created":
      return simple("PRIVAZY CRM: nowa wiadomosc klienta", "Klient wyslal nowa wiadomosc w portalu. Odpowiedz powinna pozostac w watku, bez ujawniania notatek internal.", adminUrl("/inbox"));
    case "task.assigned":
      return simple("PRIVAZY CRM: przypisano zadanie", `Zadanie: ${input.title ?? "bez tytulu"}.`, adminUrl("/tasks"));
    case "task.overdue":
      return simple("PRIVAZY CRM: zadanie po terminie", `Zadanie ${input.title ?? ""} jest po terminie.`, adminUrl("/tasks"));
    case "newsletter.double_opt_in":
      return simple("PRIVAZY: potwierdz zapis do newslettera", "Potwierdz, ze chcesz otrzymywac newsletter PRIVAZY. Ten e-mail nie uruchamia kampanii masowej.", String(input.confirmationUrl ?? portalUrl()));
    case "report.daily_crm":
      return simple("PRIVAZY CRM: raport dzienny", String(input.summary ?? "Raport dzienny zostal wygenerowany."), adminUrl("/reports"));
    case "report.weekly_operations":
      return simple("PRIVAZY CRM: raport tygodniowy", String(input.summary ?? "Raport tygodniowy zostal wygenerowany."), adminUrl("/reports"));
    case "transactional.custom":
      return { html: String(input.html ?? ""), subject: String(input.subject ?? "PRIVAZY") };
  }
}

function simple(subject: string, body: string, href: string): RenderedEmail {
  return {
    html: `
      <p>Dzien dobry,</p>
      <p>${escapeHtml(body)}</p>
      <p><a href="${escapeHtml(href)}">${escapeHtml(href)}</a></p>
      <p>PRIVAZY</p>
    `,
    subject,
  };
}

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
