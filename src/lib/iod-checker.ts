import {
  evaluateIodObligation,
  type IodObligationInput,
  type IodObligationOutput,
  type IodObligationStatus,
  type PrimaryTrigger,
  type ScaleCountBand,
  type ScaleDuration,
  type ScaleGeography,
  type ScaleScope,
} from "./iod-obligation-checker";

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
export type IodOutcomeKey = "required" | "highrisk" | "maybe" | "docs";

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

export function calculateIodAssessment(
  answers: Partial<IodCheckerAnswers>,
  entityName = "Landing / Checker IOD",
): IodObligationOutput {
  return evaluateIodObligation(mapIodCheckerAnswersToObligationInput(answers, entityName));
}

export function calculateIodResult(
  answers: Partial<IodCheckerAnswers>,
  assessment = calculateIodAssessment(answers),
): IodCheckerResult {
  const level = mapIodObligationStatusToResultLevel(assessment.obligation_status);
  const score = estimateComplianceScore(assessment);
  const reasons = buildIodResultReasons(assessment);

  if (level === "required") {
    return {
      level,
      badge: "Prawdopodobny obowiązek IOD",
      title: "Twoja firma powinna wyznaczyć IOD",
      description:
        "Odpowiedzi wskazują na przesłanki z art. 37 RODO albo właściwego reżimu publicznego. Najbezpieczniejszym krokiem jest formalna weryfikacja i przygotowanie powołania Inspektora Ochrony Danych.",
      reasons,
      score,
      leadValue: estimateLeadValue(score, level),
      hot: true,
    };
  }

  if (level === "verification") {
    return {
      level,
      badge: "Wymagana weryfikacja",
      title: "Obowiązek IOD wymaga indywidualnej oceny",
      description:
        "Nie ma jeszcze pełnej, jednoznacznej przesłanki obowiązku, ale skala, rodzaj danych albo brakujące informacje wymagają sprawdzenia przed decyzją.",
      reasons,
      score,
      leadValue: estimateLeadValue(score, level),
      hot: isHotComplianceLead(assessment),
    };
  }

  return {
    level,
    badge: "Brak oczywistego obowiązku",
    title: "Powołanie IOD prawdopodobnie nie jest wymagane",
    description:
      "Na podstawie odpowiedzi nie widać ustawowego obowiązku. Warto jednak wrócić do oceny po zmianie skali, branży lub rodzaju danych.",
    reasons,
    score,
    leadValue: estimateLeadValue(score, level),
    hot: false,
  };
}

export function mapIodCheckerAnswersToObligationInput(
  answers: Partial<IodCheckerAnswers>,
  entityName = "Landing / Checker IOD",
): IodObligationInput {
  const isPublic = answers.publiczny === "tak" || answers.branza === "publiczny";
  const monitoringPresent = toNullableBoolean(answers.monitoring);
  const specialCategoriesPresent =
    answers.branza === "zdrowie" ? true : answers.wrazliwe === undefined ? null : toNullableBoolean(answers.wrazliwe);
  const coreProcessing = monitoringPresent === true || specialCategoriesPresent === true ? true : false;
  const scale = legacyScaleToComplianceScale(answers.skala, specialCategoriesPresent === true);

  return buildBaseObligationInput({
    entityName,
    legalForm: isPublic ? "organ lub podmiot publiczny" : "podmiot prywatny",
    roles: ["administrator"],
    isPublic,
    publicBodyBasis: isPublic ? ["unknown"] : ["none"],
    publicFinanceSubtype: isPublic ? "unknown" : "not_applicable",
    coreDescriptions: compactStrings([answers.branza ? iodSectorLabels[answers.branza] : undefined]),
    processingIntegralToCoreService: coreProcessing,
    monitoringActivitiesPresent: monitoringPresent,
    monitoringTypes: monitoringPresent ? ["profiling"] : [],
    monitoringRegular: monitoringPresent,
    monitoringSystematic: monitoringPresent,
    specialCategoriesPresent,
    specialCategoriesTypes: answers.branza === "zdrowie" || answers.wrazliwe === "tak" ? ["health"] : [],
    criminalDataPresent: false,
    scale,
    internalDocumentedAssessmentExists: answers.iod === "tak",
  });
}

