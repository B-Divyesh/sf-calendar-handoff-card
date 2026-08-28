# Polish 1 — review finding closure

Candidate repaired from `468dc175c52996a94e77567e3dfea636bfa713d6` in commit `ad6d218`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Replaced the slogan with the job headline, named families and small teams, and made the sample the first action. | `@claim:demo-sample`; `.factory/evidence/screenshot-desktop.png` |
| F-1-2 | Added `/demo` and `?demo=1`, a filled Grandma’s birthday sample, demo banner, reset, exit, and `demo:` session namespace. | `@claim:demo-sample`; `.factory/demo.md` |
| F-1-3 | Added the claim registry and one tagged test for every listed claim. | `.factory/claims.json`; `npm test` |
| F-1-4 | Kept “No account” and tested the sample without a sign-in surface. | `@claim:no-account` |
| F-1-5 | Rewrote privacy wording and recorded every request during demo copy/download. | `@claim:local-processing` |
| F-1-6 | Rewrote builder copy; the same whole-flow request test covers local processing. | `@claim:local-processing` |
| F-1-7 | Used a fixed November DST fixture with New York and London values. | `@claim:dst-conversion` |
| F-1-8 | Replaced “works everywhere” with plain text for chat or email. | `@claim:text-export` |
| F-1-9 | Removed the subjective image/PDF wording. | `@claim:image-download`, `@claim:pdf-download` |
| F-1-10 | Renamed the control “Download calendar file” and described an ICS import file. | `@claim:ics-download` |
| F-1-11 | Removed the broad output statement; clipboard and calendar-file contents are asserted. | `@claim:text-export`, `@claim:ics-download` |
| F-1-12 | Replaced the absolute trust claim with tested browser processing wording. | `@claim:local-processing` |
| F-1-13 | Kept the offline statement and added an online-then-offline sample reload. | `@claim:offline-reload` |
| F-1-14 | Removed the metaphor. | copy audit |
| F-1-15 | Replaced the unsupported footer promise with a product description and source link. | link crawl in browser suite |
| F-1-16 | Removed the untested tracker statement; request logging covers retained privacy wording. | `@claim:local-processing` |
| F-1-17 | Rewrote the README opening as two short plain sentences. | `.factory/copy-audit.md` |
| F-1-18 | Removed unverified limitations from README. | README audit |
| F-1-19 | Kept first-event import and tested a two-event fixture. | `@claim:ics-import` |
| F-1-20 | The sample and text export cover all listed event fields. | `@claim:text-export` |
| F-1-21 | Removed technical README wording; date-specific conversion remains tested. | `@claim:dst-conversion`; unit tests |
| F-1-22 | Asserted the event, device, and recipient rows. | `@claim:timezone-equivalents` |
| F-1-23 | Removed the undefined “accessible” export adjective. | `@claim:text-export` |
| F-1-24 | Split image, PDF, and calendar downloads into separate claims. | `@claim:image-download`, `@claim:pdf-download`, `@claim:ics-download` |
| F-1-25 | Kept private choices off by default and assert selection state and preview contents. | `@claim:private-output-options` |
| F-1-26 | Kept the offline claim with the required reload test. | `@claim:offline-reload` |
| F-1-27 | Replaced the broad sentence with request-observable browser processing wording. | `@claim:local-processing` |
| F-1-28 | Removed the untestable compound privacy/resource promise. | README audit |
| F-1-29 | Kept the repository `LICENSE`; removed the untested license marketing sentence. | `LICENSE` present |
| F-1-30 | Added designed `404.html`, Azure 404 response override, and real sitemap. | browser route test; `dist/404.html`, `dist/sitemap.xml` |
| F-1-31 | Added concrete titles, canonical, OG/Twitter metadata, apple icon, and original 1200×630 social art. | metadata browser test |
| F-1-32 | Added Home/Demo/Privacy/Terms header navigation and route-heading focus/announcement. | browser route/focus test |
| F-1-33 | Replaced all recorded slogans/headings and corrected the calendar-download label. | `.factory/copy-audit.md`; screenshots |
| F-1-34 | Rewrote README and documented the sentence audit and terminology. | `.factory/copy-audit.md` |

Local evidence: `npm test` passed (12 Vitest tests; 28 Playwright project tests with 2 expected export skips), `npm run build` passed, and `verify-url.sh` wrote desktop/mobile screenshots to `.factory/evidence/`.

The live deployment is currently blocked by an Azure control-plane timeout after successful authentication. The cold production check at `2026-08-28T23:49Z` confirmed the old artifact is still live; exact deployment evidence is in the handoff.
