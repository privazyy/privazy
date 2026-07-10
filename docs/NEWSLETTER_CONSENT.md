# Newsletter Consent

Consent requirements implemented in this PR:

- the public checkbox is required;
- the checkbox is not checked by default;
- the consent text snapshot is stored on the subscriber;
- a consent event is written for subscribe/resubscribe/unsubscribe actions;
- full IP addresses and full user agents are not stored; only hashes may be recorded.

Current consent text:

> Wyrazam zgode na otrzymywanie od PRIVAZY tresci marketingowych i edukacyjnych dotyczacych ochrony danych, RODO oraz uslug PRIVAZY. Zgode moge wycofac w kazdej chwili.

Double opt-in is not fully implemented because this PR does not send email. It should be added before marketing campaigns are launched.
