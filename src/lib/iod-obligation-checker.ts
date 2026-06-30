export const iodObligationRoles = ["administrator", "processor", "joint_controller", "other"] as const;
export const iodObligationRegimes = ["gdpr", "led_poland_2018"] as const;
export const iodObligationStatuses = [
  "required",
  "not_required",
  "likely_required",
  "likely_not_required",
  "requires_case_by_case_assessment",
  "insufficient_information",
] as const;

export const publicBodyBases = [
  "public_finance_sector",
  "research_institute",
  "nbp",
  "other_special_law",
  "none",
  "unknown",
] as const;

export const publicFinanceSubtypes = [
  "public_authority",
  "local_government_unit_or_union",
  "budgetary_unit",
  "local_budgetary_establishment",
  "executive_agency",
  "budget_economy_institution",
  "state_special_purpose_fund",
  "zus_or_krus",
  "nfz",
  "spzoz",
  "public_university",
  "pan_or_unit",
  "public_cultural_institution_or_film_institution",
  "other_state_or_local_legal_person",
  "not_applicable",
  "unknown",
] as const;

export const monitoringTypes = [
  "cctv",
  "telecom_service",
  "email_routing",
  "behavioral_advertising",
  "profiling",
  "risk_scoring",
  "fraud_detection",
  "aml",
  "geolocation",
  "loyalty_program",
  "wearables_health",
  "iot_smart_devices",
  "other",
] as const;

export const scaleCountBands = ["1", "2-100", "101-1000", "1001-10000", "10001-100000", "100000+"] as const;
export const scaleScopes = ["low", "medium", "high", "very_high"] as const;
export const scaleDurations = ["one_off", "occasional", "periodic", "continuous", "long_term"] as const;
export const scaleGeographies = ["single_location", "local", "regional", "national", "multi_national"] as const;

export const specialCategoryTypes = [
  "racial_or_ethnic_origin",
  "political_opinions",
  "religion_or_belief",
  "trade_union_membership",
  "genetic",
  "biometric_identification",
  "health",
  "sex_life",
  "sexual_orientation",
] as const;

export type IodObligationRole = (typeof iodObligationRoles)[number];
export type IodObligationRegime = (typeof iodObligationRegimes)[number];
export type IodObligationStatus = (typeof iodObligationStatuses)[number];
export type PublicBodyBasis = (typeof publicBodyBases)[number];
export type PublicFinanceSubtype = (typeof publicFinanceSubtypes)[number];
export type MonitoringType = (typeof monitoringTypes)[number];
export type ScaleCountBand = (typeof scaleCountBands)[number];
export type ScaleScope = (typeof scaleScopes)[number];
export type ScaleDuration = (typeof scaleDurations)[number];
export type ScaleGeography = (typeof scaleGeographies)[number];
export type SpecialCategoryType = (typeof specialCategoryTypes)[number];

export type PrimaryTrigger =
  | "public_body"
  | "large_scale_monitoring"
  | "large_scale_special_categories"
  | "large_scale_criminal_data"
  | "led_controller"
  | "none"
  | "unclear";

export type ScaleClassification = "low" | "medium" | "high" | "unknown";
export type QuestionAnswerType = "yes_no" | "number" | "text" | "enum" | "multi_enum" | "date";

export type IodObligationInput = {
  entity_name: string;
  legal_form: string;
  roles: IodObligationRole[];
  regimes: IodObligationRegime[];
  is_public_body_under_polish_law: boolean | null;
  public_body_basis: PublicBodyBasis[];
  public_finance_subtype: PublicFinanceSubtype | null;
  is_court_or_tribunal: boolean | null;
  acts_in_judicial_capacity_for_assessed_processing: boolean | null;
  is_competent_authority_under_led: boolean | null;
  core_activities_description: string[];
  processing_integral_to_core_service: boolean | null;
  monitoring_activities_present: boolean | null;
  monitoring_types: MonitoringType[];
  monitoring_regular: boolean | null;
  monitoring_systematic: boolean | null;
  scale_data_subject_count_12m: number | null;
  scale_data_subject_count_band: ScaleCountBand | null;
  scale_population_share_pct: number | null;
  scale_data_scope: ScaleScope | null;
  scale_duration: ScaleDuration | null;
  scale_geography: ScaleGeography | null;
  special_categories_present: boolean | null;
  special_categories_types: SpecialCategoryType[];
  criminal_data_present: boolean | null;
  processor_multi_client_similarity: boolean | null;
  processor_number_of_clients_for_same_processing: number | null;
  joint_controller_count: number | null;
  wants_single_shared_dpo: boolean | null;
  dpo_easy_access_from_each_establishment: boolean | null;
  internal_documented_assessment_exists: boolean | null;
  free_text_notes: string | null;
};

export type IodAdditionalQuestion = {
  id: string;
  question: string;
  answer_type: QuestionAnswerType;
  why_it_matters: string;
  branch_if_yes: string;
  branch_if_no: string;
};

export type LegalRegimeResult = {
  regime: IodObligationRegime;
  status: IodObligationStatus;
  legal_bases: string[];
  rationale: string;
};

export type PublicBodyResult = {
  is_public_body: boolean | null;
  basis: PublicBodyBasis[];
  public_finance_subtype: PublicFinanceSubtype | null;
  status: IodObligationStatus;
  legal_bases: string[];
  rationale: string;
  missing_information: string[];
};

export type CourtExceptionResult = {
  is_court_or_tribunal: boolean | null;
  acts_in_judicial_capacity: boolean | null;
  exception_applies_to_public_body_trigger: boolean;
  rationale: string;
};

export type MonitoringResult = {
  present: boolean | null;
  types: MonitoringType[];
  regular: boolean | null;
  systematic: boolean | null;
  core_activity: boolean | null;
  large_scale: boolean | null;
  status: IodObligationStatus;
  legal_bases: string[];
  rationale: string;
  missing_information: string[];
};

export type ScaleResult = {
  classification: ScaleClassification;
  score: number;
  factors: string[];
  missing_information: string[];
  legal_threshold_note: string;
};

export type SpecialCategoriesResult = {
  present: boolean | null;
  types: SpecialCategoryType[];
  core_activity: boolean | null;
  large_scale: boolean | null;
  status: IodObligationStatus;
  legal_bases: string[];
  rationale: string;
  missing_information: string[];
};

export type CriminalDataResult = {
  present: boolean | null;
  core_activity: boolean | null;
  large_scale: boolean | null;
  status: IodObligationStatus;
  legal_bases: string[];
  rationale: string;
  missing_information: string[];
};

export type ProcessorResult = {
  is_processor: boolean;
  processor_only: boolean;
  aggregation_considered: boolean;
  similar_processing_for_many_clients: boolean | null;
  client_count: number | null;
  scale_points_from_aggregation: number;
  rationale: string;
};

export type JointControllerResult = {
  is_joint_controller: boolean;
  joint_controller_count: number | null;
  assessed_as_controller: boolean;
  rationale: string;
};

export type SharedDpoOption = {
  requested: boolean | null;
  legally_available: boolean | null;
  easy_access_confirmed: boolean | null;
  legal_bases: string[];
  rationale: string;
};

export type IodObligationOutput = {
  obligation_status: IodObligationStatus;
  legal_regime_results: LegalRegimeResult[];
  primary_trigger: PrimaryTrigger;
  public_body_result: PublicBodyResult;
  monitoring_result: MonitoringResult;
  scale_result: ScaleResult;
  special_categories_result: SpecialCategoriesResult;
  criminal_data_result: CriminalDataResult;
  processor_result: ProcessorResult;
  joint_controller_result: JointControllerResult;
  court_exception_result: CourtExceptionResult;
  shared_dpo_option: SharedDpoOption;
  missing_information: string[];
  validation_errors: string[];
  validation_warnings: string[];
  additional_questions: IodAdditionalQuestion[];
  assumptions_used: string[];
  confidence: "high" | "medium" | "low";
  final_human_review_recommended: boolean;
};

