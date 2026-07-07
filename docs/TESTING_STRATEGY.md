# Testing Strategy

This PR establishes a minimal, real test harness for PRIVAZY without requiring production secrets, a production database, or client data.

## Runner

The project uses Vitest with `environment: "node"` and `tests/**/*.test.ts`.

Scripts:

- `npm run test` runs the full Vitest suite.
- `npm run test:unit` runs focused unit tests.
- `npm run test:security` runs security policy, guard, serializer, env, and safe error tests.
- `npm run test:smoke` runs release smoke tests for critical safety imports and route classifications.
- `npm run test:watch` starts Vitest watch mode locally.

## What This PR Tests

- Role permissions for ADMIN, LAWYER, OPERATOR, READ_ONLY, CLIENT, and unauthenticated users.
- Private route classification for public, staff, client portal, and authenticated routes.
- CRM API read/mutation guards, query limits, and safe lead serialization.
- Document generation guard behavior and session-derived actor IDs.
- Organization/tenant access decisions.
- Document job/generated document serializers that hide raw storage keys.
- Env validation status that reports booleans, not secret values.
- Safe error shapes and secret redaction.
- Release smoke checks for critical security helper availability.

## Manual For Now

- Browser auth/login E2E.
- Real database route handler integration.
- Staging deployment smoke tests.
- Supabase RLS/Data API verification.
- Secure document download endpoint tests, because that endpoint is not present yet.
- Lead endpoint abuse protection tests, because rate limiting/Turnstile is planned as a separate PR.

## CI Policy

CI runs `npm run test:security` and `npm run test:smoke` after lint/typecheck. These tests do not need real secrets or a production database.

Staging readiness remains blocked until the broader P1 list is closed and staging is verified with real environment configuration.
