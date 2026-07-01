"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Compass,
  Cpu,
  Database,
  Download,
  Eye,
  FileCheck2,
  FileText,
  FolderLock,
  Gavel,
  GitBranch,
  GraduationCap,
  HeartPulse,
  HelpCircle,
  History,
  Info,
  KeyRound,
  Landmark,
  ListChecks,
  Lock,
  MapPin,
  Menu,
  MessageCircle,
  MessageSquare,
  Megaphone,
  Package,
  PackageCheck,
  PhoneCall,
  RefreshCw,
  RotateCcw,
  Route as RouteIcon,
  Scale,
  SearchCheck,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Siren,
  Star,
  Timer,
  UserCheck,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { LeadCaptureForm } from "@/components/public/lead-capture-form";
import { mapIodObligationToOutcomeKey, mapLandingAnswersToObligationInput } from "@/lib/iod-checker";
import { evaluateIodObligation, type IodObligationOutput } from "@/lib/iod-obligation-checker";
import { cn } from "@/lib/utils";

const iconMap = {
  activity: Activity,
  "alert-triangle": AlertTriangle,
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  "badge-check": BadgeCheck,
  briefcase: Briefcase,
  "building-2": Building2,
  check: Check,
  "check-circle-2": CheckCircle2,
  "chevron-down": ChevronDown,
  "clipboard-check": ClipboardCheck,
  compass: Compass,
  cpu: Cpu,
  database: Database,
  download: Download,
  eye: Eye,
  "file-check-2": FileCheck2,
  "file-text": FileText,
  "folder-lock": FolderLock,
  gavel: Gavel,
  "git-branch": GitBranch,
  "graduation-cap": GraduationCap,
  "heart-pulse": HeartPulse,
  "help-circle": HelpCircle,
  history: History,
  info: Info,
  "key-round": KeyRound,
  landmark: Landmark,
  "list-checks": ListChecks,
  lock: Lock,
  "map-pin": MapPin,
  menu: Menu,
  "message-circle": MessageCircle,
  "message-square": MessageSquare,
  megaphone: Megaphone,
  package: Package,
  "package-check": PackageCheck,
  "phone-call": PhoneCall,
  "refresh-cw": RefreshCw,
  "rotate-ccw": RotateCcw,
  route: RouteIcon,
  scale: Scale,
  "search-check": SearchCheck,
  send: Send,
  shield: Shield,
  "shield-alert": ShieldAlert,
  "shield-check": ShieldCheck,
  "shopping-cart": ShoppingCart,
  siren: Siren,
  star: Star,
  timer: Timer,
  "user-check": UserCheck,
  users: Users,
  wrench: Wrench,
  x: X,
} satisfies Record<string, LucideIcon>;

type Tone = "green" | "amber" | "red" | "blue" | "gray";

type AnswerMap = Record<string, string>;

type CheckerQuestion = {
  id: string;
  title: string;
  sub: string;
  options: string[];
  show?: (answers: AnswerMap) => boolean;
};

type Recommendation = {
  title: string;
  desc: string;
  icon: string;
  href: string;
};

type Outcome = {
  badge: string;
  icon: string;
  tone: Exclude<Tone, "gray">;
  title: string;
  lead: string;
  recommendations: Recommendation[];
  assessment: IodObligationOutput;
};

const offerItems = [
  { icon: "badge-check", title: "Sprawdź obowiązek IOD", desc: "Checker w 7 krokach", kind: "checker" },
  { icon: "package", title: "Pakiety RODO", desc: "Mikro · Standard · Pro", href: "/uslugi/dokumentacja-rodo" },
  { icon: "shield-check", title: "Outsourcing IOD", desc: "Stały nadzór i platforma", href: "/uslugi/outsourcing-iod" },
];

const questions = [
  {
    id: "branza",
    title: "Jaka jest główna branża Twojej firmy?",
    sub: "Wybierz najbliższy obszar działalności.",
    options: ["Medyczna", "Edukacja", "HR / rekrutacja", "E-commerce", "Kancelaria / odszkodowania", "Inna"],
  },
  {
    id: "rola",
    title: "Jaką rolę pełnicie w ocenianym procesie?",
    sub: "Silnik rozróżnia administratora, processora i współadministratorów.",
    options: ["Administrator danych", "Podmiot przetwarzający", "Współadministrator", "Nie wiem"],
  },
  {
    id: "rezim",
    title: "Który reżim prawny ma zastosowanie?",
    sub: "Zwykle będzie to RODO, a dla organów ścigania także reżim dyrektywy policyjnej.",
    options: ["Tylko RODO / GDPR", "RODO + ustawa policyjna 2018", "Nie wiem"],
  },
  {
    id: "organizacja",
    title: "Jaki jest charakter Twojej organizacji?",
    sub: "To decyduje o przesłance public body i wyjątkach dla sądów.",
    options: [
      "Firma prywatna",
      "Organ lub podmiot publiczny",
      "Jednostka sektora finansów publicznych",
      "Instytut badawczy / NBP / ustawa szczególna",
      "Sąd lub trybunał",
      "Podmiot leczniczy",
      "Placówka oświatowa / opiekuńcza",
    ],
  },
  {
    id: "sad_czynnosc",
    title: "Czy sąd działa tu w ramach sprawowania wymiaru sprawiedliwości?",
    sub: "Wyjątek z art. 37 ust. 1 lit. a RODO jest funkcjonalny, a nie absolutny.",
    options: ["Tak, czynność orzecznicza", "Nie, czynność administracyjna", "Nie wiem"],
    show: (answers) => answers.organizacja === "Sąd lub trybunał",
  },
  {
    id: "led_status",
    title: "Czy podmiot jest właściwym organem w reżimie policyjnym?",
    sub: "Dotyczy ustawy z 14.12.2018 i art. 46 dla administratora.",
    options: ["Tak, jako administrator", "Tak, ale tylko jako processor", "Nie", "Nie wiem"],
    show: (answers) => answers.rezim === "RODO + ustawa policyjna 2018" || answers.rezim === "Nie wiem",
  },
  {
    id: "pracownicy",
    title: "Ilu pracowników zatrudnia Twoja firma?",
    sub: "Skala organizacji wpływa na zakres dokumentacji.",
    options: ["1-9", "10-49", "50-249", "250 i więcej"],
  },
  {
    id: "kategorie",
    title: "Jakie kategorie danych przetwarzasz?",
    sub: "Silnik osobno ocenia art. 9 RODO oraz dane z art. 10 RODO.",
    options: [
      "Tylko dane zwykłe",
      "Dane zwykłe + szczególnych kategorii",
      "Dane o zdrowiu",
      "Dane biometryczne / genetyczne",
      "Dane o wyrokach i karalności",
      "Głównie dane wrażliwe",
    ],
  },
  {
    id: "charakter",
    title: "Czy przetwarzanie danych to główny element działalności?",
    sub: 'Tzw. "główna działalność" w rozumieniu art. 37 RODO.',
    options: ["Nie, sporadycznie", "Tak, stały element", "Tak, monitoring / profilowanie systematyczne", "Nie wiem"],
  },
  {
    id: "monitoring",
    title: "Czy prowadzicie monitorowanie osób?",
    sub: "Chodzi m.in. o CCTV, profilowanie, scoring, AML, geolokalizację lub IoT.",
    options: [
      "Brak monitorowania",
      "CCTV",
      "Profilowanie / reklama behawioralna",
      "Fraud / AML / risk scoring",
      "Geolokalizacja / IoT / wearables",
      "Nie wiem",
    ],
  },
  {
    id: "monitoring_regularny",
    title: "Czy monitoring jest regularny i systematyczny?",
    sub: "To jeden z kluczowych warunków art. 37 ust. 1 lit. b RODO.",
    options: ["Tak, regularny i systematyczny", "Tylko okazjonalny", "Nie", "Nie wiem"],
    show: (answers) => Boolean(answers.monitoring) && answers.monitoring !== "Brak monitorowania",
  },
  {
    id: "liczba_osob",
    title: "Ilu osób dotyczy przetwarzanie w skali 12 miesięcy?",
    sub: "Nie ma sztywnych progów ustawowych, ale liczba osób jest ważnym czynnikiem dużej skali.",
    options: ["1", "2-100", "101-1000", "1001-10000", "10001-100000", "100000+", "Nie wiem"],
  },
  {
    id: "udzial_populacji",
    title: "Jaki jest udział populacji lub grupy docelowej?",
    sub: "Pomaga ocenić skalę tam, gdzie sama liczba osób nie wystarcza.",
    options: ["Marginalny <1%", "Lokalna grupa 1-10%", "Istotna grupa 10-30%", "Znaczna grupa >30%", "Nie wiem"],
  },
  {
    id: "zakres_danych",
    title: "Jak szeroki jest zakres danych?",
    sub: "Uwzględnij liczbę kategorii danych, ich wrażliwość i głębokość profilu.",
    options: ["Niski", "Średni", "Wysoki", "Bardzo wysoki", "Nie wiem"],
  },
  {
    id: "czas",
    title: "Jak długo trwa przetwarzanie?",
    sub: "Ciągłe lub długoterminowe procesy zwiększają ocenę skali.",
    options: ["Jednorazowe", "Okazjonalne", "Cykliczne", "Ciągłe", "Długoterminowe", "Nie wiem"],
  },
  {
    id: "zasieg",
    title: "Jaki jest zasięg geograficzny przetwarzania?",
    sub: "Zasięg lokalny, krajowy albo międzynarodowy wpływa na ocenę dużej skali.",
    options: ["Jedna lokalizacja", "Lokalny", "Regionalny", "Ogólnopolski", "Międzynarodowy", "Nie wiem"],
  },
  {
    id: "processor_agregacja",
    title: "Czy jako processor wykonujecie podobny proces dla wielu klientów?",
    sub: "Silnik dolicza agregację skali po stronie podmiotu przetwarzającego.",
    options: ["Nie", "Tak, 1-9 klientów", "Tak, 10-99 klientów", "Tak, 100-499 klientów", "Tak, 500+ klientów", "Nie wiem"],
    show: (answers) => answers.rola === "Podmiot przetwarzający",
  },
  {
    id: "wspolny_iod",
    title: "Czy rozważacie jednego wspólnego IOD?",
    sub: "RODO dopuszcza wspólnego IOD, jeśli jest łatwo dostępny dla każdej jednostki.",
    options: ["Nie planuję", "Tak, dostępny dla każdej jednostki", "Tak, ale dostępność niepewna", "Nie wiem"],
  },
  {
    id: "ocena_wewnetrzna",
    title: "Czy macie udokumentowaną ocenę obowiązku IOD?",
    sub: "Brak notatki nie tworzy obowiązku, ale zwiększa potrzebę weryfikacji i dokumentacji decyzji.",
    options: ["Tak", "Nie", "Nie wiem"],
  },
] satisfies CheckerQuestion[];

const heroMicro = [
  "pakiety dokumentów do 48 godzin",
  "kontakt z ekspertem do 24 godzin w dni robocze",
  "obsługa całej Polski zdalnie",
  "platforma do incydentów i dokumentów",
];