export const iodObligationInputJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://privazy.pl/schemas/iod-obligation-input.json",
  title: "IOD obligation checker input",
  type: "object",
  additionalProperties: false,
  required: [
    "entity_name",
    "legal_form",
    "roles",
    "regimes",
    "is_public_body_under_polish_law",
    "public_body_basis",
    "public_finance_subtype",
    "is_court_or_tribunal",
    "acts_in_judicial_capacity_for_assessed_processing",
    "is_competent_authority_under_led",
    "core_activities_description",
    "processing_integral_to_core_service",
    "monitoring_activities_present",
    "monitoring_types",
    "monitoring_regular",
    "monitoring_systematic",
    "scale_data_subject_count_12m",
    "scale_data_subject_count_band",
    "scale_population_share_pct",
    "scale_data_scope",
    "scale_duration",
    "scale_geography",
    "special_categories_present",
    "special_categories_types",
    "criminal_data_present",
    "processor_multi_client_similarity",
    "processor_number_of_clients_for_same_processing",
    "joint_controller_count",
    "wants_single_shared_dpo",
    "dpo_easy_access_from_each_establishment",
    "internal_documented_assessment_exists",
    "free_text_notes",
  ],
  properties: {
    entity_name: { type: "string", minLength: 1, maxLength: 180 },
    legal_form: { type: "string", minLength: 1, maxLength: 180 },
    roles: { type: "array", minItems: 1, uniqueItems: true, items: { enum: iodObligationRoles } },
    regimes: { type: "array", minItems: 1, uniqueItems: true, items: { enum: iodObligationRegimes } },
    is_public_body_under_polish_law: { type: ["boolean", "null"] },
    public_body_basis: { type: "array", uniqueItems: true, items: { enum: publicBodyBases } },
    public_finance_subtype: { enum: [...publicFinanceSubtypes, null] },
    is_court_or_tribunal: { type: ["boolean", "null"] },
    acts_in_judicial_capacity_for_assessed_processing: { type: ["boolean", "null"] },
    is_competent_authority_under_led: { type: ["boolean", "null"] },
    core_activities_description: { type: "array", items: { type: "string", minLength: 1, maxLength: 500 } },
    processing_integral_to_core_service: { type: ["boolean", "null"] },
    monitoring_activities_present: { type: ["boolean", "null"] },
    monitoring_types: { type: "array", uniqueItems: true, items: { enum: monitoringTypes } },
    monitoring_regular: { type: ["boolean", "null"] },
    monitoring_systematic: { type: ["boolean", "null"] },
    scale_data_subject_count_12m: { type: ["integer", "null"], minimum: 0 },
    scale_data_subject_count_band: { enum: [...scaleCountBands, null] },
    scale_population_share_pct: { type: ["number", "null"], minimum: 0, maximum: 100 },
    scale_data_scope: { enum: [...scaleScopes, null] },
    scale_duration: { enum: [...scaleDurations, null] },
    scale_geography: { enum: [...scaleGeographies, null] },
    special_categories_present: { type: ["boolean", "null"] },
    special_categories_types: { type: "array", uniqueItems: true, items: { enum: specialCategoryTypes } },
    criminal_data_present: { type: ["boolean", "null"] },
    processor_multi_client_similarity: { type: ["boolean", "null"] },
    processor_number_of_clients_for_same_processing: { type: ["integer", "null"], minimum: 0 },
    joint_controller_count: { type: ["integer", "null"], minimum: 0 },
    wants_single_shared_dpo: { type: ["boolean", "null"] },
    dpo_easy_access_from_each_establishment: { type: ["boolean", "null"] },
    internal_documented_assessment_exists: { type: ["boolean", "null"] },
    free_text_notes: { type: ["string", "null"], maxLength: 4000 },
  },
} as const;

export const iodObligationOutputJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://privazy.pl/schemas/iod-obligation-output.json",
  title: "IOD obligation checker output",
  type: "object",
  additionalProperties: false,
  required: [
    "obligation_status",
    "legal_regime_results",
    "primary_trigger",
    "public_body_result",
    "monitoring_result",
    "scale_result",
    "special_categories_result",
    "criminal_data_result",
    "processor_result",
    "joint_controller_result",
    "court_exception_result",
    "shared_dpo_option",
    "missing_information",
    "validation_errors",
    "validation_warnings",
    "additional_questions",
    "assumptions_used",
    "confidence",
    "final_human_review_recommended",
  ],
  properties: {
    obligation_status: { enum: iodObligationStatuses },
    legal_regime_results: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["regime", "status", "legal_bases", "rationale"],
        properties: {
          regime: { enum: iodObligationRegimes },
          status: { enum: iodObligationStatuses },
          legal_bases: { type: "array", items: { type: "string" } },
          rationale: { type: "string" },
        },
      },
    },
    primary_trigger: {
      enum: [
        "public_body",
        "large_scale_monitoring",
        "large_scale_special_categories",
        "large_scale_criminal_data",
        "led_controller",
        "none",
        "unclear",
      ],
    },
    public_body_result: {
      type: "object",
      additionalProperties: true,
      required: ["is_public_body", "basis", "public_finance_subtype", "status", "legal_bases", "rationale", "missing_information"],
      properties: {
        is_public_body: { type: ["boolean", "null"] },
        basis: { type: "array", items: { enum: publicBodyBases } },
        public_finance_subtype: { enum: [...publicFinanceSubtypes, null] },
        status: { enum: iodObligationStatuses },
        legal_bases: { type: "array", items: { type: "string" } },
        rationale: { type: "string" },
        missing_information: { type: "array", items: { type: "string" } },
      },
    },
    monitoring_result: {
      type: "object",
      additionalProperties: true,
      required: ["present", "types", "regular", "systematic", "core_activity", "large_scale", "status", "legal_bases", "rationale", "missing_information"],
      properties: {
        present: { type: ["boolean", "null"] },
        types: { type: "array", items: { enum: monitoringTypes } },
        regular: { type: ["boolean", "null"] },
        systematic: { type: ["boolean", "null"] },
        core_activity: { type: ["boolean", "null"] },
        large_scale: { type: ["boolean", "null"] },
        status: { enum: iodObligationStatuses },
        legal_bases: { type: "array", items: { type: "string" } },
        rationale: { type: "string" },
        missing_information: { type: "array", items: { type: "string" } },
      },
    },
    scale_result: {
      type: "object",
      additionalProperties: false,
      required: ["classification", "score", "factors", "missing_information", "legal_threshold_note"],
      properties: {
        classification: { enum: ["low", "medium", "high", "unknown"] },
        score: { type: "integer", minimum: 0 },
        factors: { type: "array", items: { type: "string" } },
        missing_information: { type: "array", items: { type: "string" } },
        legal_threshold_note: { type: "string" },
      },
    },
    special_categories_result: {
      type: "object",
      additionalProperties: true,
      required: ["present", "types", "core_activity", "large_scale", "status", "legal_bases", "rationale", "missing_information"],
      properties: {
        present: { type: ["boolean", "null"] },
        types: { type: "array", items: { enum: specialCategoryTypes } },
        core_activity: { type: ["boolean", "null"] },
        large_scale: { type: ["boolean", "null"] },
        status: { enum: iodObligationStatuses },
        legal_bases: { type: "array", items: { type: "string" } },
        rationale: { type: "string" },
        missing_information: { type: "array", items: { type: "string" } },
      },
    },
    criminal_data_result: {
      type: "object",
      additionalProperties: true,
      required: ["present", "core_activity", "large_scale", "status", "legal_bases", "rationale", "missing_information"],
      properties: {
        present: { type: ["boolean", "null"] },
        core_activity: { type: ["boolean", "null"] },
        large_scale: { type: ["boolean", "null"] },
        status: { enum: iodObligationStatuses },
        legal_bases: { type: "array", items: { type: "string" } },
        rationale: { type: "string" },
        missing_information: { type: "array", items: { type: "string" } },
      },
    },
    processor_result: {
      type: "object",
      additionalProperties: false,
      required: [
        "is_processor",
        "processor_only",
        "aggregation_considered",
        "similar_processing_for_many_clients",
        "client_count",
        "scale_points_from_aggregation",
        "rationale",
      ],
      properties: {
        is_processor: { type: "boolean" },
        processor_only: { type: "boolean" },
        aggregation_considered: { type: "boolean" },
        similar_processing_for_many_clients: { type: ["boolean", "null"] },
        client_count: { type: ["integer", "null"], minimum: 0 },
        scale_points_from_aggregation: { type: "integer", minimum: 0 },
        rationale: { type: "string" },
      },
    },
    joint_controller_result: {
      type: "object",
      additionalProperties: false,
      required: ["is_joint_controller", "joint_controller_count", "assessed_as_controller", "rationale"],
      properties: {
        is_joint_controller: { type: "boolean" },
        joint_controller_count: { type: ["integer", "null"], minimum: 0 },
        assessed_as_controller: { type: "boolean" },
        rationale: { type: "string" },
      },
    },
    court_exception_result: {
      type: "object",
      additionalProperties: false,
      required: ["is_court_or_tribunal", "acts_in_judicial_capacity", "exception_applies_to_public_body_trigger", "rationale"],
      properties: {
        is_court_or_tribunal: { type: ["boolean", "null"] },
        acts_in_judicial_capacity: { type: ["boolean", "null"] },
        exception_applies_to_public_body_trigger: { type: "boolean" },
        rationale: { type: "string" },
      },
    },
    shared_dpo_option: {
      type: "object",
      additionalProperties: false,
      required: ["requested", "legally_available", "easy_access_confirmed", "legal_bases", "rationale"],
      properties: {
        requested: { type: ["boolean", "null"] },
        legally_available: { type: ["boolean", "null"] },
        easy_access_confirmed: { type: ["boolean", "null"] },
        legal_bases: { type: "array", items: { type: "string" } },
        rationale: { type: "string" },
      },
    },
    missing_information: { type: "array", items: { type: "string" } },
    validation_errors: { type: "array", items: { type: "string" } },
    validation_warnings: { type: "array", items: { type: "string" } },
    additional_questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "question", "answer_type", "why_it_matters", "branch_if_yes", "branch_if_no"],
        properties: {
          id: { type: "string" },
          question: { type: "string" },
          answer_type: { enum: ["yes_no", "number", "text", "enum", "multi_enum", "date"] },
          why_it_matters: { type: "string" },
          branch_if_yes: { type: "string" },
          branch_if_no: { type: "string" },
        },
      },
    },
    assumptions_used: { type: "array", items: { type: "string" } },
    confidence: { enum: ["high", "medium", "low"] },
    final_human_review_recommended: { type: "boolean" },
  },
} as const;

