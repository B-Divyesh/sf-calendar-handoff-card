# Independent verification — PASS

**Work order:** `calendar-handoff-card-verify-1`
**Candidate:** `dfa4929b4677590fc0138e274ebffdf3c055245f`
**Verified:** 2026-08-28
**Production URL:** <https://calendar-handoff-card.sociobot.in>

## Verdict

**PASS.** The candidate satisfies the researched brief's smallest useful product: a no-account, local-first event/ICS handoff maker with timezone equivalents, plain-text/ICS/image/PDF handoffs, and explicit opt-in treatment for private link/note/QR content. No product defects were found in this verification.

## Reproducible local evidence

Verification used a fresh detached Git worktree at the exact candidate SHA, rather than the working checkout.

```sh
npm ci
npm run test:unit
npm run build
```

- `npm ci`: installed the locked 85-package tree; `npm audit` reported 0 vulnerabilities.
- `npm run test:unit`: **12/12 passed**.
- `npm run build`: **passed** (`tsc --noEmit`, Vite production build, postbuild); `dist/index.html` exists at the deploy root.
- The complete Playwright set scheduled by `npm test` was executed from that clean worktree in desktop Chromium and 390 × 844 Chromium slices: **14 passed, 2 intentional project skips** (mobile-only overflow is skipped on desktop; the one-browser PNG/PDF check is skipped on mobile). It covers normal typed-event export, clipboard/ICS/PNG/PDF downloads, pasted ICS import, errors, offline editing, legal pages, keyboard order, desktop and mobile Axe, and mobile overflow.

The monolithic `npm test` invocation reached the browser suite but the verification executor stops a single shell call at 30 seconds. The same repository test cases were then completed in smaller exact Playwright invocations; no test assertion failed. One two-worker Chromium launch transiently segfaulted before the keyboard test could create a context; rerunning that unchanged test with one worker passed. This was a test-host browser-process failure, not a page console error or reproducible product failure.

Production build output is within the static-web budgets:

| Asset | Size | Gzip |
| --- | ---: | ---: |
| Initial JavaScript | 48,875 B | 18,960 B |
| CSS | 16,412 B | 4,640 B |
| Mobile WebP hero | 22,588 B | — |

There are no downloaded fonts. All are below the 200 KB JS, 50 KB CSS, and 300 KB mobile-image budgets.

## Independent journeys and boundary checks

- Normal handoff: entered event name, place, joining link, organizer, RSVP, and notes; the preview, timezone rows, copy text, ICS, PNG, and PDF paths were all exercised by the browser suite.
- DST boundary: `2026-03-08 02:30` in `America/New_York` was rejected as a nonexistent wall time and disabled sharing. Changing it to `03:30–04:30` recovered to **Ready to share**.
- Invalid URL and recovery: `javascript:alert(1)` produced the labelled HTTP(S)-only error and disabled sharing; replacing it with `https://meet.example/recovered` restored sharing. The joining link remained absent from the rendered card until its explicit print option was selected.
- Invalid ICS: `BEGIN:VCALENDAR ... END:VCALENDAR` without a `VEVENT` produced the actionable “No VEVENT was found” error. Valid multiline, two-event, timezone-aware, all-day, and folded-description inputs are covered by the unit/browser tests; the first event is used and the count is reported.
- No storage: on a filled local run, `localStorage.length === 0`, `sessionStorage.length === 0`, and `document.cookie === ""`.
- PWA: after a successful online visit, the page registered one `handoff-card-v1` service worker, was controlled after reload, and reloaded offline with the application H1 intact. Update mechanics are present and deploy-safe: `/sw.js` is `Cache-Control: no-cache`, the worker calls `skipWaiting()`/`clients.claim()`, precaches the built shell, and removes other cache names on activation.

## Accessibility, responsive, privacy, and policy checks

- Live production Chromium checks at desktop and **390 px**: one `h1`, one `main`, zero console/page errors, zero external runtime requests, and no horizontal overflow (`scrollWidth === clientWidth` at 390 px).
- Axe on both live desktop and 390 px mobile: **0 serious or critical violations**.
- Keyboard journey: skip link, home link, hero jump, ICS-file action, and pasted-ICS action were reachable in order; visible 3 px focus styling is declared and observed in the tested journey.
- Reduced motion: with `prefers-reduced-motion: reduce`, computed card animation and transition durations are `0.01ms`.
- Visual review: full-page desktop and 390 px screenshots showed readable, intentional stacked mobile layout, no clipped controls, and the recorded risograph/paper visual system.
- Network/privacy: request capture after load contained only same-origin resources; no trackers, analytics, CDNs, fonts, cookies, or event-data requests were observed. ICS parsing and exports ran in-browser.
- Live headers: HTTPS `/` returned `200` with HSTS, `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, restrictive camera/microphone/geolocation permissions, and a same-origin CSP (`default-src`, `script-src`, `style-src`, `connect-src` all `'self'`; images limited to self/data/blob). Hashed JS returned `Cache-Control: public, max-age=31536000, immutable`; `/sw.js` returned `Cache-Control: no-cache`; HTML returned short revalidation caching.
- `/privacy`, `/terms`, and unknown-route fallback responded successfully; the legal routes render correct page titles/headings in browser tests.

## Deployment identity

The live deployment matches this candidate's generated artifact, not merely its markup:

| File | SHA-256 (local `dist` and live response) |
| --- | --- |
| `index.html` | `b6abae4742e93098536ded5e43e36a087c47b5f6984bc076f31f8b93a2817470` |
| `assets/index-BM7riDRD.js` | `0e6d025f154ba79059762735837f907bc30831a246ba0d9b25eeecc73bf0bd38` |

The live HTML also references the exact candidate CSS hash and all six candidate hero assets.

## Defects

None.

The transient Chromium worker segmentation fault noted above is an execution-environment observation only. It was eliminated by a single-worker retry and is not reported as a product defect.
