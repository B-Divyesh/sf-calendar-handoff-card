import { describe, expect, it, vi } from "vitest";
import { buildIcs, parseIcs } from "./ics";

describe("ICS handoff", () => {
  it("imports a timezone-aware event and unfolds its description", () => {
    const result = parseIcs([
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      "SUMMARY:Design review",
      "DTSTART;TZID=America/New_York:20261101T013000",
      "DTEND;TZID=America/New_York:20261101T023000",
      "LOCATION:Studio 4",
      "DESCRIPTION:Bring the latest mockups and join at https://meet.example/test",
      "  for the handoff.",
      "ORGANIZER;CN=Riley:mailto:riley@example.com",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n"), "Europe/London");

    expect(result.event).toMatchObject({
      title: "Design review",
      startDate: "2026-11-01",
      startTime: "01:30",
      timeZone: "America/New_York",
      location: "Studio 4",
      organizer: "Riley",
      joinUrl: "https://meet.example/test"
    });
    expect(result.event.description).toContain("for the handoff");
  });

  it("uses the first event and reports the count", () => {
    const text = `BEGIN:VCALENDAR
BEGIN:VEVENT
SUMMARY:First
DTSTART:20260101T100000Z
DTEND:20260101T110000Z
END:VEVENT
BEGIN:VEVENT
SUMMARY:Second
DTSTART:20260102T100000Z
DTEND:20260102T110000Z
END:VEVENT
END:VCALENDAR`;
    const result = parseIcs(text);
    expect(result.event.title).toBe("First");
    expect(result.eventCount).toBe(2);
  });

  it("turns exclusive all-day DTEND into an inclusive form date", () => {
    const result = parseIcs(`BEGIN:VCALENDAR
BEGIN:VEVENT
SUMMARY:Trip
DTSTART;VALUE=DATE:20260810
DTEND;VALUE=DATE:20260813
END:VEVENT
END:VCALENDAR`);
    expect(result.event.allDay).toBe(true);
    expect(result.event.endDate).toBe("2026-08-12");
  });

  it("fails clearly when no event exists", () => {
    expect(() => parseIcs("BEGIN:VCALENDAR\nEND:VCALENDAR")).toThrow(/No VEVENT/);
  });

  it("exports portable UTC timestamps and escaped text", () => {
    vi.stubGlobal("crypto", { randomUUID: () => "test-id" });
    const output = buildIcs({
      title: "Lunch, then notes",
      startDate: "2026-07-01",
      startTime: "18:30",
      endDate: "2026-07-01",
      endTime: "19:30",
      timeZone: "Europe/London",
      allDay: false,
      location: "Home",
      joinUrl: "https://example.com/join",
      organizer: "Sam",
      rsvp: "Friday",
      description: "Bring plates"
    });
    expect(output).toContain("DTSTART:20260701T173000Z");
    expect(output).toContain("SUMMARY:Lunch\\, then notes");
    expect(output).toContain("URL:https://example.com/join");
    vi.unstubAllGlobals();
  });
});