export function mapLandingAnswersToObligationInput(
  answers: AnswerMapLike,
  entityName = "Landing / Checker IOD",
): IodObligationInput {
  const organization = answers.organizacja;
  const industry = answers.branza;
  const category = answers.kategorie;
  const character = answers.charakter;
  const roleAnswer = answers.rola;
  const regimeAnswer = answers.rezim;
  const monitoringAnswer = answers.monitoring;
  const regularityAnswer = answers.monitoring_regularny;
  const processorAggregationAnswer = answers.processor_agregacja;
  const sharedDpoAnswer = answers.wspolny_iod;
  const internalAssessmentAnswer = answers.ocena_wewnetrzna;

  const roles = mapLandingRoles(roleAnswer, answers.led_status);
  const regimes = mapLandingRegimes(regimeAnswer);
  const publicBody = mapLandingPublicBody(organization);
  const court = mapLandingCourt(organization, answers.sad_czynnosc);
  const led = mapLandingLed(answers.led_status, regimes);
  const isMedical = organization === "Podmiot leczniczy" || industry === "Medyczna";
  const isEducation = organization === "Placówka oświatowa / opiekuńcza" || industry === "Edukacja";
  const hasCriminalData = category === "Dane o wyrokach i karalności" ? true : false;
  const hasSpecialCategories =
    isMedical ||
    category === "Dane zwykłe + szczególnych kategorii" ||
    category === "Dane o zdrowiu" ||
    category === "Dane biometryczne / genetyczne" ||
    category === "Głównie dane wrażliwe";
  const processingIntegral = mapLandingCoreActivity(character, isMedical, isEducation);
  const monitoring = mapLandingMonitoring(monitoringAnswer, regularityAnswer);
  const processorAggregation = mapLandingProcessorAggregation(roles.includes("processor"), processorAggregationAnswer);
  const sharedDpo = mapLandingSharedDpo(sharedDpoAnswer);

  return {
    entity_name: entityName,
    legal_form: organization ?? "nieustalona",
    roles,
    regimes,
    is_public_body_under_polish_law: publicBody.is_public_body_under_polish_law,
    public_body_basis: publicBody.public_body_basis,
    public_finance_subtype: publicBody.public_finance_subtype,
    is_court_or_tribunal: court.isCourt,
    acts_in_judicial_capacity_for_assessed_processing: court.actsInJudicialCapacity,
    is_competent_authority_under_led: led.isCompetentAuthority,
    core_activities_description: compactStrings([industry, organization, character, monitoringAnswer]),
    processing_integral_to_core_service: processingIntegral,
    monitoring_activities_present: monitoring.monitoring_activities_present,
    monitoring_types: monitoring.monitoring_types,
    monitoring_regular: monitoring.monitoring_regular,
    monitoring_systematic: monitoring.monitoring_systematic,
    ...landingScaleToComplianceScale(answers),
    special_categories_present: hasSpecialCategories,
    special_categories_types: mapLandingSpecialCategories(category, isMedical),
    criminal_data_present: hasCriminalData,
    processor_multi_client_similarity: processorAggregation.similar,
    processor_number_of_clients_for_same_processing: processorAggregation.clients,
    joint_controller_count: roles.includes("joint_controller") ? 2 : null,
    wants_single_shared_dpo: sharedDpo.wantsSingleSharedDpo,
    dpo_easy_access_from_each_establishment: sharedDpo.easyAccess,
    internal_documented_assessment_exists: mapTriStateAnswer(internalAssessmentAnswer),
    free_text_notes: "Wynik obliczony z pełnego layoutu landingowego checkera IOD.",
  };
}

export function mapIodObligationToOutcomeKey(assessment: IodObligationOutput): IodOutcomeKey {
  if (assessment.obligation_status === "required") return "required";
  if (assessment.obligation_status === "likely_required") return "highrisk";
  if (
    assessment.obligation_status === "requires_case_by_case_assessment" &&
    (assessment.special_categories_result.present || assessment.criminal_data_result.present)
  ) {
    return "highrisk";
  }
  if (
    assessment.obligation_status === "requires_case_by_case_assessment" ||
    assessment.obligation_status === "insufficient_information"
  ) {
    return "maybe";
  }
  return "docs";
}

