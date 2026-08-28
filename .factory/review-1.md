# Adversarial first-read review 1 — Calendar Handoff Card

**Reviewed:** 2026-08-28  
**Production URL:** <https://calendar-handoff-card.sociobot.in>  
**Verdict:** **FAIL**

The static application is visually distinct, responsive, and its current normal-flow tests pass. It is not acceptable as a first-visit product because it has no one-click sample demo, no claims registry or claim tests, and an unknown URL silently becomes the home page. The first screen also does not say who the tool is for and uses slogans in place of the job.

## Cold first read

Fresh Chromium contexts were used at 390 × 844 and 1440 × 1000. The viewport was not scrolled before recording the first impression.

What it appears to do: turn an invite into a card containing a time, place, and joining link.

Who it is for: **not answerable from the first screen.** The brief's families and small teams with incompatible calendars are not named. The screen says only, “Turn an invite into one clear card with the right time, place, and joining link.”

What to click first: “Make a handoff card,” which moves to an empty form. It does not show the product with data or say what the visitor will see next.

This is a blocking first-read failure. The relevant first-screen copy is: “Calendar details, ready to pass on”; “Pass the event. Not the calendar.”; and “Make a handoff card.” None states the audience, and the headline is a slogan rather than the job.

## Findings

### F-1-1 — BLOCKING — First screen does not state the audience or a plain job

**Location / quote:** Landing hero, “Pass the event. Not the calendar.” and “Turn an invite into one clear card with the right time, place, and joining link.”

**Why this fails:** A cold visitor can infer a loose purpose, but cannot tell whether it is for people sharing an event, calendar migration, meeting hosts, or calendar administrators. The h1 is a metaphor and the only primary action leads to a blank form. This fails the required five-second answer to what it does, for whom, and what to do first.

**Concrete fix:** Use an h1 such as **“Create a shareable event card”** and a ≤22-word supporting sentence such as **“For families and small teams when an invite is hard to open or crosses calendar apps.”** Make the primary control **“Try it with sample data”**, next to **“See a filled event card with local times and sharing options.”**

### F-1-2 — BLOCKING — No one-click, isolated sample-data demo

**Location / evidence:** Landing has no “Try it with sample data” action. In a fresh mobile context, `https://calendar-handoff-card.sociobot.in/?demo=1` showed `Add an event name to start` / `WAITING FOR A NAME`; its demo banner, Reset demo button, and Start for real button counts were all zero. Clicking “Make a handoff card” only changed the URL to `?demo=1#builder` and retained the empty card.

**Why this fails:** The required demo path is absent. A visitor must supply real event information before seeing the product work, so the value cannot be checked in one click. There is no persistent statement that sample data is isolated, no reset, and no distinct demo storage namespace to audit. The normal form happened not to use storage in this run, but that is not a demo boundary.

**Concrete fix:** Implement `/demo` or `?demo=1` with a realistic filled event (event name, location, a valid meeting URL, organizer, RSVP, notes, and two useful timezone equivalents) already rendered on entry. Show **“Demo — sample data, nothing is saved”**, **“Reset demo”**, and **“Start for real”** persistently. Restrict demo data to keys prefixed `demo:` (or an equivalent isolated namespace), discard it when leaving demo, document this in `.factory/demo.md`, and add clean-context Playwright tests for seed, reset, storage isolation, and no real-data reads/writes.

### F-1-3 — BLOCKING — Required claims registry and claim tests are absent

**Location / evidence:** `.factory/claims.json` does not exist. `rg '@claim:' . --glob '!node_modules/**'` found no tagged test. Consequently there were no listed claim commands to run from a clean clone.

**Why this fails:** The site and README make feature, privacy, offline, and export promises, yet there is no contract connecting any promise to an observable sandbox test. Passing `npm test` is not a substitute: it ran 12 Vitest tests and 14 applicable Playwright tests, but none was a declared claim test.

**Concrete fix:** Add `.factory/claims.json`; give every claim below exactly one `@claim:<id>` test command that starts from `/demo` in a fresh context. Include request-log evidence for privacy claims and an offline reload test for the offline claim. Do not retain a claim that cannot be demonstrated this way.

### F-1-4 — F-1-29 — Unlisted claims (each is an independent finding)

Each row below is an unlisted claim because the registry in F-1-3 is absent. Add the indicated entry and observable test, or remove/rewrite the sentence so it makes no promise. These findings are separate rather than one generic documentation issue.

