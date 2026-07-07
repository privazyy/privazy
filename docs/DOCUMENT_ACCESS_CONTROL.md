# Document Access Control

| Actor | Job list | Generated document metadata | Active template metadata | Mutations |
| ----- | -------- | --------------------------- | ------------------------ | --------- |
| Anonymous | No | No | No | No |
| CLIENT | Own `ClientProfile` organizations only | Own organizations only | Active metadata only | No in this PR |
| READ_ONLY | Staff-wide read | Staff-wide read | Active metadata | No |
| OPERATOR | Staff-wide read | Staff-wide read | Active metadata | Separate guarded flows only |
| LAWYER | Staff-wide read | Staff-wide read | Active metadata | Separate guarded flows only |
| ADMIN | Staff-wide read | Staff-wide read | Active metadata | Separate guarded flows only |

## Central Helper

`src/server/auth/organization-access.ts` contains the shared organization access policy:

- `getUserOrganizationIds`
- `canAccessOrganization`
- `assertOrganizationAccess`
- `canReadOrganizationDocuments`
- `canMutateOrganizationDocuments`
- `assertCanReadDocumentJob`
- `assertCanReadGeneratedDocument`
- `assertCanReadDocumentTemplate`
- `resolveDocumentListOrganizationScope`

The helper intentionally uses `ClientProfile` for CLIENT scope because there is no `OrganizationMember` model on `main`.

