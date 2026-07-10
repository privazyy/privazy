# Module Readiness Matrix

| Module | Expected status | Verified status | Evidence | Blockers | Decision |
| --- | --- | --- | --- | --- | --- |
| Public landing | READY | PARTIAL | `/` builds; IOD UI exists | live smoke not run | CONDITIONAL |
| Blog | READY | PARTIAL | static `/blog`, `src/lib/blog.ts` | no DB CMS on `main` | CONDITIONAL |
| CMS | READY | MISSING | no `BlogPost`, no `/admin/cms` on `main` | draft PR not merged | BLOCKED |
| Newsletter | READY | MISSING | no subscriber model/API on `main` | consent/unsubscribe missing | BLOCKED |
| IOD checker | READY | PARTIAL | `src/lib/iod-checker.ts`, `/api/leads/iod` | no public abuse protection | BLOCKED |
| Public lead endpoint | READY | PARTIAL | Zod validation, Lead creation | no limiter/Turnstile; logs raw IP/UA | BLOCKED |
| Auth | READY | PARTIAL | NextAuth credentials, JWT role | no staging login smoke | CONDITIONAL |
| Roles | READY | PARTIAL | `ADMIN/LAWYER/OPERATOR/CLIENT/READ_ONLY` | only CRM role matrix verified by code | CONDITIONAL |
| Private routes | READY | PARTIAL | `/admin` guard exists | `/client` is public placeholder; no `/platforma` | BLOCKED |
| Admin/CRM | READY | PARTIAL | `/admin`, `getCrmDatabaseData` | many modules scaffold | CONDITIONAL |
| CRM leads | READY | PARTIAL | model + CRUD API | no staging role smoke | CONDITIONAL |
| CRM organizations | READY | PARTIAL | model + CRUD API | no staging role smoke | CONDITIONAL |
| CRM tasks/notes/timeline | READY | PARTIAL | `CrmTask`, `CrmNote` models; notes API | no task CRUD/timeline API | BLOCKED |
| CRM orders | READY | MISSING | no Order model | schema/API missing | BLOCKED |
| CRM payments | READY | MISSING | no Payment model | schema/API missing | BLOCKED |
| CRM invoices | READY | MISSING | no Invoice model | schema/API missing | BLOCKED |
| CRM documents | READY | PARTIAL | generated document models visible in CRM data | no secure download/status workflow | BLOCKED |
| Client portal | READY | MISSING | `/client` placeholder only | `/platforma/*` missing | BLOCKED |
| Checkout sandbox | READY | MISSING | product page local cart count only | no checkout/order/payment API | BLOCKED |
| Payments sandbox/mock | READY | MISSING | no payment implementation | missing mode flags | BLOCKED |
| Invoice foundation | READY | MISSING | no invoice model | missing invoice docs/flow | BLOCKED |
| DocumentInput | READY | MISSING | no DocumentInput model/routes | missing paid input flow | BLOCKED |
| Privacy Policy generator | READY | PARTIAL | document generator foundation | no paid/order-gated privacy-policy flow | BLOCKED |
| R2 secure download | READY | PARTIAL | R2 helpers exist | no permission-checked download route | BLOCKED |
| Breach module | READY | MISSING | CRM demo/static rows only | no models/API/portal | BLOCKED |
| DSR module | READY | MISSING | no DSR model/API on `main` | draft branch not merged | BLOCKED |
| Notifications | READY | MISSING | no Notification model/API | missing scope rules | BLOCKED |
| EmailLog | READY | MISSING | Resend helper only | no EmailLog/idempotency | BLOCKED |
| Automations/Inngest | READY | PARTIAL | document generation Inngest function | no audit of retries/idempotency for broad flows | CONDITIONAL |
| Env validation | READY | PARTIAL | `.env.example`, docs | no env check scripts | BLOCKED |
| Supabase/Postgres | READY | MANUAL_REQUIRED | Prisma direct DB config | dashboard/staging DB not available | BLOCKED |
| RLS/Data API | READY | MANUAL_REQUIRED | CRM migration enables RLS for selected tables | initial tables need dashboard verification | BLOCKED |
| CI/CD | READY | PARTIAL | GitHub workflows build/lint/typecheck | no test/security/smoke jobs | CONDITIONAL |
| Tests | READY | MISSING | `test*` scripts absent | no automated coverage | BLOCKED |
| Legal docs | READY | PARTIAL | privacy policy route exists | terms/cookies/sales/refund approval missing | BLOCKED |
| Release gate | READY | BLOCKED | prior audit says staging/production NO | this audit confirms blockers | STAGING_NO_GO |
