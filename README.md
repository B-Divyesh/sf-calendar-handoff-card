# Calendar Handoff Card

Calendar Handoff Card turns event details or an ICS file into a dependable, channel-ready handoff: clear plain text, a compact PNG or PDF, timezone equivalents, joining details, and a universal calendar download.

It is for families and small teams whose recipients use different calendar systems—or missed the original invitation. It does not sync calendars, host events, send invitations, or store contacts.

Live product: <https://calendar-handoff-card.sociobot.in>

## What it does

- Imports the first `VEVENT` from an ICS file or pasted ICS text.
- Accepts typed event, organizer, RSVP, place, link, and note fields.
- Resolves IANA timezones in-browser, applies date-specific daylight-saving rules, and rejects nonexistent DST wall times.
- Shows the event time alongside the device and a chosen recipient timezone.
- Copies an accessible plain-text handoff.
- Downloads an illustrated PNG, compact PDF, or standards-based ICS file.
- Keeps links, notes, and link QR codes out of PNG/PDF output unless explicitly enabled.
- Works offline after the first successful visit.

No event data is sent to a server or written to local storage. There are no accounts, cookies, trackers, analytics, third-party fonts, or runtime CDNs.

## Develop

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
```

Vite prints the local URL. Production output is reproducible with:

```sh
npm run build
```

The exact deploy artifact is `dist/`, with `dist/index.html` at its root. `staticwebapp.config.json` supplies the Azure Static Web Apps navigation fallback, security headers, and immutable asset caching.

## Test

```sh
npm test
```

This runs Vitest unit coverage for timezone/ICS/output logic, then Playwright journeys in desktop Chromium and a 390 px mobile Chromium viewport. The browser suite includes Axe serious/critical checks, keyboard navigation, offline editing, imports, and file downloads. Playwright is pinned to `1.58.2` as required by the build environment.

Individual commands:

```sh
npm run test:unit
npm run test:e2e
```

## Privacy and legal

The in-product [privacy page](/privacy) explains local processing and the service-worker cache. The [terms page](/terms) explains the tool’s limits. The project is MIT licensed.

## Product and design records

- [Research brief](.factory/brief.json)
- [Visual thesis and asset provenance](.factory/design.md)
- [Build handoff](.factory/handoff.md)

The original hero artwork source and generation metadata are in `assets/src/`; optimized runtime assets are in `public/assets/`.
