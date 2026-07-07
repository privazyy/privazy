# Audit Command Results

Date: 2026-07-07

This file is updated by the ops env validation PR. Final command results are recorded in the PR description after local and remote checks run.

Expected local env blockers:

- `npx prisma validate` fails without `DIRECT_URL`.
- `npm run env:check:staging` fails without real staging env.
- `npm run env:check:production` fails without real production env.