| Id | Location and exact claim | Concrete required test / fix |
| --- | --- | --- |
| F-1-4 | Hero: “No account.” | `@claim:no-account`: demo completes without sign-in or account request. |
| F-1-5 | Hero: “Nothing uploaded.” | `@claim:local-processing`: record the whole demo request log; allow same-origin assets only. |
| F-1-6 | Builder: “Everything is processed here in your browser.” | Use the same request-log test and assert an import/export produces no event-data request. |
| F-1-7 | Timezone help: “Daylight-saving changes are applied for the event date.” | `@claim:dst-conversion`: use a fixed DST-crossing demo fixture and assert both displayed local times. |
| F-1-8 | Sharing copy: “Plain text works everywhere.” | Replace the absolute wording with “Copy plain text for chat or email,” then test clipboard contents. “Everywhere” cannot be proven. |
| F-1-9 | Sharing copy: “Image and PDF are easy to spot in busy chats.” | Remove the subjective promise; state the formats, then test PNG/PDF downloads. |
| F-1-10 | Sharing copy: “Calendar download works with most calendar apps.” | Replace with “Download an .ics calendar file,” and test the MIME type and ICS content. Compatibility with “most” apps is untested. |
| F-1-11 | Privacy options: “Plain-text copy and calendar files include all entered details.” | `@claim:text-and-ics-details`: seed all relevant fields and assert clipboard and ICS contents. |
| F-1-12 | Trust strip: “No event data leaves this browser.” | `@claim:no-event-data-network`: inspect every demo-flow request URL, method, and body. |
| F-1-13 | Trust strip: “Works offline.” | `@claim:offline-reload`: first load `/demo`, take the context offline, reload, and assert the filled sample remains usable. |
| F-1-14 | Trust strip: “After the first visit, the tool travels too.” | Remove the metaphor and retain the tested wording “Works offline after the first visit.” |
| F-1-15 | Footer: “Calendar Handoff Card is a free, open-source utility from the Param Factory.” | Either link the source/license and test those links, or reduce to a non-promissory attribution. |
| F-1-16 | Footer: “No tracking pixels or analytics.” | `@claim:no-trackers`: request log must contain only the product origin through the whole demo. |
| F-1-17 | README opening: “Calendar Handoff Card turns event details or an ICS file into a dependable, channel-ready handoff: clear plain text, a compact PNG or PDF, timezone equivalents, joining details, and a universal calendar download.” | Split into independently tested feature claims; remove “dependable,” “channel-ready,” “compact,” and “universal.” |
| F-1-18 | README: “It does not sync calendars, host events, send invitations, or store contacts.” | Test that demo has no auth/sync/network event request and no persisted contact data, or keep only limitations visibly enforced by the UI. |
| F-1-19 | README bullet: “Imports the first `VEVENT` from an ICS file or pasted ICS text.” | `@claim:ics-import`: import a two-event fixture in `/demo`, assert the first event is shown and reported. |
| F-1-20 | README bullet: “Accepts typed event, organizer, RSVP, place, link, and note fields.” | `@claim:event-fields`: seed every named field and assert it contributes to the appropriate output. |
| F-1-21 | README bullet: “Resolves IANA timezones in-browser, applies date-specific daylight-saving rules, and rejects nonexistent DST wall times.” | Split into timezone conversion and nonexistent-wall-time claim tests using fixed fixtures. |
| F-1-22 | README bullet: “Shows the event time alongside the device and a chosen recipient timezone.” | `@claim:timezone-equivalents`: assert the three labelled timezone rows for a known instant. |
| F-1-23 | README bullet: “Copies an accessible plain-text handoff.” | Test clipboard output; remove “accessible” unless a specific accessible-output criterion is defined and tested. |
| F-1-24 | README bullet: “Downloads an illustrated PNG, compact PDF, or standards-based ICS file.” | Split into PNG, PDF, and ICS download/content tests; remove “compact” unless a size limit is stated and measured. |
| F-1-25 | README bullet: “Keeps links, notes, and link QR codes out of PNG/PDF output unless explicitly enabled.” | `@claim:private-output-options`: inspect generated output/fixture for absence by default and presence only after each checkbox. |
| F-1-26 | README bullet: “Works offline after the first successful visit.” | Use the offline-reload test in F-1-13. |
| F-1-27 | README: “No event data is sent to a server or written to local storage.” | Test request bodies plus localStorage, sessionStorage, IndexedDB, OPFS, and cookies during the `/demo` flow. |
| F-1-28 | README: “There are no accounts, cookies, trackers, analytics, third-party fonts, or runtime CDNs.” | Split into testable privacy/resource assertions; record resource URLs, cookies, and visible account flow. |
| F-1-29 | README: “The project is MIT licensed.” | Link `LICENSE` and add a repository check that asserts an MIT license file exists. |

