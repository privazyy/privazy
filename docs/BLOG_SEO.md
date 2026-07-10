# Blog SEO

Added SEO foundation:

- per-post `seoTitle`;
- per-post `seoDescription`;
- optional `canonicalUrl`;
- metadata in `/blog` and `/blog/[slug]`;
- category and tag route metadata;
- `src/app/sitemap.ts` with only published blog posts;
- `src/app/robots.ts` that excludes admin and CMS APIs.

Rules:

- public SEO can reference only `PUBLISHED` posts;
- drafts and review posts are excluded from sitemap;
- newsletter unsubscribe page is `noindex`;
- no marketing analytics is added in this PR.

`NEXT_PUBLIC_SITE_URL` is used for sitemap URLs and falls back to `http://localhost:3000` locally.
