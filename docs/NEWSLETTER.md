# Newsletter

This PR adds a newsletter foundation, not campaign sending.

Models:

- `NewsletterSubscriber`
- `NewsletterConsentEvent`

Public API:

- `POST /api/newsletter/subscribe`
- `POST /api/newsletter/unsubscribe`

Admin API:

- `GET /api/cms/newsletter/subscribers`

The subscribe endpoint requires explicit marketing consent and returns a neutral success response. Duplicate emails do not reveal whether a subscriber already exists.

Out of scope:

- mass newsletter sending;
- campaign scheduling;
- marketing automation;
- external ESP integration;
- analytics/open tracking.
