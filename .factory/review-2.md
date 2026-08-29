# Adversarial first-read review 2 — Calendar Handoff Card

**Reviewed:** 2026-08-29  
**Production URL:** <https://calendar-handoff-card.sociobot.in>  
**Repository reviewed:** `61ae1a97682edc33ba64cd7caba3aa5f6df795d5`  
**Verdict:** **FAIL**

The central job, audience, and sample action are clear on a cold mobile and desktop visit. The product is not ready to pass because ordinary home visits display a false, non-working demo banner; unknown URLs do not reach the 404 page; the direct 404 logs a CSP error; and browser Back does not put focus on the destination heading. These are live, reproducible failures, not documentation-only issues.

## Cold first read

Fresh Chromium contexts at 390 × 844 and 1440 × 1000 were opened at `/` before scrolling.

- **What it does:** Creates a shareable event card from calendar details.
- **For whom:** Families and small teams when an invite is hard to open or crosses calendar apps.
- **What to click first:** **“Try it with sample data”** to see a filled card with local times and sharing options.

The first screen answers all three questions. Its relevant copy is: **“Create a shareable event card”**, **“For families and small teams when an invite is hard to open or crosses calendar apps.”**, and **“Try it with sample data”** / **“See a filled event card with local times and sharing options.”** This check passes.

## Findings

### F-2-1 (reopens F-1-30) — BLOCKING — Unknown URLs serve the home page, not a 404

**Location / exact evidence:** `GET https://calendar-handoff-card.sociobot.in/not-a-real-page` returned **200** `text/html`. Chromium rendered title **“Calendar Handoff Card — create an event card”** and h1 **“Create a shareable event card”**. It did not render the `404.html` title or h1.

**Why this fails:** A mistyped or stale shared link silently opens an unrelated card maker. This is broken routing and reopens the earlier 404 finding. `staticwebapp.config.json` rewrites every non-asset request to `/index.html` before the 404 response override can apply.

**Concrete fix:** Restrict navigation fallback to the known SPA routes, or route unknown paths to `/404.html` with status 404 at the hosting layer. Add a live/deployed browser-and-HTTP test that asserts an unknown path returns status 404, title **“Page not found — Calendar Handoff Card”**, h1 **“Page not found”**, and a way home.

### F-2-2 — BLOCKING — The ordinary home page shows a false, non-working demo banner

**Location / exact quote:** On a fresh visit to `/`, the visually rendered banner says **“Demo — sample data, nothing is saved”** with **“Reset demo”** and **“Start for real”**. The empty builder and empty card are also shown.

**Evidence:** In a fresh context, `#demo-banner.hidden` was `true` but computed `display` was `flex` because the `.demo-banner { display: flex }` rule overrides the browser’s `[hidden]` rule. `sessionStorage` was empty. After entering **“Actual event”** in the normal form and clicking **“Reset demo”**, the value remained **“Actual event”** because the reset handler is registered only when `isDemo` is true.

**Why this fails:** A real-data visitor is told they are in an isolated sample when they are not, and a visible reset control does nothing. This makes the privacy/sandbox state dishonest and weakens the one-click demo contract. The existing `@claim:demo-sample` test exercises `/demo` only, so it misses this ordinary-home regression.

**Concrete fix:** Make the HTML `hidden` state win (for example, add `[hidden] { display: none !important; }` or avoid assigning `display` to the hidden element). Render and wire the banner only in demo mode. Add a clean-context test for `/` that asserts the banner is not visible, no `demo:` storage key exists, and normal form values are unaffected by the absent reset control.

### F-2-3 — BLOCKING — The deployed 404 page logs a CSP error and lacks required route metadata/skeleton

**Location / exact evidence:** Directly opening `/404.html` returned 200 and emitted this console error:

> Applying inline style violates the following Content Security Policy directive `style-src 'self'` … The action has been blocked.

The direct 404 has no canonical link, Open Graph metadata, Twitter metadata, or apple-touch icon. Its footer is only **“Calendar Handoff Card makes event cards from details or calendar files.”**; it omits Privacy, Terms, Param Factory attribution, and a build identifier.

**Why this fails:** The designed 404 is visibly unstyled under the production security policy and violates the no-console-errors gate. It also is not the required consistent route skeleton.

**Concrete fix:** Move the 404 stylesheet into a same-origin CSS file permitted by the existing CSP (or use a CSP hash for the exact inline style), then test `/404.html` for zero console errors. Add canonical/OG/Twitter/apple metadata and the standard footer/skip-link treatment, or explicitly provide an equivalent accessible static 404 shell.

### F-2-4 (reopens F-1-32) — BLOCKING — Browser Back does not focus the destination heading

