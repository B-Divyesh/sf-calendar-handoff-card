# Adversarial first-read review 3 — Calendar Handoff Card

**Reviewed:** 2026-08-29  
**Production URL:** <https://calendar-handoff-card.sociobot.in>  
**Repository:** `eedb7a291a4268f40d77e60b4ba8594b83af0541`  
**Verdict:** **FAIL**

The cold first screen now explains the job, audience, and first action. The product still fails this round because the mobile demo click does not put the filled product in the first screen, and three earlier export/privacy findings were closed with tests that do not assert the promised downloaded content. One earlier metaphor also remains. There are additional unlisted claims, copy defects, and skeleton omissions. A PASS requires zero findings.

## Cold first read

Fresh Chromium contexts at 390 × 844 and 1440 × 1000 opened `/` with no prior storage. Nothing was scrolled before this record.

- **What it does:** Creates a shareable event card from calendar details.
- **For whom:** Families and small teams when an invite is hard to open or crosses calendar apps.
- **What to click first:** **“Try it with sample data”** to see a filled event card with local times and sharing options.

The exact first-screen text that answers these questions is **“Create a shareable event card”**, **“For families and small teams when an invite is hard to open or crosses calendar apps.”**, and **“Try it with sample data”** / **“See a filled event card with local times and sharing options.”** This part passes at both sizes.

## Findings

### F-3-1 (reopens F-1-2) — BLOCKING — The demo click does not show the product in the first mobile screen

**Location / exact evidence:** On a fresh 390 × 844 visit, clicking **“Try it with sample data”** opened `/demo`, left `scrollY` at `0`, focused **“Create a shareable event card”**, and showed the same hero and the same demo action. The filled **“Grandma’s birthday lunch”** form, event card, and **“Demo — sample data, nothing is saved”** banner were all below the viewport. The only visible change was the temporary toast **“Sample event loaded.”** The banner is an ordinary block above the builder, not a persistent/sticky demo notice.

**Why this fails:** The first screen after the one-click demo does not already look like the product being used. A phone visitor sees the landing page again and must scroll past the hero art to discover whether the click worked. This only partially closes F-1-2 and violates the demo contract.

**Concrete fix:** Make `/demo` a product-first route: omit or collapse the marketing hero, place a persistent **“Demo — sample data, nothing is saved”** banner at the top, and put the filled event card or filled form in the initial 390 × 844 viewport. Add a test that clicks the landing action and asserts the sample card, event name, and banner intersect the first viewport without scrolling.

### F-3-2 (reopens F-1-11) — BLOCKING — “All entered details” is still not tested for calendar files

**Location / quote:** The ready-state help says **“Plain text and calendar files include all entered details; image and PDF follow the privacy choices above.”** `@claim:text-export` checks all six sample details, but `@claim:ics-download` checks only `SUMMARY:Grandma’s birthday lunch`.

**Why this fails:** A calendar file could omit the place, link, organizer, RSVP, or notes and the declared claim test would still pass. F-1-11 explicitly required all relevant fields to be asserted in both clipboard and calendar-file contents.

**Concrete fix:** Add the exact “all entered details” wording to a claim entry, then assert the downloaded ICS contains the sample title, times, place, URL, organizer, RSVP, and notes. Alternatively replace the UI sentence with the narrower behavior that the test actually proves.

### F-3-3 (reopens F-1-24) — BLOCKING — PNG and PDF claim tests prove filenames, not event cards

**Location / evidence:** `.factory/claims.json` says **“Download image creates a PNG event card”** and **“Download PDF creates a PDF event card.”** The tagged tests only assert `suggestedFilename()`; they do not read either download, assert a PNG/PDF signature, assert non-trivial dimensions/bytes, or confirm sample content.

**Why this fails:** A blank, corrupt, or wrong-format download with the expected suffix passes both tests. F-1-24 required download/content tests, so it remains half-fixed even though both commands exit successfully.

**Concrete fix:** Read each downloaded file in the tagged test. Assert the PNG signature and decoded 1200px card dimensions; assert the PDF signature, page count, and embedded non-empty image. Add a deterministic image-content assertion for the sample card.