const heroIndustries = [
  { label: "Medyczna", icon: "heart-pulse", value: "Medyczna" },
  { label: "Edukacja", icon: "graduation-cap", value: "Edukacja" },
  { label: "HR", icon: "users", value: "HR / rekrutacja" },
  { label: "E-commerce", icon: "shopping-cart", value: "E-commerce" },
  { label: "Kancelaria", icon: "scale", value: "Kancelaria / odszkodowania" },
  { label: "Inna", icon: "building-2", value: "Inna" },
];

const industries = [
  {
    icon: "heart-pulse",
    value: "Medyczna",
    href: "/branze/placowki-medyczne",
    title: "Placówki medyczne",
    desc: "Dane o zdrowiu to dane szczególnych kategorii. Przy większej skali realny jest obowiązek IOD i ocena skutków (DPIA).",
  },
  {
    icon: "graduation-cap",
    value: "Edukacja",
    href: "/branze/szkoly-i-przedszkola",
    title: "Szkoły, przedszkola i żłobki niepubliczne",
    desc: "Przetwarzasz dane dzieci i rodziców. Potrzebne są polityki, upoważnienia i procedury naruszeń.",
  },
  {
    icon: "users",
    value: "HR / rekrutacja",
    href: "/branze/hr-i-rekrutacja",
    title: "HR i rekrutacja",
    desc: "Rekrutacja i kadry to ciągłe przetwarzanie danych kandydatów i pracowników, w tym danych wrażliwych.",
  },
  {
    icon: "scale",
    value: "Kancelaria / odszkodowania",
    href: "/branze/kancelarie",
    title: "Kancelarie i firmy odszkodowawcze",
    desc: "Duże zbiory danych klientów oraz dane o zdrowiu i sprawach, a więc wysokie wymagania wobec dokumentacji RODO.",
  },
  {
    icon: "shopping-cart",
    value: "E-commerce",
    href: "/branze/ecommerce",
    title: "E-commerce i usługi online",
    desc: "Profilowanie, marketing i obsługa zamówień oznaczają stałe przetwarzanie danych klientów.",
  },
  {
    icon: "database",
    value: "Inna",
    href: "/branze/saas-i-it",
    title: "Firmy przetwarzające dane na większą skalę",
    desc: "Monitoring lub przetwarzanie na dużą skalę często wiąże się z obowiązkiem IOD i DPIA.",
  },
];

const paths = [
  {
    icon: "compass",
    title: "Nie wiem, czy muszę mieć IOD",
    desc: "Odpowiedz na pytania o role, reżim, skalę danych i kategorie przetwarzania. Otrzymasz wynik oraz rekomendację dalszych działań.",
    cta: "Uruchom checker",
    kind: "checker",
    tone: "brand",
  },
  {
    icon: "package",
    title: "Chcę kupić dokumenty RODO",
    desc: "Wybierz pakiet Mikro, Standard albo Pro. Dokumenty są personalizowane na podstawie wzorów przygotowanych przez prawników i sprawdzane przez specjalistę.",
    cta: "Zobacz pakiety",
    kind: "link",
    href: "/uslugi/dokumentacja-rodo",
    tone: "plain",
  },
  {
    icon: "shield-check",
    title: "Potrzebuję stałego wsparcia",
    desc: "Przekaż funkcję IOD zewnętrznemu specjaliście. Otrzymujesz stały nadzór, konsultacje, obsługę incydentów, aktualizację dokumentacji i wsparcie przed UODO.",
    cta: "Umów rozmowę",
    kind: "link",
    href: "/uslugi/outsourcing-iod",
    tone: "plain",
  },
];

const platformTabs = [
  { key: "incidents", label: "Zgłoszenia naruszeń", icon: "alert-triangle" },
  { key: "documents", label: "Dokumenty", icon: "file-text" },
  { key: "iod", label: "Kontakt z IOD", icon: "message-square" },
  { key: "history", label: "Historia spraw", icon: "history" },
  { key: "sla", label: "Terminy i SLA", icon: "timer" },
  { key: "statuses", label: "Statusy incydentów", icon: "activity" },
];

const platformFeatures = [
  { icon: "megaphone", title: "Zgłaszanie naruszeń przez pracowników", desc: "Prosty formularz dostępny dla całego zespołu, bez logowania do osobnych systemów." },
  { icon: "git-branch", title: "Obieg incydentu do IOD", desc: "Każde zgłoszenie trafia do inspektora z automatycznym terminem reakcji." },
  { icon: "folder-lock", title: "Repozytorium dokumentów", desc: "Aktualne polityki, rejestry i upoważnienia w jednym, bezpiecznym miejscu." },
  { icon: "message-square", title: "Kontakt z inspektorem", desc: "Pytania do IOD i odpowiedzi w jednym wątku, z pełną historią." },
  { icon: "history", title: "Historia spraw i potwierdzenia", desc: "Pełen ślad decyzji, zgłoszeń i odpowiedzi, gotowy do okazania podczas kontroli." },
  { icon: "shield-check", title: "Dowód należytej staranności", desc: "Raporty i logi, które pokazują, że Twoja firma działa zgodnie z RODO." },
];

const pIncidents = [
  { id: "INC-2026-031", type: "Nieautoryzowany dostęp", who: "Recepcja · zgłoszenie pracownika", date: "27.06", status: "Nowe", tone: "amber", sla: "Reakcja IOD: 21 h" },
  { id: "INC-2026-030", type: "Błędna wysyłka e-mail", who: "Dział obsługi klienta", date: "24.06", status: "W toku", tone: "blue", sla: "Analiza: 2 dni" },
  { id: "INC-2026-028", type: "Zgubiony nośnik", who: "Magazyn", date: "19.06", status: "Zgłoszone do UODO", tone: "red", sla: "Termin 72 h dotrzymany" },
  { id: "INC-2026-025", type: "Phishing (próba)", who: "IT", date: "11.06", status: "Zamknięte", tone: "green", sla: "Bez naruszenia" },
] satisfies Array<{ tone: Tone; id: string; type: string; who: string; date: string; status: string; sla: string }>;

const pDocuments = [
  { name: "Polityka ochrony danych osobowych", status: "Aktualny", tone: "green", updated: "12.05.2026" },
  { name: "Rejestr czynności przetwarzania", status: "Do przeglądu", tone: "amber", updated: "01.02.2026" },
  { name: "Procedura naruszeń ochrony danych", status: "Aktualny", tone: "green", updated: "12.05.2026" },
  { name: "Ewidencja upoważnień", status: "Aktualny", tone: "green", updated: "08.06.2026" },
  { name: "Umowa powierzenia (DPA), dostawca IT", status: "Do podpisu", tone: "blue", updated: "25.06.2026" },
] satisfies Array<{ tone: Tone; name: string; status: string; updated: string }>;

const pHistory = [
  { date: "27.06.2026", title: "Nowe zgłoszenie naruszenia", desc: "INC-2026-031 przyjęte i przydzielone inspektorowi.", tone: "amber" },
  { date: "21.06.2026", title: "Zaktualizowano rejestr czynności", desc: "Dodano nowy proces: newsletter marketingowy.", tone: "blue" },
  { date: "19.06.2026", title: "Zgłoszenie do UODO", desc: "INC-2026-028 zgłoszone w terminie 72 godzin.", tone: "red" },
  { date: "12.05.2026", title: "Przegląd dokumentacji", desc: "Inspektor zatwierdził komplet polityk i procedur.", tone: "green" },
] satisfies Array<{ tone: Tone; date: string; title: string; desc: string }>;

const pSla = [
  { task: "Reakcja na INC-2026-031", due: "do jutra, 09:00", pct: 78, tone: "amber" },
  { task: "Analiza INC-2026-030", due: "za 2 dni", pct: 45, tone: "blue" },
  { task: "Kwartalny przegląd dokumentów", due: "za 9 dni", pct: 20, tone: "green" },
  { task: "Szkolenie zespołu z RODO", due: "za 3 tygodnie", pct: 10, tone: "gray" },
] satisfies Array<{ tone: Tone; task: string; due: string; pct: number }>;

const pStatuses = [
  { col: "Nowe", tone: "amber", count: 1, items: ["INC-2026-031 · Nieautoryzowany dostęp"] },
  { col: "W toku", tone: "blue", count: 1, items: ["INC-2026-030 · Błędna wysyłka e-mail"] },
  { col: "Zamknięte", tone: "green", count: 2, items: ["INC-2026-028 · Zgłoszony do UODO", "INC-2026-025 · Bez naruszenia"] },
] satisfies Array<{ tone: Tone; col: string; count: number; items: string[] }>;

const pIod = [
  { from: "iod", who: "Inspektor PRIVAZY", text: "Przyjąłem zgłoszenie INC-2026-031. Proszę o kontakt z osobą zgłaszającą. Odezwę się z oceną do końca dnia.", time: "08:42" },
  { from: "me", who: "Ty", text: "Dziękuję. Czy to kwalifikuje się do zgłoszenia do UODO?", time: "09:05" },
  { from: "iod", who: "Inspektor PRIVAZY", text: "Wstępnie nie, dostęp był wewnętrzny i ograniczony. Przygotuję notatkę do dokumentacji.", time: "09:12" },
] satisfies Array<{ from: "iod" | "me"; who: string; text: string; time: string }>;

const packages = [
  { name: "Mikro", tagline: "Dla najmniejszych firm.", recommended: false, feats: ["Podstawowa dokumentacja RODO", "Szybki start", "Personalizacja na podstawie wzorów", "Sprawdzenie przez specjalistę", "Realizacja do 48 godzin"], cta: "Wybierz pakiet Mikro" },
  { name: "Standard", tagline: "Dla większości małych firm.", recommended: true, feats: ["Pełniejsza dokumentacja", "Procedury i rejestry", "Ewidencja upoważnień", "Podstawowa analiza procesów", "Sprawdzenie przez specjalistę", "Realizacja do 48 godzin"], cta: "Wybierz pakiet Standard" },
  { name: "Pro", tagline: "Dla firm z większym ryzykiem.", recommended: false, feats: ["Dane wrażliwe i większa skala", "DPIA, czyli ocena skutków", "Procedury naruszeń", "Konsultacja w cenie", "Rekomendacja dalszych działań", "Możliwość przejścia na outsourcing IOD"], cta: "Wybierz pakiet Pro" },
];

const documents = [
  { icon: "shield", name: "Polityka ochrony danych osobowych", desc: "Główny dokument opisujący zasady przetwarzania danych w firmie.", who: "Każda firma" },
  { icon: "list-checks", name: "Rejestr czynności przetwarzania", desc: "Wykaz wszystkich procesów, w których przetwarzasz dane osobowe.", who: "Administratorzy danych" },
  { icon: "alert-triangle", name: "Procedura naruszeń ochrony danych", desc: "Krok po kroku, jak reagować na incydent i zgłoszenie do UODO.", who: "Firmy z danymi klientów" },
  { icon: "user-check", name: "Procedura obsługi żądań osób", desc: "Obsługa wniosków o dostęp, usunięcie czy sprostowanie danych.", who: "E-commerce, usługi" },
  { icon: "clipboard-check", name: "DPIA / ocena skutków", desc: "Analiza ryzyka dla przetwarzania wysokiego ryzyka.", who: "Dane wrażliwe, monitoring" },
  { icon: "key-round", name: "Upoważnienia i ewidencja upoważnień", desc: "Nadawanie i rejestrowanie dostępu pracowników do danych.", who: "Firmy z zespołem" },
];

