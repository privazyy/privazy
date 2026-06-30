# Checker obowiazku IOD/DPO

Dokument opisuje model compliance dla oceny, czy podmiot powinien wyznaczyc Inspektora Ochrony Danych (IOD/DPO). Tresc ma charakter ogolny i produktowo-techniczny; nie stanowi porady prawnej dla konkretnej sprawy.

Zrodla referencyjne:

- RODO: art. 37 ust. 1 lit. a-c, art. 37 ust. 2-4, art. 9, art. 10, art. 26, motywy 91 i 97.
- Polska ustawa z 10 maja 2018 r. o ochronie danych osobowych: art. 8-11.
- Ustawa z 27 sierpnia 2009 r. o finansach publicznych: art. 9.
- Dyrektywa (UE) 2016/680: art. 32.
- Polska ustawa z 14 grudnia 2018 r. o ochronie danych osobowych przetwarzanych w zwiazku z zapobieganiem i zwalczaniem przestepczosci: art. 46 ust. 1 i 3.
- WP243 / wytyczne dotyczace inspektorow ochrony danych oraz oficjalne materialy UODO dotyczace IOD/DODO.

## 1. Zwiezla specyfikacja

Checker rozdziela dwa rezimy prawne:

1. `gdpr` - analiza art. 37 RODO dla administratora, podmiotu przetwarzajacego i wspoladministratora.
2. `led_poland_2018` - analiza art. 46 ustawy z 14.12.2018 w rezimie dyrektywy policyjnej.

Wynik ma szesc poziomow:

- `required` - obowiazek wynika bezposrednio z potwierdzonej przeslanki.
- `likely_required` - dane mocno wskazuja na obowiazek, ale wymagaja potwierdzenia jednego elementu.
- `requires_case_by_case_assessment` - wystepuja przeslanki graniczne, zwlaszcza przy skali medium.
- `insufficient_information` - brakuje danych kluczowych do oceny.
- `likely_not_required` - brak pelnego zestawu przeslanek, ale pozostaje ryzyko interpretacyjne.
- `not_required` - na podstawie kompletnych odpowiedzi nie widac ustawowego obowiazku.

Reguly glowne:

- Organ lub podmiot publiczny w rozumieniu polskiego prawa co do zasady daje `required` w GDPR, chyba ze oceniana czynnosc dotyczy sadu/trybunalu dzialajacego w ramach sprawowania wymiaru sprawiedliwosci.
- Regularne i systematyczne monitorowanie osob daje `required` tylko wtedy, gdy jest elementem glownej dzialalnosci oraz odbywa sie na duza skale.
- Dane szczegolnych kategorii z art. 9 RODO albo dane z art. 10 RODO daja `required`, gdy ich przetwarzanie jest elementem glownej dzialalnosci oraz odbywa sie na duza skale.
- Wspoladministrator nie jest odrebna kategoria zwalniajaca; kazdy wspoladministrator jest oceniany jak controller dla danej operacji.
- Processor w GDPR jest objety art. 37. Przy ocenie skali nalezy uwzglednic agregacje podobnych operacji wykonywanych dla wielu klientow.
- W rezimie ustawy z 14.12.2018 bezposredni obowiazek dotyczy administratora bedacego wlasciwym organem. Sam status processora nie tworzy automatycznego `required` z art. 46.
- Wspolny IOD jest dopuszczalny tylko wtedy, gdy zapewniona jest latwa dostepnosc z kazdej jednostki i dla osob, ktorych dane dotycza.
- Brak obowiazku nie wyklucza dobrowolnego IOD. Dobrowolnie wyznaczony IOD powinien korzystac z pelnego rezimu statusu, niezaleznosci i zadan IOD.

Mechanizm duzej skali jest scoringiem pomocniczym, a nie progiem ustawowym. Uwzglednia liczbe osob, udzial populacji/grupy docelowej, zakres danych, czas, zasieg geograficzny i agregacje procesora.

