# Calendar Handoff Card — Review 2 handoff

## What was done

An independent, no-code adversarial review was completed against the live production site and repository commit `61ae1a9`. The report is [review-2.md](review-2.md). It records a **FAIL** with four blocking live defects and two minor copy/claim defects.

No product code was changed. This handoff and the review are the only intended repository changes.

## How verified

- Cold fresh-browser visits at 390 × 844 and 1440 × 1000 to `/`.
- Fresh `/demo` journey: sample seed, visible banner, reset, start-for-real, storage namespace, request log, and mobile rendering.
- A fresh local clone at `/tmp/calendar-handoff-card-review2`: `npm ci`, `npm run test:unit` (12 passing), `npm run build` (passing), and every command declared in `.factory/claims.json` (all 12 passing).
- Production route/link crawl, metadata inspection, browser console capture, and Axe serious/critical check at mobile and desktop (none on home/demo).
- Current code and every earlier review/polish/handoff record were inspected; the report maps F-1-1 through F-1-34 individually.

## Remaining work

1. Route unknown paths to a real 404 response instead of the home page.
2. Make `/404.html` CSP-compliant and complete its route metadata/footer shell.
3. Prevent the demo banner from rendering on the normal home page; add a regression test for that state.
4. Focus the destination h1 on browser Back/Forward, then test it.
5. Remove or verify stale footer provenance/build claims and simplify decorative stage labels.
