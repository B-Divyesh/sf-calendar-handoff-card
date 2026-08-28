# Calendar Handoff Card — Polish 1 handoff

## Delivered

Repair commit: `ad6d218` (based on review candidate `468dc175c52996a94e77567e3dfea636bfa713d6`).

- Reworked the first screen around the plain job, named audience, and one-click filled sample.
- Added isolated `/demo` and `?demo=1` paths with reset and exit controls.
- Added `.factory/claims.json`, demo documentation, copy audit, and clean-context browser claim coverage.
- Added static 404, sitemap, route titles/metadata/social assets, header navigation, route focus, and legal links.
- Preserved the risograph paper-collage identity and improved mobile header/action stacking.

See [polish-1.md](polish-1.md) for the complete F-1-1 through F-1-34 mapping.

## Run and verify

```sh
npm ci
npm test
npm run build
```

`npm test` passed in this checkout and in a clean local clone: 12 Vitest tests passed; all 12 claim tests ran in desktop and 390px Chromium (28 project executions, with two intentional duplicate export skips). `npm run build` passed and created `dist/index.html`.

Claim commands are listed in [claims.json](claims.json). They use the `/demo` sandbox only. Local verifier evidence is in `.factory/evidence/`:

- `verify-url.sh http://127.0.0.1:4173 .factory/evidence` — HTTP 200, title, `lang=en`, one h1, main landmark, no missing image alt text, no unlabeled buttons, and no console/page errors.
- Playwright Axe check — no serious or critical findings on desktop and mobile.
- `@claim:offline-reload` — waits for service worker control, then reloads the filled demo while offline.

The standalone Axe CLI could not start its Selenium Chrome session in this container; the pinned Playwright Axe integration is the accepted accessibility evidence.

## Deployment and live check

Deploy `dist/` as the static application with the checked-in `staticwebapp.config.json`. The required live re-check URLs are:

- `https://calendar-handoff-card.sociobot.in/`
- `https://calendar-handoff-card.sociobot.in/demo`
- `https://calendar-handoff-card.sociobot.in/?demo=1`
- `https://calendar-handoff-card.sociobot.in/privacy`
- `https://calendar-handoff-card.sociobot.in/terms`
- `https://calendar-handoff-card.sociobot.in/not-a-real-page`

## Known gaps

None from review 1. The parser intentionally imports the first event from a calendar file; it does not attempt calendar synchronization or recurring-event expansion.