## 2. JSON Schema input

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://privazy.pl/schemas/iod-obligation-input.json",
  "title": "IOD obligation checker input",
  "type": "object",
  "additionalProperties": false,
  "required": [
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
    "free_text_notes"
  ],
  "properties": {
    "entity_name": { "type": "string", "minLength": 1, "maxLength": 180 },
    "legal_form": { "type": "string", "minLength": 1, "maxLength": 180 },
    "roles": {
      "type": "array",
      "minItems": 1,
      "uniqueItems": true,
      "items": { "enum": ["administrator", "processor", "joint_controller", "other"] }
    },
    "regimes": {
      "type": "array",
      "minItems": 1,
      "uniqueItems": true,
      "items": { "enum": ["gdpr", "led_poland_2018"] }
    },
    "is_public_body_under_polish_law": { "type": ["boolean", "null"] },
    "public_body_basis": {
      "type": "array",
      "uniqueItems": true,
      "items": {
        "enum": ["public_finance_sector", "research_institute", "nbp", "other_special_law", "none", "unknown"]
      }
    },
    "public_finance_subtype": {
      "enum": [
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
        null
      ]
    },
    "is_court_or_tribunal": { "type": ["boolean", "null"] },
    "acts_in_judicial_capacity_for_assessed_processing": { "type": ["boolean", "null"] },
    "is_competent_authority_under_led": { "type": ["boolean", "null"] },
    "core_activities_description": {
      "type": "array",
      "items": { "type": "string", "minLength": 1, "maxLength": 500 }
    },
    "processing_integral_to_core_service": { "type": ["boolean", "null"] },
    "monitoring_activities_present": { "type": ["boolean", "null"] },
    "monitoring_types": {
      "type": "array",
      "uniqueItems": true,
      "items": {
        "enum": [
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
          "other"
        ]
      }
    },
    "monitoring_regular": { "type": ["boolean", "null"] },
    "monitoring_systematic": { "type": ["boolean", "null"] },
    "scale_data_subject_count_12m": { "type": ["integer", "null"], "minimum": 0 },
    "scale_data_subject_count_band": {
      "enum": ["1", "2-100", "101-1000", "1001-10000", "10001-100000", "100000+", null]
    },
    "scale_population_share_pct": { "type": ["number", "null"], "minimum": 0, "maximum": 100 },
    "scale_data_scope": { "enum": ["low", "medium", "high", "very_high", null] },
    "scale_duration": { "enum": ["one_off", "occasional", "periodic", "continuous", "long_term", null] },
    "scale_geography": { "enum": ["single_location", "local", "regional", "national", "multi_national", null] },
    "special_categories_present": { "type": ["boolean", "null"] },
    "special_categories_types": {
      "type": "array",
      "uniqueItems": true,
      "items": {
        "enum": [
          "racial_or_ethnic_origin",
          "political_opinions",
          "religion_or_belief",
          "trade_union_membership",
          "genetic",
          "biometric_identification",
          "health",
          "sex_life",
          "sexual_orientation"
        ]
      }
    },
    "criminal_data_present": { "type": ["boolean", "null"] },
    "processor_multi_client_similarity": { "type": ["boolean", "null"] },
    "processor_number_of_clients_for_same_processing": { "type": ["integer", "null"], "minimum": 0 },
    "joint_controller_count": { "type": ["integer", "null"], "minimum": 0 },
    "wants_single_shared_dpo": { "type": ["boolean", "null"] },
    "dpo_easy_access_from_each_establishment": { "type": ["boolean", "null"] },
    "internal_documented_assessment_exists": { "type": ["boolean", "null"] },
    "free_text_notes": { "type": ["string", "null"], "maxLength": 4000 }
  }
}
```

## 3. JSON Schema output

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://privazy.pl/schemas/iod-obligation-output.json",
  "title": "IOD obligation checker output",
  "type": "object",
  "additionalProperties": false,
  "required": [
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
    "final_human_review_recommended"
  ],
  "$defs": {
    "status": {
      "enum": [
        "required",
        "not_required",
        "likely_required",
        "likely_not_required",
        "requires_case_by_case_assessment",
        "insufficient_information"
      ]
    },
    "question": {
      "type": "object",
      "additionalProperties": false,
      "required": ["id", "question", "answer_type", "why_it_matters", "branch_if_yes", "branch_if_no"],
      "properties": {
        "id": { "type": "string" },
        "question": { "type": "string" },
        "answer_type": { "enum": ["yes_no", "number", "text", "enum", "multi_enum", "date"] },
        "why_it_matters": { "type": "string" },
        "branch_if_yes": { "type": "string" },
        "branch_if_no": { "type": "string" }
      }
    },
    "regime_result": {
      "type": "object",
      "additionalProperties": false,
      "required": ["regime", "status", "legal_bases", "rationale"],
      "properties": {
        "regime": { "enum": ["gdpr", "led_poland_2018"] },
        "status": { "$ref": "#/$defs/status" },
        "legal_bases": { "type": "array", "items": { "type": "string" } },
        "rationale": { "type": "string" }
      }
    },
    "assessment_object": {
      "type": "object",
      "additionalProperties": true,
      "required": ["status", "legal_bases", "rationale", "missing_information"],
      "properties": {
        "status": { "$ref": "#/$defs/status" },
        "legal_bases": { "type": "array", "items": { "type": "string" } },
        "rationale": { "type": "string" },
        "missing_information": { "type": "array", "items": { "type": "string" } }
      }
    }
  },
  "properties": {
    "obligation_status": { "$ref": "#/$defs/status" },
    "legal_regime_results": { "type": "array", "items": { "$ref": "#/$defs/regime_result" } },
    "primary_trigger": {
      "enum": [
        "public_body",
        "large_scale_monitoring",
        "large_scale_special_categories",
        "large_scale_criminal_data",
        "led_controller",
        "none",
        "unclear"
      ]
    },
    "public_body_result": { "$ref": "#/$defs/assessment_object" },
    "monitoring_result": { "$ref": "#/$defs/assessment_object" },
    "scale_result": {
      "type": "object",
      "additionalProperties": false,
      "required": ["classification", "score", "factors", "missing_information", "legal_threshold_note"],
      "properties": {
        "classification": { "enum": ["low", "medium", "high", "unknown"] },
        "score": { "type": "integer", "minimum": 0 },
        "factors": { "type": "array", "items": { "type": "string" } },
        "missing_information": { "type": "array", "items": { "type": "string" } },
        "legal_threshold_note": { "type": "string" }
      }
    },
    "special_categories_result": { "$ref": "#/$defs/assessment_object" },
    "criminal_data_result": { "$ref": "#/$defs/assessment_object" },
    "processor_result": {
      "type": "object",
      "additionalProperties": true,
      "required": [
        "is_processor",
        "processor_only",
        "aggregation_considered",
        "similar_processing_for_many_clients",
        "client_count",
        "scale_points_from_aggregation",
        "rationale"
      ]
    },
    "joint_controller_result": {
      "type": "object",
      "additionalProperties": true,
      "required": ["is_joint_controller", "joint_controller_count", "assessed_as_controller", "rationale"]
    },
    "court_exception_result": {
      "type": "object",
      "additionalProperties": true,
      "required": [
        "is_court_or_tribunal",
        "acts_in_judicial_capacity",
        "exception_applies_to_public_body_trigger",
        "rationale"
      ]
    },
    "shared_dpo_option": {
      "type": "object",
      "additionalProperties": true,
      "required": ["requested", "legally_available", "easy_access_confirmed", "legal_bases", "rationale"]
    },
    "missing_information": { "type": "array", "items": { "type": "string" } },
    "validation_errors": { "type": "array", "items": { "type": "string" } },
    "validation_warnings": { "type": "array", "items": { "type": "string" } },
    "additional_questions": { "type": "array", "items": { "$ref": "#/$defs/question" } },
    "assumptions_used": { "type": "array", "items": { "type": "string" } },
    "confidence": { "enum": ["high", "medium", "low"] },
    "final_human_review_recommended": { "type": "boolean" }
  }
}
```

