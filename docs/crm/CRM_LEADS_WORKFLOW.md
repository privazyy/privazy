# CRM leads workflow

## Statuses

The schema uses:

- `NEW`
- `TO_CONTACT`
- `CONTACTED`
- `QUALIFIED`
- `UNQUALIFIED`
- `PROPOSAL_SENT`
- `CONVERTED`
- `WON`
- `LOST`
- `ARCHIVED`

`PROPOSAL_SENT` maps to the brief's offer-sent state.

## Staff workflow

1. Create a lead manually or receive one from the existing checker/form intake path.
2. Search/filter the lead list by query, status, priority, source or assignee.
3. Open detail from `/admin`.
4. Change status, priority and assignee.
5. Add internal notes and linked tasks.
6. Convert to organization after duplicate review.
7. Archive if the lead should no longer be active.

## Security

Unauthenticated users get `401`. `CLIENT` is blocked. `READ_ONLY` can read but cannot mutate. `OPERATOR`, `LAWYER` and `ADMIN` can perform operational lead mutations.
