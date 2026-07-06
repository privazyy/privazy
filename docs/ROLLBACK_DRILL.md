# Rollback Drill

Status: **BLOCKED - drill not executed**

## Application rollback

1. Identify previous healthy production deployment.
2. Confirm database compatibility.
3. Use Vercel rollback or redeploy approved commit.
4. Run production smoke tests.
5. Record rollback timestamp and owner.

## Maintenance mode drill

1. Set `MAINTENANCE_MODE=true` in staging.
2. Confirm public notice appears.
3. Confirm critical mutations are blocked.
4. Confirm internal bypass only works for approved roles.
5. Reset flag and re-test.

## Module disable drills

| Module | Switch | Expected result |
| --- | --- | --- |
| Checkout | `ENABLE_CHECKOUT=false` | No new carts/orders/payments. |
| Live payments | `ENABLE_LIVE_PAYMENTS=false` | Checkout cannot capture live payments. |
| Generator | `ENABLE_DOCUMENT_GENERATION=false` | No new generation jobs. |
| Portal | `ENABLE_CLIENT_PORTAL=false` | Client access paused or read-only. |
| CMS publication | `ENABLE_CMS_PUBLICATION=false` | No new public publishing. |
| Automations | `ENABLE_AUTOMATIONS=false` | No non-critical workflows run. |

## Database restore drill

1. Create staging backup.
2. Restore into isolated staging/test database.
3. Run migration status.
4. Run smoke tests.
5. Record restore time and issues.

## Rollback limitations

- Destructive migrations may require restore instead of rollback.
- Payment and invoice side effects cannot be rolled back only by app deploy.
- Emails already sent cannot be unsent.
- Documents delivered to customers require legal/support handling.
