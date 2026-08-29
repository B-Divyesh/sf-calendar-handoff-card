# Calendar Handoff Card

Create a shareable event card from details or a calendar file. Copy plain text or download an image, PDF, or calendar file.

It is for families and small teams when an invite is hard to open or crosses calendar apps.

Live product: <https://calendar-handoff-card.sociobot.in>

## Try the event-card demo

Open [the demo](https://calendar-handoff-card.sociobot.in/demo) to see a filled event card. Add event details, check local times, then choose a sharing format.

- Import the first event from a calendar file (`.ics`) or calendar text.
- Add a title, time, place, organizer, RSVP details, link, and notes.
- Compare event, device, and recipient times.
- Keep private link and note choices off until you select them.

The app has no account flow. Event details are processed in the browser. The app works offline after its first visit. Product claims and their tests are listed in [`.factory/claims.json`](.factory/claims.json).

## Develop

Node.js 20 or newer is required.

```sh
npm ci
npm run dev
```

Build the static deploy output with:

```sh
npm run build
```

The deploy artifact is `dist/`, with `dist/index.html` at its root. The build emits static documents for known routes and Azure Static Web Apps serves the designed 404 response for unknown paths.

## Test

```sh
npm test
```

This runs unit tests and browser checks in desktop Chromium and a 390px mobile viewport. The browser suite checks accessibility, keyboard access, offline reload, routing, and all claims.

Run an individual claim exactly as listed in `.factory/claims.json`, for example:

```sh
npm run test:e2e -- --grep @claim:offline-reload
```

## Privacy and legal

Read the in-product [privacy page](https://calendar-handoff-card.sociobot.in/privacy) and [terms page](https://calendar-handoff-card.sociobot.in/terms). See [LICENSE](LICENSE) for reuse terms.

## Product records

- [Research brief](.factory/brief.json)
- [Visual thesis and artwork provenance](.factory/design.md)
- [Demo sandbox](.factory/demo.md)
- [Build handoff](.factory/handoff.md)