### F-3-4 (reopens F-1-25) — BLOCKING — Private image/PDF choices and QR output are not tested in the files

**Location / quote:** **“These details are off by default in image and PDF downloads.”** Controls offer **“Print the joining link”**, **“Print event notes”**, and **“Encode the joining link as a QR.”** `@claim:private-output-options` checks only the HTML preview, never downloads a file, and never selects the QR option.

**Why this fails:** The test does not verify the privacy boundary the copy promises. A PNG/PDF that always leaked the link or notes would still pass. QR behavior is completely untested. This only partially closes F-1-25.

**Concrete fix:** Generate PNG and PDF files with all choices off and assert the private link, note, and QR are absent. Repeat with each choice enabled and assert only that chosen output is present; decode the QR and compare its value with the joining URL.

### F-3-5 (reopens F-1-33) — BLOCKING — An earlier metaphor remains in the empty state

**Location / quote:** Event card empty state: **“The date and time will land here.”**

**Why this fails:** “Land here” is metaphorical and says less directly what will appear. It was flagged as mood/metaphor copy in review 1 and remains in both live production and `index.html`, so F-1-33 was not fully fixed.

**Concrete fix:** Use **“The event date and time will appear here.”**

### F-3-6 — Minor — The offline banner makes an unlisted link-behavior claim

**Location / quote:** **“Your saved page can keep making cards; links just will not open until you reconnect.”**

**Why this fails:** `offline-reload` proves that the filled sample reloads offline. It does not test continued editing/export or the stated link behavior, and no other claim entry lists this sentence.

**Concrete fix:** List the exact behavior and test offline editing plus a blocked joining-link navigation, or narrow the copy to the tested statement **“The saved app and sample still open offline.”**

### F-3-7 — Minor — The privacy page has an unlisted cache-storage claim

**Location / quote:** `/privacy`: **“The offline cache stores the app files and artwork. It does not store event entries.”**

**Why this fails:** No claim entry names Cache Storage contents. Manual inspection found only same-origin app/assets in `handoff-card-v2`, but the required repeatable claim test does not exist.

**Concrete fix:** Add a cache-privacy claim whose test edits the demo, enumerates every Cache Storage request/response, and confirms no event value appears; or remove this implementation promise.

### F-3-8 — Minor — The browser-processing test does not cover calendar import

**Location / quote:** `/privacy`: **“Calendar files are read in your browser. Downloads are created in your browser.”**

**Why this fails:** `local-processing` records requests around plain-text copy and calendar-file download only. `ics-import` exercises import without asserting the request log. PNG and PDF creation are also outside the privacy request-log flow.

**Concrete fix:** Extend `@claim:local-processing` to import the sample calendar text/file and create every download while recording URLs, methods, and bodies.

### F-3-9 — Minor — “Free” is an unlisted product claim

**Location / quote:** `/terms`: **“Calendar Handoff Card is a free tool for making an event card from details or a calendar file.”**

**Why this fails:** The claims registry has no price/paywall entry. “No account” does not prove that every product function is free.

**Concrete fix:** Add a `free-use` claim and a demo test that completes every format without a payment gate, or delete “free.”

### F-3-10 — Minor — The MIT-license sentence is not in the claims registry

**Location / quote:** `/terms`: **“The software is available under the MIT License.”**

**Why this fails:** `LICENSE` is present and is MIT text, but the sentence is still a claim-like statement with no `.factory/claims.json` entry or tagged repository test.

**Concrete fix:** Add a repository claim test that verifies the shipped `LICENSE`, or replace the prose claim with a direct **“Read the license”** link.

### F-3-11 — Minor — The offline heading is mood copy

**Location / quote:** **“Offline, still useful.”**

**Why this fails:** “Useful” is subjective and the heading does not simply name the state. It could appear on any offline product.

**Concrete fix:** Use **“You are offline.”**

### F-3-12 — Minor — Import errors expose unexplained calendar-file internals

**Location / quotes:** **“No VEVENT was found. Paste a complete ICS event or choose another file.”**, **“Paste ICS text first.”**, and **“The ICS file contains an unsupported all-day date.”**