## 4. Pseudokod decyzyjny

```text
function evaluate(input):
  validate(input)
  scale = score_scale(input)
  court_exception = input.is_court_or_tribunal
                    and input.acts_in_judicial_capacity_for_assessed_processing

  results = []

  if "gdpr" in input.regimes:
    gdpr = evaluate_gdpr(input, scale, court_exception)
    results.append(gdpr)

  if "led_poland_2018" in input.regimes:
    led = evaluate_led_poland_2018(input)
    results.append(led)

  obligation_status = combine_results(results)
  primary_trigger = select_first_confirmed_trigger(results)
  missing_information = union(validation.missing, results.missing, scale.missing)
  additional_questions = build_questions(missing_information, ambiguous_flags)
  confidence = high unless missing info, warnings, validation errors or case-by-case status
  return full output

function evaluate_gdpr(input, scale, court_exception):
  if roles lacks administrator, processor and joint_controller:
    return insufficient_information

  if input.is_public_body_under_polish_law == true:
    if not court_exception:
      return required with trigger public_body
    else:
      do not use art. 37(1)(a) for that assessed judicial activity

  if monitoring present and regular and systematic
     and processing_integral_to_core_service == true
     and scale.classification == high:
    return required with trigger large_scale_monitoring

  if special_categories_present == true
     and processing_integral_to_core_service == true
     and scale.classification == high:
    return required with trigger large_scale_special_categories

  if criminal_data_present == true
     and processing_integral_to_core_service == true
     and scale.classification == high:
    return required with trigger large_scale_criminal_data

  if any relevant field is null:
    return insufficient_information or requires_case_by_case_assessment

  if scale.classification == medium and a legal trigger is otherwise plausible:
    return requires_case_by_case_assessment

  return likely_not_required or not_required

function evaluate_led_poland_2018(input):
  if input.is_competent_authority_under_led is null:
    return insufficient_information

  if input.is_competent_authority_under_led == true
     and roles includes administrator or joint_controller:
    return required with trigger led_controller

  if input.is_competent_authority_under_led == true
     and roles == processor only:
    return likely_not_required for art. 46 direct obligation

  return not_required

function score_scale(input):
  score = 0
  add 0-4 for count or count band
  add 0-3 for population share
  add 0-3 for data scope
  add 0-2 for duration
  add 0-3 for geography
  add 0-3 for processor aggregation if processor handles similar processing for many clients
  if no signals: unknown
  if score >= 8: high
  if score >= 4: medium
  else: low
```