export function mapIodObligationStatusToResultLevel(status: IodObligationStatus): IodResultLevel {
  if (status === "required" || status === "likely_required") return "required";
  if (status === "requires_case_by_case_assessment" || status === "insufficient_information") return "verification";
  return "not_required";
}

export function isHotComplianceLead(assessment: IodObligationOutput) {
  return (
    assessment.obligation_status === "required" ||
    assessment.obligation_status === "likely_required" ||
    assessment.primary_trigger === "large_scale_special_categories" ||
    assessment.primary_trigger === "large_scale_monitoring" ||
    assessment.scale_result.classification === "high"
  );
}

export function resultLabelForComplianceStatus(status?: IodObligationStatus) {
  if (status === "required" || status === "likely_required") return "IOD wymagany";
  if (status === "not_required" || status === "likely_not_required") return "IOD raczej niewymagany";
  return "Do weryfikacji";
}

type AnswerMapLike = Record<string, string | undefined>;

type ComplianceScaleFields = Pick<
  IodObligationInput,
  | "scale_data_subject_count_12m"
  | "scale_data_subject_count_band"
  | "scale_population_share_pct"
  | "scale_data_scope"
  | "scale_duration"
  | "scale_geography"
>;

type BaseObligationInputParams = {
  entityName: string;
  legalForm: string;
  roles: IodObligationInput["roles"];
  isPublic: boolean;
  publicBodyBasis: IodObligationInput["public_body_basis"];
  publicFinanceSubtype: IodObligationInput["public_finance_subtype"];
  coreDescriptions: string[];
  processingIntegralToCoreService: boolean | null;
  monitoringActivitiesPresent: boolean | null;
  monitoringTypes: IodObligationInput["monitoring_types"];
  monitoringRegular: boolean | null;
  monitoringSystematic: boolean | null;
  specialCategoriesPresent: boolean | null;
  specialCategoriesTypes: IodObligationInput["special_categories_types"];
  criminalDataPresent: boolean | null;
  scale: ComplianceScaleFields;
  internalDocumentedAssessmentExists: boolean | null;
};

function buildBaseObligationInput(params: BaseObligationInputParams): IodObligationInput {
  return {
    entity_name: params.entityName,
    legal_form: params.legalForm,
    roles: params.roles,
    regimes: ["gdpr"],
    is_public_body_under_polish_law: params.isPublic,
    public_body_basis: params.publicBodyBasis,
    public_finance_subtype: params.publicFinanceSubtype,
    is_court_or_tribunal: false,
    acts_in_judicial_capacity_for_assessed_processing: false,
    is_competent_authority_under_led: false,
    core_activities_description: params.coreDescriptions,
    processing_integral_to_core_service: params.processingIntegralToCoreService,
    monitoring_activities_present: params.monitoringActivitiesPresent,
    monitoring_types: params.monitoringTypes,
    monitoring_regular: params.monitoringRegular,
    monitoring_systematic: params.monitoringSystematic,
    ...params.scale,
    special_categories_present: params.specialCategoriesPresent,
    special_categories_types: params.specialCategoriesTypes,
    criminal_data_present: params.criminalDataPresent,
    processor_multi_client_similarity: null,
    processor_number_of_clients_for_same_processing: null,
    joint_controller_count: null,
    wants_single_shared_dpo: false,
    dpo_easy_access_from_each_establishment: null,
    internal_documented_assessment_exists: params.internalDocumentedAssessmentExists,
    free_text_notes: null,
  };
}