### F-1-30 — BLOCKING — Unknown routes are the landing page, not a designed 404

**Location / evidence:** `GET /not-a-real-page` returned `200 text/html`, the home title, and the home h1 “Pass the event. Not the calendar.” `/sitemap.xml` also returned this same HTML instead of a sitemap. The repository has no 404 route/page and no sitemap file.

**Why this fails:** A bad shared URL gives no explanation or way back from a 404 state; it silently presents an unrelated empty tool. This is broken routing under the site-structure contract. Search engines also cannot consume the required route list.

**Concrete fix:** Add a designed `/404.html` with a clear “Page not found” h1 and Home/Demo links. Configure `responseOverrides.404` to serve it with a 404 status, retain navigation fallback only for recognised SPA routes, and add a real `sitemap.xml` listing `/`, `/demo`, `/privacy`, and `/terms`. Test direct load, reload, and unknown-route status/content.

### F-1-31 — Metadata is incomplete and the home title is a slogan

**Location / evidence:** Home title is “Calendar Handoff Card — pass the event, not the calendar.” It is not a plain description of what the product does. `index.html` has a meta description and SVG favicon, but no canonical link, Open Graph tags, Twitter card tags, apple-touch icon, or social image. Production `/apple-touch-icon.png` and `/og-image.png` returned 404.

**Why this fails:** Shared links and search results lack the required product-specific preview, and the title repeats the first-read slogan rather than a concrete use.

**Concrete fix:** Set the home title to **“Calendar Handoff Card — create a shareable event card”** (or equivalent ≤60-character plain wording); retain route-specific legal titles; add canonical, OG, Twitter, 1200×630 original product art, and 180px apple-touch metadata/assets. Add a metadata test for all routes.

### F-1-32 — Header/routing accessibility contract is incomplete

**Location / evidence:** The home and legal headers contain only the wordmark and “Stays on this device”; Privacy and Terms live only in the footer. On a live mobile click of Privacy, `document.activeElement` was `BODY`, not the new h1. Going back likewise left focus on `BODY`.

**Why this fails:** The required consistent header navigation is absent and route changes are not announced/focused for keyboard and screen-reader users.

**Concrete fix:** Put a consistent header nav on every route with Home, Demo, Privacy, and Terms (or the allowed subset). On navigation/back-forward, set focus to the route h1 and announce it in a polite live region. Test the focus result and history restoration.

### F-1-33 — Copy uses non-informative headings, slogans, and a misleading export button

**Location / quote:** “Calendar details, ready to pass on”; “Pass the event. Not the calendar.”; “What are you handing over?”; “The handoff”; “Same moment, clear labels”; “Choose the channel, not another platform.”; “Local by design”; and button “Add to calendar” with sublabel “Universal .ics download.”

**Why this fails:** These do not name their sections out of context. The button downloads a file; it does not add an event to a calendar. “Universal” is both jargon/marketing and an unsupported compatibility promise.

**Concrete fix:** Use “Create a shareable event card,” “Add event details,” “Event card preview,” “Timezone comparison,” “Choose a sharing format,” and “Privacy.” Rename the button **“Download calendar file”** and label it **“ICS file to import into a calendar.”**

### F-1-34 — README opening and test description exceed the 22-word hard cap; terminology remains too technical for a first read

**Location / quote:** README opening is 32 words: “Calendar Handoff Card turns event details or an ICS file into a dependable, channel-ready handoff: clear plain text, a compact PNG or PDF, timezone equivalents, joining details, and a universal calendar download.” The test sentence is 23 words: “This runs Vitest unit coverage for timezone/ICS/output logic, then Playwright journeys in desktop Chromium and a 390 px mobile Chromium viewport.” README also uses unexplained `VEVENT`, IANA, DST, and ICS in its user-facing summary.

**Why this fails:** The opening makes several promises at once, uses marketing adjectives, and requires calendar/developer vocabulary before explaining the job.

