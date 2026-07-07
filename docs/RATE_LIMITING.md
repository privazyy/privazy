# Rate Limiting

## Public IOD Lead Endpoint

| Key | Limit | Window | Purpose |
| --- | ---: | ---: | --- |
| Hashed client IP | 8 requests | 60 seconds | Basic burst control before body parsing. |
| Invalid payload by hashed IP | 4 invalid requests | 60 seconds | Slows scanners and schema probing. |
| Normalized email | 3 valid requests | 60 minutes | Limits duplicate human submissions and spam retries. |

## Behavior

When a limit is exceeded, the endpoint returns:

```json
{
  "error": {
    "code": "rate_limited",
    "message": "Zbyt wiele zgłoszeń. Spróbuj ponownie później."
  }
}
```

The response contains no retry metadata that could help tune automated abuse.

## Production Hardening

The current implementation uses in-memory counters. Use a shared backend before treating this as a full production abuse-control layer across many serverless instances.