## 5. Reguly walidacyjne

- `entity_name` i `legal_form` musza byc niepuste.
- `roles` i `regimes` musza miec co najmniej jeden element i nie moga miec duplikatow.
- Jezeli `is_public_body_under_polish_law == true`, `public_body_basis` nie moze byc puste.
- Jezeli `public_body_basis` zawiera `public_finance_sector`, nalezy uzupelnic `public_finance_subtype`.
- Jezeli `is_public_body_under_polish_law == true`, `public_body_basis` nie powinno zawierac `none`.
- Jezeli `monitoring_activities_present == false`, `monitoring_types` powinno byc puste.
- Jezeli `monitoring_activities_present == true`, nalezy uzupelnic `monitoring_regular` i `monitoring_systematic`.
- Jezeli `special_categories_present == false`, `special_categories_types` powinno byc puste.
- Jezeli `roles` nie zawiera `processor`, pola `processor_*` powinny byc puste albo `null`.
- Jezeli `roles` zawiera `processor`, nalezy doprecyzowac `processor_multi_client_similarity`.
- Jezeli `regimes` zawiera `led_poland_2018`, nalezy uzupelnic `is_competent_authority_under_led`.
- Jezeli `is_court_or_tribunal == true`, nalezy uzupelnic `acts_in_judicial_capacity_for_assessed_processing`.
- Jezeli `wants_single_shared_dpo == true`, nalezy uzupelnic `dpo_easy_access_from_each_establishment`.
- Wszystkie pola integer musza byc `>= 0`.
- `scale_population_share_pct` musi byc w zakresie `0-100`.
- Braki w polach skali nie moga byc zgadywane; wynik ma przejsc do `insufficient_information` albo `requires_case_by_case_assessment`.
- Nie wolno traktowac scoringu `high` jako progu ustawowego. To tylko pomocniczy mechanizm compliance.

