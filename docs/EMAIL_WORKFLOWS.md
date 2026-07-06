# EMAIL_WORKFLOWS

Phase 10R introduces `src/server/email/send-email.ts` and template foundations in `src/server/email/templates`.

## Behavior

- If `RESEND_API_KEY` and `RESEND_FROM` exist, transactional mail can be sent through Resend.
- If env is missing, the development mailer logs the message and marks `EmailLog` as `SKIPPED`.
- E-mail errors are logged in `EmailLog` and not shown to clients.
- E-mails never attach generated documents.
- Document links point to authenticated `/platforma` or internal `/admin` routes.
- Marketing unsubscribe affects newsletter/marketing e-mail, not transactional e-mail.

## Templates

Templates exist for lead confirmation, internal lead notification, order created, payment succeeded/failed, invoice issued, document input required, document generation started, document ready, document failed internal alert, document review required, breach/DSR internal alerts, deadline reminders, client message, task assigned, task overdue, double opt-in and reports.

## Campaign boundary

Newsletter campaigns are intentionally out of scope. `newsletter.subscriber.created.v1` can send a double opt-in foundation e-mail, but does not send a broadcast.
