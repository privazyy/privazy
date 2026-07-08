# CRM Lead and Organization Baseline Audit

Baseline: `main` at `0bea57cc8bf87f864015dd6a21dfc357a8029c81`.

| Area | Current state | Target in this PR | Out of scope | Notes |
| --- | --- | --- | --- | --- |
| Lead | No model; IOD submissions were rendered as leads | Dedicated operational `Lead` | Scoring automation, CSV/import | `FormSubmission` remains raw intake |
| Organization | Existing base model | Add CRM status, legal data and owner | Client portal | Existing relations are preserved |
| ClientProfile | Existing | No schema change | Portal workflow | Not used for CRM authorization |
| ContactPerson | Missing | Minimal lead/organization relation | Full contact CRUD | Created during conversion |
| CrmNote | Missing | Internal notes with author | Client-visible notes | Staff-only API |
| CrmTask | Missing | Schema and serializer foundation | Task CRUD/timeline UI | Recommended follow-up |
| CRM API | Public read-only IOD projection | Guarded lead/org CRUD and notes | Other CRM modules | Every route checks the session role |
| `/admin` | Database-backed shell, but public on this baseline | Staff gate and real lead/org actions | Rebuilding the shell | Existing layout and tokens retained |
| Pagination/filtering | Unbounded semantics in shell | API cursor/limits plus bounded UI lists | Exports | API max limit is 100 |
| Audit | Existing `AuditLog`, unused by CRM mutations | Transactional CRM events | Central event bus | Metadata excludes note bodies and raw payloads |

Before this PR, the shell read real organizations, users, document records, audit entries and IOD `FormSubmission` rows. Numerous navigation modules and actions remained scaffold-only. The primary risks were public CRM access, no mutation authorization, no operational lead entity, accidental over-fetching and no auditable workflow.

Residual risks: the `main` baseline has no durable rate limit or Turnstile enforcement on public IOD intake, there is no task CRUD/timeline, no automated deduplication decision, no staging verification against a Supabase branch, and no production migration. Production remains blocked.
