# Privacy Policy Input Schema

First supported document type: `PRIVACY_POLICY`.

Sections:
- Administrator data
- RODO contact and DPO data
- Website/application profile
- Categories of people
- Processing purposes
- Legal bases
- Recipients
- Transfers outside EEA
- Retention
- Data subject rights
- Cookies
- Additional notes

Draft:
- accepts partial JSON,
- size-limited,
- does not trust organization/template/user IDs.

Submit:
- requires critical fields,
- rejects simple HTML markers in text fields,
- requires `confirmAccuracy`,
- requires `acceptDocumentDisclaimer`,
- creates a controlled pending generation job.
