# Calendar Handoff Card — review 3 handoff

## Completed

Performed the required adversarial first-read review against production and source commit `eedb7a291a4268f40d77e60b4ba8594b83af0541`.

- Wrote `.factory/review-3.md` with verdict **FAIL**, 5 blocking findings, 15 minor findings, the full landing/README copy audit, all claim results, and a finding-by-finding history check.
- Confirmed production matches the clean local build by SHA-256 for `index.html`, `index-BzF8CRFr.js`, and `style-agbfdjU3.css`.
- Did not modify product code.

## Verification performed

- Fresh mobile (390 × 844) and desktop (1440 × 1000) production contexts for cold first read.
- One-click demo entry, seed, reset, exit, request log, and local/session/cookie/IndexedDB/OPFS/Cache Storage inspection.
- Every exact command in `.factory/claims.json` from clean clone `/tmp/calendar-handoff-review3.iBRDQn/repo`: all commands exited successfully.
- `npm test`: 12 unit tests passed; 26 Playwright checks passed; 2 configured mobile export duplicates skipped.
- Independent live PNG, PDF, and ICS downloads; all were valid, non-empty files.
- Live route/title/metadata/404/deep-link/Back/Forward/focus checks and rendered-link crawl.
- Live Axe checks at mobile and desktop for `/`, `/demo`, `/privacy`, `/terms`, and `/404.html`: no serious/critical violations.
- `/opt/fleet/lib/verify-url.sh https://calendar-handoff-card.sociobot.in`: passed with no load errors.

## Outstanding review result

The primary blockers are:

1. `/demo` leaves a phone visitor at the unchanged hero; the filled product and non-persistent demo banner are below the first viewport.
2. The calendar-file test does not prove the visible “all entered details” claim.
3. PNG/PDF tests assert filenames only, not valid event-card content.
4. Private link/note/QR choices are not tested in downloaded PNG/PDF files.
5. The earlier metaphor “The date and time will land here” remains.

Additional unlisted claims, copy terminology, recovery messages, standard-skeleton omissions, and the missing footer build identifier are recorded with concrete fixes in `.factory/review-3.md`.

## Reproduce

```sh
npm ci
npm test
npm run build
```

Run each command in `.factory/claims.json` separately from a clean clone, then repeat the live first-screen demo check at 390 × 844. A future review may pass only after every finding in `.factory/review-3.md` is closed and verified on production.
