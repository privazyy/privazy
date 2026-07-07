# Test Fixtures

Fixtures live in `tests/helpers`.

## Users

`tests/helpers/users.ts` defines example.com-only users:

- ADMIN: `admin@example.com`
- LAWYER: `lawyer@example.com`
- OPERATOR: `operator@example.com`
- READ_ONLY: `readonly@example.com`
- CLIENT: `client@example.com`
- unauthenticated: `null`

No fixture contains real client data or secrets.

## Organizations

`tests/helpers/organizations.ts` defines:

- `org_a`
- `org_b`
- one CLIENT membership for `org_a`

These are plain strings for policy tests. They are not database records.

## Rules

- Do not add production data to fixtures.
- Do not make tests depend on `.env.local`.
- Prefer pure policy helpers over live database calls.
- When a route handler requires data access, split the policy/serializer first and test that logic directly.