**Why this fails:** `VEVENT` is an implementation token. The product otherwise uses “calendar file,” so these errors make recovery harder and break the terminology rule.

**Concrete fix:** Use **“No event was found. Paste a complete calendar event or choose another calendar file.”**, **“Paste calendar text first.”**, and **“This calendar file has an unsupported all-day date.”** Apply “calendar file/text” to the remaining ICS error strings as well.

### F-3-13 — Minor — One file-size error uses three names for the same thing

**Location / quote:** **“That ICS file is over 2 MB. Choose a smaller calendar export.”**

**Why this fails:** The same object is called an “ICS file,” a “calendar export,” and elsewhere a “calendar file.”

**Concrete fix:** Use **“That calendar file is over 2 MB. Choose a smaller calendar file.”**

### F-3-14 — Minor — Sharing feedback reintroduces “handoff” and unexplained “share sheet”

**Location / quotes:** **“Plain-text handoff copied.”**, **“Use your share sheet”**, **“Handoff sent to your share sheet.”**, and **“That export did not finish.”**

**Why this fails:** The primary object is called an “event card” and the action is “Copy plain text.” “Handoff” is inconsistent; “share sheet” is platform jargon.

**Concrete fix:** Use **“Plain text copied.”**, **“Open your device’s sharing menu”**, **“Event details sent to your sharing menu.”**, and **“That download did not finish.”**

### F-3-15 — Minor — The README overstates claim coverage

**Location / quote:** README: **“Each statement is covered by the listed claim tests.”**

**Why this fails:** F-3-2 through F-3-4 show that the current tagged tests do not cover the full visible statements. F-3-6 through F-3-10 identify live claims with no registry entry.

**Concrete fix:** Remove this sentence until every product claim has a complete tagged test, then use **“Product claims and their tests are listed in `.factory/claims.json`.”**

### F-3-16 — Minor — The standard “How it works” section is absent

**Location / evidence:** The landing page moves from the hero directly into the full builder. There is no **“How it works”** heading or three-step explanation after the product preview.

**Why this fails:** A first-time visitor can infer the sequence only by scanning a long form. The required site skeleton calls for three plain, verb-led steps.

**Concrete fix:** Add **“How it works”** with **“Add or import event details”**, **“Check the local times”**, and **“Copy or download the event card.”** Keep it concise and use the real interface as the illustration.

### F-3-17 — Minor — The landing page does not state what the tool does not do

**Location / evidence:** The trust strip lists privacy, account, and offline facts, but no section says that this card maker does not send invitations or sync calendars.

**Why this fails:** The site-structure contract requires a plain limitations/privacy section. That distinction is material for a calendar tool.

**Concrete fix:** Add a tested limitations section such as **“This makes files and copyable text. It does not send invitations or sync calendars.”**

### F-3-18 — Minor — Footers omit the required version/build identifier

**Location / quote:** Product routes end with **“Built by Param Factory.”** The 404 uses the same attribution. No route displays a version or build ID.

**Why this fails:** The site-structure contract requires a version/build identifier in every footer. Review 2 correctly rejected a stale ID, but removing it without a truthful replacement leaves the structural requirement unmet.

**Concrete fix:** Inject the deployed commit or immutable build ID during `npm run build`, render it on all product/legal/404 footers, and test it against the generated artifact.

### F-3-19 — Minor — Three errors do not give a next action

**Location / quotes:** **“Clipboard permission was denied.”**, **“This browser cannot draw an image card.”**, and **“The card could not be encoded.”**

**Why this fails:** Each message identifies a failure but leaves the visitor to guess how to recover. Error copy must say what to do next.

**Concrete fix:** Use **“Clipboard access was denied. Copy the event details manually or try again after allowing clipboard access.”** and **“This browser could not create the image card. Download the PDF or calendar file instead.”** Use the same alternative-format instruction for encoding failure.

### F-3-20 — Minor — The README heading “Use it” does not name its section out of context

**Location / quote:** README h2: **“Use it”**.

