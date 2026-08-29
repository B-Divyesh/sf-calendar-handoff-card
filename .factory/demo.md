# Demo sandbox

Open `/?demo=1` (the landing action) or `/demo` to load the Grandma’s birthday lunch sample event.
The product-first demo puts its event card, event name, and persistent **“Demo — sample data, nothing is saved”** notice in the initial phone viewport. It includes a meeting link, place, organizer, RSVP note, event notes, and New York/London time comparison.

The demo uses only the `sessionStorage` key `demo:calendar-handoff-card`; it contains the mode flag, never event content. The sample is an in-memory fixture.
**Reset demo** restores that fixture. **Start for real** removes the demo key, discards the sample, and returns to an empty form.
No real form field is read or written in demo mode.
