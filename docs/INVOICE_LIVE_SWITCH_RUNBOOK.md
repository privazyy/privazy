# Invoice Live Switch Runbook

Status: **BLOCKED - invoice provider not approved on main**

## Preconditions

- Invoice provider selected and contracted.
- Numbering series approved.
- VAT settings approved.
- Buyer data requirements approved.
- Accounting export process defined.
- Manual fallback owner assigned.

## Switch steps

1. Confirm provider production credentials in environment.
2. Confirm invoice numbering and reset/continuity rules.
3. Confirm VAT, seller and buyer data.
4. Issue test invoice if legally allowed.
5. Verify PDF/download/email delivery path.
6. Verify accounting export.
7. Verify correction/refund process.
8. Enable invoice provider flag/config only after approval.

## Stop conditions

- Wrong numbering.
- Wrong VAT settings.
- Missing buyer data validation.
- Export cannot be verified.
- No manual fallback.
