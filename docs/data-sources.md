# BAR data-source policy

BAR stores each import's raw payload, source URL, provider, checksum and import time. Importing a record never makes it verified.

| Use | Preferred source | Stored data |
| --- | --- | --- |
| Tournament schedule, scores, official rosters and box scores | WBSC event pages / official reports | Tournament, teams, rosters, games and plate appearances when available |
| MLB pitch-level traits | Baseball Savant CSV export | Pitch velocity, type, event, xwOBA and player identifiers |
| MLB identity and schedule reconciliation | MLB Stats API | External identities, schedule and official game IDs |
| NPB translation inputs | NPB official export or manually reviewed licensed data | Season batting, pitching and fielding values with a source URL |

## Import rules

1. Import only stable URLs whose terms permit the intended use.
2. Preserve the unmodified provider payload in `RawRecord`.
3. Attach an event page or report URL to every roster, stat line and game.
4. Set `verifiedAt` only after a human checks the roster or official result.
5. Never represent a demo baseline as a public player projection.

## Roster API

`POST /api/admin/import/roster` accepts validated JSON and never scrapes a caller-provided URL. In production, send `Authorization: Bearer $BAR_IMPORT_TOKEN`.