**Why this fails:** A heading list does not reveal that this section opens the sample and explains the event-card sequence.

**Concrete fix:** Rename it **“Try the event-card demo”**.

## Demo and sandbox verification

- Direct `/demo` and `/?demo=1` load the realistic **“Grandma’s birthday lunch”** sample with place, organizer, RSVP, link, notes, and New York/London comparison.
- **Reset demo** restored an edited event name. **Start for real** returned to `/`, cleared the form, removed `demo:calendar-handoff-card`, and hid the banner.
- After editing the sample, storage contained only `sessionStorage["demo:calendar-handoff-card"] = "active"`. `localStorage`, cookies, IndexedDB, and OPFS were empty. Cache Storage contained only same-origin app files and artwork.
- The live demo request log contained same-origin GET requests with no request bodies. No external runtime request was observed.
- The sandbox isolation behavior passes. The first-viewport/persistent-banner failure remains F-3-1.

## Claims verification

The clean clone was `/tmp/calendar-handoff-review3.iBRDQn/repo` at `eedb7a291a4268f40d77e60b4ba8594b83af0541`. `npm ci` completed with zero audit vulnerabilities. Every exact command in `.factory/claims.json` was run separately.

| Claim | Command result | Review result |
| --- | --- | --- |
| `demo-sample` | PASS, desktop + mobile | Behavior passes; first-viewport requirement is not asserted (F-3-1) |
| `no-account` | PASS, desktop + mobile | Covered |
| `local-processing` | PASS, desktop + mobile | Copy/ICS download covered; import/PNG/PDF omitted (F-3-8) |
| `dst-conversion` | PASS, desktop + mobile | Covered |
| `text-export` | PASS, desktop + mobile | Covered |
| `ics-download` | PASS, desktop + mobile | Only title asserted (F-3-2) |
| `image-download` | PASS desktop; expected mobile skip | Only filename asserted (F-3-3) |
| `pdf-download` | PASS desktop; expected mobile skip | Only filename asserted (F-3-3) |
| `private-output-options` | PASS, desktop + mobile | HTML preview only; files/QR omitted (F-3-4) |
| `ics-import` | PASS, desktop + mobile | First-event behavior covered |
| `timezone-equivalents` | PASS, desktop + mobile | Covered |
| `offline-reload` | PASS, desktop + mobile | Reload covered; link statement omitted (F-3-6) |

The full `npm test` also passed: 12 unit tests and 26 browser checks passed; the two duplicate mobile PNG/PDF checks were skipped as configured. Independent live downloads were valid non-empty PNG (`194,951` bytes), PDF (`122,907` bytes), and ICS (`567` bytes), but manual observation does not replace the missing repeatable content assertions.

## Copy audit

Counts treat hyphenated and apostrophe-joined terms as one word. Field labels, placeholders, timezone option names, and user-supplied event content are excluded because they are not sentences. Actions are included and checked separately. No sentence exceeds 22 words and no banned marketing word appears. Flags below map to findings.

### Landing page: static and state copy

