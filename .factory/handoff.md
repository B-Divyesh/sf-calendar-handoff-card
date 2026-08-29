# Calendar Handoff Card — Polish 2 handoff

## Completed repair

Repaired every finding in [review-1.md](review-1.md) and [review-2.md](review-2.md). The product remains a Vite + TypeScript static site with its paper-collage visual identity.

- Commit `be8dc9b47319b9ae7f7e5117fe0b78d5e0231408` removes the false home demo banner, emits real static documents for `/demo`, `/privacy`, and `/terms`, restores Back/Forward heading focus, supplies an HTTP 404 path, completes the 404 shell/metadata, removes stale footer/build copy, and removes decorative labels.
- Commit `4d8ec5379f5274bfbb0efbc14d43eb9d63a2f2d0` corrects the direct-404 red label to accessible contrast after the new 404 Axe check caught it.
- `.factory/polish-2.md` maps F-1-1 through F-1-34 and F-2-1 through F-2-6 to changes and evidence.

## Verification

- Final clean clone: `/tmp/calendar-handoff-card-polish2-final.pD7WTb/repo`.
- `npm ci` passed with no audit vulnerabilities.
- `npm test` passed: 12 Vitest unit tests; 26 Playwright checks passed; PNG and PDF download checks intentionally skip only their mobile duplicate (2 skips). All 12 tagged claim tests ran in both desktop/mobile projects through `/demo`.
- Every exact command declared by `.factory/claims.json` was also run from a clean clone at `/tmp/calendar-handoff-card-polish2-clean.Kj3iJp/repo`; all passed. PNG/PDF each passed on desktop and intentionally skipped their duplicate mobile check.
- `npm run build` passed and writes `dist/index.html`, `dist/demo/index.html`, `dist/privacy/index.html`, `dist/terms/index.html`, and the designed 404 assets.
- `/opt/fleet/lib/verify-url.sh` passed locally for `/` and `/404.html` under the deployment CSP. Evidence: `.factory/evidence/polish-2-local/verify.json`, `.factory/evidence/polish-2-local/screenshot-mobile.png`, `.factory/evidence/polish-2-404/verify.json`, and `.factory/evidence/polish-2-404/screenshot-mobile.png`.
- Playwright Axe checks found no serious/critical issue on the home page (desktop/mobile) or direct 404 (desktop/mobile). The route regression asserts an unknown path returns HTTP 404, direct 404 has no console errors, normal home has no demo storage/banner, and Back/Forward restores h1 focus.
- Initial built JS is 50,425 bytes and CSS is 17,953 bytes before gzip; both are within budget.

## Deployment status

The completed repair was pushed to `origin/main` at `4d8ec53` (`45feb41..4d8ec53`). As of `2026-08-29T00:43Z`, the live custom domain still serves the previous artifact: `/not-a-real-page` returns 200 with the old home title and the old stage labels. I attempted the work-order static deployment after a successful local build using both `calendar-handoff-card` and the DNS-resolved Static Web App name `icy-glacier-06f41f70f`; the supplied workload identity authenticated, but `swa deploy … --env production --no-use-keychain` stalled during Azure resource resolution without a deployment result. This repeats the Azure control-plane blocker recorded in the prior handoff. No secrets were written or exposed. A successful factory deployment must be followed by the live route/404 cold check specified above.