const gdprLegalBases = [
  "RODO art. 37 ust. 1 lit. a-c",
  "RODO art. 37 ust. 2-4",
  "RODO art. 9",
  "RODO art. 10",
  "RODO art. 26",
  "RODO motyw 91",
  "RODO motyw 97",
  "WP243 / wytyczne dotyczace inspektorow ochrony danych",
];

const ledLegalBases = [
  "Dyrektywa (UE) 2016/680 art. 32",
  "Ustawa z 14.12.2018 art. 46 ust. 1 i 3",
];

const polishDpoNotificationBases = ["Ustawa z 10.05.2018 art. 8-11"];

const assumptionsUsed = [
  "A: art. 37 RODO dotyczy administratora i podmiotu przetwarzajacego.",
  "B: wspoladministrator jest oceniany jak controller dla danej operacji.",
  "C: art. 37 ust. 1 lit. c obejmuje duza skale danych szczegolnych albo danych z art. 10 RODO.",
  "D: duza skala nie ma uniwersalnych sztywnych progow ustawowych.",
  "E: glowna dzialalnosc obejmuje dzialalnosc zasadnicza lub przetwarzanie integralne dla zasadniczej uslugi.",
  "F: w reżimie ustawy z 14.12.2018 bezposredni obowiazek dotyczy administratora.",
  "G: wyjatek sadowy z art. 37 ust. 1 lit. a RODO jest funkcjonalny dla sprawowania wymiaru sprawiedliwosci.",
];

type RegimeAnalysis = LegalRegimeResult & {
  primary_trigger: PrimaryTrigger;
  missing_information: string[];
};

export function evaluateIodObligation(input: IodObligationInput): IodObligationOutput {
  const validation = validateIodObligationInput(input);
  const scaleResult = evaluateScale(input);
  const courtExceptionResult = evaluateCourtException(input);
  const publicBodyResult = evaluatePublicBody(input, courtExceptionResult);
  const processorResult = evaluateProcessor(input, scaleResult);
  const jointControllerResult = evaluateJointController(input);
  const monitoringResult = evaluateMonitoring(input, scaleResult);
  const specialCategoriesResult = evaluateSpecialCategories(input, scaleResult);
  const criminalDataResult = evaluateCriminalData(input, scaleResult);
  const sharedDpoOption = evaluateSharedDpo(input);

  const regimeResults: RegimeAnalysis[] = [];

  if (input.regimes.includes("gdpr")) {
    regimeResults.push(
      evaluateGdprRegime({
        input,
        publicBodyResult,
        monitoringResult,
        specialCategoriesResult,
        criminalDataResult,
      }),
    );
  }

  if (input.regimes.includes("led_poland_2018")) {
    regimeResults.push(evaluateLedRegime(input));
  }

  const missingInformation = uniqueStrings([
    ...validation.missingInformation,
    ...scaleResult.missing_information,
    ...publicBodyResult.missing_information,
    ...monitoringResult.missing_information,
    ...specialCategoriesResult.missing_information,
    ...criminalDataResult.missing_information,
    ...regimeResults.flatMap((result) => result.missing_information),
  ]);

  const legalRegimeResults = regimeResults.map((result) => ({
    regime: result.regime,
    status: result.status,
    legal_bases: result.legal_bases,
    rationale: result.rationale,
  }));
  const obligationStatus = combineStatuses(legalRegimeResults.map((result) => result.status), missingInformation);
  const primaryTrigger = pickPrimaryTrigger(regimeResults, obligationStatus);
  const additionalQuestions = buildAdditionalQuestions(input, missingInformation, validation.warnings);
  const finalHumanReviewRecommended =
    obligationStatus === "requires_case_by_case_assessment" ||
    obligationStatus === "insufficient_information" ||
    validation.errors.length > 0 ||
    validation.warnings.length > 0 ||
    scaleResult.classification === "medium";

  return {
    obligation_status: obligationStatus,
    legal_regime_results: legalRegimeResults,
    primary_trigger: primaryTrigger,
    public_body_result: publicBodyResult,
    monitoring_result: monitoringResult,
    scale_result: scaleResult,
    special_categories_result: specialCategoriesResult,
    criminal_data_result: criminalDataResult,
    processor_result: processorResult,
    joint_controller_result: jointControllerResult,
    court_exception_result: courtExceptionResult,
    shared_dpo_option: sharedDpoOption,
    missing_information: missingInformation,
    validation_errors: validation.errors,
    validation_warnings: validation.warnings,
    additional_questions: additionalQuestions,
    assumptions_used: assumptionsUsed,
    confidence: determineConfidence(obligationStatus, missingInformation, validation.errors, validation.warnings),
    final_human_review_recommended: finalHumanReviewRecommended,
  };
}