**Location / evidence:** In a fresh mobile context, Privacy navigation correctly focused its h1. After `page.goBack()` to the prior home/history entry, `document.activeElement` was not the page h1. The route in that journey was `/not-a-real-page`, which currently renders the home page because of F-2-1; the same root initializer only calls `focusRouteHeading()` for demo mode.

**Why this fails:** Keyboard and screen-reader users lose their place when using Back. The earlier finding required focus on navigation **and back/forward**; the implementation fixes the legal forward navigation but not the home destination.

**Concrete fix:** On `pageshow`/`popstate` and every rendered route, move focus to the destination h1 (without changing scroll position) and update the polite route announcer. Add an end-to-end test: Home → Privacy → browser Back → home h1 focused; repeat for Forward and for `/demo`.

### F-2-5 — Minor — Footer provenance/build wording is an unlisted claim and the build identifier is stale

**Location / exact quote:** Landing footer: **“Original paper-collage artwork was generated for this product. Built by Param Factory · build 468dc17.”**

**Why this fails:** Neither statement has a `.factory/claims.json` entry or sandbox test. More importantly, `468dc17` is the review-document commit, not the current reviewed repository commit `61ae1a9`; a visitor cannot rely on it as a build identifier.

**Concrete fix:** Delete the runtime provenance/build assertion, or generate the actual deployed commit/build identifier during the build and add a test that compares it with the generated artifact. Keep detailed artwork provenance in `.factory/design.md`, where it is auditable.

### F-2-6 — Minor — Decorative stage labels and “Time check” do not name their content clearly

**Location / exact quotes:** **“01 / SOURCE”**, **“02 / CHECK”**, **“03 / PASS IT ON”**, and h3 **“Time check”**.

**Why this fails:** These labels add factory-style mood rather than useful first-read information. “Time check” does not identify the section as local-time conversion when read in a heading list. This conflicts with the plain-words requirement that headings name their section out of context.

**Concrete fix:** Remove the three decorative stage labels. Rename **“Time check”** to **“Compare local times”** and keep the existing explanatory sentence only if it adds information beyond the heading.

## Demo and sandbox check

`/demo` itself passes the required happy path in a fresh 390 px context:

- It immediately renders the realistic **“Grandma’s birthday lunch”** event, place, organizer, RSVP, date, and New York/London times.
- The banner is visible there and says **“Demo — sample data, nothing is saved.”**
- Reset restored an edited title to the sample.
- Start for real returned to an empty root form and cleared `demo:calendar-handoff-card`.
- Demo storage held only `sessionStorage["demo:calendar-handoff-card"] = "active"`; localStorage was empty.
- The complete observed demo flow made GET-only same-origin requests.

The normal-home regression in F-2-2 means the demo boundary is not presented honestly outside `/demo`.

## Claims check

`.factory/claims.json` exists and declares 12 claims. From a fresh local clone at the reviewed SHA, `npm ci` completed successfully and every exact listed command passed:

| Claim id | Result |
| --- | --- |
| `demo-sample` | PASS — 2 browser projects |
| `no-account` | PASS — 2 browser projects |
| `local-processing` | PASS — 2 browser projects |
| `dst-conversion` | PASS — 2 browser projects |
| `text-export` | PASS — 2 browser projects |
| `ics-download` | PASS — 2 browser projects |
| `image-download` | PASS — 1 browser project; mobile intentionally skipped |
| `pdf-download` | PASS — 1 browser project; mobile intentionally skipped |
| `private-output-options` | PASS — 2 browser projects |
| `ics-import` | PASS — 2 browser projects |
| `timezone-equivalents` | PASS — 2 browser projects |
| `offline-reload` | PASS — 2 browser projects |

`npm run test:unit` also passed (12 tests), and `npm run build` passed. The production request log for `/` and `/demo` showed only same-origin document, script, stylesheet, and image requests. The unlisted footer claims are recorded as F-2-5.

## Copy audit

Word counts treat a hyphenated or apostrophe-joined word as one word. This lists all visitor-facing sentence or sentence-like landing/README copy; form field labels and button names are assessed separately. No entry exceeds 22 words. `F-2-5` and `F-2-6` are the only flags found in this audit; claims already represented in `claims.json` are not flagged again.

### Landing page