const outsourcingTiles = [
  { icon: "eye", title: "Stały nadzór IOD" },
  { icon: "message-circle", title: "Konsultacje dla zarządu i pracowników" },
  { icon: "siren", title: "Obsługa naruszeń" },
  { icon: "refresh-cw", title: "Aktualizacja dokumentacji" },
  { icon: "graduation-cap", title: "Szkolenia" },
  { icon: "landmark", title: "Wsparcie przy kontroli UODO" },
];

const outsourcingProcess = ["Audyt startowy", "Uporządkowanie dokumentacji", "Uruchomienie kanału zgłoszeń", "Stała obsługa IOD", "Raportowanie i aktualizacje"];

const implementSteps = [
  { icon: "search-check", title: "Sprawdzasz obowiązek IOD", desc: "Wypełniasz checker i poznajesz wynik oraz rekomendację." },
  { icon: "route", title: "Wybierasz ścieżkę", desc: "Pakiet dokumentów, pojedynczy dokument albo outsourcing IOD." },
  { icon: "building-2", title: "Podajesz dane do personalizacji", desc: "Krótki formularz o firmie, bez prawniczego żargonu." },
  { icon: "file-check-2", title: "Przygotowujemy dokumentację", desc: "Generujemy komplet, a specjalista weryfikuje go przed przekazaniem." },
  { icon: "download", title: "Otrzymujesz dokumenty i instrukcje", desc: "Gotowe pliki wraz z instrukcją wdrożenia w firmie." },
  { icon: "shield-check", title: "Możesz przejść na stałą obsługę", desc: "W każdej chwili rozszerzasz współpracę o outsourcing IOD i platformę." },
];

const trustStats = [
  { icon: "briefcase", text: "Doświadczenie specjalistów we wdrożeniach RODO i pełnieniu funkcji IOD" },
  { icon: "users", text: "Organizacje zatrudniające łącznie około 100 osób" },
  { icon: "database", text: "Doświadczenie przy przetwarzaniu danych i danych wrażliwych ok. 30 000 klientów" },
  { icon: "timer", text: "Reakcja na incydenty do 24 godzin" },
  { icon: "package-check", text: "Przygotowanie pakietów dokumentów do 48 godzin" },
  { icon: "map-pin", text: "Obsługa całej Polski zdalnie" },
  { icon: "scale", text: "Dokumenty oparte na wzorach przygotowanych przez prawników" },
];

const trustPillars = [
  { icon: "gavel", title: "Prawo", desc: "Dokumenty i procedury zgodne z RODO oraz prawem polskim, oparte na wzorach prawników." },
  { icon: "wrench", title: "Praktyka", desc: "Realne doświadczenie z wdrożeń, incydentów i pełnienia funkcji IOD, nie tylko teoria przepisów." },
  { icon: "cpu", title: "Technologia", desc: "Platforma, która porządkuje dokumenty, incydenty i terminy w jednym miejscu." },
];

const blogPosts = [
  { tag: "IOD", title: "Czy muszę powołać IOD w firmie?", read: "6 min", icon: "badge-check" },
  { tag: "Medyczna", title: "RODO w placówce medycznej: najważniejsze obowiązki", read: "8 min", icon: "heart-pulse" },
  { tag: "Edukacja", title: "RODO w przedszkolu niepublicznym", read: "5 min", icon: "graduation-cap" },
  { tag: "Incydenty", title: "Naruszenie danych osobowych: co zrobić krok po kroku?", read: "7 min", icon: "siren" },
];

const faqItems = [
  { q: "Czy każda firma musi wdrożyć RODO?", a: "Praktycznie tak. RODO dotyczy każdego, kto przetwarza dane osobowe, czyli w praktyce niemal każdej firmy. Różni się jedynie zakres wymaganej dokumentacji w zależności od skali i rodzaju danych." },
  { q: "Czy każda firma musi powołać IOD?", a: "Nie. Obowiązek dotyczy m.in. organów publicznych oraz firm, których główna działalność polega na monitorowaniu osób na dużą skalę lub przetwarzaniu danych wrażliwych. Checker pomoże ustalić, czy dotyczy to Ciebie." },
  { q: "Czy wynik checkera jest wiążącą opinią prawną?", a: "Nie. Wynik ma charakter informacyjny i pomaga dobrać dalszą ścieżkę. W przypadkach granicznych rekomendujemy konsultację ze specjalistą." },
  { q: "Czy dokumenty są gotowcami?", a: "Nie kupujesz pliku, lecz uporządkowane wdrożenie. Dokumenty personalizujemy na podstawie wzorów przygotowanych przez prawników i dopasowujemy do Twojej branży i skali." },
  { q: "Czy dokumenty są sprawdzane przez człowieka?", a: "Tak. Po wygenerowaniu komplet sprawdza nasz specjalista, zanim trafi do Ciebie." },
  { q: "Ile trwa przygotowanie pakietu?", a: "Do 48 godzin od podania danych potrzebnych do personalizacji." },
  { q: "Czy mogę kupić tylko jeden dokument?", a: "Tak. Oferujemy pojedyncze dokumenty, więc możesz dokupić kolejne lub przejść na pełny pakiet w dowolnym momencie." },
  { q: "Czy po zakupie dokumentów mogę przejść na outsourcing IOD?", a: "Tak. Pakiety, zwłaszcza Pro, są zaprojektowane tak, by płynnie rozszerzyć współpracę o stałą obsługę IOD i platformę." },
  { q: "Czy platforma jest dostępna w każdym pakiecie?", a: "Platforma jest częścią outsourcingu IOD. Przy pakietach dokumentów udostępniamy repozytorium dokumentów; pełna obsługa incydentów dochodzi wraz ze stałą opieką IOD." },
  { q: "Co zrobić, jeśli pracownik zgłosi naruszenie?", a: "Zgłoszenie trafia przez platformę do inspektora, który ocenia incydent, prowadzi go zgodnie z procedurą i, jeśli trzeba, przygotowuje zgłoszenie do UODO w terminie 72 godzin." },
  { q: "Czy obsługujecie firmy z całej Polski?", a: "Tak. Usługi świadczymy zdalnie na terenie całej Polski." },
  { q: "Czy możliwy jest audyt stacjonarny?", a: "Obecnie pracujemy zdalnie. W przyszłości przewidujemy możliwość audytów stacjonarnych." },
];

const tonePillClasses: Record<Tone, string> = {
  green: "border-[var(--success)] bg-[var(--success-soft)] text-[var(--green-600)]",
  amber: "border-[var(--warning)] bg-[var(--warning-soft)] text-[var(--amber-600)]",
  red: "border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--red-600)]",
  blue: "border-[var(--brand-border)] bg-[var(--info-soft)] text-[var(--brand-ink)]",
  gray: "border-[var(--border-subtle)] bg-[var(--surface-sunken)] text-[var(--text-muted)]",
};

const toneDotClasses: Record<Tone, string> = {
  green: "bg-[var(--green-500)]",
  amber: "bg-[var(--amber-500)]",
  red: "bg-[var(--red-500)]",
  blue: "bg-[var(--brand)]",
  gray: "bg-[var(--gray-400)]",
};

function computeResult(answers: AnswerMap): Outcome {
  const assessment = evaluateIodObligation(mapLandingAnswersToObligationInput(answers));
  return {
    ...outcomeFor(mapIodObligationToOutcomeKey(assessment)),
    assessment,
  };
}

function outcomeFor(key: "required" | "highrisk" | "maybe" | "docs"): Omit<Outcome, "assessment"> {
  const recDocs = (pkg: string, label: string): Recommendation => ({
    title: `Dobierz pakiet ${pkg}`,
    desc: label,
    icon: "package",
    href: "/uslugi/dokumentacja-rodo",
  });
  const recOut = {
    title: "Outsourcing IOD",
    desc: "Przekaż funkcję IOD specjaliście i obsługuj incydenty w platformie.",
    icon: "shield-check",
    href: "/uslugi/outsourcing-iod",
  };
  const recConsult = {
    title: "Skonsultuj wynik ze specjalistą",
    desc: "Oddzwonimy w ciągu 24 godzin w dni robocze.",
    icon: "phone-call",
    href: "#kontakt",
  };

  const outcomes: Record<typeof key, Omit<Outcome, "assessment">> = {
    required: {
      badge: "IOD prawdopodobnie wymagany",
      icon: "alert-triangle",
      tone: "amber",
      title: "Twoja firma prawdopodobnie musi powołać Inspektora Ochrony Danych.",
      lead: "Charakter i skala przetwarzania wskazują na obowiązek z art. 37 RODO. Najprościej przekazać tę funkcję na zewnątrz wraz z platformą do incydentów.",
      recommendations: [recOut, recDocs("Pro", "Dokumentacja dla większej skali danych: DPIA, procedury naruszeń."), recConsult],
    },
    highrisk: {
      badge: "Wysokie ryzyko przetwarzania",
      icon: "shield-alert",
      tone: "red",
      title: "Przetwarzasz dane podwyższonego ryzyka, dlatego warto wykonać DPIA i rozważyć stałą obsługę IOD.",
      lead: "IOD może nie być formalnie wymagany, ale skala i kategorie danych oznaczają realne ryzyko. Rekomendujemy konsultację, ocenę skutków (DPIA) oraz platformę do obsługi incydentów.",
      recommendations: [recConsult, recDocs("Pro", "Zawiera DPIA, procedury naruszeń i rekomendację dalszych działań."), recOut],
    },
    maybe: {
      badge: "IOD może być wymagany",
      icon: "help-circle",
      tone: "blue",
      title: "Obowiązek IOD jest możliwy, choć graniczny, dlatego warto go skonsultować.",
      lead: "Część przesłanek z art. 37 RODO może Cię dotyczyć. Zanim zdecydujesz, potwierdź wynik ze specjalistą i uporządkuj dokumentację.",
      recommendations: [recConsult, recDocs("Standard", "Pełniejsza dokumentacja, procedury, rejestry i upoważnienia."), recOut],
    },
    docs: {
      badge: "IOD raczej niewymagany",
      icon: "check-circle-2",
      tone: "green",
      title: "Najprawdopodobniej nie musisz powoływać IOD, ale dokumentacja RODO i tak jest potrzebna.",
      lead: "Obowiązek powołania Inspektora raczej Cię nie dotyczy. Wciąż musisz jednak prowadzić dokumentację ochrony danych, a pakiet przygotuje ją za Ciebie.",
      recommendations: [recDocs("Standard", "Rekomendowany komplet dla typowej małej firmy."), recDocs("Mikro", "Podstawowa dokumentacja dla najmniejszych firm."), recConsult],
    },
  };

  return outcomes[key];
}

