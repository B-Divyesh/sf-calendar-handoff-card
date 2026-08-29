# Adversarial first-read review 4 — Calendar Handoff Card

**Reviewed:** 2026-08-29  
**Production URL:** <https://calendar-handoff-card.sociobot.in>  
**Verdict:** **PASS**

No findings remain. This review used clean Chromium contexts at 390 × 844 and
1440 × 1000, a fresh local clone for every listed claim command, and direct
production route checks. There are zero blocking or minor findings and every
current claim has an executed test.

## Cold first read

Before scrolling, the mobile and desktop first screen answer all three required
questions.

| Question | Cold-reader answer | Evidence |
| --- | --- | --- |
| What does it do? | It creates a shareable event card from an invite or calendar details. | H1: “Create a shareable event card.” |
| For whom? | Families and small teams when an invite is difficult to open or crosses calendar apps. | Supporting sentence: “For families and small teams when an invite is hard to open or crosses calendar apps.” |
| What should I click first? | “Try it with sample data.” | The primary action is visible, names the result, and says it will show a filled card with local times and sharing options. |

At 390px the first screen showed the headline, audience, primary action,
immediate outcome, and three facts without a scroll. The layout is a
product-specific paper-and-risograph collage, not a generic SaaS hero.

Clicking the primary action opened `/?demo=1` immediately. Its initial mobile
viewport contained the persistent “Demo — sample data, nothing is saved” banner,
Reset demo, Start for real, and the filled “Grandma’s birthday lunch” card.
The demo uses only `sessionStorage["demo:calendar-handoff-card"]`; localStorage
was empty. Reset restored the sample and Start for real removed that key and
returned to an empty form. The sample is an in-memory fixture, so no real event
data can be read or written in demo mode.

## Copy audit

Counts treat hyphenated words as one word. The audit covers visitor-facing
sentences and meaningful headings on the landing page and README. Field labels,
timezone names, filenames, code, links, and user-entered values are not
sentences. No entry exceeds 22 words. No jargon, marketing adjective,
inconsistent term, mood heading, or non-result-naming action remains.

### Landing page

| Words | Copy | Check |
| ---: | --- | --- |
| 5 | Create a shareable event card | Plain job h1 |
| 16 | For families and small teams when an invite is hard to open or crosses calendar apps. | Audience and situation |
| 11 | See a filled event card with local times and sharing options. | Explains primary action result |
| 2 | No account | `no-account` claim |
| 6 | Event details stay in your browser. | `local-processing` claim |
| 6 | Works offline after the first visit. | `offline-reload` claim |
| 3 | You are offline. | Literal state heading |
| 8 | The saved app and sample still open offline. | `offline-reload` claim |
| 7 | Demo — sample data, nothing is saved | Demo boundary, `demo-sample` claim |
| 5 | Try a sample event card | Demo h1 |
| 9 | Type the details or import a calendar file (.ics). | Clear first instruction |
| 6 | Processing happens in this browser. | `local-processing` claim |
| 3 | First event only | `ics-import` claim |
| 5 | The timezone the organizer used. | Field help |
| 8 | Daylight-saving changes are applied for the event date. | `dst-conversion` claim |
| 6 | The event date and time will appear here. | Literal empty state |
| 17 | Plain text and calendar files include all entered details; image and PDF follow the privacy choices above. | `all-entered-details`, `private-output-options` claims |
| 14 | A QR code for the joining link will appear in image and PDF downloads. | `private-output-options` claim |
| 11 | These details are off by default in image and PDF downloads. | `private-output-options` claim |
| 12 | Copy plain text for chat or email. Download an image, PDF, or calendar file. | Concrete format instruction |
| 10 | Use the event card preview to check the details before sharing. | How-it-works introduction |
| 10 | Type the details or use a calendar file. | How-it-works step |
| 9 | Compare the event, device, and recipient time. | How-it-works step |
| 12 | Choose plain text, an image, a PDF, or a calendar file. | How-it-works step |
| 8 | This card maker creates files and copyable text. | `scope-limits` claim |
| 7 | It does not send invitations or sync calendars. | `scope-limits` claim |
| 11 | Calendar Handoff Card makes event cards from details or calendar files. | Footer description |
| 5 | Built by Param Factory · build [build id]. | Build provenance, populated as `2442c18` in production |
| 16 | Clipboard access was denied. Copy the event details manually or try again after allowing clipboard access. | Error and next action |
| 15 | This browser could not create the image card. Download the PDF or calendar file instead. | Error and next action |
| 12 | That download did not finish. Try the PDF or calendar file instead. | Error and next action |
| 14 | No event was found. Paste a complete calendar event or choose another calendar file. | Error and next action |
| 4 | Paste calendar text first. | Error and next action |
| 8 | This calendar file has an unsupported all-day date. | Specific recovery state |
| 11 | This calendar file uses a date format this tool cannot safely interpret. | Specific recovery state |

Actions were also checked: **Try it with sample data**, **Reset demo**,
**Start for real**, **Import calendar file**, **Paste calendar text**,
**Import first event**, **Copy plain text**, **Download image**,
**Download PDF**, **Download calendar file**, and **Share from device** all
name the action or result. Conventional dismissals are limited to Cancel and
Close.