export function validateIodObligationInput(input: IodObligationInput) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingInformation: string[] = [];

  if (!input.entity_name.trim()) errors.push("entity_name jest wymagane.");
  if (!input.legal_form.trim()) errors.push("legal_form jest wymagane.");
  if (!input.roles.length) errors.push("roles musi zawierac co najmniej jedna role.");
  if (!input.regimes.length) errors.push("regimes musi zawierac co najmniej jeden rezim prawny.");

  if (input.is_public_body_under_polish_law === true && input.public_body_basis.length === 0) {
    errors.push("Gdy is_public_body_under_polish_law == true, public_body_basis nie moze byc puste.");
  }

  if (input.is_public_body_under_polish_law === true && input.public_body_basis.some((basis) => basis === "none")) {
    warnings.push("public_body_basis zawiera 'none' mimo oznaczenia podmiotu jako publicznego.");
  }

  if (input.is_public_body_under_polish_law === null) {
    missingInformation.push("is_public_body_under_polish_law");
  }

  if (input.public_body_basis.includes("public_finance_sector") && !input.public_finance_subtype) {
    missingInformation.push("public_finance_subtype");
  }

  if (input.monitoring_activities_present === false && input.monitoring_types.length > 0) {
    warnings.push("monitoring_types powinno byc puste, gdy monitoring_activities_present == false.");
  }

  if (input.monitoring_activities_present === true) {
    if (input.monitoring_regular === null) missingInformation.push("monitoring_regular");
    if (input.monitoring_systematic === null) missingInformation.push("monitoring_systematic");
  }

  if (input.monitoring_activities_present === null) {
    missingInformation.push("monitoring_activities_present");
  }

  if (input.special_categories_present === false && input.special_categories_types.length > 0) {
    warnings.push("special_categories_types powinno byc puste, gdy special_categories_present == false.");
  }

  if (input.special_categories_present === null) {
    missingInformation.push("special_categories_present");
  }

  if (input.criminal_data_present === null) {
    missingInformation.push("criminal_data_present");
  }

  if (
    (input.monitoring_activities_present === true ||
      input.special_categories_present === true ||
      input.criminal_data_present === true) &&
    input.processing_integral_to_core_service === null
  ) {
    missingInformation.push("processing_integral_to_core_service");
  }

  if (!input.roles.includes("processor")) {
    if (input.processor_multi_client_similarity !== null || input.processor_number_of_clients_for_same_processing !== null) {
      warnings.push("Pola processor_* powinny byc puste, gdy roles nie zawiera 'processor'.");
    }
  }

  if (input.roles.includes("processor") && input.processor_multi_client_similarity === null) {
    missingInformation.push("processor_multi_client_similarity");
  }

  if (input.scale_data_subject_count_12m !== null && input.scale_data_subject_count_12m < 0) {
    errors.push("scale_data_subject_count_12m musi byc >= 0.");
  }

  if (input.processor_number_of_clients_for_same_processing !== null && input.processor_number_of_clients_for_same_processing < 0) {
    errors.push("processor_number_of_clients_for_same_processing musi byc >= 0.");
  }

  if (input.joint_controller_count !== null && input.joint_controller_count < 0) {
    errors.push("joint_controller_count musi byc >= 0.");
  }

  if (
    input.scale_population_share_pct !== null &&
    (input.scale_population_share_pct < 0 || input.scale_population_share_pct > 100)
  ) {
    errors.push("scale_population_share_pct musi byc w zakresie 0-100.");
  }

  if (input.regimes.includes("led_poland_2018") && input.is_competent_authority_under_led === null) {
    missingInformation.push("is_competent_authority_under_led");
  }

  if (input.is_court_or_tribunal === true && input.acts_in_judicial_capacity_for_assessed_processing === null) {
    missingInformation.push("acts_in_judicial_capacity_for_assessed_processing");
  }

  if (input.wants_single_shared_dpo === true && input.dpo_easy_access_from_each_establishment === null) {
    missingInformation.push("dpo_easy_access_from_each_establishment");
  }

  return {
    errors: uniqueStrings(errors),
    warnings: uniqueStrings(warnings),
    missingInformation: uniqueStrings(missingInformation),
  };
}

function evaluateGdprRegime(context: {
  input: IodObligationInput;
  publicBodyResult: PublicBodyResult;
  monitoringResult: MonitoringResult;
  specialCategoriesResult: SpecialCategoriesResult;
  criminalDataResult: CriminalDataResult;
}): RegimeAnalysis {
  const { input, publicBodyResult, monitoringResult, specialCategoriesResult, criminalDataResult } = context;
  const missingInformation: string[] = [];

  if (!hasGdprRelevantRole(input)) {
    return {
      regime: "gdpr",
      status: "insufficient_information",
      legal_bases: gdprLegalBases,
      rationale: "Art. 37 RODO ocenia administratora, podmiot przetwarzajacy albo wspoladministratora. Wskazane role nie pozwalaja potwierdzic, czy podmiot nalezy do tej grupy.",
      primary_trigger: "unclear",
      missing_information: ["roles"],
    };
  }

  if (publicBodyResult.status === "required") {
    return {
      regime: "gdpr",
      status: "required",
      legal_bases: [...gdprLegalBases, ...polishDpoNotificationBases],
      rationale: "Podmiot jest organem lub podmiotem publicznym w rozumieniu polskich kryteriow. Nie zastosowano wyjatku dla sadu wykonujacego wymiar sprawiedliwosci.",
      primary_trigger: "public_body",
      missing_information: [],
    };
  }

  const triggerResults = [
    { result: monitoringResult, trigger: "large_scale_monitoring" as const },
    { result: specialCategoriesResult, trigger: "large_scale_special_categories" as const },
    { result: criminalDataResult, trigger: "large_scale_criminal_data" as const },
  ];

  const requiredTrigger = triggerResults.find(({ result }) => result.status === "required");
  if (requiredTrigger) {
    return {
      regime: "gdpr",
      status: "required",
      legal_bases: [...gdprLegalBases, ...polishDpoNotificationBases],
      rationale: requiredTrigger.result.rationale,
      primary_trigger: requiredTrigger.trigger,
      missing_information: [],
    };
  }

  const likelyTrigger = triggerResults.find(({ result }) => result.status === "likely_required");
  if (likelyTrigger) {
    return {
      regime: "gdpr",
      status: "likely_required",
      legal_bases: gdprLegalBases,
      rationale: likelyTrigger.result.rationale,
      primary_trigger: likelyTrigger.trigger,
      missing_information: likelyTrigger.result.missing_information,
    };
  }

  for (const item of [publicBodyResult, monitoringResult, specialCategoriesResult, criminalDataResult]) {
    missingInformation.push(...item.missing_information);
  }

  if (triggerResults.some(({ result }) => result.status === "requires_case_by_case_assessment")) {
    return {
      regime: "gdpr",
      status: "requires_case_by_case_assessment",
      legal_bases: gdprLegalBases,
      rationale: "Wystepuja cechy przetwarzania istotne dla art. 37 RODO, ale dane o skali, regularnosci/systematycznosci albo glownej dzialalnosci nie daja jednoznacznej kwalifikacji.",
      primary_trigger: "unclear",
      missing_information: uniqueStrings(missingInformation),
    };
  }

  if (missingInformation.length > 0) {
    return {
      regime: "gdpr",
      status: "insufficient_information",
      legal_bases: gdprLegalBases,
      rationale: "Brakuje danych potrzebnych do wykluczenia lub potwierdzenia przeslanek z art. 37 RODO.",
      primary_trigger: "unclear",
      missing_information: uniqueStrings(missingInformation),
    };
  }

  if (triggerResults.some(({ result }) => result.status === "likely_not_required")) {
    return {
      regime: "gdpr",
      status: "likely_not_required",
      legal_bases: gdprLegalBases,
      rationale: "Nie potwierdzono organu publicznego, duzej skali monitorowania ani duzej skali danych z art. 9 lub art. 10 RODO w glownej dzialalnosci.",
      primary_trigger: "none",
      missing_information: [],
    };
  }

  return {
    regime: "gdpr",
    status: "not_required",
    legal_bases: gdprLegalBases,
    rationale: "Dane wejściowe nie wskazuja przeslanek ustawowego obowiazku wyznaczenia IOD w art. 37 RODO. Dobrowolne wyznaczenie jest dopuszczalne, ale uruchamia reżim statusu i zadan IOD.",
    primary_trigger: "none",
    missing_information: [],
  };
}

