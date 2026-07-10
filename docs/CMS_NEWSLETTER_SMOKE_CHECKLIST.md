# CMS Newsletter Smoke Checklist

Use this checklist after migrations are applied to a staging database.

- [ ] `npm run prisma:generate` completes.
- [ ] `npx prisma validate` completes with real `DATABASE_URL` and `DIRECT_URL`.
- [ ] `/blog` renders without draft posts.
- [ ] `/api/blog/posts` returns only `PUBLISHED`.
- [ ] A `DRAFT` post is not visible at `/blog/[slug]`.
- [ ] Unauthenticated user gets `401` on `/api/cms/posts`.
- [ ] `CLIENT` gets `403` on `/api/cms/posts`.
- [ ] `READ_ONLY` can `GET /api/cms/posts` but cannot `POST /api/cms/posts/[id]/publish`.
- [ ] `ADMIN` can create, submit review, publish and archive a post.
- [ ] Duplicate post slug returns a safe conflict response.
- [ ] Newsletter subscribe without consent is rejected.
- [ ] Duplicate newsletter subscribe returns neutral success.
- [ ] `NewsletterConsentEvent` is written on subscribe.
- [ ] `NewsletterSubscriber.unsubscribeTokenHash` contains only a hash, not a raw token.
- [ ] `/newsletter/wypisz?token=...` works without login.
- [ ] Sitemap includes published posts and excludes drafts.
- [ ] No raw Prisma error or stack trace is returned by public/admin APIs.
- [ ] Production readiness remains `NO`.
