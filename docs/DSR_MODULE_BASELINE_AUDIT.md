# DSR Module Baseline Audit

## Scope

This audit covers the Data Subject Request foundation added on branch `codex/dsr-data-subject-request-module`.

## Baseline

| Area | Before | After |
| --- | --- | --- |
| Dedicated DSR model | Missing; CRM request view used filtered `FormSubmission` records | Added `DataSubjectRequest` and `DataSubjectRequestActivity` |
| Client intake | Missing on `main` | Added `/platforma/wnioski-osob` org-scoped create, draft and submit flow |
| CRM operations | Scaffold only | Added `/admin/dsr` list and detail with status, verification, response prep and notes |
| Deadlines | Missing | `receivedAt + 1 month`, optional extension metadata |
| Identity verification | Missing | Status, method, internal note and timestamp foundation |
| Response preparation | Missing | Staff response summary, draft, decision and rationale foundation |
| Audit/activity | CRM audit existed, DSR unused | Added activity timeline plus `AuditLog` entries without full request or response bodies |

## Production Decision

Production readiness remains **NO**. This PR adds the operational foundation, but does not apply the migration to production, send legal responses, notify data subjects, automate deadlines, add attachments, or replace legal review.
