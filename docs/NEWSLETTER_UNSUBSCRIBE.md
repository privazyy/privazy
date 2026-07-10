# Newsletter Unsubscribe

Unsubscribe foundation:

- public page: `/newsletter/wypisz`;
- public API: `POST /api/newsletter/unsubscribe`;
- no login required;
- unsubscribe token is hashed before lookup;
- raw unsubscribe token is not stored in the database;
- response is neutral to avoid subscriber enumeration.

Because this PR does not send marketing email, it does not deliver unsubscribe links to recipients. Future campaign delivery must generate a raw token link at send time while continuing to persist only the hash.

No marketing email may be sent until unsubscribe is verified in staging.