## 6. Dodatkowe pytania

```json
[
  {
    "id": "public-body-basis",
    "question": "Jaka jest konkretna podstawa uznania podmiotu za organ lub podmiot publiczny?",
    "answer_type": "multi_enum",
    "why_it_matters": "Art. 37 ust. 1 lit. a RODO daje samodzielna przeslanke obowiazku dla organow i podmiotow publicznych.",
    "branch_if_yes": "Zweryfikuj katalog z art. 9 ustawy o finansach publicznych albo ustawe szczegolna i oznacz public_body_basis.",
    "branch_if_no": "Nie opieraj wyniku na przeslance public body; przejdz do monitorowania, danych szczegolnych i danych z art. 10 RODO."
  },
  {
    "id": "court-capacity",
    "question": "Czy oceniane przetwarzanie jest wykonywane przez sad/trybunal w ramach sprawowania wymiaru sprawiedliwosci?",
    "answer_type": "yes_no",
    "why_it_matters": "Wyjatek z art. 37 ust. 1 lit. a RODO jest funkcjonalny dla tej kategorii czynnosci.",
    "branch_if_yes": "Nie stosuj public body trigger dla tej czynnosci; ocen pozostale przeslanki.",
    "branch_if_no": "Dla czynnosci administracyjnych sadu public body trigger moze pozostac aktualny."
  },
  {
    "id": "led-competent-authority",
    "question": "Czy podmiot jest wlasciwym organem w rozumieniu rezimu dyrektywy policyjnej i ustawy z 14.12.2018?",
    "answer_type": "yes_no",
    "why_it_matters": "Art. 46 ustawy z 14.12.2018 naklada obowiazek na administratora w tym rezimie.",
    "branch_if_yes": "Jesli podmiot jest administratorem, wynik LED powinien byc required.",
    "branch_if_no": "Nie wyprowadzaj obowiazku z rezimu LED."
  },
  {
    "id": "core-activity",
    "question": "Czy oceniane przetwarzanie jest zasadnicza dzialalnoscia albo integralnym elementem glownej uslugi?",
    "answer_type": "yes_no",
    "why_it_matters": "Motyw 97 i WP243 odrozniaja glowna dzialalnosc od czynnosci pomocniczych, np. kadr lub standardowego IT.",
    "branch_if_yes": "Przejdz do oceny duzej skali i rodzaju danych.",
    "branch_if_no": "Nie stosuj lit. b/c tylko dlatego, ze dane wystepuja pomocniczo."
  },
  {
    "id": "scale-factors",
    "question": "Jaka jest liczba osob, udzial populacji, zakres danych, czas i zasieg geograficzny przetwarzania?",
    "answer_type": "text",
    "why_it_matters": "Duza skala wymaga oceny wielu czynnikow; brak sztywnego progu ustawowego.",
    "branch_if_yes": "Uzupelnij pola scale_* i ponownie przelicz klasyfikacje low/medium/high.",
    "branch_if_no": "Zwroc insufficient_information albo requires_case_by_case_assessment."
  },
  {
    "id": "monitoring-regular-systematic",
    "question": "Czy monitoring osob jest regularny oraz systematyczny?",
    "answer_type": "yes_no",
    "why_it_matters": "Art. 37 ust. 1 lit. b RODO wymaga regularnego i systematycznego monitorowania na duza skale.",
    "branch_if_yes": "Jesli skala jest wysoka i monitoring jest core activity, wynik GDPR jest required.",
    "branch_if_no": "Lit. b najpewniej nie tworzy samodzielnego obowiazku."
  },
  {
    "id": "processor-aggregation",
    "question": "Czy processor wykonuje podobne operacje dla wielu klientow i ilu klientow obejmuje ten sam proces?",
    "answer_type": "number",
    "why_it_matters": "Dla processora skala moze wynikac z agregacji wielu podobnych zlecen.",
    "branch_if_yes": "Dodaj punkty agregacji do oceny skali.",
    "branch_if_no": "Oceniaj skale bez agregacji procesora."
  },
  {
    "id": "shared-dpo-access",
    "question": "Czy wspolny IOD bedzie latwo dostepny dla kazdej jednostki, pracownikow i osob, ktorych dane dotycza?",
    "answer_type": "yes_no",
    "why_it_matters": "Art. 37 ust. 2-3 RODO dopuszcza wspolnego IOD tylko przy zapewnieniu latwej dostepnosci.",
    "branch_if_yes": "Wariant wspolnego IOD jest co do zasady dopuszczalny.",
    "branch_if_no": "Nie rekomenduj wspolnego IOD bez zmiany modelu dostepnosci."
  }
]
```

