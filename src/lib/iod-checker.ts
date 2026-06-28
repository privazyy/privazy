export const iodSectorOptions = [
  { value: "zdrowie", label: "Ochrona zdrowia" },
  { value: "finanse", label: "Banki i finanse" },
  { value: "ecommerce", label: "Handel / e-commerce" },
  { value: "it", label: "IT / SaaS" },
  { value: "marketing", label: "Marketing / reklama" },
  { value: "edukacja", label: "Edukacja" },
  { value: "publiczny", label: "Sektor publiczny" },
  { value: "inne", label: "Inna działalność" },
] as const;

export const iodScaleOptions = [
  { value: "s", label: "Do 1 000 osób" },
  { value: "m", label: "1 000 - 10 000 osób" },
  { value: "l", label: "10 000 - 100 000 osób" },
  { value: "xl", label: "Ponad 100 000 osób" },
] as const;

export const iodTriStateOptions = [
  { value: "tak", label: "Tak" },
  { value: "nie", label: "Nie" },
  { value: "nie_wiem", label: "Nie wiem" },
] as const;

export type IodSector = (typeof iodSectorOptions)[number]["value"];
export type IodScale = (typeof iodScaleOptions)[number]["value"];
export type IodTriState = (typeof iodTriStateOptions)[number]["value"];

export type IodCheckerAnswers = {
  publiczny: "tak" | "nie";
  branza: IodSector;
  monitoring: IodTriState;
  wrazliwe: IodTriState;
  skala: IodScale;
  iod: IodTriState;
};

export type IodResultLevel = "required" | "verification" | "not_required";

export type IodCheckerResult = {
  level: IodResultLevel;
  badge: string;
  title: string;
  description: string;
  reasons: string[];
  score: number;
  leadValue: number;
  hot: boolean;
};

export const iodSectorLabels: Record<IodSector, string> = {
  zdrowie: "Ochrona zdrowia",
  finanse: "Banki i finanse",
  ecommerce: "Handel / e-commerce",
  it: "IT / SaaS",
  marketing: "Marketing / reklama",
  edukacja: "Edukacja",
  publiczny: "Sektor publiczny",
  inne: "Inna działalność",
};

export const iodScaleLabels: Record<IodScale, string> = {
  s: "Do 1 000 osób",
  m: "1 000 - 10 000 osób",
  l: "10 000 - 100 000 osób",
  xl: "Ponad 100 000 osób",
};

export function calculateIodResult(answers: Partial<IodCheckerAnswers>): IodCheckerResult {
  const reasons: string[] = [];
  let score = 0;

  if (answers.publiczny === "tak" || answers.branza === "publiczny") {
    score += 5;
    reasons.push("organizacja publiczna");
  }

  if (answers.monitoring === "tak") {
    score += 4;
    reasons.push("regularny monitoring osób na dużą skalę");
  }

  if (answers.wrazliwe === "tak") {
    score += 4;
    reasons.push("dane szczególnej kategorii na dużą skalę");
  }

  if (answers.skala === "l" || answers.skala === "xl") {
    score += answers.skala === "xl" ? 3 : 2;
    reasons.push("duża skala przetwarzania");
  }

  if (answers.branza === "zdrowie" || answers.branza === "finanse") {
    score += 2;
    reasons.push(`branża: ${iodSectorLabels[answers.branza]}`);
  }

  if (answers.branza === "marketing") {
    score += 1;
    reasons.push("profilowanie lub działania marketingowe");
  }

  if (answers.monitoring === "nie_wiem" || answers.wrazliwe === "nie_wiem" || answers.iod === "nie_wiem") {
    score += 1;
    reasons.push("odpowiedź wymaga doprecyzowania");
  }

  if (answers.iod === "nie" && score >= 4) {
    score += 1;
    reasons.push("brak obecnie wyznaczonego IOD");
  }

  const hasStatutoryTrigger =
    answers.publiczny === "tak" ||
    answers.branza === "publiczny" ||
    answers.monitoring === "tak" ||
    answers.wrazliwe === "tak";

  const needsVerification =
    score >= 3 ||
    answers.skala === "l" ||
    answers.skala === "xl" ||
    answers.branza === "zdrowie" ||
    answers.branza === "finanse" ||
    answers.monitoring === "nie_wiem" ||
    answers.wrazliwe === "nie_wiem";

  if (hasStatutoryTrigger) {
    return {
      level: "required",
      badge: "Prawdopodobny obowiązek IOD",
      title: "Twoja firma powinna wyznaczyć IOD",
      description:
        "Odpowiedzi wskazują na przesłanki z art. 37 RODO. Najbezpieczniejszym krokiem jest formalna weryfikacja i przygotowanie powołania Inspektora Ochrony Danych.",
      reasons,
      score,
      leadValue: estimateLeadValue(score, "required"),
      hot: true,
    };
  }

  if (needsVerification) {
    return {
      level: "verification",
      badge: "Wymagana weryfikacja",
      title: "Obowiązek IOD wymaga indywidualnej oceny",
      description:
        "Nie ma jednoznacznej przesłanki obowiązku, ale skala lub charakter przetwarzania są podwyższone. Warto sprawdzić procesy przed decyzją.",
      reasons,
      score,
      leadValue: estimateLeadValue(score, "verification"),
      hot: score >= 4,
    };
  }

  return {
    level: "not_required",
    badge: "Brak oczywistego obowiązku",
    title: "Powołanie IOD prawdopodobnie nie jest wymagane",
    description:
      "Na podstawie odpowiedzi nie widać ustawowego obowiązku. Warto jednak wrócić do oceny po zmianie skali, branży lub rodzaju danych.",
    reasons: reasons.length ? reasons : ["brak kluczowych przesłanek z art. 37 RODO"],
    score,
    leadValue: estimateLeadValue(score, "not_required"),
    hot: false,
  };
}

function estimateLeadValue(score: number, level: IodResultLevel) {
  const base = level === "required" ? 8900 : level === "verification" ? 5900 : 2900;
  return base + Math.min(score, 8) * 500;
}