| Ref | Words | Copy | Flag |
| --- | ---: | --- | --- |
| L1 | 3 | Calendar Handoff Card | — |
| L2 | 5 | Create a shareable event card | — |
| L3 | 16 | For families and small teams when an invite is hard to open or crosses calendar apps. | — |
| L4 | 11 | See a filled event card with local times and sharing options. | — |
| L5 | 2 | No account | Tested claim |
| L6 | 6 | Event details stay in your browser | Tested claim |
| L7 | 6 | Works offline after the first visit | Tested claim |
| L8 | 6 | Demo — sample data, nothing is saved | F-2-2 on `/` |
| L9 | 2 | 01 / Source | F-2-6 |
| L10 | 3 | Add event details | — |
| L11 | 9 | Type the details or import a calendar file (.ics). | — |
| L12 | 5 | Processing happens in this browser. | Tested claim |
| L13 | 3 | First event only | Tested claim |
| L14 | 5 | The timezone the organizer used. | — |
| L15 | 8 | Daylight-saving changes are applied for the event date. | Tested claim |
| L16 | 2 | 02 / Check | F-2-6 |
| L17 | 3 | Event card preview | — |
| L18 | 2 | You’re invited | — |
| L19 | 6 | Add an event name to start | — |
| L20 | 7 | The date and time will land here. | — |
| L21 | 2 | Time check | F-2-6 |
| L22 | 3 | Compare local times | — |
| L23 | 9 | Add a valid date and time to compare timezones. | — |
| L24 | 4 | 03 / Pass it on | F-2-6 |
| L25 | 4 | Choose a sharing format | — |
| L26 | 7 | Copy plain text for chat or email. | Tested claim |
| L27 | 7 | Download an image, PDF, or calendar file. | Tested claims |
| L28 | 5 | Private details in image & PDF | — |
| L29 | 11 | These details are off by default in image and PDF downloads. | Tested claim |
| L30 | 4 | For chat or email | — |
| L31 | 4 | PNG, ready to attach | — |
| L32 | 6 | PDF file for sharing or printing | — |
| L33 | 7 | ICS file to import into a calendar | — |
| L34 | 4 | Use your share sheet | — |
| L35 | 9 | Add an event name and valid time before exporting. | — |
| L36 | 6 | Event details stay in your browser. | Tested claim |
| L37 | 6 | Make a card without signing in. | Tested claim |
| L38 | 6 | Works offline after the first visit. | Tested claim |
| L39 | 11 | Calendar Handoff Card makes event cards from details or calendar files. | — |
| L40 | 8 | Original paper-collage artwork was generated for this product. | F-2-5 |
| L41 | 6 | Built by Param Factory · build 468dc17. | F-2-5 |
| L42 | 1 | Import | — |
| L43 | 3 | Paste calendar text | — |

### README

| Ref | Words | Copy | Flag |
| --- | ---: | --- | --- |
| R1 | 3 | Calendar Handoff Card | — |
| R2 | 11 | Create a shareable event card from details or a calendar file. | — |
| R3 | 11 | Copy plain text or download an image, PDF, or calendar file. | Tested claims |
| R4 | 16 | It is for families and small teams when an invite is hard to open or crosses calendar apps. | — |
| R5 | 2 | Live product | — |
| R6 | 2 | Use it | — |
| R7 | 9 | Open the demo to see a filled event card. | Tested claim |
| R8 | 11 | Add event details, check local times, then choose a sharing format. | — |
| R9 | 12 | Import the first event from a calendar file (.ics) or calendar text. | Tested claim |
| R10 | 11 | Add a title, time, place, organizer, RSVP details, link, and notes. | Covered by sample/export test |
| R11 | 6 | Compare event, device, and recipient times. | Tested claim |
| R12 | 11 | Keep private link and note choices off until you select them. | Tested claim |
| R13 | 6 | The app has no account flow. | Tested claim |
| R14 | 7 | Event details are processed in the browser. | Tested claim |
| R15 | 8 | The app works offline after its first visit. | Tested claim |
| R16 | 9 | Each statement is covered by the listed claim tests. | — |
| R17 | 1 | Develop | Developer heading |
| R18 | 7 | Node.js 20 or newer is required. | Developer context |
| R19 | 6 | Build the static deploy output with: | Developer context |
| R20 | 12 | The deploy artifact is dist, with dist/index.html at its root. | Developer context |
| R21 | 17 | Azure Static Web Apps uses staticwebapp.config.json for fallback, headers, caches, and the designed 404 response. | Developer context; live 404 assertion is false, see F-2-1/F-2-3 |
| R22 | 1 | Test | Developer heading |
| R23 | 15 | This runs unit tests and browser checks in desktop Chromium and a 390px mobile viewport. | Developer context |
| R24 | 13 | The browser suite checks accessibility, keyboard access, offline reload, routing, and all claims. | Developer context |
| R25 | 13 | Run an individual claim exactly as listed in .factory/claims.json, for example: | Developer context |
| R26 | 3 | Privacy and legal | — |
| R27 | 8 | Read the in-product privacy page and terms page. | — |
| R28 | 5 | See LICENSE for reuse terms. | — |
| R29 | 2 | Product records | — |
| R30 | 2 | Research brief | — |
| R31 | 5 | Visual thesis and artwork provenance | — |
| R32 | 2 | Demo sandbox | — |
| R33 | 2 | Build handoff | — |

