import { describe, expect, it } from "vitest";
import { plainText, safeFileName } from "./output";
import type { EventDraft } from "./types";

const event: EventDraft = {
  title: "Project handoff",
  startDate: "2026-09-15",
  startTime: "09:00",
  endDate: "2026-09-15",
  endTime: "10:00",
  timeZone: "Asia/Kolkata",
  allDay: false,
  location: "Room 2",
  joinUrl: "https://example.test/join",
  organizer: "Mina",
  rsvp: "Reply by Monday",
  description: "Bring the brief."
};

describe("share output", () => {
  it("includes the essential handoff and timezone equivalents", () => {
    const output = plainText(event, "Europe/London", "America/New_York");
    expect(output).toContain("Project handoff");
    expect(output).toContain("Europe / London:");
    expect(output).toContain("America / New York:");
    expect(output).toContain("Join: https://example.test/join");
    expect(output).toContain("RSVP: Reply by Monday");
  });

  it("creates filesystem-safe names", () => {
    expect(safeFileName("Lunch / plans?!", "pdf")).toBe("lunch-plans-handoff.pdf");
  });
});
