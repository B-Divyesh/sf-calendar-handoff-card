# Demo sandbox

Open `/demo` or `/?demo=1` to load the Grandma’s birthday lunch sample event.
It includes a meeting link, place, organizer, RSVP note, event notes, and New York/London time comparison.

The demo uses only the `sessionStorage` key `demo:calendar-handoff-card`; it contains the mode flag, never event content.
The sample is an in-memory fixture. **Reset demo** restores that fixture. **Start for real** removes the demo key and returns to an empty form.
No real form field is read or written in demo mode.
