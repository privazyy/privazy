# PRIVAZY - Audit Command Results

Audit date: 2026-07-07
Repository: `privazyy/privazy`
Audited base branch: `main`
Audited commit: `0bea57cc8bf87f864015dd6a21dfc357a8029c81`
Audit branch: `codex/full-system-audit`
Package manager: `npm` (`package-lock.json`)
Local runtime: Node `v25.8.1`, npm `11.11.0`
CI runtime: Node `24`

The original requested path `C:\Users\alber\Desktop\privazy-main` is not a usable Git checkout even though `.git` exists. Git returned `fatal: not a git repository`. This audit was produced from a fresh clean clone at `C:\Users\alber\Desktop\privazy-full-system-audit`.

| Command | Status | Key output | Release impact |
| --- | --- | --- | --- |
| `git status -sb` in `privazy-main` | FAIL | `fatal: not a git repository` | Cannot publish from that checkout. |
| `git status -sb` in fresh clone | PASS | `main...origin/main`, then `codex/full-system-audit` | Clean audit base. |
| `gh auth status` | PASS | Authenticated as `privazyy` | GitHub publish possible. |
| `gh repo view privazyy/privazy --json nameWithOwner,viewerPermission,defaultBranchRef,url` | PASS | `viewerPermission=ADMIN`, default `main` | PR possible. |
| `npm ci` | PASS | 683 packages installed, 0 vulnerabilities; deprecation warnings present | Does not block. |
| `npm run prisma:generate` | PASS | Prisma Client generated v6.19.3 | Does not block. |
| `npx prisma validate` | FAIL | `Environment variable not found: DIRECT_URL` | Real env required. |
| Dummy env `npx prisma validate` | PASS | Schema is valid | Schema syntax OK. |
| `npx prisma migrate status` | FAIL | `Environment variable not found: DIRECT_URL` | `MANUAL_VERIFICATION_REQUIRED`. |
| `npm run lint` | PASS | ESLint completed | Does not block. |
| `npm run typecheck` | PASS | `tsc --noEmit` completed | Does not block. |
| `npm run build` | PASS | Next.js build completed | Build is not the release blocker. |
| `npm run` | PASS | No test scripts are present | Test gap is P1. |
| `npm audit --audit-level=moderate` | PASS | `found 0 vulnerabilities` | Does not block. |
| `agent-browser open http://localhost:3000` | FAIL | `agent-browser` not found in PATH | Browser CLI unavailable locally. |
| `npm run responsive:check` | FAIL | `/` passed all viewports; `/admin` failed with HTTP 500 | CRM readiness/security blocker. |

Observed `/admin` failure:

```txt
PrismaClientInitializationError:
error: Environment variable not found: DATABASE_URL.
src/server/crm/data.ts:69
```