### README

| Words | Copy | Check |
| ---: | --- | --- |
| 11 | Create a shareable event card from details or a calendar file. | Plain opening |
| 11 | Copy plain text or download an image, PDF, or calendar file. | Format claims below |
| 16 | It is for families and small teams when an invite is hard to open or crosses calendar apps. | Audience and situation |
| 9 | Open the demo to see a filled event card. | Demo instruction |
| 11 | Add event details, check local times, then choose a sharing format. | Usage sequence |
| 12 | Import the first event from a calendar file (.ics) or calendar text. | `ics-import` claim |
| 11 | Add a title, time, place, organizer, RSVP details, link, and notes. | `all-entered-details` coverage |
| 6 | Compare event, device, and recipient times. | `timezone-equivalents` claim |
| 11 | Keep private link and note choices off until you select them. | `private-output-options` claim |
| 6 | The app has no account flow. | `no-account` claim |
| 7 | Event details are processed in the browser. | `local-processing` claim |
| 8 | The app works offline after its first visit. | `offline-reload` claim |
| 10 | Product claims and their tests are listed in `.factory/claims.json`. | Test-record instruction |
| 6 | Node.js 20 or newer is required. | Developer prerequisite |
| 14 | The deploy artifact is `dist/`, with `dist/index.html` at its root. | Developer instruction |
| 18 | The build emits static documents for known routes and Azure Static Web Apps serves the designed 404 response for unknown paths. | Developer instruction |
| 15 | This runs unit tests and browser checks in desktop Chromium and a 390px mobile viewport. | Developer instruction |
| 12 | The browser suite checks accessibility, keyboard access, offline reload, routing, and all claims. | Developer instruction |

The terminology remains consistent: **event card**, **calendar file**,
**calendar text**, **sharing menu**, and **demo**. “.ics” is introduced as the
calendar-file extension, not used as unexplained user-facing jargon.

## Claims and sandbox verification

`.factory/claims.json` contains 15 entries. I cloned the repository into
`/tmp/calendar-handoff-review4.yF8Nd8/repo`, ran `npm ci`, then ran every exact
listed command separately. Each passed in both the desktop and 390px Chromium
projects.

| Claim id | Result |
| --- | --- |
| `demo-sample` | PASS — filled first screen, reset, exit, and separate `demo:` session key |
| `no-account` | PASS — no sign-in surface |
| `local-processing` | PASS — calendar-text import, copy, PNG, PDF, and calendar-file flow made only same-origin GET requests with no request body |
| `dst-conversion` | PASS — date-specific New York/London sample conversion |
| `text-export` | PASS — clipboard contains all sample details |
| `ics-download` | PASS — downloaded ICS contains every event detail |
| `all-entered-details` | PASS — clipboard and calendar file both contain every entered sample detail |
| `image-download` | PASS — PNG signature, dimensions, metadata, and changed-content check |
| `pdf-download` | PASS — one-page PDF, embedded image, and metadata |
| `private-output-options` | PASS — PNG/PDF metadata and decoded QR verify opt-in private choices |
| `ics-import` | PASS — first of two pasted calendar events is imported and reported |
| `timezone-equivalents` | PASS — event, device, and recipient labels render |
| `offline-reload` | PASS — filled demo reloads after going offline following first visit |
| `cache-privacy` | PASS — cache contains app/artwork but not edited event content |
| `scope-limits` | PASS — all exports complete without invitation/sync controls or non-local requests |

`npm test` also passed from that clean clone: 13 unit tests and 34 browser
tests. `npm run build` passed and produced `dist/`; the first-load JavaScript
is 19.99 kB gzip. The retained claim-like landing and README text crosswalks to
one or more entries above; no unlisted claim was found.

## Structure, accessibility, and links

Production checks confirmed the following.

- `/`, `/demo`, `/?demo=1`, `/privacy`, `/terms`, and `/404.html` have one h1,
  a route-specific plain-language title, description, canonical URL, Open Graph
  image, and no console errors. Direct `/404.html` returns its designed page;
  an unknown route returns HTTP 404 with title and h1 “Page not found”.
- The home, demo, legal, and 404 pages have the consistent header, skip link,
  footer, Privacy and Terms links, and current build ID. A fresh live
  Home → Privacy → Back check put focus and the polite route announcement on
  the destination h1 each time.
- The live crawl returned 200 for every internal route and asset, including
  `robots.txt`, `sitemap.xml`, favicon, apple-touch icon, and OG image; the
  linked source repository also returned 200.
- The browser suite’s Axe run found no serious or critical violations on `/`,
  `/demo`, `/privacy`, `/terms`, or `/404.html`. Its keyboard and mobile checks
  passed. The live 390px view had no horizontal overflow and no console errors.
- The risograph paper, hard ink shadows, registration marks, original
  calendar-bridge art, Georgia/system type pairing, and reduced-motion policy
  match `.factory/design.md` and are visually distinct from a generic template.

## Earlier findings rechecked

