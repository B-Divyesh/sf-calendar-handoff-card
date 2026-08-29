# Calendar Handoff Card — polish 3 handoff

## Shipped

The repaired static artifact from commit `b7625108d3a02533edcd672a3f2458beaa4c9c0f` is deployed to <https://calendar-handoff-card.sociobot.in> through Azure Static Web Apps resource `sf-calendar-handoff-card`.

The repair closes every finding in review rounds 1–3. It adds a true `?demo=1` sample sandbox, stronger downloadable-file and privacy verification, claim coverage, real route/metadata/404 behavior, plain copy, build IDs, limits and how-it-works sections, recovery copy, and intentional mobile navigation. The product remains the original paper-collage/riso visual system.

## Exact verification evidence

- Final clean clone: `/tmp/calendar-handoff-polish3-finalrelease.yld6Tm/repo` at `b7625108d3a02533edcd672a3f2458beaa4c9c0f`.
- `npm ci`: passed (88 packages, 0 vulnerabilities).
- Every one of the 15 exact commands from `.factory/claims.json` was run separately and passed in that clean clone: `demo-sample`, `no-account`, `local-processing`, `dst-conversion`, `text-export`, `ics-download`, `all-entered-details`, `image-download`, `pdf-download`, `private-output-options`, `ics-import`, `timezone-equivalents`, `offline-reload`, `cache-privacy`, and `scope-limits`.
- Clean-clone `npm test`: passed — 13 Vitest tests and 34 Playwright desktop/mobile tests.
- Clean-clone `npm run build`: passed; emits `dist/index.html`. Final sizes: JavaScript 52.65 kB (19.99 kB gzip), CSS 20.23 kB (5.32 kB gzip).
- Mobile Lighthouse on the demo: performance 97, accessibility 100, LCP 2.4 s, CLS 0.028 (`.factory/evidence/polish-3-lighthouse-retry.json`).
- Final production build check: custom domain serves build ID `b762510`, `index-CMfpb3Ya.js`, and `style-DkNtA8IA.css`.
- `verify-url.sh` passed with no console errors, `lang=en`, one h1, main landmark, and no missing image alt text for `/`, `/?demo=1`, `/privacy`, and `/terms`. Evidence: `.factory/evidence/polish-3-final-{home,demo,privacy,terms}/verify.json`.
- Production mobile demo check at 390 × 844: h1 is “Try a sample event card”; banner y=111; filled card y=425; card title y=504; the nav is an intentional grid. Screenshot: `.factory/evidence/polish-3-live-demo/cold-mobile-final.png`.
- Production PNG/PDF actions generated valid files with PNG/PDF signatures: `.factory/evidence/polish-3-live-demo/live-card-final.png` and `.factory/evidence/polish-3-live-demo/live-card-final.pdf`.
- Production Axe at 390px reported zero serious/critical issues for `/`, `/?demo=1`, `/privacy`, `/terms`, and `/404.html`.
- Production route check: `/not-a-real-page` returns HTTP 404 with title “Page not found — Calendar Handoff Card” and h1 “Page not found.” Home → Privacy focuses the privacy h1; Back focuses the home h1.

## Deployment

Built with `npm run build`, then deployed `dist/` as production using the Azure Static Web Apps deployment credential retrieved for the authorized resource. The CLI reported: `Project deployed to https://icy-glacier-06f41f70f.7.azurestaticapps.net`.

## Product records

- Cumulative finding map: `.factory/polish-3.md`
- Claims registry: `.factory/claims.json`
- Demo boundary: `.factory/demo.md`
- Copy/terminology audit: `.factory/copy-audit.md`

## Known gaps

None.
