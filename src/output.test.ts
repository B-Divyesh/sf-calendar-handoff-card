import { describe, expect, it } from "vitest";
import { cardManifest, plainText, safeFileName } from "./output";
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

  it("keeps private output fields out of a card manifest until selected", () => {
    expect(cardManifest(event, { includeLink: false, includeDescription: false, includeQr: false })).not.toMatchObject({
      joiningLink: expect.anything(),
      notes: expect.anything(),
      qrUrl: expect.anything()
    });
    expect(cardManifest(event, { includeLink: true, includeDescription: true, includeQr: true })).toMatchObject({
      joiningLink: "https://example.test/join",
      notes: "Bring the brief.",
      qrUrl: "https://example.test/join"
    });
  });
});