**Concrete fix:** Replace the opening with two plain sentences, for example: **“Create a shareable event card from details or a calendar file. Copy plain text or download an image, PDF, or calendar file.”** Define ICS once as “calendar file (.ics)”; move `VEVENT`, IANA, DST, Vitest, and Playwright details under a developer/testing subsection.

## Copy audit

The tables list every prose sentence or sentence-like fragment on the landing page and README. UI field labels, timezone-option names, and code blocks are not sentences; buttons are checked separately below. Word counts treat hyphenated words as one word. Flags: **M** = metaphor/mood or non-informative heading; **J** = unexplained jargon; **A** = marketing adjective/absolute; **C** = claim needing the registry; **>22** = hard-cap failure.

### Landing page

| Ref | Words | Copy | Flags |
| --- | ---: | --- | --- |
| L1 | 4 | Stays on this device | C |
| L2 | 6 | Calendar details, ready to pass on | M |
| L3 | 3 | Pass the event | M |
| L4 | 3 | Not the calendar | M |
| L5 | 15 | Turn an invite into one clear card with the right time, place, and joining link | — |
| L6 | 2 | No account | C |
| L7 | 2 | Nothing uploaded | C |
| L8 | 5 | What are you handing over | M |
| L9 | 9 | Type the essentials or bring in an ICS file | J |
| L10 | 7 | Everything is processed here in your browser | C |
| L11 | 3 | First event only | — |
| L12 | 5 | The timezone the organizer used | — |
| L13 | 8 | Daylight-saving changes are applied for the event date | C |
| L14 | 7 | The date and time will land here | M |
| L15 | 4 | Same moment, clear labels | M |
| L16 | 9 | Add a valid date and time to compare timezones | — |
| L17 | 6 | Choose the channel, not another platform | M |
| L18 | 4 | Plain text works everywhere | A, C |
| L19 | 10 | Image and PDF are easy to spot in busy chats | A, C |
| L20 | 7 | Calendar download works with most calendar apps | A, C |
| L21 | 3 | Off by default | C |
| L22 | 9 | Plain-text copy and calendar files include all entered details | C |
| L23 | 6 | Best for any chat or email | A |
| L24 | 4 | PNG, ready to attach | — |
| L25 | 4 | Compact, easy to print | A |
| L26 | 3 | Universal .ics download | A, J |
| L27 | 9 | Add an event name and valid time before exporting | — |
| L28 | 6 | No event data leaves this browser | C |
| L29 | 7 | Open it, make the card, move on | M |
| L30 | 8 | After the first visit, the tool travels too | M, C |
| L31 | 12 | Calendar Handoff Card is a free, open-source utility from the Param Factory | C |
| L32 | 11 | The paper-collage artwork was generated for this product with Azure OpenAI | — |
| L33 | 5 | No tracking pixels or analytics | C |

Buttons use verbs except the inaccurate **“Add to calendar”**; replace it as specified in F-1-33. “Make a handoff card” names an outcome but is the wrong primary action because it does not create or show an immediately usable sample.

### README

