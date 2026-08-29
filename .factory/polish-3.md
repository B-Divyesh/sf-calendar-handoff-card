# Polish 3 — cumulative finding closure

This record closes every finding in `.factory/review-1.md`, `.factory/review-2.md`, and `.factory/review-3.md`. Every `@claim:` command below was run separately from a clean clone; `npm test` and `npm run build` also passed there. Local visual evidence is under the ignored `.factory/evidence/polish-3-*` directory. Production was cold-checked after deployment of build `b762510` at <https://calendar-handoff-card.sociobot.in>.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the verb-first job headline, audience, and one-click sample action. | `@claim:demo-sample`; `home-mobile.png`; live `/` |
| F-1-2 | Made `?demo=1` and `/demo` isolated, filled, resettable demos with a persistent banner and product-first mobile layout. | `@claim:demo-sample`; `demo-mobile.png`; live `/?demo=1` |
| F-1-3 | Added the registry and an exact tagged observable test for every claim. | `.factory/claims.json`; clean-clone claim run |
| F-1-4 | Retained the no-account fact and tested no sign-in surface. | `@claim:no-account`; live `/?demo=1` |
| F-1-5 | Recorded requests through import and all exports; only allowed same-origin app requests occur. | `@claim:local-processing`; live `/?demo=1` |
| F-1-6 | Kept browser-processing copy and extended its evidence to calendar import, copy, PNG, PDF, and calendar-file output. | `@claim:local-processing`; live `/` |
| F-1-7 | Uses a fixed DST fixture and asserts displayed local times. | `@claim:dst-conversion`; live `/?demo=1` |
| F-1-8 | Uses concrete chat/email text-copy wording and checks clipboard content. | `@claim:text-export`; live `/?demo=1` |
| F-1-9 | Removed subjective image/PDF copy; validates actual output files. | `@claim:image-download`, `@claim:pdf-download`; live `/?demo=1` |
| F-1-10 | Names and generates a calendar file. | `@claim:ics-download`; live `/?demo=1` |
| F-1-11 | Asserts every relevant field in both copied text and downloaded calendar file. | `@claim:all-entered-details`; live `/?demo=1` |
| F-1-12 | Retained only browser-processing privacy copy backed by whole-flow request logging. | `@claim:local-processing`; live `/privacy` |
| F-1-13 | Keeps the offline promise with online-then-offline sample reload. | `@claim:offline-reload`; live `/?demo=1` |
| F-1-14 | Removed the travel metaphor. | `.factory/copy-audit.md`; live `/` |
| F-1-15 | Provides source, Privacy, Terms, and license links without unsupported footer marketing. | route/link test; live `/` |
| F-1-16 | Removed tracker/analytics promise rather than make an unbounded assertion. | `.factory/copy-audit.md`; request-log tests |
| F-1-17 | Rewrote README opening as short, concrete sentences. | `.factory/copy-audit.md`; `README.md` |
| F-1-18 | States only the enforced limits: no invitations or calendar sync. | `@claim:scope-limits`; live `/#limits` |
| F-1-19 | Imports and reports the first event from a two-event calendar-text fixture. | `@claim:ics-import`; live `/?demo=1` |
| F-1-20 | Covers title, time, place, organizer, RSVP, link, and notes in observed output. | `@claim:all-entered-details`; live `/?demo=1` |
| F-1-21 | Keeps a plain date-specific time statement and proves DST behavior. | `@claim:dst-conversion`; unit tests |
| F-1-22 | Labels and asserts event, device, and recipient time rows. | `@claim:timezone-equivalents`; live `/?demo=1` |
| F-1-23 | Removed the undefined accessible-output adjective. | `.factory/copy-audit.md`; `@claim:text-export` |
| F-1-24 | Separately checks actual PNG, PDF, and calendar-file signatures/content. | `@claim:image-download`, `@claim:pdf-download`, `@claim:ics-download` |
| F-1-25 | Inspects selected/private data in the generated PNG/PDF and decodes the actual QR. | `@claim:private-output-options`; live `/?demo=1` |
| F-1-26 | Uses the same tested offline reload statement. | `@claim:offline-reload`; live `/?demo=1` |
| F-1-27 | Tests requests, storage namespaces, cache contents, and demo isolation. | `@claim:local-processing`, `@claim:cache-privacy`; live `/privacy` |
| F-1-28 | Removed the untestable compound resource/privacy sentence. | `.factory/copy-audit.md`; request-log tests |
| F-1-29 | Keeps MIT `LICENSE` and direct license link. | route/link test; live `/terms` |
| F-1-30 | Emits known static routes and Azure’s real designed 404 override. | route/404 test; `polish-3-404-verify/screenshot-mobile.png`; live `/not-a-real-page` |
| F-1-31 | Supplies route-specific title, canonical, OG/Twitter, icon, and description metadata. | route/meta test; live `/`, `/privacy`, `/terms`, `/404.html` |
| F-1-32 | Keeps header/skip link and restores the destination h1 on navigation and Back/Forward. | route/focus test; live `/privacy` |
| F-1-33 | Removed slogans/metaphors and uses concrete headings/actions. | `.factory/copy-audit.md`; `home-mobile.png` |
| F-1-34 | Audited visitor copy and documented one term per concept. | `.factory/copy-audit.md`; `README.md` |
| F-2-1 | Removed the catch-all fallback so unknown paths produce the designed HTTP 404. | route/404 test; live `/not-a-real-page` |
| F-2-2 | Shows the demo banner only in an active demo; Reset is reachable only there. | route test; `home-mobile.png`, `demo-mobile.png`; live `/`, `/?demo=1` |
| F-2-3 | Uses external 404 CSS/script, complete metadata, footer, and no CSP load error. | Axe/route test; `polish-3-404-verify/verify.json`; live `/404.html` |
| F-2-4 | Handles browser history with destination-h1 focus and polite announcement. | route/focus test; live `/privacy` then Back/Forward |
| F-2-5 | Stamps the current git revision into every built footer. | route/meta test; `npm run build`; live footer |
| F-2-6 | Removed decorative stage labels and uses “Compare local times.” | `.factory/copy-audit.md`; live `/?demo=1` |
| F-3-1 | Pre-applies the card-first demo layout before first paint; retains sticky banner and sole h1. | `@claim:demo-sample`; `demo-mobile.png`; mobile Lighthouse CLS `0.028`; live `/?demo=1` |
| F-3-2 | Makes the calendar-file test assert all sample fields, not title alone. | `@claim:all-entered-details`, `@claim:ics-download` |
| F-3-3 | Verifies PNG magic/dimensions/metadata and PDF header/page/image/metadata. | `@claim:image-download`, `@claim:pdf-download` |
| F-3-4 | Generates and inspects each private PNG/PDF variant; decodes selected QR output. | `@claim:private-output-options` |
| F-3-5 | Replaced “land here” with literal date/time empty-state copy. | `.factory/copy-audit.md`; live `/` |
| F-3-6 | Rewrote offline notice as the tested saved-app/sample behavior. | `@claim:offline-reload`; live offline `/?demo=1` |
| F-3-7 | Added cache-specific privacy claim and cache-content inspection. | `@claim:cache-privacy`; live `/privacy` |
| F-3-8 | Extended local processing coverage through import, copy, PNG, PDF, and calendar-file output. | `@claim:local-processing` |
| F-3-9 | Removed the untested “free” statement. | `.factory/copy-audit.md`; live `/terms` |
| F-3-10 | Replaced MIT prose with a direct license link. | route/link test; live `/terms` |
| F-3-11 | Replaced mood-copy offline heading with “You are offline.” | `.factory/copy-audit.md`; live offline `/?demo=1` |
| F-3-12 | Replaced VEVENT/ICS error jargon with calendar file/text words and recovery. | accessibility/recovery test; live `/?demo=1` |
| F-3-13 | Uses “calendar file” consistently in file-size recovery copy. | `.factory/copy-audit.md`; accessibility/recovery test |
| F-3-14 | Replaced “handoff”/“share sheet” feedback with plain sharing-menu/download language. | `.factory/copy-audit.md`; accessibility/recovery test |
| F-3-15 | Reworded README to point to the claim record instead of asserting complete coverage. | `README.md`; clean-clone claim run |
| F-3-16 | Added a concrete three-step “How it works” section. | `home-mobile.png`; live `/#how-it-works` |
| F-3-17 | Added a plain limitations section. | `@claim:scope-limits`; live `/#limits` |
| F-3-18 | Added build-id meta/footer stamping at postbuild time. | route/meta test; `npm run build`; live footer |
| F-3-19 | Gives each clipboard/image/download failure a named next action. | accessibility/recovery test; live `/?demo=1` |
| F-3-20 | Renamed README’s “Use it” section to “Try the event-card demo.” | `.factory/copy-audit.md`; `README.md` |

