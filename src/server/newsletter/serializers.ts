import "server-only";

import type { NewsletterSubscriber } from "@prisma/client";

export function serializeSubscriberForAdmin(subscriber: NewsletterSubscriber) {
  return {
    id: subscriber.id,
    email: subscriber.email,
    status: subscriber.status,
    source: subscriber.source,
    consentMarketing: subscriber.consentMarketing,
    consentTextSnapshot: subscriber.consentTextSnapshot,
    confirmedAt: subscriber.confirmedAt,
    unsubscribedAt: subscriber.unsubscribedAt,
    createdAt: subscriber.createdAt,
    updatedAt: subscriber.updatedAt,
  };
}

export function neutralNewsletterResponse() {
  return {
    ok: true,
    message: "Jesli adres moze zostac zapisany, przetworzymy zgloszenie. Sprawdz skrzynke lub status zgody.",
  };
}