| Ref | Words | Exact copy | Result |
| --- | ---: | --- | --- |
| L1 | 3 | Calendar Handoff Card | Product name |
| L2 | 5 | Create a shareable event card | Clear h1 |
| L3 | 16 | For families and small teams when an invite is hard to open or crosses calendar apps. | Clear audience/situation |
| L4 | 5 | Try it with sample data | Result-naming action; presentation fails F-3-1 |
| L5 | 11 | See a filled event card with local times and sharing options. | Clear outcome; not visible after click, F-3-1 |
| L6 | 2 | No account | `no-account` |
| L7 | 6 | Event details stay in your browser | `local-processing`; incomplete flows, F-3-8 |
| L8 | 6 | Works offline after the first visit | `offline-reload` |
| L9 | 3 | Offline, still useful. | Mood/subjective heading, F-3-11 |
| L10 | 15 | Your saved page can keep making cards; links just will not open until you reconnect. | Unlisted claim, F-3-6 |
| L11 | 6 | Demo — sample data, nothing is saved | Demo banner; placement fails F-3-1 |
| L12 | 2 | Reset demo | Clear action |
| L13 | 3 | Start for real | Clear action |
| L14 | 3 | Add event details | Clear heading |
| L15 | 9 | Type the details or import a calendar file (.ics). | Clear instruction |
| L16 | 5 | Processing happens in this browser. | `local-processing`; incomplete flows, F-3-8 |
| L17 | 3 | Import calendar file | Clear action |
| L18 | 3 | Paste calendar text | Clear action |
| L19 | 3 | First event only | `ics-import` |
| L20 | 5 | The timezone the organizer used. | Clear help |
| L21 | 8 | Daylight-saving changes are applied for the event date. | `dst-conversion` |
| L22 | 3 | Event card preview | Clear heading |
| L23 | 4 | Waiting for a name | Clear status |
| L24 | 2 | You’re invited | Useful card label |
| L25 | 6 | Add an event name to start | Useful empty state |
| L26 | 7 | The date and time will land here. | Metaphor, F-3-5 |
| L27 | 3 | Compare local times | Clear heading |
| L28 | 9 | Add a valid date and time to compare timezones. | Useful empty state |
| L29 | 6 | Also show for a recipient in | Clear control label |
| L30 | 4 | Choose a sharing format | Clear heading |
| L31 | 7 | Copy plain text for chat or email. | `text-export` |
| L32 | 7 | Download an image, PDF, or calendar file. | Listed export claims; test gaps F-3-2/F-3-3 |
| L33 | 5 | Private details in image & PDF | Clear options label |
| L34 | 4 | Print the joining link | Clear action |
| L35 | 3 | Print event notes | Clear action |
| L36 | 6 | Encode the joining link as a QR | Clear action; untested file output, F-3-4 |
| L37 | 11 | These details are off by default in image and PDF downloads. | Test does not inspect downloads, F-3-4 |
| L38 | 3 | Copy plain text | Clear action |
| L39 | 4 | For chat or email | Clear result |
| L40 | 2 | Download image | Clear action |
| L41 | 4 | PNG, ready to attach | Concrete format/result |
| L42 | 2 | Download PDF | Clear action |
| L43 | 6 | PDF file for sharing or printing | Concrete format/result |
| L44 | 3 | Download calendar file | Clear action |
| L45 | 7 | ICS file to import into a calendar | Extension has already been introduced |
| L46 | 3 | Share from device | Clear action |
| L47 | 4 | Use your share sheet | Platform jargon, F-3-14 |
| L48 | 6 | Add an event name before sharing. | Useful error |
| L49 | 6 | Event details stay in your browser. | `local-processing`; incomplete flows, F-3-8 |
| L50 | 6 | Make a card without signing in. | `no-account` |
| L51 | 6 | Works offline after the first visit. | `offline-reload` |
| L52 | 11 | Calendar Handoff Card makes event cards from details or calendar files. | Plain footer description |
| L53 | 4 | Built by Param Factory. | Attribution; missing build ID, F-3-18 |
| L54 | 1 | Import | Context label |
| L55 | 3 | Paste calendar text | Clear dialog heading/action |
| L56 | 3 | Calendar event text | Clear label |
| L57 | 1 | Cancel | Conventional dismissal |
| L58 | 3 | Import first event | Clear action |
| L59 | 1 | Ready. | Clear status |
| L60 | 17 | Plain text and calendar files include all entered details; image and PDF follow the privacy choices above. | Incomplete tests, F-3-2/F-3-4 |
| L61 | 14 | A QR code for the joining link will appear in image and PDF downloads. | Untested output, F-3-4 |
| L62 | 3 | Sample event loaded. | Clear status |
| L63 | 2 | Event imported. | Clear status |
| L64 | 7 | Imported the first of 2 events. | `ics-import` sample rendering |
| L65 | 8 | Use a complete http:// or https:// joining link. | Actionable error |
| L66 | 9 | Use a complete link beginning with https:// or http://. | Actionable error |
| L67 | 6 | Enter a complete date and time. | Actionable error |
| L68 | 7 | The end must be after the start. | Actionable error |
| L69 | 3 | Ready to share | Clear status |
| L70 | 3 | Check the details | Clear status |
| L71 | 4 | No time conversion needed | Clear all-day state |
| L72 | 4 | Clipboard permission was denied. | Missing next action, F-3-19 |
| L73 | 3 | Plain-text handoff copied. | Inconsistent term, F-3-14 |
| L74 | 4 | Drawing the image card… | Clear progress |
| L75 | 3 | Image card downloaded. | Clear result |
| L76 | 4 | Composing the PDF card… | Clear progress |
| L77 | 3 | PDF card downloaded. | Clear result |
| L78 | 4 | Calendar file downloaded. | Clear result |
| L79 | 7 | That ICS file is over 2 MB. | Inconsistent term, F-3-13 |
| L80 | 5 | Choose a smaller calendar export. | Inconsistent term, F-3-13 |
| L81 | 7 | The ICS file could not be read. | Use “calendar file,” F-3-12 |
| L82 | 7 | The ICS text could not be read. | Use “calendar text,” F-3-12 |
| L83 | 6 | Handoff sent to your share sheet. | Inconsistent/jargon, F-3-14 |
| L84 | 5 | That export did not finish. | Inconsistent with “download,” F-3-14 |
| L85 | 3 | Try another format. | Actionable recovery |
| L86 | 4 | No VEVENT was found. | Unexplained jargon, F-3-12 |
| L87 | 9 | Paste a complete ICS event or choose another file. | Inconsistent jargon, F-3-12 |
| L88 | 8 | The ICS file contains an unsupported all-day date. | Inconsistent jargon, F-3-12 |
| L89 | 12 | The ICS file uses a date format this tool cannot safely interpret. | Inconsistent jargon, F-3-12 |
| L90 | 4 | Paste ICS text first. | Inconsistent jargon, F-3-12 |
| L91 | 6 | The event has no start date. | Useful error |
| L92 | 11 | No end time was supplied, so a one-hour event was used. | Useful warning |
| L93 | 7 | This browser cannot draw an image card. | Missing next action, F-3-19 |
| L94 | 6 | The card could not be encoded. | Missing next action, F-3-19 |
| L95 | 3 | Unknown timezone: [zone]. | Useful error |
| L96 | 13 | 2026-03-08 at 02:30 does not exist in America/New_York because the clock changes then. | Useful date-specific error |
| L97 | 3 | Choose another time. | Actionable recovery |
| L98 | 11 | The timezone “Example/Zone” is not available here, so UTC was used. | Useful fallback warning |