function legacyScaleToComplianceScale(scale: IodScale | undefined, sensitive: boolean): ComplianceScaleFields {
  const scope: ScaleScope = sensitive ? "high" : "medium";

  if (scale === "xl") {
    return scaleFields(150_000, "100000+", 15, sensitive ? "very_high" : "high", "continuous", "national");
  }

  if (scale === "l") {
    return scaleFields(50_000, "10001-100000", 8, sensitive ? "very_high" : "high", "continuous", "regional");
  }

  if (scale === "m") {
    return scaleFields(5_000, "1001-10000", 2, scope, "periodic", "regional");
  }

  return scaleFields(500, "101-1000", 0.5, sensitive ? "high" : "low", "occasional", "local");
}

function mapLandingRoles(roleAnswer: string | undefined, ledStatus: string | undefined): IodObligationInput["roles"] {
  if (ledStatus === "Tak, ale tylko jako processor") return ["processor"];

  const roles: IodObligationInput["roles"] = [];

  if (roleAnswer === "Administrator danych") roles.push("administrator");
  if (roleAnswer === "Podmiot przetwarzający") roles.push("processor");
  if (roleAnswer === "Współadministrator") roles.push("joint_controller");
  if (ledStatus === "Tak, jako administrator" && !roles.includes("administrator")) roles.push("administrator");

  return roles.length ? roles : ["other"];
}

function mapLandingRegimes(regimeAnswer: string | undefined): IodObligationInput["regimes"] {
  if (regimeAnswer === "RODO + ustawa policyjna 2018" || regimeAnswer === "Nie wiem") return ["gdpr", "led_poland_2018"];
  return ["gdpr"];
}

function mapLandingPublicBody(organization: string | undefined): Pick<
  IodObligationInput,
  "is_public_body_under_polish_law" | "public_body_basis" | "public_finance_subtype"
> {
  if (organization === "Organ lub podmiot publiczny") {
    return {
      is_public_body_under_polish_law: true,
      public_body_basis: ["other_special_law"],
      public_finance_subtype: "unknown",
    };
  }

  if (organization === "Jednostka sektora finansów publicznych") {
    return {
      is_public_body_under_polish_law: true,
      public_body_basis: ["public_finance_sector"],
      public_finance_subtype: "unknown",
    };
  }

  if (organization === "Instytut badawczy / NBP / ustawa szczególna") {
    return {
      is_public_body_under_polish_law: true,
      public_body_basis: ["research_institute", "nbp", "other_special_law"],
      public_finance_subtype: "not_applicable",
    };
  }

  if (organization === "Sąd lub trybunał") {
    return {
      is_public_body_under_polish_law: true,
      public_body_basis: ["public_finance_sector", "other_special_law"],
      public_finance_subtype: "public_authority",
    };
  }

  return {
    is_public_body_under_polish_law: false,
    public_body_basis: ["none"],
    public_finance_subtype: "not_applicable",
  };
}

function mapLandingCourt(organization: string | undefined, courtActivity: string | undefined) {
  const isCourt = organization === "Sąd lub trybunał";

  return {
    isCourt,
    actsInJudicialCapacity: isCourt
      ? courtActivity === "Tak, czynność orzecznicza"
        ? true
        : courtActivity === "Nie, czynność administracyjna"
          ? false
          : null
      : false,
  };
}

function mapLandingLed(ledStatus: string | undefined, regimes: IodObligationInput["regimes"]) {
  if (!regimes.includes("led_poland_2018")) return { isCompetentAuthority: false };
  if (ledStatus === "Tak, jako administrator" || ledStatus === "Tak, ale tylko jako processor") {
    return { isCompetentAuthority: true };
  }
  if (ledStatus === "Nie") return { isCompetentAuthority: false };
  return { isCompetentAuthority: null };
}

function mapLandingCoreActivity(character: string | undefined, isMedical: boolean, isEducation: boolean) {
  if (character === "Tak, stały element" || character === "Tak, monitoring / profilowanie systematyczne") return true;
  if (character === "Nie, sporadycznie") return false;
  if (isMedical || isEducation) return true;
  return null;
}