function evaluateLedRegime(input: IodObligationInput): RegimeAnalysis {
  if (input.is_competent_authority_under_led === null) {
    return {
      regime: "led_poland_2018",
      status: "insufficient_information",
      legal_bases: ledLegalBases,
      rationale: "Nie ustalono, czy podmiot jest wlasciwym organem w rozumieniu reżimu policyjnego.",
      primary_trigger: "unclear",
      missing_information: ["is_competent_authority_under_led"],
    };
  }

  if (!input.is_competent_authority_under_led) {
    return {
      regime: "led_poland_2018",
      status: "not_required",
      legal_bases: ledLegalBases,
      rationale: "Podmiot nie zostal oznaczony jako wlasciwy organ w reżimie dyrektywy 2016/680 i ustawy z 14.12.2018.",
      primary_trigger: "none",
      missing_information: [],
    };
  }

  const isController = input.roles.includes("administrator") || input.roles.includes("joint_controller");
  if (isController) {
    return {
      regime: "led_poland_2018",
      status: "required",
      legal_bases: ledLegalBases,
      rationale: "Podmiot jest wlasciwym organem i administratorem w reżimie ustawy z 14.12.2018, wiec ma obowiazek wyznaczenia IOD/DODO.",
      primary_trigger: "led_controller",
      missing_information: [],
    };
  }

  if (input.roles.includes("processor")) {
    return {
      regime: "led_poland_2018",
      status: "likely_not_required",
      legal_bases: ledLegalBases,
      rationale: "Podmiot jest oznaczony wylacznie jako processor. Zgodnie z zalozeniem F art. 46 ustawy z 14.12.2018 nie tworzy automatycznego obowiazku po stronie samego processora.",
      primary_trigger: "none",
      missing_information: [],
    };
  }

  return {
    regime: "led_poland_2018",
    status: "requires_case_by_case_assessment",
    legal_bases: ledLegalBases,
    rationale: "Potwierdzono status wlasciwego organu, ale role nie pozwalaja jednoznacznie przypisac pozycji administratora dla ocenianego przetwarzania.",
    primary_trigger: "unclear",
    missing_information: ["roles"],
  };
}

function evaluatePublicBody(input: IodObligationInput, courtException: CourtExceptionResult): PublicBodyResult {
  const missingInformation: string[] = [];

  if (input.is_public_body_under_polish_law === null) {
    missingInformation.push("is_public_body_under_polish_law");
  }

  if (input.is_public_body_under_polish_law === true && input.public_body_basis.length === 0) {
    missingInformation.push("public_body_basis");
  }

  if (input.public_body_basis.includes("public_finance_sector") && !input.public_finance_subtype) {
    missingInformation.push("public_finance_subtype");
  }

  if (courtException.exception_applies_to_public_body_trigger) {
    return {
      is_public_body: input.is_public_body_under_polish_law,
      basis: input.public_body_basis,
      public_finance_subtype: input.public_finance_subtype,
      status: "likely_not_required",
      legal_bases: ["RODO art. 37 ust. 1 lit. a"],
      rationale: "Podmiot moze byc sadem lub trybunalem, ale dla ocenianej czynnosci dziala w ramach sprawowania wymiaru sprawiedliwosci. Dla tej czynnosci nie stosuje sie przeslanki public body.",
      missing_information: [],
    };
  }

  if (input.is_public_body_under_polish_law === true) {
    return {
      is_public_body: true,
      basis: input.public_body_basis,
      public_finance_subtype: input.public_finance_subtype,
      status: "required",
      legal_bases: ["RODO art. 37 ust. 1 lit. a", "Ustawa o finansach publicznych art. 9", "Ustawa z 10.05.2018 art. 8-11"],
      rationale: "Podmiot oznaczono jako organ/podmiot publiczny w polskiej kwalifikacji. To samodzielna przeslanka obowiazku IOD w RODO.",
      missing_information: uniqueStrings(missingInformation),
    };
  }

  if (input.is_public_body_under_polish_law === false) {
    return {
      is_public_body: false,
      basis: input.public_body_basis,
      public_finance_subtype: input.public_finance_subtype,
      status: "not_required",
      legal_bases: ["RODO art. 37 ust. 1 lit. a"],
      rationale: "Nie potwierdzono statusu organu ani podmiotu publicznego dla przeslanki z art. 37 ust. 1 lit. a RODO.",
      missing_information: [],
    };
  }

  return {
    is_public_body: null,
    basis: input.public_body_basis,
    public_finance_subtype: input.public_finance_subtype,
    status: "insufficient_information",
    legal_bases: ["RODO art. 37 ust. 1 lit. a"],
    rationale: "Nie wiadomo, czy podmiot jest organem lub podmiotem publicznym.",
    missing_information: uniqueStrings(missingInformation),
  };
}

function evaluateMonitoring(input: IodObligationInput, scaleResult: ScaleResult): MonitoringResult {
  const missingInformation: string[] = [];
  const largeScale = scaleResult.classification === "high" ? true : scaleResult.classification === "unknown" ? null : false;

  if (input.monitoring_activities_present === null) {
    missingInformation.push("monitoring_activities_present");
  }

  if (input.monitoring_activities_present === true) {
    if (input.monitoring_regular === null) missingInformation.push("monitoring_regular");
    if (input.monitoring_systematic === null) missingInformation.push("monitoring_systematic");
    if (input.processing_integral_to_core_service === null) missingInformation.push("processing_integral_to_core_service");
    if (scaleResult.classification === "unknown") missingInformation.push(...scaleResult.missing_information);
  }

  const isTrigger =
    input.monitoring_activities_present === true &&
    input.monitoring_regular === true &&
    input.monitoring_systematic === true &&
    input.processing_integral_to_core_service === true;

  let status: IodObligationStatus = "not_required";
  let rationale = "Brak potwierdzonego regularnego i systematycznego monitorowania osob jako glownej dzialalnosci.";

  if (isTrigger && largeScale === true) {
    status = "required";
    rationale = "Monitorowanie jest regularne, systematyczne, integralne dla glownej uslugi i ocenione pomocniczo jako duza skala.";
  } else if (isTrigger && scaleResult.classification === "medium") {
    status = "requires_case_by_case_assessment";
    rationale = "Monitorowanie spelnia cechy regularnosci, systematycznosci i glownej dzialalnosci, ale skala jest graniczna i wymaga oceny przypadku.";
  } else if (input.monitoring_activities_present === true && missingInformation.length > 0) {
    status = "insufficient_information";
    rationale = "Wykazano monitorowanie, lecz brakuje danych o regularnosci, systematycznosci, glownej dzialalnosci albo skali.";
  } else if (input.monitoring_activities_present === true) {
    status = "likely_not_required";
    rationale = "Monitorowanie wystepuje, ale nie potwierdzono kompletu przeslanek art. 37 ust. 1 lit. b RODO.";
  }

  return {
    present: input.monitoring_activities_present,
    types: input.monitoring_types,
    regular: input.monitoring_regular,
    systematic: input.monitoring_systematic,
    core_activity: input.processing_integral_to_core_service,
    large_scale: largeScale,
    status,
    legal_bases: ["RODO art. 37 ust. 1 lit. b", "RODO motyw 91", "RODO motyw 97", "WP243"],
    rationale,
    missing_information: uniqueStrings(missingInformation),
  };
}

function evaluateSpecialCategories(input: IodObligationInput, scaleResult: ScaleResult): SpecialCategoriesResult {
  const missingInformation = evaluateSensitiveDataMissingFields(input.special_categories_present, input.processing_integral_to_core_service, scaleResult);
  const largeScale = scaleResult.classification === "high" ? true : scaleResult.classification === "unknown" ? null : false;
  let status: IodObligationStatus = "not_required";
  let rationale = "Nie potwierdzono duzej skali danych szczegolnych kategorii jako glownej dzialalnosci.";

  if (input.special_categories_present === true && input.processing_integral_to_core_service === true && largeScale === true) {
    status = "required";
    rationale = "Dane szczegolnych kategorii z art. 9 RODO sa przetwarzane jako element glownej dzialalnosci i skala jest wysoka.";
  } else if (
    input.special_categories_present === true &&
    input.processing_integral_to_core_service === true &&
    scaleResult.classification === "medium"
  ) {
    status = "requires_case_by_case_assessment";
    rationale = "Dane szczegolnych kategorii sa w glownej dzialalnosci, ale klasyfikacja skali jest graniczna.";
  } else if (input.special_categories_present === true && missingInformation.length > 0) {
    status = "insufficient_information";
    rationale = "Wykazano dane szczegolnych kategorii, lecz brakuje informacji o glownej dzialalnosci albo skali.";
  } else if (input.special_categories_present === true) {
    status = "likely_not_required";
    rationale = "Dane szczegolnych kategorii wystepuja, ale nie potwierdzono glownej dzialalnosci i duzej skali jednoczesnie.";
  }

  return {
    present: input.special_categories_present,
    types: input.special_categories_types,
    core_activity: input.processing_integral_to_core_service,
    large_scale: largeScale,
    status,
    legal_bases: ["RODO art. 37 ust. 1 lit. c", "RODO art. 9", "RODO motyw 91", "RODO motyw 97", "WP243"],
    rationale,
    missing_information: missingInformation,
  };
}