### README

| Ref | Words | Exact copy | Result |
| --- | ---: | --- | --- |
| R1 | 3 | Calendar Handoff Card | Product heading |
| R2 | 11 | Create a shareable event card from details or a calendar file. | Plain opening |
| R3 | 11 | Copy plain text or download an image, PDF, or calendar file. | Listed export claims; test gaps F-3-2/F-3-3 |
| R4 | 16 | It is for families and small teams when an invite is hard to open or crosses calendar apps. | Clear audience/situation |
| R5 | 2 | Live product | Clear label |
| R6 | 2 | Use it | Context-dependent heading, F-3-20 |
| R7 | 9 | Open the demo to see a filled event card. | Demo claim; presentation gap F-3-1 |
| R8 | 11 | Add event details, check local times, then choose a sharing format. | Clear sequence |
| R9 | 12 | Import the first event from a calendar file (.ics) or calendar text. | `ics-import` |
| R10 | 11 | Add a title, time, place, organizer, RSVP details, link, and notes. | Sample/text coverage; ICS gap F-3-2 |
| R11 | 6 | Compare event, device, and recipient times. | `timezone-equivalents` |
| R12 | 11 | Keep private link and note choices off until you select them. | Listed claim; downloaded-output gap F-3-4 |
| R13 | 6 | The app has no account flow. | `no-account` |
| R14 | 7 | Event details are processed in the browser. | `local-processing`; incomplete flows F-3-8 |
| R15 | 8 | The app works offline after its first visit. | `offline-reload` |
| R16 | 9 | Each statement is covered by the listed claim tests. | False/incomplete, F-3-15 |
| R17 | 1 | Develop | Developer heading |
| R18 | 7 | Node.js 20 or newer is required. | Developer prerequisite |
| R19 | 6 | Build the static deploy output with: | Developer instruction |
| R20 | 12 | The deploy artifact is dist, with dist/index.html at its root. | Developer fact |
| R21 | 21 | The build emits static documents for known routes and Azure Static Web Apps serves the designed 404 response for unknown paths. | Developer deployment fact; locally and live verified |
| R22 | 1 | Test | Developer heading |
| R23 | 15 | This runs unit tests and browser checks in desktop Chromium and a 390px mobile viewport. | Developer instruction; verified |
| R24 | 13 | The browser suite checks accessibility, keyboard access, offline reload, routing, and all claims. | Developer test summary; claim-depth gaps F-3-2/F-3-4 |
| R25 | 13 | Run an individual claim exactly as listed in .factory/claims.json, for example: | Developer instruction |
| R26 | 3 | Privacy and legal | Clear heading |
| R27 | 8 | Read the in-product privacy page and terms page. | Clear instruction |
| R28 | 5 | See LICENSE for reuse terms. | Clear instruction/link |
| R29 | 2 | Product records | Clear heading |
| R30 | 2 | Research brief | Clear link label |
| R31 | 5 | Visual thesis and artwork provenance | Clear link label |
| R32 | 2 | Demo sandbox | Clear link label |
| R33 | 2 | Build handoff | Clear link label |

