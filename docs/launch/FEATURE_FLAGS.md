# Feature Flags

Defaults are conservative because current launch decision is `DO_NOT_LAUNCH`.

| Flag | Purpose | Default dev | Default staging | Default production | Risk | Owner | Launch setting |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ENABLE_CHECKOUT` | Enables checkout entry points | `false` | `false` | `false` | Users may expect paid fulfillment | Product/Tech | Disabled until commerce smoke |
| `ENABLE_LIVE_PAYMENTS` | Enables real payment provider mode | `false` | `false` | `false` | Real charges and reconciliation risk | Finance/Tech | Disabled without written approval |
| `ENABLE_INVOICES` | Enables invoice flows | `false` | `false` | `false` | Legal/accounting obligations | Finance/Legal | Disabled until invoice provider approved |
| `ENABLE_LIVE_INVOICES` | Enables production invoice issuing | `false` | `false` | `false` | Incorrect legal documents | Finance/Legal | Disabled without written approval |
| `ENABLE_CLIENT_PORTAL` | Enables client portal surfaces | `false` | `false` | `false` | Tenant isolation and auth risk | Tech | Disabled until portal smoke |
| `ENABLE_DOCUMENT_GENERATION` | Enables document generation | `false` | `false` | `false` | Wrong/corrupt documents | Legal/Tech | Disabled until document smoke |
| `ENABLE_BREACH_MODULE` | Enables breach register | `false` | `false` | `false` | Deadline/legal tracking risk | Legal/Tech | Disabled unless module merged and tested |
| `ENABLE_DSR_MODULE` | Enables DSR register | `false` | `false` | `false` | Deadline/legal tracking risk | Legal/Tech | Disabled unless module merged and tested |
| `ENABLE_NEWSLETTER` | Enables newsletter signup/campaign surfaces | `false` | `false` | `false` | Consent and marketing compliance | Marketing/Legal | Campaigns disabled |
| `ENABLE_CMS` | Enables CMS/blog admin surfaces | `false` | `false` | `false` | Publishing unreviewed content | Product | Disabled unless CMS PR merged and reviewed |
| `ENABLE_EMAIL_SENDING` | Enables transactional email sending | `false` | `false` | `false` | Spam/duplicate messages | Tech/Support | Disabled until test email and logging pass |
| `MAINTENANCE_MODE` | Blocks normal usage during incidents/preflight | `false` | `true` for rehearsals | `true` until launch approval | Lockout or accidental exposure | Tech | Enabled until checklist passes |

Do not remove flags during launch prep. A flag may be enabled only with a linked decision, owner and smoke result.