function evaluateCriminalData(input: IodObligationInput, scaleResult: ScaleResult): CriminalDataResult {
  const missingInformation = evaluateSensitiveDataMissingFields(input.criminal_data_present, input.processing_integral_to_core_service, scaleResult);
  const largeScale = scaleResult.classification === "high" ? true : scaleResult.classification === "unknown" ? null : false;
  let status: IodObligationStatus = "not_required";
  let rationale = "Nie potwierdzono duzej skali danych dotyczacych wyrokow skazujacych i naruszen prawa jako glownej dzialalnosci.";

  if (input.criminal_data_present === true && input.processing_integral_to_core_service === true && largeScale === true) {
    status = "required";
    rationale = "Dane z art. 10 RODO sa przetwarzane jako element glownej dzialalnosci i skala jest wysoka.";
  } else if (input.criminal_data_present === true && input.processing_integral_to_core_service === true && scaleResult.classification === "medium") {
    status = "requires_case_by_case_assessment";
    rationale = "Dane z art. 10 RODO sa w glownej dzialalnosci, ale klasyfikacja skali jest graniczna.";
  } else if (input.criminal_data_present === true && missingInformation.length > 0) {
    status = "insufficient_information";
    rationale = "Wykazano dane z art. 10 RODO, lecz brakuje informacji o glownej dzialalnosci albo skali.";
  } else if (input.criminal_data_present === true) {
    status = "likely_not_required";
    rationale = "Dane z art. 10 RODO wystepuja, ale nie potwierdzono glownej dzialalnosci i duzej skali jednoczesnie.";
  }

  return {
    present: input.criminal_data_present,
    core_activity: input.processing_integral_to_core_service,
    large_scale: largeScale,
    status,
    legal_bases: ["RODO art. 37 ust. 1 lit. c", "RODO art. 10", "RODO motyw 91", "RODO motyw 97", "WP243"],
    rationale,
    missing_information: missingInformation,
  };
}

function evaluateSensitiveDataMissingFields(present: boolean | null, coreActivity: boolean | null, scaleResult: ScaleResult) {
  const missingInformation: string[] = [];
  if (present === null) missingInformation.push("sensitive_or_criminal_data_present");
  if (present === true && coreActivity === null) missingInformation.push("processing_integral_to_core_service");
  if (present === true && scaleResult.classification === "unknown") missingInformation.push(...scaleResult.missing_information);
  return uniqueStrings(missingInformation);
}

function evaluateScale(input: IodObligationInput): ScaleResult {
  const factors: string[] = [];
  const missingInformation: string[] = [];
  let score = 0;
  let hasScaleSignal = false;

  const countScore = getCountScore(input.scale_data_subject_count_12m, input.scale_data_subject_count_band);
  if (countScore === null) {
    missingInformation.push("scale_data_subject_count_12m lub scale_data_subject_count_band");
  } else {
    score += countScore.points;
    factors.push(countScore.factor);
    hasScaleSignal = true;
  }

  if (input.scale_population_share_pct === null) {
    missingInformation.push("scale_population_share_pct");
  } else if (input.scale_population_share_pct >= 30) {
    score += 3;
    factors.push("znaczny udzial populacji/grupy docelowej");
    hasScaleSignal = true;
  } else if (input.scale_population_share_pct >= 10) {
    score += 2;
    factors.push("istotny udzial populacji/grupy docelowej");
    hasScaleSignal = true;
  } else if (input.scale_population_share_pct > 0) {
    score += 1;
    factors.push("ograniczony udzial populacji/grupy docelowej");
    hasScaleSignal = true;
  }

  if (input.scale_data_scope === null) {
    missingInformation.push("scale_data_scope");
  } else {
    const scopePoints = { low: 0, medium: 1, high: 2, very_high: 3 } satisfies Record<ScaleScope, number>;
    score += scopePoints[input.scale_data_scope];
    factors.push(`zakres danych: ${input.scale_data_scope}`);
    hasScaleSignal = true;
  }

  if (input.scale_duration === null) {
    missingInformation.push("scale_duration");
  } else {
    const durationPoints = { one_off: 0, occasional: 0, periodic: 1, continuous: 2, long_term: 2 } satisfies Record<ScaleDuration, number>;
    score += durationPoints[input.scale_duration];
    factors.push(`czas przetwarzania: ${input.scale_duration}`);
    hasScaleSignal = true;
  }

  if (input.scale_geography === null) {
    missingInformation.push("scale_geography");
  } else {
    const geographyPoints = { single_location: 0, local: 0, regional: 1, national: 2, multi_national: 3 } satisfies Record<ScaleGeography, number>;
    score += geographyPoints[input.scale_geography];
    factors.push(`zasieg: ${input.scale_geography}`);
    hasScaleSignal = true;
  }

  const processorAggregationPoints = getProcessorAggregationPoints(input);
  if (processorAggregationPoints > 0) {
    score += processorAggregationPoints;
    factors.push(`agregacja procesora: +${processorAggregationPoints}`);
    hasScaleSignal = true;
  }

  const classification = !hasScaleSignal ? "unknown" : score >= 8 ? "high" : score >= 4 ? "medium" : "low";

  return {
    classification,
    score,
    factors,
    missing_information: classification === "unknown" ? uniqueStrings(missingInformation) : uniqueStrings(missingInformation),
    legal_threshold_note:
      "Wynik low/medium/high jest narzedziem compliance opartym na czynnikach z WP243 i motywu 91 RODO; nie jest ustawowym progiem liczbowym.",
  };
}

function getCountScore(count: number | null, band: ScaleCountBand | null) {
  const normalizedBand = countToBand(count) ?? band;
  if (!normalizedBand) return null;

  const points = {
    "1": 0,
    "2-100": 0,
    "101-1000": 1,
    "1001-10000": 2,
    "10001-100000": 3,
    "100000+": 4,
  } satisfies Record<ScaleCountBand, number>;

  return {
    points: points[normalizedBand],
    factor: `liczba osob: ${normalizedBand}`,
  };
}

function countToBand(count: number | null): ScaleCountBand | null {
  if (count === null) return null;
  if (count <= 1) return "1";
  if (count <= 100) return "2-100";
  if (count <= 1000) return "101-1000";
  if (count <= 10000) return "1001-10000";
  if (count <= 100000) return "10001-100000";
  return "100000+";
}

function getProcessorAggregationPoints(input: IodObligationInput) {
  if (!input.roles.includes("processor") || input.processor_multi_client_similarity !== true) return 0;
  const clients = input.processor_number_of_clients_for_same_processing ?? 0;
  if (clients >= 500) return 3;
  if (clients >= 100) return 2;
  if (clients >= 10) return 1;
  return 0;
}

function evaluateProcessor(input: IodObligationInput, scaleResult: ScaleResult): ProcessorResult {
  const isProcessor = input.roles.includes("processor");
  const processorOnly = isProcessor && !input.roles.includes("administrator") && !input.roles.includes("joint_controller");
  const scalePointsFromAggregation = getProcessorAggregationPoints(input);

  return {
    is_processor: isProcessor,
    processor_only: processorOnly,
    aggregation_considered: isProcessor,
    similar_processing_for_many_clients: input.processor_multi_client_similarity,
    client_count: input.processor_number_of_clients_for_same_processing,
    scale_points_from_aggregation: scalePointsFromAggregation,
    rationale: isProcessor
      ? `Dla GDPR processor jest objety art. 37. Agregacja wielu podobnych klientow zostala uwzgledniona w skali (${scaleResult.classification}).`
      : "Podmiot nie zostal oznaczony jako processor; agregacja procesora nie byla stosowana.",
  };
}

function evaluateJointController(input: IodObligationInput): JointControllerResult {
  const isJointController = input.roles.includes("joint_controller");
  return {
    is_joint_controller: isJointController,
    joint_controller_count: input.joint_controller_count,
    assessed_as_controller: isJointController,
    rationale: isJointController
      ? "Wspoladministrowanie nie jest zwolnieniem. Podmiot jest oceniany jako controller dla danej operacji zgodnie z art. 26 RODO."
      : "Nie wskazano roli wspoladministratora.",
  };
}

