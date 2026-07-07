# Maintenance Mode

Status: `PARTIAL`

`MAINTENANCE_MODE` is documented as an operational flag and surfaced in runtime config status. This PR does not add a full maintenance page or global request interception.

## Intended Behavior

- `MAINTENANCE_MODE=false`: normal runtime.
- `MAINTENANCE_MODE=true`: operators may use this flag in future route guards, banners, or deployment procedures.

## Rules

- Do not use maintenance mode to hide security failures.
- Do not enable maintenance mode in production without an incident/release owner.
- Public marketing pages should remain available unless the incident requires a full stop.
- Private write flows should be the first candidates for maintenance gating.