## 7. Przyklady testowe

Kazdy przyklad zaklada komplet neutralnych pol domyslnych: `roles=["administrator"]`, `regimes=["gdpr"]`, brak monitorowania, brak danych szczegolnych, brak danych z art. 10, skala lokalna/niska, brak wspolnego IOD, chyba ze delta wskazuje inaczej.

### 1. Urzad gminy

```json
{
  "input_delta": {
    "entity_name": "Urzad Gminy",
    "legal_form": "jednostka samorzadu terytorialnego",
    "is_public_body_under_polish_law": true,
    "public_body_basis": ["public_finance_sector"],
    "public_finance_subtype": "local_government_unit_or_union"
  },
  "expected_output": {
    "obligation_status": "required",
    "primary_trigger": "public_body",
    "confidence": "high",
    "final_human_review_recommended": false
  }
}
```

### 2. Instytut badawczy

```json
{
  "input_delta": {
    "entity_name": "Instytut Badawczy",
    "legal_form": "instytut badawczy",
    "is_public_body_under_polish_law": true,
    "public_body_basis": ["research_institute"],
    "public_finance_subtype": "not_applicable"
  },
  "expected_output": {
    "obligation_status": "required",
    "primary_trigger": "public_body",
    "confidence": "high"
  }
}
```

### 3. Spolka komunalna jako sp. z o.o.

```json
{
  "input_delta": {
    "entity_name": "Komunalna sp. z o.o.",
    "legal_form": "spolka z ograniczona odpowiedzialnoscia",
    "is_public_body_under_polish_law": false,
    "public_body_basis": ["none"],
    "public_finance_subtype": "not_applicable"
  },
  "expected_output": {
    "obligation_status": "not_required",
    "primary_trigger": "none",
    "confidence": "high",
    "note": "Sama forma sp. z o.o. i wlasciciel publiczny nie powinny automatycznie tworzyc public body trigger bez ustawy szczegolnej albo innych przeslanek."
  }
}
```

### 4. Szpital prywatny

```json
{
  "input_delta": {
    "entity_name": "Prywatny Szpital",
    "legal_form": "spolka z o.o.",
    "core_activities_description": ["diagnostyka i leczenie pacjentow"],
    "processing_integral_to_core_service": true,
    "scale_data_subject_count_12m": 120000,
    "scale_data_subject_count_band": "100000+",
    "scale_population_share_pct": 12,
    "scale_data_scope": "very_high",
    "scale_duration": "continuous",
    "scale_geography": "regional",
    "special_categories_present": true,
    "special_categories_types": ["health"]
  },
  "expected_output": {
    "obligation_status": "required",
    "primary_trigger": "large_scale_special_categories",
    "confidence": "high"
  }
}
```

### 5. Pojedynczy lekarz

```json
{
  "input_delta": {
    "entity_name": "Gabinet lekarski",
    "legal_form": "jednoosobowa dzialalnosc gospodarcza",
    "core_activities_description": ["porady lekarskie"],
    "processing_integral_to_core_service": true,
    "scale_data_subject_count_12m": 700,
    "scale_data_subject_count_band": "101-1000",
    "scale_population_share_pct": 0.5,
    "scale_data_scope": "high",
    "scale_duration": "continuous",
    "scale_geography": "local",
    "special_categories_present": true,
    "special_categories_types": ["health"]
  },
  "expected_output": {
    "obligation_status": "requires_case_by_case_assessment",
    "primary_trigger": "unclear",
    "confidence": "medium",
    "final_human_review_recommended": true
  }
}
```