function evaluateCourtException(input: IodObligationInput): CourtExceptionResult {
  const exceptionApplies =
    input.is_court_or_tribunal === true && input.acts_in_judicial_capacity_for_assessed_processing === true;

  return {
    is_court_or_tribunal: input.is_court_or_tribunal,
    acts_in_judicial_capacity: input.acts_in_judicial_capacity_for_assessed_processing,
    exception_applies_to_public_body_trigger: exceptionApplies,
    rationale: exceptionApplies
      ? "Wyjatek z art. 37 ust. 1 lit. a RODO stosuje sie funkcjonalnie do czynnosci wykonywanej przy sprawowaniu wymiaru sprawiedliwosci."
      : "Nie potwierdzono funkcjonalnego wyjatku sadowego dla ocenianej czynnosci.",
  };
}

function evaluateSharedDpo(input: IodObligationInput): SharedDpoOption {
  if (input.wants_single_shared_dpo !== true) {
    return {
      requested: input.wants_single_shared_dpo,
      legally_available: null,
      easy_access_confirmed: input.dpo_easy_access_from_each_establishment,
      legal_bases: ["RODO art. 37 ust. 2-3"],
      rationale: "Nie zadeklarowano wariantu wspolnego IOD.",
    };
  }

  if (input.dpo_easy_access_from_each_establishment === true) {
    return {
      requested: true,
      legally_available: true,
      easy_access_confirmed: true,
      legal_bases: ["RODO art. 37 ust. 2-3"],
      rationale: "Wspolny IOD jest co do zasady dopuszczalny, jesli zachowana jest latwa dostepnosc dla kazdej jednostki i osob, ktorych dane dotycza.",
    };
  }

  if (input.dpo_easy_access_from_each_establishment === false) {
    return {
      requested: true,
      legally_available: false,
      easy_access_confirmed: false,
      legal_bases: ["RODO art. 37 ust. 2-3"],
      rationale: "Wariant wspolnego IOD nie powinien byc przyjety bez zapewnienia latwej dostepnosci z kazdej jednostki.",
    };
  }

  return {
    requested: true,
    legally_available: null,
    easy_access_confirmed: null,
    legal_bases: ["RODO art. 37 ust. 2-3"],
    rationale: "Trzeba potwierdzic latwa dostepnosc IOD dla kazdej jednostki.",
  };
}

function hasGdprRelevantRole(input: IodObligationInput) {
  return input.roles.some((role) => role === "administrator" || role === "processor" || role === "joint_controller");
}

function combineStatuses(statuses: IodObligationStatus[], missingInformation: string[]): IodObligationStatus {
  if (!statuses.length) return "insufficient_information";
  if (statuses.includes("required")) return "required";
  if (statuses.includes("likely_required")) return "likely_required";
  if (statuses.includes("requires_case_by_case_assessment")) return "requires_case_by_case_assessment";
  if (statuses.includes("insufficient_information")) return missingInformation.length ? "insufficient_information" : "requires_case_by_case_assessment";
  if (statuses.includes("likely_not_required")) return "likely_not_required";
  return "not_required";
}

function pickPrimaryTrigger(results: RegimeAnalysis[], status: IodObligationStatus): PrimaryTrigger {
  const priority: PrimaryTrigger[] = [
    "public_body",
    "led_controller",
    "large_scale_monitoring",
    "large_scale_special_categories",
    "large_scale_criminal_data",
  ];

  for (const trigger of priority) {
    if (results.some((result) => result.primary_trigger === trigger && (result.status === "required" || result.status === "likely_required"))) {
      return trigger;
    }
  }

  if (status === "requires_case_by_case_assessment" || status === "insufficient_information") return "unclear";
  return "none";
}

function determineConfidence(
  status: IodObligationStatus,
  missingInformation: string[],
  validationErrors: string[],
  validationWarnings: string[],
): "high" | "medium" | "low" {
  if (validationErrors.length > 0 || missingInformation.length > 4 || status === "insufficient_information") return "low";
  if (validationWarnings.length > 0 || missingInformation.length > 0 || status === "requires_case_by_case_assessment") return "medium";
  return "high";
}

function buildAdditionalQuestions(input: IodObligationInput, missingInformation: string[], warnings: string[]) {
  const questions: IodAdditionalQuestion[] = [];
  const missing = new Set(missingInformation);

  if (missing.has("is_public_body_under_polish_law") || missing.has("public_body_basis") || warnings.some((warning) => warning.includes("public_body_basis"))) {
    questions.push(question("public-body-basis"));
  }

  if (missing.has("acts_in_judicial_capacity_for_assessed_processing")) {
    questions.push(question("court-capacity"));
  }

  if (missing.has("is_competent_authority_under_led")) {
    questions.push(question("led-competent-authority"));
  }

  if (missing.has("processing_integral_to_core_service")) {
    questions.push(question("core-activity"));
  }

  if (
    missing.has("scale_data_subject_count_12m lub scale_data_subject_count_band") ||
    missing.has("scale_data_scope") ||
    missing.has("scale_duration") ||
    missing.has("scale_geography")
  ) {
    questions.push(question("scale-factors"));
  }

  if (input.monitoring_activities_present === true && (missing.has("monitoring_regular") || missing.has("monitoring_systematic"))) {
    questions.push(question("monitoring-regular-systematic"));
  }

  if (input.roles.includes("processor") && missing.has("processor_multi_client_similarity")) {
    questions.push(question("processor-aggregation"));
  }

  if (missing.has("dpo_easy_access_from_each_establishment")) {
    questions.push(question("shared-dpo-access"));
  }

  return uniqueQuestions(questions);
}

