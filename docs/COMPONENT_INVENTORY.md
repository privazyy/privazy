# PRIVAZY component inventory

Status: Phase 3 baseline.

## Existing components

### Badge

- Path: `src/components/ui/badge.tsx`.
- Used in: product page, CRM, blog article, blog index.
- Variants: `neutral`, `brand`, `success`, `warning`, `danger`, `outline`; optional dot.
- Missing before Phase 3: semantic status wrapper.
- Design-system fit: yes, uses tokens and rounded pill.
- Readiness: ready; extended by `StatusBadge`.

### Button

- Path: `src/components/ui/button.tsx`.
- Used in: dashboard, product page, CRM, document request form, blog chrome, blog article, blog index.
- Variants: `default`, `outline`, `ghost`, `soft`, `danger`; sizes `default`, `sm`, `lg`, `icon`.
- Missing before Phase 3: no grouped action patterns.
- Design-system fit: yes, brand blue, focus ring and tokenized radius.
- Readiness: ready.

### Card

- Path: `src/components/ui/card.tsx`.
- Used in: product page and CRM.
- Variants: `default`, `flat`, `raised`, `soft`; padding `sm`, `md`, `lg`.
- Missing before Phase 3: no domain-specific card patterns.
- Design-system fit: mostly yes; radius follows current DS token.
- Readiness: ready, used by new empty/loading/error and domain patterns.

### Field

- Path: `src/components/ui/field.tsx`.
- Used in: available for forms; direct current usage is limited.
- Variants: label, required marker, hint and error.
- Missing before Phase 3: section/action/summary wrappers.
- Design-system fit: yes.
- Readiness: ready for field-level composition.

### IconButton

- Path: `src/components/ui/icon-button.tsx`.
- Used in: product page and CRM.
- Variants: `ghost`, `solid`, `outline`; sizes `sm`, `md`, `lg`.
- Missing before Phase 3: menu/dropdown composition.
- Design-system fit: yes; requires accessible `label`.
- Readiness: ready.

### Input

- Path: `src/components/ui/input.tsx`.
- Used in: CRM, document request form, blog index.
- Variants: native input attributes, tokenized default style.
- Missing before Phase 3: checkbox/radio/switch/file upload peers.
- Design-system fit: yes.
- Readiness: ready.

### Label

- Path: `src/components/ui/label.tsx`.
- Used in: document request form.
- Variants: native label props.
- Missing before Phase 3: none significant; `Field` is preferred for full field composition.
- Design-system fit: yes.
- Readiness: ready.

### Logo

- Path: `src/components/ui/logo.tsx`.
- Used in: product page, CRM, blog chrome.
- Variants: size `sm`, `md`, `lg`; tone `default`, `inverse`; optional dot.
- Missing before Phase 3: none.
- Design-system fit: yes, preserves `privazy.` wordmark.
- Readiness: ready.

### Select

- Path: `src/components/ui/select.tsx`.
- Used in: available for forms and CRM; direct current usage is limited.
- Variants: native select props plus `invalid`.
- Missing before Phase 3: status/assignee wrappers.
- Design-system fit: yes, uses `.pvz-select`.
- Readiness: ready; extended by `CrmStatusSelect` and `CrmAssigneeSelect`.

### Textarea

- Path: `src/components/ui/textarea.tsx`.
- Used in: document request form.
- Variants: native textarea props.
- Missing before Phase 3: comment box composition.
- Design-system fit: yes.
- Readiness: ready.

## Added foundation components

- Feedback: `Alert`, `Toast`/`Notification`, `EmptyState`, `LoadingState`, `ErrorState`.
- Overlays: `Modal`, `Drawer`, `ConfirmDialog`.
- Navigation and controls: `Tabs`, `Stepper`, `DropdownMenu`, `Checkbox`, `RadioGroup`, `Switch`.
- Data and collaboration: `StatusBadge`, `DataTable`, `Timeline`, `CommentBox`, `FileUpload`.

## Added pattern components

- Forms: `FormSection`, `FormActions`, `FormSummary`, `FieldGroup`, `ConsentCheckbox`, `LegalDisclaimer`, `MultiStepFormShell`.
- CRM: `CrmPageHeader`, `CrmToolbar`, `CrmKpiGrid`, `CrmDetailLayout`, `CrmActivityTimeline`, `CrmNotesPanel`, `CrmStatusSelect`, `CrmAssigneeSelect`, `CrmTableActions`.
- Client portal: `ClientPortalShell`, `ClientDashboardCard`, `ClientDocumentCard`, `ClientTaskCard`, `ClientMessageThread`, `ClientStatusTimeline`.
- Shop/checkout: `ProductCard`, `PriceBlock`, `CartSummary`, `CheckoutLayout`, `CheckoutStepIndicator`, `PaymentStatusCard`, `OrderStatusCard`.

## Gaps intentionally left

- No public `/design-system` route was added because admin route protection is not complete on `main`.
- No checkout, CRM CRUD, generator, breach or DSAR business logic was implemented.
- No large component dependency was added.
- No full landing or CRM redesign was done.
