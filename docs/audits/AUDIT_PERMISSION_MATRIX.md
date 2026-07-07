# Audit Permission Matrix Delta

Date: 2026-07-07

| Permission | Anonymous | CLIENT | READ_ONLY | OPERATOR | LAWYER | ADMIN |
| ---------- | --------- | ------ | --------- | -------- | ------ | ----- |
| List document jobs | No | Own organizations only | Staff-wide read | Staff-wide read | Staff-wide read | Staff-wide read |
| Read active template metadata | No | Yes, active metadata only | Yes | Yes | Yes | Yes |
| See raw storage keys in document query responses | No | No | No | No | No | No |
| Mutate documents through query layer | No | No | No | No in this PR | No in this PR | No in this PR |