function question(id: string): IodAdditionalQuestion {
  const questions: Record<string, IodAdditionalQuestion> = {
    "public-body-basis": {
      id: "public-body-basis",
      question: "Jaka jest konkretna podstawa uznania podmiotu za organ lub podmiot publiczny?",
      answer_type: "multi_enum",
      why_it_matters: "Art. 37 ust. 1 lit. a RODO daje samodzielna przeslanke obowiazku dla organow i podmiotow publicznych.",
      branch_if_yes: "Zweryfikuj katalog z art. 9 ustawy o finansach publicznych albo ustawę szczegolna i oznacz public_body_basis.",
      branch_if_no: "Nie opieraj wyniku na przeslance public body; przejdz do monitorowania, danych szczegolnych i danych z art. 10 RODO.",
    },
    "court-capacity": {
      id: "court-capacity",
      question: "Czy oceniane przetwarzanie jest wykonywane przez sad/trybunal w ramach sprawowania wymiaru sprawiedliwosci?",
      answer_type: "yes_no",
      why_it_matters: "Wyjatek z art. 37 ust. 1 lit. a RODO jest funkcjonalny dla tej kategorii czynnosci.",
      branch_if_yes: "Nie stosuj public body trigger dla tej czynnosci; ocen pozostale przeslanki.",
      branch_if_no: "Dla czynnosci administracyjnych sadu public body trigger moze pozostac aktualny.",
    },
    "led-competent-authority": {
      id: "led-competent-authority",
      question: "Czy podmiot jest wlasciwym organem w rozumieniu reżimu dyrektywy policyjnej i ustawy z 14.12.2018?",
      answer_type: "yes_no",
      why_it_matters: "Art. 46 ustawy z 14.12.2018 naklada obowiazek na administratora w tym reżimie.",
      branch_if_yes: "Jesli podmiot jest administratorem, wynik LED powinien byc required.",
      branch_if_no: "Nie wyprowadzaj obowiazku z reżimu LED.",
    },
    "core-activity": {
      id: "core-activity",
      question: "Czy oceniane przetwarzanie jest zasadnicza dzialalnoscia albo integralnym elementem glownej uslugi?",
      answer_type: "yes_no",
      why_it_matters: "Motyw 97 i WP243 odrozniaja glowna dzialalnosc od czynnosci pomocniczych, np. kadr lub standardowego IT.",
      branch_if_yes: "Przejdz do oceny duzej skali i rodzaju danych.",
      branch_if_no: "Nie stosuj lit. b/c tylko dlatego, ze dane wystepuja pomocniczo.",
    },
    "scale-factors": {
      id: "scale-factors",
      question: "Jaka jest liczba osob, udzial populacji, zakres danych, czas i zasieg geograficzny przetwarzania?",
      answer_type: "text",
      why_it_matters: "Duza skala wymaga oceny wielu czynnikow; brak sztywnego progu ustawowego.",
      branch_if_yes: "Uzupełnij pola scale_* i ponownie przelicz klasyfikacje low/medium/high.",
      branch_if_no: "Zwroc insufficient_information albo requires_case_by_case_assessment.",
    },
    "monitoring-regular-systematic": {
      id: "monitoring-regular-systematic",
      question: "Czy monitoring osob jest regularny oraz systematyczny?",
      answer_type: "yes_no",
      why_it_matters: "Art. 37 ust. 1 lit. b RODO wymaga regularnego i systematycznego monitorowania na duza skale.",
      branch_if_yes: "Jesli skala jest wysoka i monitoring jest core activity, wynik GDPR jest required.",
      branch_if_no: "Lit. b najpewniej nie tworzy samodzielnego obowiazku.",
    },
    "processor-aggregation": {
      id: "processor-aggregation",
      question: "Czy processor wykonuje podobne operacje dla wielu klientow i ilu klientow obejmuje ten sam proces?",
      answer_type: "number",
      why_it_matters: "Dla processora skala moze wynikac z agregacji wielu podobnych zlecen.",
      branch_if_yes: "Dodaj punkty agregacji do oceny skali.",
      branch_if_no: "Oceniaj skale bez agregacji procesora.",
    },
    "shared-dpo-access": {
      id: "shared-dpo-access",
      question: "Czy wspolny IOD bedzie latwo dostepny dla kazdej jednostki, pracownikow i osob, ktorych dane dotycza?",
      answer_type: "yes_no",
      why_it_matters: "Art. 37 ust. 2-3 RODO dopuszcza wspolnego IOD tylko przy zapewnieniu latwej dostepnosci.",
      branch_if_yes: "Wariant wspolnego IOD jest co do zasady dopuszczalny.",
      branch_if_no: "Nie rekomenduj wspolnego IOD bez zmiany modelu dostepnosci.",
    },
  };

  return questions[id];
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function uniqueQuestions(values: IodAdditionalQuestion[]) {
  const seen = new Set<string>();
  return values.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export type IodObligationTestCase = {
  name: string;
  input: IodObligationInput;
  expected: {
    obligation_status: IodObligationStatus;
    primary_trigger: PrimaryTrigger;
  };
};

const baseInput = {
  legal_form: "nieustalona",
  roles: ["administrator"],
  regimes: ["gdpr"],
  is_public_body_under_polish_law: false,
  public_body_basis: ["none"],
  public_finance_subtype: "not_applicable",
  is_court_or_tribunal: false,
  acts_in_judicial_capacity_for_assessed_processing: false,
  is_competent_authority_under_led: false,
  core_activities_description: [],
  processing_integral_to_core_service: false,
  monitoring_activities_present: false,
  monitoring_types: [],
  monitoring_regular: false,
  monitoring_systematic: false,
  scale_data_subject_count_12m: 80,
  scale_data_subject_count_band: "2-100",
  scale_population_share_pct: 0,
  scale_data_scope: "low",
  scale_duration: "occasional",
  scale_geography: "single_location",
  special_categories_present: false,
  special_categories_types: [],
  criminal_data_present: false,
  processor_multi_client_similarity: null,
  processor_number_of_clients_for_same_processing: null,
  joint_controller_count: null,
  wants_single_shared_dpo: false,
  dpo_easy_access_from_each_establishment: null,
  internal_documented_assessment_exists: false,
  free_text_notes: null,
} satisfies Omit<IodObligationInput, "entity_name">;

export const iodObligationTestCases: IodObligationTestCase[] = [
  {
    name: "urzad-gminy",
    input: {
      ...baseInput,
      entity_name: "Urzad Gminy",
      legal_form: "jednostka samorzadu terytorialnego",
      is_public_body_under_polish_law: true,
      public_body_basis: ["public_finance_sector"],
      public_finance_subtype: "local_government_unit_or_union",
    },
    expected: { obligation_status: "required", primary_trigger: "public_body" },
  },
  {
    name: "instytut-badawczy",
    input: {
      ...baseInput,
      entity_name: "Instytut Badawczy",
      legal_form: "instytut badawczy",
      is_public_body_under_polish_law: true,
      public_body_basis: ["research_institute"],
      public_finance_subtype: "not_applicable",
    },
    expected: { obligation_status: "required", primary_trigger: "public_body" },
  },
  {
    name: "spolka-komunalna-zoo",
    input: {
      ...baseInput,
      entity_name: "Komunalna sp. z o.o.",
      legal_form: "spolka z ograniczona odpowiedzialnoscia",
    },
    expected: { obligation_status: "not_required", primary_trigger: "none" },
  },
  {
    name: "szpital-prywatny",
    input: {
      ...baseInput,
      entity_name: "Prywatny Szpital",
      legal_form: "spolka z o.o.",
      core_activities_description: ["diagnostyka i leczenie pacjentow"],
      processing_integral_to_core_service: true,
      scale_data_subject_count_12m: 120000,
      scale_data_subject_count_band: "100000+",
      scale_population_share_pct: 12,
      scale_data_scope: "very_high",
      scale_duration: "continuous",
      scale_geography: "regional",
      special_categories_present: true,
      special_categories_types: ["health"],
    },
    expected: { obligation_status: "required", primary_trigger: "large_scale_special_categories" },
  },
  {
    name: "pojedynczy-lekarz",
    input: {
      ...baseInput,
      entity_name: "Gabinet lekarski",
      legal_form: "jednoosobowa dzialalnosc gospodarcza",
      core_activities_description: ["porady lekarskie"],
      processing_integral_to_core_service: true,
      scale_data_subject_count_12m: 700,
      scale_data_subject_count_band: "101-1000",
      scale_data_scope: "high",
      scale_duration: "continuous",
      scale_geography: "local",
      special_categories_present: true,
      special_categories_types: ["health"],
    },
    expected: { obligation_status: "requires_case_by_case_assessment", primary_trigger: "unclear" },
  },
  {
    name: "processor-analityczny-500-klientow",
    input: {
      ...baseInput,
      entity_name: "Analytics Processor",
      legal_form: "spolka z o.o.",
      roles: ["processor"],
      core_activities_description: ["analityka behawioralna dla klientow SaaS"],
      processing_integral_to_core_service: true,
      monitoring_activities_present: true,
      monitoring_types: ["profiling", "behavioral_advertising"],
      monitoring_regular: true,
      monitoring_systematic: true,
      scale_data_subject_count_12m: 90000,
      scale_data_subject_count_band: "10001-100000",
      scale_population_share_pct: 8,
      scale_data_scope: "high",
      scale_duration: "continuous",
      scale_geography: "national",
      processor_multi_client_similarity: true,
      processor_number_of_clients_for_same_processing: 500,
    },
    expected: { obligation_status: "required", primary_trigger: "large_scale_monitoring" },
  },
  {
    name: "fundacja-zdrowie-psychiczne-ogolnopolska",
    input: {
      ...baseInput,
      entity_name: "Fundacja Zdrowia Psychicznego",
      legal_form: "fundacja",
      core_activities_description: ["ogolnopolski program wsparcia zdrowia psychicznego"],
      processing_integral_to_core_service: true,
      scale_data_subject_count_12m: 40000,
      scale_data_subject_count_band: "10001-100000",
      scale_population_share_pct: 18,
      scale_data_scope: "very_high",
      scale_duration: "long_term",
      scale_geography: "national",
      special_categories_present: true,
      special_categories_types: ["health"],
    },
    expected: { obligation_status: "required", primary_trigger: "large_scale_special_categories" },
  },
  {
    name: "komendant-strazy-miejskiej",
    input: {
      ...baseInput,
      entity_name: "Komendant Strazy Miejskiej",
      legal_form: "organ w strukturze urzedu",
      roles: ["administrator"],
      regimes: ["gdpr", "led_poland_2018"],
      is_public_body_under_polish_law: true,
      public_body_basis: ["public_finance_sector", "other_special_law"],
      public_finance_subtype: "budgetary_unit",
      is_competent_authority_under_led: true,
    },
    expected: { obligation_status: "required", primary_trigger: "public_body" },
  },
];
