# NOTIFICATIONS

`Notification` stores CRM and portal notifications.

## Channels

- `CRM`: internal team notification.
- `PORTAL`: visible only to users who can access the organization in `/platforma`.
- `EMAIL`: reserved for future notification-to-email mapping.

## Portal

The `/platforma` dashboard shows unread `PORTAL` notifications for the active organization. Clients can mark a notification as read through a server action scoped by `organizationId`.

Clients cannot read internal CRM notifications. Internal notes do not generate portal notifications.

## CRM

The CRM automations module lists notifications alongside event logs, automation runs and e-mail logs.