function mapLandingMonitoring(
  monitoringAnswer: string | undefined,
  regularityAnswer: string | undefined,
): Pick<IodObligationInput, "monitoring_activities_present" | "monitoring_types" | "monitoring_regular" | "monitoring_systematic"> {
  if (monitoringAnswer === "Brak monitorowania") {
    return {
      monitoring_activities_present: false,
      monitoring_types: [],
      monitoring_regular: false,
      monitoring_systematic: false,
    };
  }

  if (!monitoringAnswer || monitoringAnswer === "Nie wiem") {
    return {
      monitoring_activities_present: null,
      monitoring_types: [],
      monitoring_regular: null,
      monitoring_systematic: null,
    };
  }

  const regular =
    regularityAnswer === "Tak, regularny i systematyczny"
      ? true
      : regularityAnswer === "Tylko okazjonalny" || regularityAnswer === "Nie"
        ? false
        : null;

  return {
    monitoring_activities_present: true,
    monitoring_types: monitoringTypesForLandingAnswer(monitoringAnswer),
    monitoring_regular: regular,
    monitoring_systematic: regular,
  };
}

function monitoringTypesForLandingAnswer(answer: string): IodObligationInput["monitoring_types"] {
  if (answer === "CCTV") return ["cctv"];
  if (answer === "Profilowanie / reklama behawioralna") return ["profiling", "behavioral_advertising"];
  if (answer === "Fraud / AML / risk scoring") return ["fraud_detection", "aml", "risk_scoring"];
  if (answer === "Geolokalizacja / IoT / wearables") return ["geolocation", "iot_smart_devices", "wearables_health"];
  return ["other"];
}

function mapLandingSpecialCategories(category: string | undefined, isMedical: boolean): IodObligationInput["special_categories_types"] {
  if (category === "Dane biometryczne / genetyczne") return ["biometric_identification", "genetic"];
  if (isMedical || category === "Dane o zdrowiu") return ["health"];
  if (category === "Dane zwykłe + szczególnych kategorii" || category === "Głównie dane wrażliwe") {
    return ["health", "biometric_identification"];
  }
  return [];
}

function landingScaleToComplianceScale(answers: AnswerMapLike): ComplianceScaleFields {
  const band = mapLandingCountBand(answers.liczba_osob);

  return {
    scale_data_subject_count_12m: countForBand(band),
    scale_data_subject_count_band: band,
    scale_population_share_pct: mapLandingPopulationShare(answers.udzial_populacji),
    scale_data_scope: mapLandingDataScope(answers.zakres_danych),
    scale_duration: mapLandingDuration(answers.czas),
    scale_geography: mapLandingGeography(answers.zasieg),
  };
}

function mapLandingCountBand(value: string | undefined): ScaleCountBand | null {
  if (value === "1" || value === "2-100" || value === "101-1000" || value === "1001-10000" || value === "10001-100000" || value === "100000+") {
    return value;
  }
  return null;
}

function countForBand(band: ScaleCountBand | null) {
  if (band === "1") return 1;
  if (band === "2-100") return 50;
  if (band === "101-1000") return 500;
  if (band === "1001-10000") return 5_000;
  if (band === "10001-100000") return 50_000;
  if (band === "100000+") return 150_000;
  return null;
}

function mapLandingPopulationShare(value: string | undefined) {
  if (value === "Marginalny <1%") return 0.5;
  if (value === "Lokalna grupa 1-10%") return 5;
  if (value === "Istotna grupa 10-30%") return 20;
  if (value === "Znaczna grupa >30%") return 35;
  return null;
}

function mapLandingDataScope(value: string | undefined): ScaleScope | null {
  if (value === "Niski") return "low";
  if (value === "Średni") return "medium";
  if (value === "Wysoki") return "high";
  if (value === "Bardzo wysoki") return "very_high";
  return null;
}

function mapLandingDuration(value: string | undefined): ScaleDuration | null {
  if (value === "Jednorazowe") return "one_off";
  if (value === "Okazjonalne") return "occasional";
  if (value === "Cykliczne") return "periodic";
  if (value === "Ciągłe") return "continuous";
  if (value === "Długoterminowe") return "long_term";
  return null;
}

function mapLandingGeography(value: string | undefined): ScaleGeography | null {
  if (value === "Jedna lokalizacja") return "single_location";
  if (value === "Lokalny") return "local";
  if (value === "Regionalny") return "regional";
  if (value === "Ogólnopolski") return "national";
  if (value === "Międzynarodowy") return "multi_national";
  return null;
}

