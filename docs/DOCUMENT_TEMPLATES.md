# Document templates

`DocumentTemplate` now supports:

- `type`
- `version`
- `status`
- `source`
- `isSample`
- `requiresReview`
- `variablesSchema`
- optional `fileKey`

Template sources:

- `R2` - reviewed DOCX template stored privately in Cloudflare R2.
- `LOCAL_DEVELOPMENT_SAMPLE` - code-generated sample DOCX for local development only.

Production must not rely on sample templates. Before production:

1. Create a final lawyer-reviewed DOCX template.
2. Upload it to private R2.
3. Create an `ACTIVE` `DocumentTemplate` row with `source = R2`.
4. Store the reviewed variables schema.
5. Decide whether the product/template requires legal review before client download.

The privacy-policy mapper exposes controlled variables instead of passing arbitrary JSON to Docxtemplater.