### Button/action-name check

Result-producing actions use verbs and name their result: **Try it with sample data**, **Reset demo**, **Start for real**, **Import calendar file**, **Paste calendar text**, **Copy plain text**, **Download image**, **Download PDF**, **Download calendar file**, **Share from device**, and **Import first event**. **Cancel** and the close control are conventional dismissals. No action-name finding is raised. F-3-14 concerns supporting jargon, not the action verbs.

## Earlier finding verification

Every earlier review, polish record, verification record, and handoff was read. Production asset hashes exactly match the clean local build (`index-BzF8CRFr.js`, `style-agbfdjU3.css`, and `index.html`), so the live/code comparisons below concern the same artifact.

| Earlier finding | Live and code result |
| --- | --- |
| F-1-1 | Fixed: the cold screen states the job, audience, and first action. |
| F-1-2 | **Half-fixed; reopened as F-3-1:** seed/reset/isolation work, but the first mobile screen after the click is still the landing hero and the banner is not persistent. |
| F-1-3 | Fixed: 12 registry entries and one tagged test per ID exist. Test depth has separate reopened findings. |
| F-1-4 | Fixed: `no-account` passes. |
| F-1-5 | Fixed for the listed copy/download flow; import/export omissions are F-3-8. |
| F-1-6 | Fixed for retained browser-processing copy; broader privacy-route wording is F-3-8. |
| F-1-7 | Fixed: fixed-date DST assertion passes. |
| F-1-8 | Fixed: the absolute “works everywhere” wording is gone; clipboard content is tested. |
| F-1-9 | Fixed: subjective busy-chat wording is gone. |
| F-1-10 | Fixed: the action names a calendar-file download and produces ICS. |
| F-1-11 | **Half-fixed; reopened as F-3-2:** calendar-file content test checks only the title, not all entered details. |
| F-1-12 | Fixed for the current narrower browser-processing statement. |
| F-1-13 | Fixed: offline reload passes in both viewports. |
| F-1-14 | Fixed: the prior travel metaphor is gone. |
| F-1-15 | Fixed at the original footer location. A new unlisted “free” sentence is F-3-9. |
| F-1-16 | Fixed: tracker/analytics promise is removed. |
| F-1-17 | Fixed: README opening is split and plain. |
| F-1-18 | Fixed at the original README location; the required limitations section is separately absent in F-3-17. |
| F-1-19 | Fixed: two-event fixture uses and reports the first event. |
| F-1-20 | Fixed: the sample/text path covers every named input field. |
| F-1-21 | Fixed: technical timezone promise was narrowed; date conversion is tested. |
| F-1-22 | Fixed: event/device/recipient labels are asserted. |
| F-1-23 | Fixed: undefined “accessible” output adjective is gone. |
| F-1-24 | **Half-fixed; reopened as F-3-3:** PNG/PDF tests assert filenames only, not file format/content. |
| F-1-25 | **Half-fixed; reopened as F-3-4:** test inspects HTML instead of PNG/PDF and omits QR. |
| F-1-26 | Fixed: offline reload claim passes. |
| F-1-27 | Fixed for retained wording. Manual live checks confirmed no event content in localStorage, cookies, IndexedDB, OPFS, or Cache Storage. |
| F-1-28 | Fixed: the compound no-cookie/tracker/CDN sentence is gone. |
| F-1-29 | Fixed at the README location: `LICENSE` exists and is linked. The separate terms-page claim is F-3-10. |
| F-1-30 | Fixed: unknown production paths return HTTP 404 and the designed page. |
| F-1-31 | Fixed: titles and complete canonical/OG/Twitter/icon metadata are present per route. |
| F-1-32 | Fixed: consistent header navigation and h1 focus work on navigation, Back, and Forward. |
| F-1-33 | **Half-fixed; reopened as F-3-5:** the recorded “land here” metaphor remains. Other quoted headings/actions were fixed. |
| F-1-34 | Fixed: README sentences stay within the cap and user instructions define the calendar-file extension. |
| F-2-1 | Fixed: `/not-a-real-page` returns HTTP 404 with the designed 404 title/h1. |
| F-2-2 | Fixed: ordinary `/` hides the demo banner and does not set demo storage. |
| F-2-3 | Fixed: direct `/404.html` has external CSS, complete metadata/skeleton, no load error, and no serious/critical Axe violation. |
| F-2-4 | Fixed: Home → Privacy → Back → Forward focuses each destination h1. |
| F-2-5 | Fixed as originally prescribed by removing the stale assertion. The still-required truthful build identifier is a new structural finding, F-3-18. |
| F-2-6 | Fixed: decorative stage labels are gone and the heading is “Compare local times.” |

