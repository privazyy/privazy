# CMS Blog

This PR adds an internal blog CMS foundation backed by Prisma models:

- `BlogPost`
- `BlogCategory`
- `BlogTag`
- `PostCategory`
- `PostTag`

Public blog routes read through `src/server/cms/posts-service.ts` and filter by `status = PUBLISHED`. Draft, review and archived posts are not returned by public APIs or public pages.

Content policy:

- content is markdown/plain rich text;
- public rendering does not use `dangerouslySetInnerHTML`;
- service validation rejects dangerous HTML containers such as script and iframe;
- public serializers omit workflow fields and reviewer/admin metadata.

The old static blog array remains in the repo for historical/reference code, but it is not the target public data source for this PR.
