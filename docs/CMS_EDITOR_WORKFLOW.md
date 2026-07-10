# CMS Editor Workflow

Status flow:

1. `DRAFT` - staff creates or edits a private post.
2. `IN_REVIEW` - staff submits the post for legal/editorial review.
3. `PUBLISHED` - `ADMIN` or `OPERATOR` publishes the post; public routes can now see it.
4. `ARCHIVED` - `ADMIN` or `OPERATOR` removes the post from the public surface without deleting the record.

The admin preview in `/admin/cms` is staff-only. Public previews are not added in this PR.

Audit events:

- `cms.post.created`
- `cms.post.updated`
- `cms.post.submitted_for_review`
- `cms.post.published`
- `cms.post.archived`
- `cms.category.created`
- `cms.tag.created`

The workflow is intentionally minimal. No WYSIWYG editor, scheduling, approval SLA, notifications or content migration is included.