function mapLandingProcessorAggregation(isProcessor: boolean, value: string | undefined) {
  if (!isProcessor) return { similar: null, clients: null };
  if (value === "Nie") return { similar: false, clients: 0 };
  if (value === "Tak, 1-9 klientów") return { similar: true, clients: 5 };
  if (value === "Tak, 10-99 klientów") return { similar: true, clients: 50 };
  if (value === "Tak, 100-499 klientów") return { similar: true, clients: 250 };
  if (value === "Tak, 500+ klientów") return { similar: true, clients: 500 };
  return { similar: null, clients: null };
}

function mapLandingSharedDpo(value: string | undefined) {
  if (value === "Nie planuję") return { wantsSingleSharedDpo: false, easyAccess: null };
  if (value === "Tak, dostępny dla każdej jednostki") return { wantsSingleSharedDpo: true, easyAccess: true };
  if (value === "Tak, ale dostępność niepewna") return { wantsSingleSharedDpo: true, easyAccess: false };
  return { wantsSingleSharedDpo: null, easyAccess: null };
}

function mapTriStateAnswer(value: string | undefined) {
  if (value === "Tak") return true;
  if (value === "Nie") return false;
  return null;
}

function scaleFields(
  count: number,
  band: ScaleCountBand,
  populationShare: number,
  scope: ScaleScope,
  duration: ScaleDuration,
  geography: ScaleGeography,
): ComplianceScaleFields {
  return {
    scale_data_subject_count_12m: count,
    scale_data_subject_count_band: band,
    scale_population_share_pct: populationShare,
    scale_data_scope: scope,
    scale_duration: duration,
    scale_geography: geography,
  };
}

function toNullableBoolean(value: IodTriState | undefined) {
  if (value === "tak") return true;
  if (value === "nie") return false;
  return null;
}

function compactStrings(values: Array<string | undefined>) {
  return values.filter((value): value is string => Boolean(value));
}

function buildIodResultReasons(assessment: IodObligationOutput) {
  const reasons: string[] = [];
  const trigger = triggerLabels[assessment.primary_trigger];

  if (trigger) reasons.push(trigger);
  if (assessment.scale_result.classification !== "unknown") {
    reasons.push(`skala: ${assessment.scale_result.classification}`);
  }
  if (assessment.public_body_result.status === "required") reasons.push("organizacja publiczna");
  if (assessment.monitoring_result.status === "required") reasons.push("regularne i systematyczne monitorowanie");
  if (assessment.special_categories_result.status === "required") reasons.push("dane szczególnych kategorii na dużą skalę");
  if (assessment.criminal_data_result.status === "required") reasons.push("dane z art. 10 RODO na dużą skalę");
  if (assessment.missing_information.length) reasons.push(`wymaga doprecyzowania: ${assessment.missing_information.slice(0, 3).join(", ")}`);

  return reasons.length ? reasons : ["brak kluczowych przesłanek z art. 37 RODO"];
}

function estimateComplianceScore(assessment: IodObligationOutput) {
  const statusPoints: Record<IodObligationStatus, number> = {
    required: 6,
    likely_required: 5,
    requires_case_by_case_assessment: 4,
    insufficient_information: 3,
    likely_not_required: 1,
    not_required: 0,
  };

  return Math.min(12, statusPoints[assessment.obligation_status] + Math.min(assessment.scale_result.score, 6));
}

function estimateLeadValue(score: number, level: IodResultLevel) {
  const base = level === "required" ? 8900 : level === "verification" ? 5900 : 2900;
  return base + Math.min(score, 8) * 500;
}

const triggerLabels: Partial<Record<PrimaryTrigger, string>> = {
  public_body: "organ lub podmiot publiczny",
  large_scale_monitoring: "regularne monitorowanie na dużą skalę",
  large_scale_special_categories: "duża skala danych szczególnych kategorii",
  large_scale_criminal_data: "duża skala danych o wyrokach lub naruszeniach prawa",
  led_controller: "administrator w reżimie dyrektywy policyjnej",
};
