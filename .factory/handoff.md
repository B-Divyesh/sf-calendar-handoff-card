# Calendar Handoff Card — build handoff

## Shipped

- A complete local-first Vite + TypeScript event handoff maker.
- Typed event fields plus local ICS file and pasted-ICS import; the first `VEVENT` is used and multiple events are reported.
- Deterministic IANA timezone conversion with event, device, and chosen-recipient readouts. Nonexistent daylight-saving times are rejected; repeated fall-back times consistently use the earlier instant.
- Live accessible card preview with place, organizer, RSVP, and explicit privacy switches for joining links, notes, and QR codes.
- Plain-text clipboard output, native device sharing where supported, illustrated PNG download, compact PDF download, and portable ICS calendar download.
- Empty, validation, import-error, offline, and ready states; mobile layout at 390 px; keyboard-accessible controls and dialog.
- Versioned service-worker shell caching, Azure Static Web Apps navigation fallback/security/cache headers, and privacy/terms routes.
- Original risograph collage artwork, generated specifically for the product and exported responsively. Prompt, review, and provenance are in `.factory/design.md` and `assets/src/calendar-bridge.json`.
- No event persistence, accounts, cookies, analytics, third-party runtime scripts/fonts, or network processing.

## Verification

Run from a clean checkout with Node.js 20+:

```sh
npm ci
npm test
npm run build
```

Final local results on 2026-08-28:

- `npm test`: passed — 12/12 Vitest tests; 14/14 applicable Playwright journeys passed across desktop Chromium and a 390 × 844 mobile viewport (2 intentional project skips).
- Browser coverage includes ICS import, DST behavior, timezone output, empty/invalid states, offline editing, clipboard text, ICS/PNG/PDF downloads, opt-in QR output, legal routes, mobile overflow, keyboard order, zero console errors, and Axe.
- Axe via Playwright: 0 serious or critical violations on desktop and mobile.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173 .factory/evidence`: HTTP 200; title present; `lang=en`; one h1; main landmark present; 0 missing image alts; 0 unlabeled buttons; 0 console/page errors.
- `npm run build`: passed; `dist/index.html` exists at the deploy root.
- Production assets: 48.9 KB JavaScript (20.1 KB gzip), 16.4 KB CSS (4.6 KB gzip), 22.6 KB mobile hero WebP. No font downloads.
- `npm audit`: 0 vulnerabilities.

Mobile Lighthouse 12.8.2 against the production preview:

| Category / metric | Result |
| --- | ---: |
| Performance | 99 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| Largest Contentful Paint | 1.9 s |
| First Contentful Paint | 1.1 s |
| Total Blocking Time | 70 ms |
| Cumulative Layout Shift | 0 |

The Lighthouse run used headless Chromium with mobile defaults. Full desktop and 390 px screenshots were also reviewed for visual integrity and overflow.

## Known gaps

- The intentionally small parser imports the first `VEVENT`; it does not expand recurring rules, alarms, or vendor-specific timezone definitions. Unsupported TZIDs fall back to the device timezone with a visible warning.
- PDF output is a high-resolution image card, so recipients needing selectable text should use the plain-text handoff or ICS download.
- The service worker provides offline use after one successful online visit; a completely new device still needs that first visit.

## Suggested next steps

- Pilot the handoff with mixed iOS/Android and Google/Outlook/Nextcloud recipients against the brief’s 80% comprehension and sub-60-second creation targets.
- Add fixtures only for vendor-specific ICS patterns observed in that pilot; avoid turning v1 into calendar-sync software.
