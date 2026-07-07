# PRIVAZY - Audit Route Matrix

| Route | Public/private | Expected access | Actual access | Auth check | Role check | Data source | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | Public | Anonymous | Anonymous | N/A | N/A | Static React + checker engine | PARTIAL | Responsive check passed for this route; several CTAs point to scaffolded flows. |
| `/blog` | Public | Anonymous | Anonymous | N/A | N/A | Static `src/lib/blog.ts` | PARTIAL | No CMS workflow. |
| `/blog/[slug]` | Public | Anonymous | Anonymous | N/A | N/A | Static article array | PARTIAL | SSG works; no draft/review model. |
| `/sklep/polityka-prywatnosci` | Public | Anonymous | Anonymous | N/A | N/A | Static `src/lib/product.ts` | SCAFFOLD | Product page claims payment/access without backend. |
| `/sklep` | Public | Anonymous | Missing | N/A | N/A | N/A | MISSING | Required shop index absent. |
| `/regulamin` | Public | Anonymous | Missing | N/A | N/A | N/A | MISSING | Legal route absent. |
| `/polityka-prywatnosci` | Public | Anonymous | Missing | N/A | N/A | N/A | MISSING | Product privacy-policy route is not a site privacy policy. |
| `/polityka-cookies` | Public | Anonymous | Missing | N/A | N/A | N/A | MISSING | Legal route absent. |
| `/sitemap.xml` | Public | Anonymous | Missing | N/A | N/A | N/A | MISSING | No `sitemap.ts` or static sitemap. |
| `/robots.txt` | Public | Anonymous | Missing | N/A | N/A | N/A | MISSING | No `robots.ts` or static robots file. |
| `/admin` | Private | Staff only; never CLIENT | Public route, DB read, local 500 without env | Missing | Missing | Prisma CRM aggregate | BROKEN | P0: CRM has no route guard. |
| `/dashboard` | Private | Authenticated user | Public placeholder | Missing | Missing | None | SCAFFOLD | Publicly reachable. |
| `/documents` | Private | Authorized user/order | Public form | Missing | Missing | Public POST to generator API | BROKEN | P0: accepts raw IDs. |
| `/uploads` | Private | Authorized upload users | Public placeholder | Missing | Missing | None | SCAFFOLD | Publicly reachable. |
| `/client` | Private | CLIENT org scoped | Public placeholder | Missing | Missing | None | SCAFFOLD | Not a real portal. |
| `/platforma` | Private | CLIENT/staff org scoped | Missing | N/A | N/A | N/A | MISSING | Required portal route absent. |
| `/api/auth/[...nextauth]` | Mixed | Auth handler | Exists | NextAuth | N/A | Credentials provider | PARTIAL | Config points to missing `/login`. |
| `/api/leads/iod` POST | Public with abuse protection | Anonymous lead submit | Public, Zod validation | N/A | N/A | Creates `Organization` and `FormSubmission` | PARTIAL | No rate limit/Turnstile. |
| `/api/crm/leads` GET | Private | Staff CRM only | Public GET | Missing | Missing | Lead submissions | BROKEN | P0: lead data exposure. |
| `/api/documents/generate` POST | Private | Paid order or privileged staff | Public POST | Missing | Missing | Creates `DocumentGenerationJob` and emits Inngest | BROKEN | P0: client controls org/user IDs. |
| `/api/trpc/[trpc]` | Private | Auth + org scope | Session-only for document router | Session only | Missing | Prisma document jobs/templates | PARTIAL/BROKEN | P0: arbitrary `organizationId`. |
| `/api/inngest` | Webhook/private | Signed Inngest traffic | `serve()` route | Library-level only | N/A | Inngest function | PARTIAL | Signature/env behavior not manually verified. |
| `/api/orders/*` | Private | Order owner/staff | Missing | N/A | N/A | N/A | MISSING | Required flow absent. |
| `/api/payments/*` | Private/webhook | Payment flow/webhook | Missing | N/A | N/A | N/A | MISSING | Required flow absent. |
| `/api/platform/*` | Private | CLIENT org scoped | Missing | N/A | N/A | N/A | MISSING | Required flow absent. |
| `/api/admin/*` | Private | ADMIN only | Missing | N/A | N/A | N/A | MISSING | Required flow absent. |
| Document download route | Private | Permission-checked signed URL | Missing | N/A | N/A | R2 helper only | MISSING | No `DocumentDownload` audit model. |