Every earlier finding was verified against both the current code/tests and the
live site, rather than accepted from a prior status label.

| Earlier id | Current confirmation |
| --- | --- |
| F-1-1 | Fixed: live first screen states job, audience, and first action. |
| F-1-2 | Fixed: direct demo is filled, isolated, resettable, persistent, and card-first on mobile. |
| F-1-3 | Fixed: registry exists and all 15 tagged commands pass. |
| F-1-4 | Fixed: `no-account` passed. |
| F-1-5 | Fixed: `local-processing` passed with request log. |
| F-1-6 | Fixed: import and every export are covered by `local-processing`. |
| F-1-7 | Fixed: `dst-conversion` passed. |
| F-1-8 | Fixed: absolute wording removed; `text-export` passed. |
| F-1-9 | Fixed: subjective wording removed; actual files are tested. |
| F-1-10 | Fixed: control names and creates a calendar file. |
| F-1-11 | Fixed: both text and ICS contain every sample detail. |
| F-1-12 | Fixed: retained browser-processing claim has request-log coverage. |
| F-1-13 | Fixed: offline reload passed. |
| F-1-14 | Fixed: travel metaphor is absent. |
| F-1-15 | Fixed: footer provides working source/legal links without unsupported promise. |
| F-1-16 | Fixed: tracker/analytics promise remains removed. |
| F-1-17 | Fixed: README opening is short, concrete, and audited. |
| F-1-18 | Fixed: only tested scope limitations remain. |
| F-1-19 | Fixed: first-event import passed. |
| F-1-20 | Fixed: all named fields are covered in observed exports. |
| F-1-21 | Fixed: technical overclaim removed; date-specific behavior is tested. |
| F-1-22 | Fixed: three labeled timezone rows are tested. |
| F-1-23 | Fixed: undefined accessibility adjective is absent. |
| F-1-24 | Fixed: PNG, PDF, and ICS content are independently tested. |
| F-1-25 | Fixed: real PNG/PDF private variants and QR are inspected. |
| F-1-26 | Fixed: offline claim is tested. |
| F-1-27 | Fixed: storage/cache/request boundary is tested. |
| F-1-28 | Fixed: untestable compound privacy/resource claim is absent. |
| F-1-29 | Fixed: LICENSE is present and linked. |
| F-1-30 | Fixed: live unknown URL is designed HTTP 404. |
| F-1-31 | Fixed: metadata and social/icon assets are live per route. |
| F-1-32 | Fixed: header and Back/Forward h1 focus work live. |
| F-1-33 | Fixed: concrete headings/actions and literal empty state are present. |
| F-1-34 | Fixed: README is under the sentence cap and uses plain terms. |
| F-2-1 | Fixed: live unknown path returns 404, not home. |
| F-2-2 | Fixed: ordinary home hides demo banner and has no demo storage state. |
| F-2-3 | Fixed: direct 404 has metadata, skeleton, external assets, and no console error. |
| F-2-4 | Fixed: fresh Home → Privacy → Back focuses the relevant h1. |
| F-2-5 | Fixed: current build ID is stamped in live footer. |
| F-2-6 | Fixed: decorative stage labels are absent. |
| F-3-1 | Fixed: mobile demo shows banner and filled card in first screen. |
| F-3-2 | Fixed: calendar-file assertion checks all fields. |
| F-3-3 | Fixed: actual PNG/PDF structure and content are checked. |
| F-3-4 | Fixed: opt-in private output and QR are checked in files. |
| F-3-5 | Fixed: literal date/time empty state is present. |
| F-3-6 | Fixed: offline copy is specific and covered by offline reload. |
| F-3-7 | Fixed: cache-specific privacy claim has cache inspection. |
| F-3-8 | Fixed: request log includes import and every export. |
| F-3-9 | Fixed: untested free claim is absent. |
| F-3-10 | Fixed: direct license link replaces prose claim. |
| F-3-11 | Fixed: offline heading is literal. |
| F-3-12 | Fixed: import errors use calendar file/text language and a next action. |
| F-3-13 | Fixed: calendar-file terminology is consistent. |
| F-3-14 | Fixed: unexplained handoff/share-sheet feedback is absent. |
| F-3-15 | Fixed: README points to the claim record without overstatement. |
| F-3-16 | Fixed: a three-step How it works section is live. |
| F-3-17 | Fixed: limitations section is live and claim-tested. |
| F-3-18 | Fixed: build ID is emitted in footer and metadata. |
| F-3-19 | Fixed: clipboard/image/download errors name a next action. |
| F-3-20 | Fixed: README heading is “Try the event-card demo.” |

## Missed leverage

No missing feature is implied by the brief. The tool already supplies the
valuable adjacent capabilities: calendar-file import, copyable text, image,
PDF, calendar-file export, and date-specific timezone comparison. Calendar
sync, invitations, and AI drafting are not implied by the job and would widen
the local, private handoff tool without improving its core task. No decorative
AI feature or embedded provider credential is present.

## What would make this perfect

No required follow-up remains. Maintain the existing claim registry and repeat
the clean-demo, request-log, route, and copy checks for any future copy or
feature change.