### 6. Processor analityczny obslugujacy 500 malych klientow

```json
{
  "input_delta": {
    "entity_name": "Analytics Processor",
    "legal_form": "spolka z o.o.",
    "roles": ["processor"],
    "core_activities_description": ["analityka behawioralna dla klientow SaaS"],
    "processing_integral_to_core_service": true,
    "monitoring_activities_present": true,
    "monitoring_types": ["profiling", "behavioral_advertising"],
    "monitoring_regular": true,
    "monitoring_systematic": true,
    "scale_data_subject_count_12m": 90000,
    "scale_data_subject_count_band": "10001-100000",
    "scale_population_share_pct": 8,
    "scale_data_scope": "high",
    "scale_duration": "continuous",
    "scale_geography": "national",
    "processor_multi_client_similarity": true,
    "processor_number_of_clients_for_same_processing": 500
  },
  "expected_output": {
    "obligation_status": "required",
    "primary_trigger": "large_scale_monitoring",
    "processor_result.aggregation_considered": true,
    "confidence": "high"
  }
}
```

### 7. Fundacja prowadzaca ogolnopolski program zdrowia psychicznego

```json
{
  "input_delta": {
    "entity_name": "Fundacja Zdrowia Psychicznego",
    "legal_form": "fundacja",
    "core_activities_description": ["ogolnopolski program wsparcia zdrowia psychicznego"],
    "processing_integral_to_core_service": true,
    "scale_data_subject_count_12m": 40000,
    "scale_data_subject_count_band": "10001-100000",
    "scale_population_share_pct": 18,
    "scale_data_scope": "very_high",
    "scale_duration": "long_term",
    "scale_geography": "national",
    "special_categories_present": true,
    "special_categories_types": ["health"]
  },
  "expected_output": {
    "obligation_status": "required",
    "primary_trigger": "large_scale_special_categories",
    "confidence": "high"
  }
}
```

### 8. Komendant strazy miejskiej w strukturze urzedu

```json
{
  "input_delta": {
    "entity_name": "Komendant Strazy Miejskiej",
    "legal_form": "organ w strukturze urzedu",
    "roles": ["administrator"],
    "regimes": ["gdpr", "led_poland_2018"],
    "is_public_body_under_polish_law": true,
    "public_body_basis": ["public_finance_sector", "other_special_law"],
    "public_finance_subtype": "budgetary_unit",
    "is_competent_authority_under_led": true
  },
  "expected_output": {
    "obligation_status": "required",
    "primary_trigger": "public_body",
    "legal_regime_results": [
      { "regime": "gdpr", "status": "required" },
      { "regime": "led_poland_2018", "status": "required" }
    ],
    "confidence": "high"
  }
}
```

### Testy walidacyjne

```json
[
  {
    "name": "public body bez podstawy",
    "input_delta": { "is_public_body_under_polish_law": true, "public_body_basis": [] },
    "expected_validation_errors": ["Gdy is_public_body_under_polish_law == true, public_body_basis nie moze byc puste."]
  },
  {
    "name": "monitoring false z typami",
    "input_delta": { "monitoring_activities_present": false, "monitoring_types": ["profiling"] },
    "expected_validation_warnings": ["monitoring_types powinno byc puste, gdy monitoring_activities_present == false."]
  },
  {
    "name": "special categories false z typami",
    "input_delta": { "special_categories_present": false, "special_categories_types": ["health"] },
    "expected_validation_warnings": ["special_categories_types powinno byc puste, gdy special_categories_present == false."]
  },
  {
    "name": "ujemna liczba osob",
    "input_delta": { "scale_data_subject_count_12m": -1 },
    "expected_validation_errors": ["scale_data_subject_count_12m musi byc >= 0."]
  },
  {
    "name": "procent poza zakresem",
    "input_delta": { "scale_population_share_pct": 140 },
    "expected_validation_errors": ["scale_population_share_pct musi byc w zakresie 0-100."]
  }
]
```
