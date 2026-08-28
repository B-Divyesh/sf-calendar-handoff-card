import { describe, expect, it } from "vitest";
import { eventInstants, formatDateRange, zonedDateTimeToUtc } from "./time";
import type { EventDraft } from "./types";

const baseEvent: EventDraft = {
  title: "Family call",
  startDate: "2026-07-01",
  startTime: "18:30",
  endDate: "2026-07-01",
  endTime: "19:30",
  timeZone: "Europe/London",
  allDay: false,
  location: "",
  joinUrl: "",
  organizer: "",
  rsvp: "",
  description: ""
};

describe("timezone conversion", () => {
  it("converts a summer wall time with the applicable DST offset", () => {
    expect(zonedDateTimeToUtc("2026-07-01", "18:30", "Europe/London").toISOString())
      .toBe("2026-07-01T17:30:00.000Z");
  });

  it("rejects a nonexistent spring-forward wall time", () => {
    expect(() => zonedDateTimeToUtc("2026-03-08", "02:30", "America/New_York"))
      .toThrow(/does not exist/);
  });

  it("chooses the earlier instant for a repeated fall-back hour", () => {
    expect(zonedDateTimeToUtc("2026-11-01", "01:30", "America/New_York").toISOString())
      .toBe("2026-11-01T05:30:00.000Z");
  });

  it("rejects an end before the start", () => {
    expect(() => eventInstants({ ...baseEvent, endTime: "17:30" })).toThrow(/after the start/);
  });

  it("formats all-day ranges without timezone noise", () => {
    expect(formatDateRange({
      ...baseEvent,
      allDay: true,
      startDate: "2026-12-24",
      endDate: "2026-12-25"
    })).toMatch(/Thursday, December 24, 2026.*Friday, December 25, 2026.*All day/);
  });
});
