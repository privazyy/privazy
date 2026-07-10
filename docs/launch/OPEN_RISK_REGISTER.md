# Open Risk Register

| Risk | Severity | Status | Accepted? | Mitigation | Owner | Must fix before public launch? |
| --- | --- | --- | --- | --- | --- | --- |
| Release gate is `STAGING_NO_GO` | P0 | Open | No | Complete RC audit conditions and re-decide | Product/Tech | Yes |
| Live payments not enabled/approved | P0 | Open | No for paid launch | Keep `ENABLE_LIVE_PAYMENTS=false` | Finance/Tech | Yes for paid launch |
| Live invoices not enabled/approved | P0 | Open | No for paid launch | Keep `ENABLE_LIVE_INVOICES=false` | Finance/Legal | Yes for paid launch |
| Legal docs draft/not approved | P0 | Open | No | Legal approval before public paid launch | Legal | Yes |
| Manual support needed | P1 | Open | Yes for internal-only | Assign support owner and SLA | Support | No for internal, yes for scale |
| Generator limited to one document | P1 | Open | Conditional | Limit scope and manually review output | Legal/Tech | No for narrow test |
| Monitoring partial | P0 | Open | No for public launch | Configure alerts and owners | Tech | Yes |
| RLS/Data API manual verification | P0 | Open | No | Verify Supabase policies/grants/API exposure | Tech | Yes |
| Backup restore not tested | P0 | Open | No | Execute restore drill or approved manual plan | Tech | Yes |
| Email mode mock/disabled | P1 | Open | Yes if no email promises | Keep `ENABLE_EMAIL_SENDING=false` | Tech/Support | No if manual comms |
| Newsletter campaigns disabled | P1 | Open | Yes | Keep campaigns disabled until consent review | Marketing/Legal | No |
| Maintenance enforcement not implemented | P0 | Open | No for public launch | Implement/test proxy or equivalent gate | Tech | Yes |
| Public forms abuse protection incomplete | P1 | Open | No for high traffic | Add Turnstile/rate limiting | Tech | Yes before campaign |
| Tenant isolation needs full smoke | P0 | Open | No | Role/org matrix tests | Tech | Yes |