## Structure, accessibility, links, and visual identity

- `/`, `/demo`, `/privacy`, `/terms`, and the 404 have route-specific plain titles, one h1, one main landmark, descriptions, canonical/OG/Twitter data, favicon, apple icon, and the original social image.
- `/not-a-real-page` returns HTTP 404 and the designed 404 page. `robots.txt` and `sitemap.xml` return the correct content types and list the public routes.
- Browser navigation, Back, and Forward focus the destination h1. Deep links reload correctly.
- Every rendered internal link crawled successfully. The public GitHub source link returned 200. The 404 page’s self-referential skip link naturally retains the current 404 URL and is not a dead destination.
- Live Axe checks on Home, Demo, Privacy, Terms, and direct 404 at mobile and desktop found no serious/critical violations. No horizontal overflow or load console errors occurred. `verify-url.sh` passed the live home page.
- Initial JavaScript is 50,425 bytes and CSS is 17,953 bytes before gzip. No third-party font/script is loaded.
- The warm paper, risograph collage, hard ink shadows, and offset marks remain distinctive and match `.factory/design.md`; this is not a generic SaaS template.
- Standard-skeleton omissions are F-3-16 through F-3-18.

## Missed leverage

No AI finding is raised. Event details are sensitive, and the brief’s deterministic local job does not benefit from sending them to a model. No provider key or AI runtime call exists. The expected import/export leverage is present: calendar text/file import, timezone comparison, plain text, PNG, PDF, QR, calendar file, and device sharing. Calendar sync would conflict with the brief’s handoff-not-migration scope.

## What would make this perfect

Put the filled demo and persistent sandbox banner in the first phone viewport. Replace the filename-only export checks with file/content assertions, test every private option in the actual PNG/PDF including QR, and verify every ICS field. Remove the remaining metaphor and calendar-file jargon. Register or remove every live privacy/free/license/offline claim. Complete the standard landing skeleton and truthful build footer. Then rerun this entire review against production; only zero findings earns PASS.
