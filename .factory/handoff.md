# Calendar Handoff Card — review 4 handoff

## Review outcome

Review 4 is a PASS with zero findings. No product code was changed. The review
report is `.factory/review-4.md`.

## Verification

- Production was checked cold at 390 × 844 and desktop. The first screen states
  the job, audience, and visible sample action.
- The live demo at `/?demo=1` and `/demo` opens filled, shows the persistent
  sample-data boundary, resets, and exits to a clean real form. Its only
  storage key is `demo:calendar-handoff-card` in sessionStorage.
- A fresh clone at `/tmp/calendar-handoff-review4.yF8Nd8/repo` passed `npm ci`,
  `npm test` (13 unit and 34 browser tests), and `npm run build`.
- Every exact test command in `.factory/claims.json` was run individually and
  passed in both desktop and 390px projects.
- Live route metadata, 404 behavior, H1 focus after Home → Privacy → Back,
  console output, asset/link responses, and responsive screenshots were
  checked. All expected routes/assets returned 200 and an unknown route returned
  the designed HTTP 404.

## Run locally

```sh
npm ci
npm test
npm run build
```

Run any individual claim exactly as recorded in `.factory/claims.json`, for
example `npm run test:e2e -- --grep @claim:offline-reload`.

## Known gaps

None. Future changes should preserve the demo isolation, update the claim
registry for any new reliance claim, and repeat the review-4 checks.