## Final local evidence

- `npm test`: 13 unit tests and 34 desktop/mobile browser tests passed.
- `npm run build`: passed; `dist/` is the static deploy artifact.
- `verify-url.sh` passed for `/`, `/?demo=1`, and `/404.html` with `lang=en`, one h1, main landmark, no missing alt text, and no console errors.
- Playwright Axe checks passed for `/`, `/?demo=1`, `/privacy`, `/terms`, and `/404.html` at desktop and 390px mobile.
- Mobile Lighthouse for `/?demo=1`: performance 97, accessibility 100, LCP 2.4 s, CLS 0.028.

## Final production evidence

- `verify-url.sh` passed with no console errors for `/`, `/?demo=1`, `/privacy`, and `/terms`; evidence is `.factory/evidence/polish-3-final-{home,demo,privacy,terms}/verify.json`.
- The 390px cold demo is `.factory/evidence/polish-3-live-demo/cold-mobile-final.png`: the demo h1, persistent banner, and filled card intersect the first viewport.
- Production Axe found zero serious/critical issues for `/`, `/?demo=1`, `/privacy`, `/terms`, and `/404.html`.
- Home → Privacy → Back restored the respective h1 focus. `/not-a-real-page` returned HTTP 404 with the designed title and h1.
- The live PNG/PDF checks saved valid files at `.factory/evidence/polish-3-live-demo/live-card-final.png` and `.factory/evidence/polish-3-live-demo/live-card-final.pdf`.