function getActiveQuestions(answers: AnswerMap) {
  return questions.filter((question) => !question.show || question.show(answers));
}

function statusLabel(status: IodObligationOutput["obligation_status"]) {
  const labels: Record<IodObligationOutput["obligation_status"], string> = {
    required: "wymagany",
    likely_required: "prawdopodobnie wymagany",
    requires_case_by_case_assessment: "ocena indywidualna",
    insufficient_information: "brak danych",
    likely_not_required: "raczej niewymagany",
    not_required: "niewymagany",
  };

  return labels[status];
}

function triggerLabel(trigger: IodObligationOutput["primary_trigger"]) {
  const labels: Record<IodObligationOutput["primary_trigger"], string> = {
    public_body: "podmiot publiczny",
    large_scale_monitoring: "monitoring na dużą skalę",
    large_scale_special_categories: "dane szczególne na dużą skalę",
    large_scale_criminal_data: "dane karne na dużą skalę",
    led_controller: "reżim policyjny",
    none: "brak przesłanki",
    unclear: "niejednoznaczne",
  };

  return labels[trigger];
}

function Icon({ name, className }: { name: string; className?: string }) {
  const IconComponent = Object.hasOwn(iconMap, name) ? iconMap[name as keyof typeof iconMap] : HelpCircle;

  return <IconComponent aria-hidden="true" className={cn("shrink-0", className)} />;
}

function BrandWordmark({ inverse = false, size = "md" }: { inverse?: boolean; size?: "sm" | "md" | "lg" }) {
  return (
    <span
      className={cn(
        "font-display font-extrabold leading-none",
        inverse ? "text-[var(--white)]" : "text-[var(--gray-900)]",
        size === "sm" && "text-[19px]",
        size === "md" && "text-[24px]",
        size === "lg" && "text-[25px]",
      )}
    >
      privazy<span className={inverse ? "text-[var(--blue-300)]" : "text-[var(--brand)]"}>.</span>
    </span>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[length:var(--fs-eyebrow)] font-medium uppercase text-[var(--brand)]">
      {children}
    </span>
  );
}

function TonePill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-pill)] border px-2.5 py-1 text-[length:var(--fs-xs)] font-semibold",
        tonePillClasses[tone],
      )}
    >
      {children}
    </span>
  );
}

function PrimaryButton({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "lp-cta inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-md)] border-0 bg-[var(--brand)] px-6 text-center font-semibold text-[var(--text-on-brand)] shadow-[var(--shadow-brand-sm)]",
        className,
      )}
    >
      {children}
    </button>
  );
}

function SecondaryLink({
  children,
  href,
  className,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "lp-cta inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-card)] px-6 text-center font-semibold text-[var(--text-strong)] shadow-[var(--shadow-xs)]",
        className,
      )}
    >
      {children}
    </a>
  );
}