| Ref | Words | Copy | Flags |
| --- | ---: | --- | --- |
| R1 | 32 | Calendar Handoff Card turns event details or an ICS file into a dependable, channel-ready handoff: clear plain text, a compact PNG or PDF, timezone equivalents, joining details, and a universal calendar download | >22, J, A, C |
| R2 | 18 | It is for families and small teams whose recipients use different calendar systems—or missed the original invitation | — |
| R3 | 12 | It does not sync calendars, host events, send invitations, or store contacts | C |
| R4 | 12 | Imports the first VEVENT from an ICS file or pasted ICS text | J, C |
| R5 | 10 | Accepts typed event, organizer, RSVP, place, link, and note fields | C |
| R6 | 14 | Resolves IANA timezones in-browser, applies date-specific daylight-saving rules, and rejects nonexistent DST wall times | J, C |
| R7 | 12 | Shows the event time alongside the device and a chosen recipient timezone | C |
| R8 | 5 | Copies an accessible plain-text handoff | C |
| R9 | 10 | Downloads an illustrated PNG, compact PDF, or standards-based ICS file | J, A, C |
| R10 | 15 | Keeps links, notes, and link QR codes out of PNG/PDF output unless explicitly enabled | J, C |
| R11 | 7 | Works offline after the first successful visit | C |
| R12 | 13 | No event data is sent to a server or written to local storage | C |
| R13 | 12 | There are no accounts, cookies, trackers, analytics, third-party fonts, or runtime CDNs | J, C |
| R14 | 6 | Requires Node.js 20 or newer | — |
| R15 | 5 | Vite prints the local URL | J (appropriate in developer section) |
| R16 | 5 | Production output is reproducible with | — |
| R17 | 13 | The exact deploy artifact is dist, with dist/index.html at its root | J (appropriate in developer section) |
| R18 | 17 | staticwebapp.config.json supplies the Azure Static Web Apps navigation fallback, security headers, and immutable asset caching | J (appropriate in developer section) |
| R19 | 23 | This runs Vitest unit coverage for timezone/ICS/output logic, then Playwright journeys in desktop Chromium and a 390 px mobile Chromium viewport | >22, J |
| R20 | 16 | The browser suite includes Axe serious/critical checks, keyboard navigation, offline editing, imports, and file downloads | J (appropriate in test section) |
| R21 | 13 | Playwright is pinned to 1.58.2 as required by the build environment | J (appropriate in test section) |
| R22 | 11 | The in-product privacy page explains local processing and the service-worker cache | — |
| R23 | 7 | The terms page explains the tool’s limits | — |
| R24 | 5 | The project is MIT licensed | C |
| R25 | 19 | The original hero artwork source and generation metadata are in assets/src; optimized runtime assets are in public/assets | J (appropriate in design-record section) |

Terminology is inconsistent where it matters: the product calls the object a “card,” “handoff,” “handoff card,” “calendar download,” “calendar file,” and “ICS file.” Use **event card** for the shareable object and **calendar file (.ics)** for the downloadable calendar format; introduce “ICS” only after that definition.

## Demo, privacy, and storage checks

- `/demo` is not implemented. `?demo=1` is ignored by application state and contains no sample event, demo notice, reset, or exit.
- The normal live form used no localStorage, sessionStorage, or cookies while an event name was entered. This is positive normal-flow evidence only; it does not prove the required demo isolation.
- A fresh mobile and desktop request log contained only same-origin HTML, JS, CSS, and hero image resources. There were no console/page errors. This is positive evidence for the observed initial load, but cannot validate the unregistered “nothing uploaded,” “no tracking,” or whole-flow privacy claims.
- The service worker/offline claim was not accepted as verified: no sandbox demo exists and no `@claim:offline-*` test exists.

## History check

There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` files in the repository. `.factory/verification-1.md` and the previous handoff say “PASS” / “No product defects,” but list no finding IDs to re-check. This review independently confirms that the demo, claims registry, metadata, and 404 requirements were not actually present in the shipped source or live site.

## Structure, links, and visual check

- Positive: both fresh viewports loaded with one h1 and one main; no console errors were observed. Privacy and Terms deep links returned 200 with their route titles. The risograph paper treatment is product-specific rather than a generic SaaS template.
- Failing: the home title is slogan copy; canonical/OG/Twitter/apple-touch metadata are missing; `/sitemap.xml` is fallback HTML; and the 404 behavior is absent (F-1-30/F-1-31).
- Failing: legal links are only in the footer and navigation/back leaves focus on body (F-1-32).
- Link crawl: internal `/`, `/privacy`, and `/terms` loaded successfully. The external Source URL is a GitHub repository link. No internal dead link was found, but the fake-route behavior remains a routing failure.

## Verification run

From this checkout after `npm ci`:

```sh
npm test
npm run build
```

- `npm test`: passed — 12 Vitest tests; 14 Playwright tests passed; 2 intended project skips.
- `npm run build`: passed and produced `dist/`.
- No `.factory/claims.json` exists, so there were zero declared claim commands to execute. This is the blocking failure in F-1-3, not a pass.

## Missed leverage

No separate AI, sync, or import/export finding is raised. The brief explicitly asks for a local, copyable handoff rather than calendar sync, and the product already offers typed/ICS import plus plain text, image, PDF, and ICS output. An AI feature would not improve the stated job enough to justify sending sensitive event details externally.

## What would make this perfect

Ship the filled, resettable, storage-isolated demo first; make every retained promise a clean-context claim test; replace the hero and headings with plain job/audience copy; then finish the 404, sitemap, metadata, header navigation, and route-focus contract. At that point, re-run this complete cold-read checklist against production rather than relying on the current normal-flow suite.
