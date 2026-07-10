# Production Smoke Checklist

Run only after deployment is intentionally approved. This PR does not execute production deployment.

| Area | Check | Result |
| --- | --- | --- |
| Homepage | Public homepage loads | Pending |
| Health | `/api/health` returns no secrets and current status | Pending |
| Launch status | `/api/launch/status` returns feature/maintenance booleans only | Pending |
| Auth | Sign in/out and callback work | Pending |
| Portal | Client portal blocks unauth and wrong tenant | Pending |
| Admin | Admin protected from unauth and CLIENT | Pending |
| IOD checker | Checker loads and result flow works | Pending |
| Lead created | Public lead capture creates expected record | Pending |
| CRM lead visible | Staff can see lead in CRM | Pending |
| Checkout mode | Disabled/sandbox/live mode matches decision | Pending |
| Document input | Input validates and scopes to organization | Pending |
| Generation job | Job is created and processed | Pending |
| Secure download | Download requires correct user/org | Pending |
| Email log | Email mode/logging matches decision | Pending |
| CMS/blog | Public content and admin access match flags | Pending |
| Legal routes | Required legal pages exist and are approved | Pending |
| Monitoring | Logs/errors/alerts accessible | Pending |
| Rollback | Maintenance mode and rollback plan ready | Pending |
