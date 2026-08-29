# Polish 2 — review finding closure

This repair starts from review commit `45feb415f02fe7cf65a577be09095ff89bf96953`. All claim evidence below runs from the shipped `/demo` sandbox in a clean browser context. Local screenshots are in `.factory/evidence/polish-2-local/`; the direct 404 screenshots are in `.factory/evidence/polish-2-404/`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the plain job headline, named families and small teams, and put the sample action first. | Cold mobile screenshot; `@claim:demo-sample` |
| F-1-2 | Kept `/demo` and `?demo=1` seed/reset/exit behavior; hid the banner unless demo mode enables it. | `@claim:demo-sample`; route regression; local `/demo` check |
| F-1-3 | Kept the 12-entry claim registry and one tagged browser test per claim. | `.factory/claims.json`; every listed command |
| F-1-4 | Kept the no-account statement and sandbox assertion. | `@claim:no-account` |
| F-1-5 | Kept browser-only processing wording and whole-flow request logging. | `@claim:local-processing` |
| F-1-6 | Kept the builder’s browser-processing wording and request-log coverage. | `@claim:local-processing` |
| F-1-7 | Kept date-specific DST fixture and rendered time checks. | `@claim:dst-conversion` |
| F-1-8 | Kept concrete plain-text copy rather than an absolute compatibility promise. | `@claim:text-export` |
| F-1-9 | Kept format wording without subjective discoverability promise. | `@claim:image-download`; `@claim:pdf-download` |
| F-1-10 | Kept the concrete calendar-file label and download assertion. | `@claim:ics-download` |
| F-1-11 | Kept clipboard and ICS detail assertions. | `@claim:text-export`; `@claim:ics-download` |
| F-1-12 | Kept tested browser-processing privacy copy. | `@claim:local-processing` |
| F-1-13 | Kept the offline statement and online-then-offline sample reload check. | `@claim:offline-reload` |
| F-1-14 | Kept the literal, testable offline wording. | copy audit; `@claim:offline-reload` |
| F-1-15 | Kept source/legal links and non-promissory product footer. | route/link browser test |
| F-1-16 | Kept untestable tracker wording removed; request logging covers retained privacy copy. | `@claim:local-processing` |
| F-1-17 | Kept README opening short and concrete. | `.factory/copy-audit.md` |
| F-1-18 | Kept unsupported limitation list removed. | README audit |
| F-1-19 | Kept first-event import and the two-event fixture. | `@claim:ics-import` |
| F-1-20 | Kept sample fields and export assertions for all named fields. | `@claim:text-export` |
| F-1-21 | Kept technical promise removed while testing visible DST behavior. | `@claim:dst-conversion` |
| F-1-22 | Kept labelled event/device/recipient rows. | `@claim:timezone-equivalents` |
| F-1-23 | Kept the undefined accessibility adjective removed. | `@claim:text-export` |
| F-1-24 | Kept separate PNG, PDF, and ICS assertions. | `@claim:image-download`; `@claim:pdf-download`; `@claim:ics-download` |
| F-1-25 | Kept private details off by default and tested their opt-in state. | `@claim:private-output-options` |
| F-1-26 | Kept tested offline reload wording. | `@claim:offline-reload` |
| F-1-27 | Kept event-data request/storage privacy coverage. | `@claim:local-processing`; `@claim:demo-sample` |
| F-1-28 | Kept untestable compound resource wording removed. | README audit |
| F-1-29 | Kept the MIT license in the repository and README link. | `LICENSE`; link crawl |
| F-1-30 | Replaced catch-all SPA routing with emitted static documents for `/demo`, `/privacy`, and `/terms`; unknown paths now reach Azure’s 404 override. | route regression asserts 404/title/h1; `curl` local 404 evidence |
| F-1-31 | Kept concrete route metadata and original social assets; added full direct-404 metadata. | metadata browser test; `.factory/evidence/polish-2-404/verify.json` |
| F-1-32 | Focuses legal/demo headings on navigation and restores destination-h1 focus on Back/Forward. | route regression browser test |
| F-1-33 | Kept concrete headline/actions and removed remaining decorative stage labels. | `.factory/copy-audit.md`; mobile screenshot |
| F-1-34 | Kept README plain and under the sentence cap. | `.factory/copy-audit.md` |
| F-2-1 | Removed `navigationFallback` and generated concrete route documents, so unknown URLs are not served as home. | route regression; local `404 Not Found` header and 404 screenshot |
| F-2-2 | Added a global `[hidden]` rule so `#demo-banner` cannot override its hidden state; handlers remain demo-only. | route regression asserts hidden banner/no demo key on `/`; mobile screenshot |
| F-2-3 | Moved 404 styling to `/404.css`, added external focus script, canonical/OG/Twitter/apple metadata, skip link, full footer, and CSP-tested direct load. | direct-404 console check and Axe in route test; `.factory/evidence/polish-2-404/verify.json` |
| F-2-4 | Added `pageshow` Back/Forward handling while preserving the initial home skip-link order. | route regression tests Back/Forward home, privacy, and demo focus |
| F-2-5 | Removed stale generated-art/build assertion from the runtime footer; provenance remains auditable in the design record. | copy audit; footer inspection |
| F-2-6 | Removed 01/02/03 labels and renamed the timezone heading to “Compare local times.” | copy audit; mobile screenshot |

## Local verification

- `npm run build` — passed; `dist/` contains root `index.html`, `/demo/index.html`, `/privacy/index.html`, `/terms/index.html`, and 404 assets.
- `npm test` — passed: 12 unit tests plus 28 desktop/mobile browser checks (two intentional mobile export skips).
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173 .factory/evidence/polish-2-local` — passed with no console errors, one h1, language, main landmark, and image-alt checks.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/404.html .factory/evidence/polish-2-404` — passed under the deployment CSP with no console errors.
- Playwright Axe checks at desktop/mobile cover home and direct 404; no serious or critical violations.

## Live URL check

At `2026-08-29T00:43Z`, `https://calendar-handoff-card.sociobot.in/not-a-real-page` still returned the pre-repair artifact (HTTP 200, home title, old `01 / Source` label). The completed code is pushed to `main`; the Azure target/deployment-token mapping is absent from the work order and the attempted Static Web Apps CLI deployment stalled. The exact deployment blocker and required post-deploy cold checks are recorded in `.factory/handoff.md`.
