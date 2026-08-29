# Copy audit — 2026-08-29, polish 3

Counts treat hyphenated words as one word. Field labels, format extensions, user-entered text, timezone names, and button labels are audited separately. No visitor-facing sentence exceeds 22 words or uses a banned marketing term.

## Terminology

| Concept | One term used |
| --- | --- |
| Shareable artifact | event card |
| `.ics` import/download | calendar file |
| Pasted calendar source | calendar text |
| Native platform share UI | sharing menu |
| Isolated sample | demo |

## Landing and app copy

| Words | Copy | Status |
| ---: | --- | --- |
| 5 | Create a shareable event card | Plain job headline |
| 16 | For families and small teams when an invite is hard to open or crosses calendar apps. | Audience and situation |
| 11 | See a filled event card with local times and sharing options. | Immediate demo outcome |
| 2 | No account | Claim: `no-account` |
| 6 | Event details stay in your browser. | Claim: `local-processing` |
| 6 | Works offline after the first visit. | Claim: `offline-reload` |
| 3 | You are offline. | State heading |
| 8 | The saved app and sample still open offline. | Claim: `offline-reload` |
| 7 | Demo — sample data, nothing is saved | Demo boundary |
| 5 | Try a sample event card | Demo h1 |
| 9 | Type the details or import a calendar file (.ics). | Clear instruction |
| 6 | Processing happens in this browser. | Claim: `local-processing` |
| 3 | First event only | Claim: `ics-import` |
| 5 | The timezone the organizer used. | Form help |
| 8 | Daylight-saving changes are applied for the event date. | Claim: `dst-conversion` |
| 6 | The event date and time will appear here. | Empty state |
| 17 | Plain text and calendar files include all entered details; image and PDF follow the privacy choices above. | Claims: `all-entered-details`, `private-output-options` |
| 14 | A QR code for the joining link will appear in image and PDF downloads. | Claim: `private-output-options` |
| 11 | These details are off by default in image and PDF downloads. | Claim: `private-output-options` |
| 12 | Copy plain text for chat or email. Download an image, PDF, or calendar file. | Format instruction |
| 10 | Use the event card preview to check the details before sharing. | How-it-works introduction |
| 10 | Type the details or use a calendar file. | How-it-works step |
| 9 | Compare the event, device, and recipient time. | How-it-works step |
| 12 | Choose plain text, an image, a PDF, or a calendar file. | How-it-works step |
| 8 | This card maker creates files and copyable text. | Claim: `scope-limits` |
| 7 | It does not send invitations or sync calendars. | Claim: `scope-limits` |
| 11 | Calendar Handoff Card makes event cards from details or calendar files. | Footer description |
| 5 | Built by Param Factory · build [build id]. | Build provenance |
| 16 | Clipboard access was denied. Copy the event details manually or try again after allowing clipboard access. | Recovery message |
| 15 | This browser could not create the image card. Download the PDF or calendar file instead. | Recovery message |
| 12 | That download did not finish. Try the PDF or calendar file instead. | Recovery message |
| 14 | No event was found. Paste a complete calendar event or choose another calendar file. | Import recovery |
| 4 | Paste calendar text first. | Import recovery |
| 8 | This calendar file has an unsupported all-day date. | Import recovery |
| 11 | This calendar file uses a date format this tool cannot safely interpret. | Import recovery |

## README copy

| Words | Copy | Status |
| ---: | --- | --- |
| 11 | Create a shareable event card from details or a calendar file. | Plain opening |
| 11 | Copy plain text or download an image, PDF, or calendar file. | Export claims |
| 16 | It is for families and small teams when an invite is hard to open or crosses calendar apps. | Audience and situation |
| 9 | Open the demo to see a filled event card. | Demo claim |
| 11 | Add event details, check local times, then choose a sharing format. | Sequence |
| 12 | Import the first event from a calendar file (.ics) or calendar text. | Claim: `ics-import` |
| 11 | Add a title, time, place, organizer, RSVP details, link, and notes. | Detail coverage |
| 6 | Compare event, device, and recipient times. | Claim: `timezone-equivalents` |
| 11 | Keep private link and note choices off until you select them. | Claim: `private-output-options` |
| 6 | The app has no account flow. | Claim: `no-account` |
| 7 | Event details are processed in the browser. | Claim: `local-processing` |
| 8 | The app works offline after its first visit. | Claim: `offline-reload` |
| 10 | Product claims and their tests are listed in `.factory/claims.json`. | Test-record instruction |

## Action-name check

The result actions are clear verbs: **Try it with sample data**, **Reset demo**, **Start for real**, **Import calendar file**, **Paste calendar text**, **Copy plain text**, **Download image**, **Download PDF**, **Download calendar file**, and **Share from device**. The only conventional dismissals are **Cancel** and **Close**.
