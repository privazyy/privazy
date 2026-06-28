# PRIVAZY Design System

Ten dokument jest konstytucja projektowania layoutu i komponentow PRIVAZY. Kazdy nowy ekran, komponent i refaktor UI musi byc zgodny z tym systemem oraz z zasadami responsywnosci z [RESPONSIVE.md](RESPONSIVE.md).

Zrodlo przekazane do projektu: `PRIVAZY Design System.zip`, odebrane lokalnie 2026-06-24.

## Brand

PRIVAZY to polski legaltech RODO/GDPR. Interfejs ma byc spokojny, zaufany, bialy i jasnoniebieski. Copy jest po polsku, konkretne, proste i operacyjne.

Najkrotsza regula marki:

```txt
White-dominant, light-blue Polish legaltech: calm, trustworthy, plain-spoken Polish copy, generous radii, soft blue-tinted shadows, no emoji, no purple gradients.
```

Wordmark:

- zawsze `privazy.` malymi literami,
- nie `Privazy` w UI produktowym,
- kropka jest akcentem brand blue,
- assety aplikacyjne sa w `public/brand/`.

## Tokeny

Produkcyjnym zrodlem tokenow jest `src/app/globals.css`.

Kluczowe tokeny:

- brand: `--brand: #2B7CFF`
- hover: `--brand-hover: #1A63E6`
- active: `--brand-active: #1450BE`
- ink: `--gray-900: #0F1B2D`
- page: `--surface-page: #F7F9FC`
- card: `--surface-card: #FFFFFF`
- subtle border: `--border-subtle: #E2E8F2`
- focus: `--ring: rgba(43, 124, 255, 0.35)`

Statusy:

- success: `--green-500`
- warning: `--amber-500`
- danger: `--red-500`
- info: `--blue-500`

Spacing:

- skala bazowa 4px: `--space-1` do `--space-13`
- marketing container: `--container`
- app shell wide: `--container-wide`
- prose/forms: `--container-narrow`
- gutter: `--gutter`
- sekcje: `--section-y`

Radius i elevation:

- controls: `--radius-md`
- cards: `--radius-xl` / `--radius-2xl`
- pills: `--radius-pill`
- cienie sa blue-tinted: `--shadow-xs` do `--shadow-xl`
- CTA glow: `--shadow-brand` / `--shadow-brand-sm`

## Typography

- Display/headings: Plus Jakarta Sans przez `--font-display`
- Body/UI: Geist przez `--font-body`
- Data/legal refs: Geist Mono przez `--font-mono`
- W produkcyjnym CSS letter spacing pozostaje `0`, zeby zachowac stabilna responsywnosc.
- Naglowki maja uzywac display font, mocnej wagi i spokojnej skali.

## Layout

- Marketing: `pvz-container` + `pvz-section`
- App/CRM: szerokie widoki tylko przez kontrolowany scroll `pvz-h-scroll` i `data-responsive-scroll="true"`
- Nie wolno dopuszczac poziomego overflow na `html` ani `body`.
- Desktop/TV nie rozciagaja tresci bez limitu: uzywaj containerow i kontrolowanych gridow.

## Components

Preferuj komponenty z `src/components/ui` i rozwijaj je w duchu DS:

- `Button`: brand blue, soft blue shadow, radius `--radius-md`, focus ring z `--ring`
- `Badge`: tony `neutral`, `brand`, `success`, `warning`, `danger`, `outline`, opcjonalny `dot`
- `Card`: warianty `default`, `flat`, `raised`, `soft`, padding `sm`, `md`, `lg`
- `Field`: label, required, hint, error, children
- `IconButton`: warianty `ghost`, `solid`, `outline`, rozmiary `sm`, `md`, `lg`
- `Input` / `Textarea`: white card surface, default border, inset shadow, brand focus
- `Label`: strong text, semibold
- `Logo`: wordmark `privazy.` w tonie `default` albo `inverse`
- `Select`: natywny select z tokenami DS i stanem `invalid`

Komponenty projektowane dalej powinny odpowiadac komponentom z paczki DS:

- core: Button, IconButton, Badge, Card, Logo
- forms: Field, Input, Select, Checkbox, Radio, Switch
- feedback: Alert
- navigation: Steps

Nie importuj prototypowego bundle'a z paczki do produkcji. Przepisuj wzorce na komponenty Next/React w repo i uzywaj tokenow z `globals.css`.

## Screens

Paczka DS wskazuje ekrany referencyjne:

- landing: marketing home z inline IOD checker
- checker: 3-step IOD obligation wizard
- crm: client management z sidebarem, statystykami, tabela i drawerem
- shop: document storefront z koszykiem

Przy rozwoju tych obszarow najpierw sprawdzaj odpowiadajacy ekran referencyjny w design systemie, potem implementuj w repo zgodnie z istniejacymi komponentami.

## Copy

- Pisz po polsku.
- Ton: pewny, prosty, uspokajajacy.
- Najpierw wartosc, potem prawniczy kontekst.
- CTA jako czasowniki: `Sprawdz`, `Wybierz`, `Uruchom`, `Otworz`.
- Bez emoji.
- Przy checkerach i wynikach prawnych dodawaj disclaimer: tresci maja charakter ogolny i nie stanowia porady prawnej dla konkretnej sprawy.

## Verification

Przed oddaniem zmian UI:

```bash
npm run lint
npm run typecheck
npm run build
npm run responsive:check
```

`responsive:check` testuje `/` i `/admin` na telefonie, tablecie, laptopie, desktopie i duzych ekranach.