export function PrivazyLanding() {
  const [checkerOpen, setCheckerOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [activeTab, setActiveTab] = useState("incidents");
  const [faqOpen, setFaqOpen] = useState(0);
  const [showFloat, setShowFloat] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const offerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setShowFloat((window.scrollY || document.documentElement.scrollTop || 0) > 720);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openChecker = () => {
    setCheckerOpen(true);
    setStep(0);
    setMobileMenu(false);
  };

  const closeChecker = () => setCheckerOpen(false);

  const restartChecker = () => {
    setStep(0);
    setAnswers({});
  };

  const pickIndustry = (value: string) => {
    setAnswers({ branza: value });
    setStep(1);
    setCheckerOpen(true);
    setMobileMenu(false);
  };

  const pick = (value: string) => {
    const currentQuestions = getActiveQuestions(answers);
    const question = currentQuestions[Math.min(step, currentQuestions.length - 1)];
    setAnswers((current) => ({ ...current, [question.id]: value }));
    setStep((current) => Math.min(current + 1, getActiveQuestions({ ...answers, [question.id]: value }).length));
  };

  const openOffer = () => {
    if (offerTimer.current) clearTimeout(offerTimer.current);
    setOfferOpen(true);
  };

  const closeOffer = () => {
    offerTimer.current = setTimeout(() => setOfferOpen(false), 120);
  };

  const activeQuestions = getActiveQuestions(answers);
  const question = activeQuestions[Math.min(step, activeQuestions.length - 1)];
  const selected = answers[question.id];
  const result = step >= activeQuestions.length ? computeResult(answers) : null;
  const activeTabLabel = platformTabs.find((tab) => tab.key === activeTab)?.label ?? platformTabs[0].label;
  const progress = `${Math.round((Math.min(step, activeQuestions.length) / activeQuestions.length) * 100)}%`;

  return (
    <main className="min-h-screen overflow-x-clip bg-[var(--surface-page)] text-[var(--text-body)]">
      {checkerOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-[rgba(15,27,45,.42)] p-[clamp(12px,4vw,48px)] backdrop-blur-md"
          style={{ animation: "lpScrim var(--dur-base) var(--ease-standard)" }}
        >
          <div
            className="relative m-auto w-full max-w-[680px] overflow-hidden rounded-[var(--radius-2xl)] bg-[var(--surface-card)] shadow-[var(--shadow-xl)]"
            style={{ animation: "lpPop 280ms var(--ease-standard)" }}
          >
            <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-[22px] py-[18px]">
              <span className="grid size-[38px] place-items-center rounded-[var(--radius-md)] bg-[var(--brand-soft)] text-[var(--brand)]">
                <Icon name="shield-check" className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-display text-base font-bold text-[var(--text-strong)]">Checker obowiązku IOD</div>
                <div className="text-[length:var(--fs-xs)] text-[var(--text-muted)]">Wynik od razu · bez podawania e-maila</div>
              </div>
              <button
                type="button"
                onClick={closeChecker}
                aria-label="Zamknij"
                className="grid size-9 place-items-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-card)] text-[var(--text-muted)]"
              >
                <Icon name="x" className="size-[18px]" />
              </button>
            </div>

            {!result && (
              <div className="p-[clamp(20px,4vw,34px)]">
                <div className="mb-2.5 flex items-center justify-between gap-3">
                  <span className="font-mono text-[length:var(--fs-xs)] font-medium text-[var(--brand)]">KROK {Math.min(step + 1, activeQuestions.length)} / {activeQuestions.length}</span>
                  <span className="text-[length:var(--fs-xs)] text-[var(--text-faint)]">Pełny silnik · art. 37 RODO / LED</span>
                </div>
                <div className="mb-[22px] h-1.5 overflow-hidden rounded-[var(--radius-pill)] bg-[var(--surface-sunken)]">
                  <div
                    className="h-full rounded-[var(--radius-pill)] bg-[linear-gradient(90deg,var(--blue-500),var(--blue-400))] transition-[width] duration-[var(--dur-slow)] ease-[var(--ease-standard)]"
                    style={{ width: progress }}
                  />
                </div>
                <h3 className="text-[23px] leading-[1.18]">{question.title}</h3>
                <p className="mb-[22px] mt-2 text-[length:var(--fs-sm)] text-[var(--text-muted)]">{question.sub}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {question.options.map((option) => {
                    const isSelected = selected === option;
                    return (
                      <button
                        type="button"
                        key={option}
                        onClick={() => pick(option)}
                        className={cn(
                          "flex items-center gap-3 rounded-[var(--radius-md)] border bg-[var(--surface-card)] p-[14px_15px] text-left font-body transition-[border-color,background-color,box-shadow] duration-[var(--dur-fast)]",
                          isSelected
                            ? "border-[var(--brand)] bg-[var(--brand-soft)] shadow-[var(--shadow-brand-sm)]"
                            : "border-[var(--border-default)] hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]",
                        )}
                      >
                        <span
                          className={cn(
                            "grid size-6 shrink-0 place-items-center rounded-[7px] border-2 text-[var(--white)]",
                            isSelected ? "border-[var(--brand)] bg-[var(--brand)]" : "border-[var(--border-default)] bg-transparent",
                          )}
                        >
                          <Icon name="check" className={cn("size-3.5", !isSelected && "opacity-0")} />
                        </span>
                        <span className="text-[length:var(--fs-body)] font-semibold text-[var(--text-strong)]">{option}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-[26px] flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setStep((current) => Math.max(current - 1, 0))}
                    className={cn(
                      "inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-card)] px-[18px] font-semibold text-[var(--text-body)]",
                      step === 0 && "invisible",
                    )}
                  >
                    <Icon name="arrow-left" className="size-[18px]" />
                    Wstecz
                  </button>
                  <span className="text-[length:var(--fs-xs)] text-[var(--text-faint)]">Wybierz odpowiedź, aby przejść dalej</span>
                </div>
              </div>
            )}

            {result && (
              <div className="p-[clamp(20px,4vw,34px)]">
                <TonePill tone={result.tone}>
                  <Icon name={result.icon} className="size-4" />
                  {result.badge}
                </TonePill>
                <h3 className="mt-4 text-[clamp(24px,3.4vw,30px)] leading-[1.16]">{result.title}</h3>
                <p className="mt-3 text-[length:var(--fs-lead)] text-[var(--text-body)]">{result.lead}</p>
                <div className="mt-[18px] grid gap-2.5 sm:grid-cols-3">
                  {[
                    ["Status", statusLabel(result.assessment.obligation_status)],
                    ["Trigger", triggerLabel(result.assessment.primary_trigger)],
                    ["Skala", result.assessment.scale_result.classification],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-page)] p-3">
                      <div className="font-mono text-[length:var(--fs-xs)] uppercase text-[var(--text-faint)]">{label}</div>
                      <div className="mt-1 text-[length:var(--fs-sm)] font-semibold text-[var(--text-strong)]">{value}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-page)] p-4">
                  <div className="mb-2 text-[length:var(--fs-sm)] font-semibold text-[var(--text-strong)]">Ustalenia silnika</div>
                  <ul className="space-y-1.5 text-[length:var(--fs-sm)] leading-relaxed text-[var(--text-muted)]">
                    {result.assessment.legal_regime_results.slice(0, 2).map((item) => (
                      <li key={item.regime}>{item.rationale}</li>
                    ))}
                    <li>{result.assessment.scale_result.legal_threshold_note}</li>
                  </ul>
                  {(result.assessment.missing_information.length > 0 || result.assessment.additional_questions.length > 0) && (
                    <div className="mt-3 border-t border-[var(--border-subtle)] pt-3 text-[length:var(--fs-sm)] text-[var(--text-muted)]">
                      {result.assessment.missing_information.length > 0 && (
                        <div>
                          <span className="font-semibold text-[var(--text-strong)]">Do doprecyzowania: </span>
                          {result.assessment.missing_information.slice(0, 4).join(", ")}
                        </div>
                      )}
                      {result.assessment.additional_questions[0] && (
                        <div className="mt-1">
                          <span className="font-semibold text-[var(--text-strong)]">Pytanie kontrolne: </span>
                          {result.assessment.additional_questions[0].question}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-[22px] flex flex-col gap-3">
                  {result.recommendations.map((rec) => (
                    <a
                      key={rec.title}
                      href={rec.href}
                      onClick={closeChecker}
                      className="flex items-center gap-3.5 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 transition hover:border-[var(--brand-border)] hover:shadow-[var(--shadow-sm)]"
                    >
                      <span className="grid size-[42px] shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--brand-soft)] text-[var(--brand)]">
                        <Icon name={rec.icon} className="size-[21px]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-[length:var(--fs-body)] font-bold text-[var(--text-strong)]">{rec.title}</span>
                        <span className="mt-0.5 block text-[length:var(--fs-sm)] text-[var(--text-muted)]">{rec.desc}</span>
                      </span>
                      <Icon name="arrow-right" className="size-5 text-[var(--text-faint)]" />
                    </a>
                  ))}
                </div>
                <div className="mt-[22px] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-page)] p-4">
                  <div className="mb-2.5 text-[length:var(--fs-sm)] font-semibold text-[var(--text-strong)]">
                    Chcesz dostać wynik i rekomendację na e-mail?
                  </div>
                  <div className="min-w-0">
                    <LeadCaptureForm
                      checker={{
                        answers,
                        complianceResult: result.assessment,
                        resultStatus: result.assessment.obligation_status,
                        resultTitle: result.title,
                        resultTrigger: result.assessment.primary_trigger,
                        scale: result.assessment.scale_result.classification,
                      }}
                      compact
                      placement="checker-result"
                      subject="Wyślij wynik i porozmawiaj o rekomendacji"
                    />
                  </div>
                  <p className="mt-2.5 text-[length:var(--fs-xs)] text-[var(--text-faint)]">
                    Wynik checkera ma charakter informacyjny i pomaga dobrać dalszą ścieżkę. W przypadkach granicznych rekomendujemy konsultację ze specjalistą.
                  </p>
                </div>
                <div className="mt-[18px] flex justify-center">
                  <button
                    type="button"
                    onClick={restartChecker}
                    className="inline-flex items-center gap-2 border-0 bg-transparent text-[length:var(--fs-sm)] font-semibold text-[var(--text-muted)]"
                  >
                    <Icon name="rotate-ccw" className="size-4" />
                    Rozpocznij checker od nowa
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <header className="sticky top-0 z-[100] border-b border-[var(--border-subtle)] bg-[var(--glass-bg)] backdrop-blur-[var(--blur-md)]">
        <div className="pvz-container flex h-[70px] items-center gap-7">
          <a href="#top" className="flex items-center" aria-label="privazy.">
            <BrandWordmark size="lg" />
          </a>
          <nav className="hidden flex-1 items-center gap-[22px] lg:flex">
            <div className="relative" onMouseEnter={openOffer} onMouseLeave={closeOffer}>
              <button
                type="button"
                className="inline-flex items-center gap-1 border-0 bg-transparent p-0 text-[length:var(--fs-sm)] font-medium text-[var(--text-body)] hover:text-[var(--brand-ink)]"
              >
                Oferta
                <Icon name="chevron-down" className="size-[15px]" />
              </button>
              {offerOpen && (
                <div
                  className="absolute left-[-14px] top-[calc(100%+14px)] z-[110] w-72 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-2 shadow-[var(--shadow-xl)]"
                  style={{ animation: "lpFadeUp 160ms var(--ease-standard)" }}
                >
                  <div className="absolute inset-x-0 top-[-14px] h-3.5" />
                  {offerItems.map((item) =>
                    item.kind === "checker" ? (
                      <button
                        type="button"
                        key={item.title}
                        onClick={() => {
                          openChecker();
                          setOfferOpen(false);
                        }}
                        className="flex w-full items-center gap-[13px] rounded-[var(--radius-md)] p-[11px_12px] text-left transition hover:bg-[var(--brand-soft)]"
                      >
                        <span className="grid size-[38px] shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--brand-soft)] text-[var(--brand)]">
                          <Icon name={item.icon} className="size-[19px]" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[length:var(--fs-sm)] font-semibold text-[var(--text-strong)]">{item.title}</span>
                          <span className="mt-px block text-[length:var(--fs-xs)] text-[var(--text-muted)]">{item.desc}</span>
                        </span>
                      </button>
                    ) : (
                      <a
                        key={item.title}
                        href={item.href}
                        onClick={() => setOfferOpen(false)}
                        className="flex items-center gap-[13px] rounded-[var(--radius-md)] p-[11px_12px] transition hover:bg-[var(--brand-soft)]"
                      >
                        <span className="grid size-[38px] shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--brand-soft)] text-[var(--brand)]">
                          <Icon name={item.icon} className="size-[19px]" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[length:var(--fs-sm)] font-semibold text-[var(--text-strong)]">{item.title}</span>
                          <span className="mt-px block text-[length:var(--fs-xs)] text-[var(--text-muted)]">{item.desc}</span>
                        </span>
                      </a>
                    ),
                  )}
                </div>
              )}
            </div>
            {[
              ["Dokumenty", "#dokumenty"],
              ["Platforma", "#platforma"],
              ["Blog", "#blog"],
              ["Kontakt", "#kontakt"],
            ].map(([label, href]) => (
              <a key={label} href={href} className="text-[length:var(--fs-sm)] font-medium text-[var(--text-body)] hover:text-[var(--brand-ink)]">
                {label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <PrimaryButton onClick={openChecker} className="hidden min-h-11 px-5 text-[length:var(--fs-body)] lg:inline-flex">
              Sprawdź obowiązek IOD
              <Icon name="arrow-right" className="size-[18px]" />
            </PrimaryButton>
            <button
              type="button"
              onClick={() => setMobileMenu((current) => !current)}
              aria-label="Menu"
              className="grid size-11 place-items-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-card)] text-[var(--text-strong)] lg:hidden"
            >
              <Icon name="menu" className="size-5" />
            </button>
          </div>
        </div>
        {mobileMenu && (
          <div className="border-t border-[var(--border-subtle)] bg-[var(--surface-card)] px-[var(--gutter)] py-3 lg:hidden">
            <div className="px-2 pb-1 pt-3 text-[length:var(--fs-xs)] font-bold uppercase text-[var(--text-faint)]">Oferta</div>
            {[
              ["Sprawdź obowiązek IOD", "#checker"],
              ["Pakiety RODO", "/uslugi/dokumentacja-rodo"],
              ["Outsourcing IOD", "/uslugi/outsourcing-iod"],
              ["Dokumenty", "#dokumenty"],
              ["Platforma", "#platforma"],
              ["Blog", "#blog"],
              ["Kontakt", "#kontakt"],
            ].map(([label, href], index) => (
              <a
                key={label}
                href={href}
                onClick={() => setMobileMenu(false)}
                className={cn(
                  "block rounded-[var(--radius-sm)] px-2 py-3 font-medium text-[var(--text-body)]",
                  index < 3 && "pl-[18px] py-2.5",
                  index === 3 && "mt-2 border-t border-[var(--border-subtle)] pt-5",
                )}
              >
                {label}
              </a>
            ))}
          </div>
        )}
      </header>

      <section id="top" className="relative overflow-hidden bg-[var(--white)]">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 480px at 80% -10%, var(--blue-50), transparent 60%), radial-gradient(680px 420px at -5% 100%, var(--blue-50), transparent 55%)",
          }}
        />
        <div id="checker" className="pvz-container relative grid items-center gap-[52px] py-[clamp(44px,6vw,84px)] lg:grid-cols-[1.05fr_.95fr]">
          <div className="min-w-0">
            <h1 className="mt-[22px] text-[length:var(--fs-display)] leading-[1.05]">
              RODO dla firm
              <br />
              bez chaosu.
            </h1>
            <p className="mt-[18px] max-w-[540px] text-[length:var(--fs-lead)] text-[var(--text-body)]">
              Sprawdź, czy musisz powołać Inspektora Ochrony Danych i dobierz dokumenty w kilka minut. Kup <strong>pakiet dokumentów RODO</strong> lub zleć outsourcing IOD dla swojej organizacji.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2.5">
              {heroMicro.map((micro) => (
                <span
                  key={micro}
                  className={cn(
                    "inline-flex items-center gap-2 text-[length:var(--fs-sm)] font-medium text-[var(--text-muted)]",
                    micro === "platforma do incydentów i dokumentów" && "basis-full",
                  )}
                >
                  <Icon name="check" className="size-[17px] text-[var(--success)]" />
                  {micro}
                </span>
              ))}
            </div>
            <div className="mt-[30px] flex flex-wrap gap-3">
              <PrimaryButton onClick={openChecker} className="min-h-[54px] rounded-[var(--radius-lg)] px-[26px] text-[length:var(--fs-lead)] shadow-[var(--shadow-brand)]">
                Sprawdź, czy musisz mieć IOD
                <Icon name="arrow-right" className="size-5" />
              </PrimaryButton>
              <SecondaryLink href="/uslugi/dokumentacja-rodo" className="min-h-[54px] rounded-[var(--radius-lg)] px-6 text-[length:var(--fs-lead)]">
                Zobacz pakiety dokumentów
              </SecondaryLink>
            </div>
          </div>

          <div className="rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-[26px] shadow-[var(--shadow-xl)]">
            <div className="flex items-center gap-[11px]">
              <span className="grid size-10 place-items-center rounded-[var(--radius-md)] bg-[var(--brand-soft)] text-[var(--brand)]">
                <Icon name="badge-check" className="size-[21px]" />
              </span>
              <div className="min-w-0">
                <div className="font-display text-[17px] font-bold text-[var(--text-strong)]">Czy Twoja firma musi powołać IOD?</div>
                <div className="text-[length:var(--fs-sm)] text-[var(--text-muted)]">Odpowiedz na pytania. Wynik otrzymasz od razu.</div>
              </div>
            </div>
            <div className="my-[18px] h-px bg-[var(--border-subtle)]" />
            <div className="mb-1 text-[length:var(--fs-body)] font-semibold text-[var(--text-strong)]">Jaka jest główna branża Twojej firmy?</div>
            <div className="mb-3.5 text-[length:var(--fs-xs)] text-[var(--text-faint)]">Pytanie 1 z 7 · kliknij, aby zacząć</div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {heroIndustries.map((industry) => (
                <button
                  type="button"
                  key={industry.label}
                  onClick={() => pickIndustry(industry.value)}
                  className="flex items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-card)] p-[13px_14px] text-left transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
                >
                  <Icon name={industry.icon} className="size-[18px] text-[var(--brand)]" />
                  <span className="text-[length:var(--fs-sm)] font-semibold text-[var(--text-strong)]">{industry.label}</span>
                </button>
              ))}
            </div>
            <PrimaryButton onClick={openChecker} className="mt-4 w-full min-h-[50px] text-[length:var(--fs-body)]">
              Rozpocznij checker
              <Icon name="arrow-right" className="size-[18px]" />
            </PrimaryButton>
          </div>
        </div>
      </section>

      <section id="branze" className="pvz-section bg-[var(--surface-page)]">
        <div className="pvz-container">
          <div className="max-w-[720px]">
            <Eyebrow>Dla kogo</Eyebrow>
            <h2 className="mt-3 text-[length:var(--fs-h2)]">Dla firm, które przetwarzają dane i chcą uporządkować RODO bez wielomiesięcznego projektu</h2>
          </div>
          <div className="mt-11 grid gap-[22px] lg:grid-cols-3">
            {industries.map((industry) => (
              <article key={industry.title} className="flex min-w-0 flex-col rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-[26px] shadow-[var(--shadow-sm)]">
                <span className="mb-4 grid size-[50px] place-items-center rounded-[var(--radius-lg)] bg-[var(--brand-soft)] text-[var(--brand)]">
                  <Icon name={industry.icon} className="size-[25px]" />
                </span>
                <h3 className="text-[19px] leading-[1.25]">{industry.title}</h3>
                <p className="mt-2 flex-1 text-[length:var(--fs-sm)] text-[var(--text-muted)]">{industry.desc}</p>
                <button
                  type="button"
                  onClick={() => pickIndustry(industry.value)}
                  className="lp-link mt-[18px] inline-flex items-center gap-2 self-start border-0 bg-transparent p-0 text-[length:var(--fs-sm)] font-semibold text-[var(--brand-ink)]"
                >
                  Sprawdź wymagania dla tej branży
                  <Icon name="arrow-right" className="size-4" />
                </button>
                <a
                  href={industry.href}
                  className="lp-link mt-3 inline-flex items-center gap-2 self-start text-[length:var(--fs-sm)] font-semibold text-[var(--text-muted)]"
                >
                  Zobacz stronę branży
                  <Icon name="arrow-right" className="size-4" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="sciezki" className="pvz-section bg-[var(--white)]">
        <div className="pvz-container">
          <div className="mx-auto max-w-[720px] text-center">
            <Eyebrow>Wybierz swoją ścieżkę</Eyebrow>
            <h2 className="mt-3 text-[length:var(--fs-h2)]">Wybierz sposób wdrożenia RODO dopasowany do Twojej firmy</h2>
            <p className="mt-3.5 text-[length:var(--fs-lead)] text-[var(--text-body)]">Nie wiesz, od czego zacząć? Zacznij od checkera, a sam podpowie Ci dalszą ścieżkę.</p>
          </div>
          <div className="mt-11 grid items-stretch gap-[22px] lg:grid-cols-3">
            {paths.map((path) => {
              const content = (
                <>
                  <span
                    className={cn(
                      "mb-[18px] grid size-[54px] place-items-center rounded-[var(--radius-lg)]",
                      path.tone === "brand" ? "bg-[var(--brand)] text-[var(--text-on-brand)]" : "bg-[var(--brand-soft)] text-[var(--brand)]",
                    )}
                  >
                    <Icon name={path.icon} className="size-[26px]" />
                  </span>
                  <h3 className="text-[21px] leading-[1.2]">{path.title}</h3>
                  <p className="mt-2.5 flex-1 text-[length:var(--fs-body)] text-[var(--text-muted)]">{path.desc}</p>
                </>
              );

              return (
                <article
                  key={path.title}
                  className={cn(
                    "flex min-w-0 flex-col rounded-[var(--radius-2xl)] bg-[var(--surface-card)] p-[30px]",
                    path.tone === "brand" ? "border-2 border-[var(--brand)] shadow-[var(--shadow-lg)]" : "border border-[var(--border-subtle)] shadow-[var(--shadow-sm)]",
                  )}
                >
                  {content}
                  <div className="mt-[22px]">
                    {path.kind === "checker" ? (
                      <PrimaryButton onClick={openChecker} className="w-full min-h-[50px] text-[length:var(--fs-body)]">
                        {path.cta}
                        <Icon name="arrow-right" className="size-[18px]" />
                      </PrimaryButton>
                    ) : (
                      <SecondaryLink href={path.href ?? "#"} className="w-full min-h-[50px] text-[length:var(--fs-body)] shadow-none">
                        {path.cta}
                        <Icon name="arrow-right" className="size-[18px]" />
                      </SecondaryLink>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="platforma" className="pvz-section relative overflow-hidden bg-[var(--white)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_420px_at_85%_0%,var(--blue-50),transparent_60%)]" />
        <div className="pvz-container relative">
          <div className="max-w-[820px]">
            <Eyebrow>Platforma klienta</Eyebrow>
            <h2 className="mt-3 text-[length:var(--fs-h2)]">
              RODO to nie folder z dokumentami. Dlatego klienci PRIVAZY dostają platformę do obsługi danych, dokumentów i incydentów.
            </h2>
          </div>

          <div className="mt-10 overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-xl)]">
            <div className="flex items-center gap-3.5 border-b border-[var(--border-subtle)] bg-[var(--surface-page)] px-[18px] py-[13px]">
              <span className="flex gap-[7px]" aria-hidden="true">
                <span className="size-[11px] rounded-full bg-[var(--danger)]" />
                <span className="size-[11px] rounded-full bg-[var(--warning)]" />
                <span className="size-[11px] rounded-full bg-[var(--success)]" />
              </span>
              <span className="flex flex-1 justify-center">
                <span className="inline-flex items-center gap-[7px] rounded-[var(--radius-pill)] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3.5 py-1 font-mono text-[length:var(--fs-xs)] text-[var(--text-muted)]">
                  <Icon name="lock" className="size-3" />
                  platforma.privazy.pl
                </span>
              </span>
            </div>
            <div className="grid min-h-[440px] lg:grid-cols-[232px_1fr]">
              <aside className="flex min-w-0 flex-col border-b border-[var(--border-subtle)] bg-[var(--surface-page)] p-[18px_14px] lg:border-b-0 lg:border-r">
                <div className="flex items-center gap-2 px-2 pb-4 pt-1">
                  <BrandWordmark size="sm" />
                </div>
                <div className="pvz-h-scroll flex gap-1 lg:flex-col" data-responsive-scroll="true">
                  {platformTabs.map((tab) => (
                    <button
                      type="button"
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={cn(
                        "inline-flex min-w-max items-center gap-[11px] rounded-[var(--radius-md)] border-0 px-[13px] py-[11px] text-left text-[length:var(--fs-sm)] font-semibold transition lg:w-full",
                        activeTab === tab.key ? "bg-[var(--brand-soft)] text-[var(--brand-ink)]" : "bg-transparent text-[var(--gray-400)]",
                      )}
                    >
                      <Icon name={tab.icon} className={cn("size-[18px]", activeTab === tab.key ? "text-[var(--brand)]" : "text-[var(--gray-400)]")} />
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2.5 border-t border-[var(--border-subtle)] px-2 pb-1 pt-3 lg:mt-auto">
                  <span className="grid size-[34px] shrink-0 place-items-center rounded-full bg-[var(--brand)] text-[13px] font-bold text-[var(--text-on-brand)]">MK</span>
                  <span className="min-w-0">
                    <span className="block text-[length:var(--fs-sm)] font-semibold text-[var(--text-strong)]">MedCare Sp. z o.o.</span>
                    <span className="block text-[length:var(--fs-xs)] text-[var(--text-muted)]">Pakiet Pro + IOD</span>
                  </span>
                </div>
              </aside>
              <div className="flex min-w-0 flex-col">
                <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-[22px] py-4">
                  <div className="font-display text-[17px] font-bold text-[var(--text-strong)]">{activeTabLabel}</div>
                </div>
                <div className="min-w-0 flex-1 p-5 sm:p-[20px_22px]">
                  {activeTab === "incidents" && (
                    <div className="flex flex-col gap-2.5">
                      {pIncidents.map((row) => (
                        <div key={row.id} className="grid min-w-0 gap-x-3.5 gap-y-2 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3.5 sm:grid-cols-[1fr_auto] sm:p-[14px_16px]">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <span className="font-mono text-[length:var(--fs-xs)] text-[var(--text-muted)]">{row.id}</span>
                              <span className="text-[length:var(--fs-sm)] font-bold text-[var(--text-strong)]">{row.type}</span>
                            </div>
                            <div className="mt-1 text-[length:var(--fs-xs)] text-[var(--text-muted)]">{row.who} · {row.date}</div>
                          </div>
                          <div className="flex items-start justify-between gap-2 sm:flex-col sm:items-end">
                            <TonePill tone={row.tone}>{row.status}</TonePill>
                            <span className="text-[length:var(--fs-xs)] text-[var(--text-faint)]">{row.sla}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "documents" && (
                    <div className="flex flex-col gap-2.5">
                      {pDocuments.map((doc) => (
                        <div key={doc.name} className="flex min-w-0 items-center gap-[13px] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-[13px_16px]">
                          <span className="grid size-[38px] shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--brand-soft)] text-[var(--brand)]">
                            <Icon name="file-text" className="size-[19px]" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[length:var(--fs-sm)] font-semibold text-[var(--text-strong)]">{doc.name}</span>
                            <span className="mt-0.5 block text-[length:var(--fs-xs)] text-[var(--text-muted)]">Aktualizacja: {doc.updated}</span>
                          </span>
                          <TonePill tone={doc.tone}>
                            <span className={cn("size-[7px] rounded-full", toneDotClasses[doc.tone])} />
                            {doc.status}
                          </TonePill>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "iod" && (
                    <div className="flex flex-col gap-3">
                      {pIod.map((message) => (
                        <div
                          key={`${message.who}-${message.time}`}
                          className={cn(
                            "flex max-w-[78%] flex-col",
                            message.from === "me" ? "self-end items-end" : "self-start items-start",
                          )}
                        >
                          <span className="mb-1 text-[length:var(--fs-xs)] text-[var(--text-faint)]">{message.who} · {message.time}</span>
                          <span
                            className={cn(
                              "rounded-[14px] px-3.5 py-[11px] text-[length:var(--fs-sm)] leading-normal",
                              message.from === "me"
                                ? "rounded-br bg-[var(--brand)] text-[var(--text-on-brand)]"
                                : "rounded-bl border border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-body)]",
                            )}
                          >
                            {message.text}
                          </span>
                        </div>
                      ))}
                      <div className="mt-1.5 flex gap-2.5 border-t border-[var(--border-subtle)] pt-3.5">
                        <div className="flex h-[42px] flex-1 items-center rounded-[var(--radius-md)] border border-[var(--border-default)] px-3.5 text-[length:var(--fs-sm)] text-[var(--text-faint)]">
                          Napisz do inspektora...
                        </div>
                        <span className="grid size-[42px] place-items-center rounded-[var(--radius-md)] bg-[var(--brand)] text-[var(--text-on-brand)]">
                          <Icon name="send" className="size-[18px]" />
                        </span>
                      </div>
                    </div>
                  )}

                  {activeTab === "history" && (
                    <div className="relative flex flex-col">
                      {pHistory.map((history) => (
                        <div key={history.title} className="grid grid-cols-[22px_1fr] gap-3.5 pb-[18px]">
                          <div className="flex flex-col items-center">
                            <span className={cn("mt-1 size-[13px] rounded-full border-[3px] border-[var(--surface-card)] shadow-[0_0_0_1px_var(--border-subtle)]", toneDotClasses[history.tone])} />
                            <span className="mt-1 w-0.5 flex-1 bg-[var(--border-subtle)]" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-mono text-[length:var(--fs-xs)] text-[var(--text-muted)]">{history.date}</div>
                            <div className="mt-0.5 text-[length:var(--fs-sm)] font-bold text-[var(--text-strong)]">{history.title}</div>
                            <div className="mt-0.5 text-[length:var(--fs-sm)] text-[var(--text-muted)]">{history.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "sla" && (
                    <div className="flex flex-col gap-4">
                      {pSla.map((task) => (
                        <div key={task.task}>
                          <div className="mb-[7px] flex items-center justify-between gap-3">
                            <span className="text-[length:var(--fs-sm)] font-semibold text-[var(--text-strong)]">{task.task}</span>
                            <span className="font-mono text-[length:var(--fs-xs)] text-[var(--text-muted)]">{task.due}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-[var(--radius-pill)] bg-[var(--surface-sunken)]">
                            <div className={cn("h-full rounded-[var(--radius-pill)]", toneDotClasses[task.tone])} style={{ width: `${task.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "statuses" && (
                    <div className="grid gap-3 sm:grid-cols-3">
                      {pStatuses.map((column) => (
                        <div key={column.col} className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-page)] p-3.5">
                          <div className="mb-3 flex items-center justify-between">
                            <span className="inline-flex items-center gap-[7px] text-[length:var(--fs-sm)] font-bold text-[var(--text-strong)]">
                              <span className={cn("size-2 rounded-full", toneDotClasses[column.tone])} />
                              {column.col}
                            </span>
                            <TonePill tone={column.tone}>{column.count}</TonePill>
                          </div>
                          <div className="flex flex-col gap-2">
                            {column.items.map((item) => (
                              <div key={item} className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-[10px_12px] text-[length:var(--fs-xs)] leading-normal text-[var(--text-body)]">
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-9 grid gap-[18px] lg:grid-cols-3">
            {platformFeatures.map((feature) => (
              <article key={feature.title} className="flex gap-[13px] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-page)] p-[18px]">
                <span className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--brand-soft)] text-[var(--brand)]">
                  <Icon name={feature.icon} className="size-5" />
                </span>
                <div className="min-w-0">
                  <div className="text-[length:var(--fs-sm)] font-bold text-[var(--text-strong)]">{feature.title}</div>
                  <div className="mt-1 text-[length:var(--fs-sm)] text-[var(--text-muted)]">{feature.desc}</div>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <PrimaryButton className="min-h-[50px] text-[length:var(--fs-body)]">
              Zobacz, jak działa platforma
              <Icon name="arrow-right" className="size-[18px]" />
            </PrimaryButton>
            <SecondaryLink href="#kontakt" className="min-h-[50px] text-[length:var(--fs-body)] shadow-none">
              Umów prezentację
            </SecondaryLink>
          </div>
        </div>
      </section>

      <section id="pakiety" className="pvz-section bg-[var(--surface-page)]">
        <div className="pvz-container">
          <div className="mx-auto max-w-[760px] text-center">
            <Eyebrow>Pakiety dokumentów</Eyebrow>
            <h2 className="mt-3 text-[length:var(--fs-h2)]">Pakiety dokumentów RODO dla firm, które chcą szybko uporządkować zgodność</h2>
            <p className="mt-3.5 text-[length:var(--fs-lead)] text-[var(--text-body)]">Wybierz pakiet, podaj dane potrzebne do personalizacji, a my przygotujemy dokumenty i sprawdzimy je przed przekazaniem.</p>
          </div>
          <div className="mt-[52px] grid items-start gap-[22px] lg:grid-cols-3">
            {packages.map((pkg) => (
              <article
                key={pkg.name}
                className={cn(
                  "relative flex min-w-0 flex-col rounded-[var(--radius-2xl)] bg-[var(--surface-card)] p-8",
                  pkg.recommended
                    ? "border-2 border-[var(--brand)] shadow-[var(--shadow-xl)] lg:-translate-y-2"
                    : "border border-[var(--border-subtle)] shadow-[var(--shadow-sm)]",
                )}
              >
                {pkg.recommended && (
                  <div className="absolute left-1/2 top-[-13px] -translate-x-1/2">
                    <span className="inline-flex whitespace-nowrap rounded-[var(--radius-pill)] bg-[var(--brand)] px-3.5 py-1.5 text-[length:var(--fs-xs)] font-bold text-[var(--text-on-brand)] shadow-[var(--shadow-brand-sm)]">
                      <Icon name="star" className="mr-1.5 size-[13px]" />
                      Najczęściej wybierany
                    </span>
                  </div>
                )}
                <div className="font-display text-2xl font-extrabold text-[var(--text-strong)]">{pkg.name}</div>
                <p className="mt-1.5 text-[length:var(--fs-sm)] text-[var(--text-muted)]">{pkg.tagline}</p>
                <div className="my-5 h-px bg-[var(--border-subtle)]" />
                <ul className="flex flex-1 list-none flex-col gap-3 p-0">
                  {pkg.feats.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-[length:var(--fs-sm)] text-[var(--text-body)]">
                      <Icon name="check" className="mt-px size-[18px] text-[var(--success)]" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <div className="mt-[26px]">
                  {pkg.recommended ? (
                    <PrimaryButton className="w-full min-h-[50px] text-[length:var(--fs-body)]">{pkg.cta}</PrimaryButton>
                  ) : (
                    <SecondaryLink href="#kontakt" className="w-full min-h-[50px] text-[length:var(--fs-body)] shadow-none">{pkg.cta}</SecondaryLink>
                  )}
                </div>
              </article>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center gap-3.5 rounded-[var(--radius-xl)] border border-[var(--brand-border)] bg-[var(--surface-card)] p-6 text-center">
            <div className="font-display text-lg font-bold text-[var(--text-strong)]">Nie wiesz, który pakiet wybrać? Uruchom checker i dobierz pakiet automatycznie.</div>
            <PrimaryButton onClick={openChecker} className="min-h-12 text-[length:var(--fs-body)]">
              Dobierz pakiet w checkerze
              <Icon name="arrow-right" className="size-[18px]" />
            </PrimaryButton>
          </div>
        </div>
      </section>

      <section id="dokumenty" className="pvz-section bg-[var(--white)]">
        <div className="pvz-container">
          <div className="max-w-[720px]">
            <Eyebrow>Pojedyncze dokumenty</Eyebrow>
            <h2 className="mt-3 text-[length:var(--fs-h2)]">Najczęściej wybierane dokumenty RODO</h2>
          </div>
          <div className="mt-10 grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <article key={doc.name} className="flex min-w-0 flex-col rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-[22px] shadow-[var(--shadow-sm)]">
                <span className="mb-3.5 grid size-11 place-items-center rounded-[var(--radius-md)] bg-[var(--brand-soft)] text-[var(--brand)]">
                  <Icon name={doc.icon} className="size-[22px]" />
                </span>
                <div className="font-display text-base font-bold leading-[1.3] text-[var(--text-strong)]">{doc.name}</div>
                <p className="mt-2 flex-1 text-[length:var(--fs-sm)] text-[var(--text-muted)]">{doc.desc}</p>
                <div className="mt-4 flex items-center justify-between gap-2.5">
                  <span className="text-[length:var(--fs-xs)] text-[var(--text-faint)]">Dla: {doc.who}</span>
                  <span className="lp-link inline-flex items-center gap-1.5 text-[length:var(--fs-sm)] font-semibold text-[var(--brand-ink)]">
                    Zobacz dokument
                    <Icon name="arrow-right" className="size-[15px]" />
                  </span>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-[30px] flex justify-center">
            <SecondaryLink href="/sklep/polityka-prywatnosci" className="min-h-12 text-[length:var(--fs-body)] shadow-none">
              Zobacz pełny katalog dokumentów
              <Icon name="arrow-right" className="size-[18px]" />
            </SecondaryLink>
          </div>
        </div>
      </section>

      <section id="outsourcing" className="pvz-section bg-[var(--surface-page)]">
        <div className="pvz-container">
          <div className="grid items-start gap-12 lg:grid-cols-[.9fr_1.1fr]">
            <div className="min-w-0">
              <Eyebrow>Outsourcing IOD</Eyebrow>
              <h2 className="mt-3 text-[length:var(--fs-h2)]">Outsourcing IOD dla firm, które potrzebują stałego nadzoru, a nie tylko dokumentów</h2>
              <p className="mt-4 text-[length:var(--fs-lead)] text-[var(--text-body)]">
                Przejmujemy funkcję IOD, wspieramy administratora danych, obsługujemy incydenty, aktualizujemy dokumentację, szkolimy pracowników i pomagamy w kontakcie z organem nadzorczym.
              </p>
              <div className="mt-[26px] rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-[22px]">
                <div className="mb-4 text-[length:var(--fs-sm)] font-bold text-[var(--text-strong)]">Jak zaczynamy współpracę</div>
                <div className="flex flex-col gap-0.5">
                  {outsourcingProcess.map((label, index) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="grid size-[26px] shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-xs font-bold text-[var(--brand-ink)]">{index + 1}</span>
                      <span className="py-2 text-[length:var(--fs-sm)] font-medium text-[var(--text-body)]">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6">
                <PrimaryButton className="min-h-[52px] text-[length:var(--fs-body)] shadow-[var(--shadow-brand)]">
                  Umów rozmowę z ekspertem
                  <Icon name="arrow-right" className="size-[18px]" />
                </PrimaryButton>
                <p className="mt-3 text-[length:var(--fs-sm)] text-[var(--text-muted)]">Oddzwonimy w ciągu 24 godzin w dni robocze.</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {outsourcingTiles.map((tile) => (
                <article key={tile.title} className="flex min-h-[120px] flex-col gap-3 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-[22px] shadow-[var(--shadow-sm)]">
                  <span className="grid size-[46px] place-items-center rounded-[var(--radius-lg)] bg-[var(--brand-soft)] text-[var(--brand)]">
                    <Icon name={tile.icon} className="size-[23px]" />
                  </span>
                  <div className="font-display text-base font-bold leading-[1.25] text-[var(--text-strong)]">{tile.title}</div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="proces" className="pvz-section bg-[var(--white)]">
        <div className="pvz-container">
          <div className="mx-auto max-w-[720px] text-center">
            <Eyebrow>Proces</Eyebrow>
            <h2 className="mt-3 text-[length:var(--fs-h2)]">Jak wygląda wdrożenie RODO z PRIVAZY?</h2>
            <p className="mt-3.5 text-[length:var(--fs-lead)] text-[var(--text-body)]">Bez wielomiesięcznego projektu i bez prawniczego żargonu, w sześciu prostych krokach.</p>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {implementSteps.map((stepItem, index) => (
              <article key={stepItem.title} className="relative min-w-0 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-page)] p-[26px]">
                <span className="absolute right-6 top-[22px] font-display text-[38px] font-extrabold text-[var(--blue-100)]">{index + 1}</span>
                <span className="mb-4 grid size-[50px] place-items-center rounded-[var(--radius-lg)] bg-[var(--brand-soft)] text-[var(--brand)]">
                  <Icon name={stepItem.icon} className="size-[25px]" />
                </span>
                <h3 className="text-lg leading-[1.25]">{stepItem.title}</h3>
                <p className="mt-2 text-[length:var(--fs-sm)] text-[var(--text-muted)]">{stepItem.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="zaufanie" className="pvz-section bg-[var(--surface-page)]">
        <div className="pvz-container">
          <div className="max-w-[720px]">
            <Eyebrow>Zaufanie</Eyebrow>
            <h2 className="mt-3 text-[length:var(--fs-h2)]">Praktyczne doświadczenie w ochronie danych, nie tylko teoria</h2>
            <p className="mt-3.5 text-[length:var(--fs-lead)] text-[var(--text-body)]">Specjaliści PRIVAZY mają doświadczenie zdobyte w realnych wdrożeniach i przy pełnieniu funkcji IOD.</p>
          </div>
          <div className="mt-10 grid gap-3.5 lg:grid-cols-2">
            {trustStats.map((stat) => (
              <article key={stat.text} className="flex items-center gap-3.5 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-[16px_18px]">
                <span className="grid size-[42px] shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--brand-soft)] text-[var(--brand)]">
                  <Icon name={stat.icon} className="size-[21px]" />
                </span>
                <span className="text-[length:var(--fs-sm)] font-medium text-[var(--text-body)]">{stat.text}</span>
              </article>
            ))}
          </div>
          <div className="mt-7 grid gap-5 lg:grid-cols-3">
            {trustPillars.map((pillar) => (
              <article key={pillar.title} className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-[26px] shadow-[var(--shadow-sm)]">
                <span className="mb-4 grid size-[50px] place-items-center rounded-[var(--radius-lg)] bg-[var(--gray-900)] text-[var(--white)]">
                  <Icon name={pillar.icon} className="size-6" />
                </span>
                <h3 className="text-xl">{pillar.title}</h3>
                <p className="mt-2 text-[length:var(--fs-sm)] text-[var(--text-muted)]">{pillar.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="blog" className="pvz-section bg-[var(--white)]">
        <div className="pvz-container">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="max-w-[620px]">
              <Eyebrow>Blog</Eyebrow>
              <h2 className="mt-3 text-[length:var(--fs-h2)]">Praktyczne poradniki RODO dla firm</h2>
            </div>
            <SecondaryLink href="/blog" className="min-h-[46px] px-5 text-[length:var(--fs-sm)] shadow-none">
              Zobacz poradniki
              <Icon name="arrow-right" className="size-4" />
            </SecondaryLink>
          </div>
          <div className="mt-9 grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
            {blogPosts.map((post) => (
              <Link key={post.title} href="/blog" className="flex min-w-0 flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)]">
                <div className="grid h-[110px] place-items-center bg-[linear-gradient(135deg,var(--blue-50),var(--blue-100))] text-[var(--brand)]">
                  <Icon name={post.icon} className="size-[34px]" />
                </div>
                <div className="flex flex-1 flex-col p-[18px]">
                  <span className="self-start rounded-[var(--radius-pill)] bg-[var(--brand-soft)] px-2.5 py-1 text-[length:var(--fs-xs)] font-semibold text-[var(--brand-ink)]">{post.tag}</span>
                  <div className="mt-3 flex-1 font-display text-base font-bold leading-[1.3] text-[var(--text-strong)]">{post.title}</div>
                  <span className="mt-3 text-[length:var(--fs-xs)] text-[var(--text-faint)]">Czas czytania: {post.read}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-[30px] flex justify-center">
            <PrimaryButton onClick={openChecker} className="min-h-12 text-[length:var(--fs-body)]">
              Sprawdź obowiązek IOD
              <Icon name="arrow-right" className="size-[18px]" />
            </PrimaryButton>
          </div>
        </div>
      </section>

      <section id="faq" className="pvz-section bg-[var(--surface-page)]">
        <div className="mx-auto w-full max-w-[860px] px-[var(--gutter)]">
          <div className="mx-auto max-w-[680px] text-center">
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="mt-3 text-[length:var(--fs-h2)]">Najczęstsze pytania o RODO, dokumenty i outsourcing IOD</h2>
          </div>
          <div className="mt-10 flex flex-col gap-3">
            {faqItems.map((item, index) => {
              const open = faqOpen === index;
              return (
                <article
                  key={item.q}
                  className={cn(
                    "overflow-hidden rounded-[var(--radius-lg)] border bg-[var(--surface-card)]",
                    open ? "border-[var(--brand-border)] shadow-[var(--shadow-md)]" : "border-[var(--border-subtle)] shadow-[var(--shadow-xs)]",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setFaqOpen((current) => (current === index ? -1 : index))}
                    className="flex w-full items-center justify-between gap-4 border-0 bg-transparent p-[18px_22px] text-left font-body"
                  >
                    <span className="font-display text-base font-semibold text-[var(--text-strong)]">{item.q}</span>
                    <span className={cn("shrink-0 text-[var(--brand)] transition-transform duration-[var(--dur-base)]", open && "rotate-180")}>
                      <Icon name="chevron-down" className="size-5" />
                    </span>
                  </button>
                  {open && <div className="px-[22px] pb-5 text-[length:var(--fs-body)] leading-relaxed text-[var(--text-body)]">{item.a}</div>}
                </article>
              );
            })}
          </div>
          <div className="mt-6 flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--brand-border)] bg-[var(--info-soft)] p-[16px_18px]">
            <Icon name="info" className="mt-px size-5 text-[var(--brand)]" />
            <span className="text-[length:var(--fs-sm)] leading-relaxed text-[var(--text-body)]">
              Wynik checkera ma charakter informacyjny i pomaga dobrać dalszą ścieżkę. W przypadkach granicznych rekomendujemy konsultację ze specjalistą.
            </span>
          </div>
        </div>
      </section>

      <section id="kontakt" className="pvz-section bg-[var(--white)]">
        <div className="pvz-container">
          <div className="relative overflow-hidden rounded-[var(--radius-2xl)] bg-[linear-gradient(135deg,var(--blue-600),var(--blue-500))] p-[clamp(40px,6vw,72px)] text-center text-[var(--white)] shadow-[var(--shadow-brand)]">
            <div className="absolute inset-0 bg-[radial-gradient(600px_320px_at_88%_0%,rgba(255,255,255,.18),transparent_60%)]" />
            <div className="relative">
              <h2 className="text-[length:var(--fs-h2)] text-[var(--white)]">Nie wiesz, od czego zacząć z RODO? Zacznij od checkera.</h2>
              <div className="mt-[30px] flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={openChecker}
                  className="lp-cta inline-flex min-h-[54px] items-center gap-2 rounded-[var(--radius-lg)] border-0 bg-[var(--white)] px-[26px] text-[length:var(--fs-lead)] font-bold text-[var(--brand-ink)]"
                >
                  Sprawdź obowiązek IOD
                  <Icon name="arrow-right" className="size-5" />
                </button>
                <a href="#kontakt" className="lp-cta inline-flex min-h-[54px] items-center gap-2 rounded-[var(--radius-lg)] border border-[color-mix(in_srgb,var(--white)_50%,transparent)] bg-transparent px-6 text-[length:var(--fs-lead)] font-semibold text-[var(--white)]">
                  Porozmawiaj z ekspertem
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="lp-foot bg-[var(--gray-900)] text-[rgba(255,255,255,.7)]">
        <div className="pvz-container grid gap-10 py-16 pb-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <BrandWordmark inverse />
            <p className="mt-4 max-w-[300px] text-[length:var(--fs-sm)] leading-relaxed">
              RODO dla firm bez chaosu. Checker obowiązku IOD, pakiety dokumentów, outsourcing IOD i platforma do obsługi incydentów.
            </p>
            <a href="mailto:kontakt@privazy.pl" className="mt-4 inline-block text-[length:var(--fs-sm)] font-semibold text-[var(--blue-300)]">
              kontakt@privazy.pl
            </a>
          </div>
          <FooterColumn
            title="Produkt"
            links={[
              ["Checker IOD", "#checker"],
              ["Pakiety RODO", "/uslugi/dokumentacja-rodo"],
              ["Dokumenty", "#dokumenty"],
              ["Outsourcing IOD", "/uslugi/outsourcing-iod"],
              ["Platforma", "#platforma"],
            ]}
          />
          <FooterColumn
            title="Branże"
            links={[
              ["Placówki medyczne", "#branze"],
              ["Edukacja niepubliczna", "#branze"],
              ["HR i rekrutacja", "#branze"],
              ["E-commerce", "#branze"],
              ["Kancelarie", "#branze"],
            ]}
          />
          <FooterColumn
            title="Firma"
            links={[
              ["Blog", "#blog"],
              ["Kontakt", "#kontakt"],
              ["Regulamin", "#"],
              ["Polityka prywatności", "#"],
            ]}
          />
        </div>
        <div className="border-t border-[rgba(255,255,255,.1)]">
          <div className="pvz-container flex flex-wrap justify-between gap-4 py-5 text-[length:var(--fs-xs)] text-[rgba(255,255,255,.5)]">
            <span>© 2026 PRIVAZY. Wszelkie prawa zastrzeżone.</span>
            <span>Treści mają charakter ogólny i nie stanowią porady prawnej dla konkretnej sprawy.</span>
          </div>
        </div>
      </footer>

      {showFloat && !checkerOpen && (
        <div
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex justify-center px-[var(--gutter)] py-3"
          style={{ animation: "lpFadeUp var(--dur-base) var(--ease-standard)" }}
        >
          <div className="pointer-events-auto flex w-full max-w-[760px] flex-col items-stretch gap-[18px] rounded-[var(--radius-lg)] bg-[var(--gray-900)] p-[14px_18px] text-center text-[var(--white)] shadow-[var(--shadow-xl)] sm:flex-row sm:items-center sm:text-left">
            <span className="hidden size-10 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[rgba(255,255,255,.12)] text-[var(--white)] sm:grid">
              <Icon name="compass" className="size-[21px]" />
            </span>
            <span className="flex-1 text-[length:var(--fs-sm)] font-medium leading-normal">
              Nie wiesz, czego potrzebuje Twoja firma? <strong>Sprawdź w 7 krokach.</strong>
            </span>
            <PrimaryButton onClick={openChecker} className="min-h-11 shrink-0 whitespace-nowrap px-5 text-[length:var(--fs-sm)]">
              Uruchom checker
              <Icon name="arrow-right" className="size-[17px]" />
            </PrimaryButton>
          </div>
        </div>
      )}
    </main>
  );
}

function FooterColumn({ title, links }: { title: string; links: Array<[string, string]> }) {
  return (
    <div>
      <div className="mb-4 font-display text-[length:var(--fs-xs)] font-bold uppercase text-[var(--white)]">{title}</div>
      <ul className="flex list-none flex-col gap-[11px] p-0">
        {links.map(([label, href]) => (
          <li key={label}>
            <a href={href} className="text-[length:var(--fs-sm)] text-[rgba(255,255,255,.7)]">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
