# Document Input Flow Baseline Audit

| Area | Current state | Target in this PR | Out of scope | Notes |
| --- | --- | --- | --- | --- |
| DocumentInput | MISSING on `main` | ADDED minimal model | Full multi-version editor | One active input per OrderItem via unique `orderItemId`. |
| DocumentTemplate | EXISTS | USED | Template CMS | Template is resolved server-side. |
| DocumentTemplateVersion | MISSING | PARTIAL via `templateVersion` snapshot | Full version table | Kept compatible with current schema. |
| DocumentGenerationJob | EXISTS | LINKED to DocumentInput | Live worker guarantee | Submit creates pending job without client-trusted IDs. |
| OrderItem | MISSING on `main` | ADDED minimal model | Full checkout | Needed to anchor paid document input. |
| OrderItem document link | MISSING | ADDED via `templateId`, `documentType`, `productId` | Full catalog | Product/template relation is server-side. |
| Document form | Public generator existed | ADDED protected input form | All document types | First form: privacy policy. |
| Public document form | EXISTS at `/documents` | NOT expanded | Public unauthenticated input | New client flow is `/platforma/dokumenty`. |
| `/documents` | EXISTS public page | Left as legacy demo | Full portal | This PR does not weaken it. |
| `/platforma/dokumenty` | MISSING | ADDED protected page | Full portal | Minimal shell only. |
| Draft/submit API | MISSING | ADDED | Autosave/version history | Draft and submit are separate. |
| Validation | Unsafe generation schema accepted IDs | ADDED Zod input validation | Full legal document review | Submit requires critical fields and confirmations. |
| Generator | EXISTS but not production-safe | CONTROLLED_PENDING job | Final DOCX guarantee | No worker event emitted from client submit. |
| Client-supplied IDs | Old `/api/documents/generate` accepts IDs | BLOCKED in new flow | Legacy endpoint hardening | New flow ignores organization/template/createdBy from client. |
| Remaining risks | No staging migration, no live payment flow | Documented as NO-GO | Production launch | Needs controlled migration rehearsal. |