### Action-name check

All result-producing controls use named verbs: **Try it with sample data**, **Reset demo**, **Start for real**, **Import calendar file**, **Paste calendar text**, **Copy plain text**, **Download image**, **Download PDF**, **Download calendar file**, **Share from device**, and **Import first event**. **Cancel** and the labelled close control are conventional dismissal controls. F-2-2 is a behavior failure of the visible Reset control on `/`, not a naming failure.

## Structure, accessibility, links, and leverage

- Home, Demo, Privacy, and Terms have route-specific titles; the live home title, description, canonical, OG/Twitter data, favicon, social image, robots, sitemap, and apple icon are present.
- Home and Demo have one h1, a main landmark, visible keyboard focus styling, and no serious/critical Axe violations at 390 px or desktop. No home/demo console errors were seen.
- All rendered internal links on `/`, `/demo`, `/privacy`, `/terms`, and `/404.html` resolved successfully; the external Source link returned 200. The unknown-route and direct-404 failures remain F-2-1 and F-2-3.
- The risograph paper-collage art, hard ink shadows, and warm-paper palette are distinct and match `.factory/design.md`; this is not a generic SaaS template.
- The brief already implies the valuable import/export and timezone features, and they are present. It does not imply an AI-assisted task; no decorative AI feature or embedded provider key was found.

## Earlier-review verification

Every earlier review/polish/handoff record was read. Status below is based on the current live site and current code, not on the prior “fixed” annotation.

| Earlier finding | Current status |
| --- | --- |
| F-1-1 | Fixed: cold first screen states job, audience, and sample action. |
| F-1-2 | Fixed at `/demo`: seeded sample, banner, reset, exit, isolated `demo:` storage. New ordinary-home banner defect is F-2-2. |
| F-1-3 | Fixed: registry and 12 tagged claim tests exist. |
| F-1-4 | Fixed: no-account claim test passes. |
| F-1-5 | Fixed: local-processing request-log claim test passes. |
| F-1-6 | Fixed: browser-processing copy is covered by local-processing test. |
| F-1-7 | Fixed: DST conversion test passes. |
| F-1-8 | Fixed: absolute wording removed; text-export test passes. |
| F-1-9 | Fixed: subjective image/PDF wording removed; download tests pass. |
| F-1-10 | Fixed: control says Download calendar file; ICS test passes. |
| F-1-11 | Fixed: export content is covered by text/ICS tests. |
| F-1-12 | Fixed: retained local-processing statement is tested. |
| F-1-13 | Fixed: offline-reload claim test passes. |
| F-1-14 | Fixed: prior metaphor removed. |
| F-1-15 | Fixed: footer source link resolves. |
| F-1-16 | Fixed: tracker statement removed; retained network claim tested. |
| F-1-17 | Fixed: README opening is plain and under 22 words per sentence. |
| F-1-18 | Fixed: unsupported limitation list removed. |
| F-1-19 | Fixed: first-event import claim test passes. |
| F-1-20 | Fixed: sample/text export covers named fields. |
| F-1-21 | Fixed: technical README wording removed; DST behavior tested. |
| F-1-22 | Fixed: labelled timezone-equivalents test passes. |
| F-1-23 | Fixed: undefined accessible-export adjective removed. |
| F-1-24 | Fixed: PNG, PDF, and ICS have separate passing tests. |
| F-1-25 | Fixed: private-output-options test passes. |
| F-1-26 | Fixed: offline-reload test passes. |
| F-1-27 | Fixed: retained browser-processing statement is request-log tested. |
| F-1-28 | Fixed: untestable compound resource claim removed. |
| F-1-29 | Fixed: LICENSE is linked and present. |
| F-1-30 | **Unfixed/reopened as F-2-1:** unknown live route returns home with HTTP 200. |
| F-1-31 | Fixed on product routes: metadata and assets are live. Direct 404 metadata is separately incomplete in F-2-3. |
| F-1-32 | **Partially fixed/reopened as F-2-4:** header exists and forward legal navigation focuses h1; Back does not. |
| F-1-33 | Fixed for the originally quoted slogans/headings and calendar-download button. New decorative labels are F-2-6. |
| F-1-34 | Fixed: README visitor copy is below the cap and calendar file is defined plainly. |

## What would make this perfect

Serve a real styled 404 for unknown URLs with no console errors, hide and scope the demo banner strictly to demo mode, restore h1 focus on Back/Forward, remove the stale footer assertion and decorative stage labels, then add deployed-route regression coverage for each repaired behavior. After those checks pass against production, the product would have no outstanding first-read, sandbox, routing, or copy findings.
