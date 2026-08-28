import type { EventDraft } from "./types";
import { addDays, formatWallParts, isValidTimeZone, zonedDateTimeToUtc } from "./time";

interface ParsedProperty {
  name: string;
  params: Record<string, string>;
  value: string;
}

function unfold(text: string): string[] {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n[ \t]/g, "").split("\n");
}

function parseProperty(line: string): ParsedProperty | null {
  const separator = line.indexOf(":");
  if (separator < 0) return null;
  const descriptor = line.slice(0, separator);
  const value = line.slice(separator + 1);
  const [rawName, ...rawParams] = descriptor.split(";");
  const params: Record<string, string> = {};
  for (const rawParam of rawParams) {
    const equals = rawParam.indexOf("=");
    if (equals > 0) {
      params[rawParam.slice(0, equals).toUpperCase()] = rawParam.slice(equals + 1).replace(/^"|"$/g, "");
    }
  }
  return { name: rawName.toUpperCase(), params, value };
}

function unescapeText(value: string): string {
  return value
    .replace(/\\[nN]/g, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

function eventLines(text: string): { lines: string[]; count: number } {
  const lines = unfold(text);
  const events: string[][] = [];
  let current: string[] | null = null;
  for (const line of lines) {
    if (line.toUpperCase() === "BEGIN:VEVENT") current = [];
    else if (line.toUpperCase() === "END:VEVENT" && current) {
      events.push(current);
      current = null;
    } else if (current) current.push(line);
  }
  if (!events.length) throw new Error("No VEVENT was found. Paste a complete ICS event or choose another file.");
  return { lines: events[0], count: events.length };
}

interface IcsDate {
  allDay: boolean;
  date: string;
  time: string;
  timeZone: string;
  instant?: Date;
}

function parseDate(property: ParsedProperty, fallbackZone: string): IcsDate {
  const raw = property.value.trim();
  const isDate = property.params.VALUE?.toUpperCase() === "DATE" || /^\d{8}$/.test(raw);
  if (isDate) {
    if (!/^\d{8}$/.test(raw)) throw new Error("The ICS file contains an unsupported all-day date.");
    return {
      allDay: true,
      date: `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`,
      time: "00:00",
      timeZone: fallbackZone
    };
  }

  const match = raw.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z)?$/);
  if (!match) throw new Error("The ICS file uses a date format this tool cannot safely interpret.");
  const [, year, month, day, hour, minute, second = "00", utc] = match;
  if (utc) {
    const instant = new Date(Date.UTC(+year, +month - 1, +day, +hour, +minute, +second));
    const wall = formatWallParts(instant, "UTC");
    return { allDay: false, ...wall, timeZone: "UTC", instant };
  }

  const candidateZone = property.params.TZID || fallbackZone;
  const timeZone = isValidTimeZone(candidateZone) ? candidateZone : fallbackZone;
  const date = `${year}-${month}-${day}`;
  const time = `${hour}:${minute}`;
  return {
    allDay: false,
    date,
    time,
    timeZone,
    instant: zonedDateTimeToUtc(date, time, timeZone)
  };
}

function findUrl(text: string): string {
  const match = text.match(/https?:\/\/[^\s<>"']+/i);
  return match?.[0].replace(/[),.;]+$/, "") || "";
}

export function parseIcs(text: string, deviceZone = "UTC"): { event: EventDraft; eventCount: number; warnings: string[] } {
  if (!text.trim()) throw new Error("Paste ICS text first.");
  const { lines, count } = eventLines(text);
  const properties = lines.map(parseProperty).filter((item): item is ParsedProperty => Boolean(item));
  const first = (name: string) => properties.find((property) => property.name === name);
  const startProperty = first("DTSTART");
  if (!startProperty) throw new Error("The event has no start date.");
  const fallbackZone = isValidTimeZone(deviceZone) ? deviceZone : "UTC";
  const start = parseDate(startProperty, fallbackZone);
  const endProperty = first("DTEND");
  const parsedEnd = endProperty ? parseDate(endProperty, start.timeZone) : null;
  const warnings: string[] = [];
  if (startProperty.params.TZID && !isValidTimeZone(startProperty.params.TZID)) {
    warnings.push(`The timezone “${startProperty.params.TZID}” is not available here, so ${fallbackZone} was used.`);
  }

  let endDate = start.date;
  let endTime = start.allDay ? "00:00" : start.time;
  if (parsedEnd) {
    if (start.allDay && parsedEnd.allDay) endDate = addDays(parsedEnd.date, -1);
    else {
      let wall = { date: parsedEnd.date, time: parsedEnd.time };
      if (parsedEnd.instant && parsedEnd.timeZone !== start.timeZone) {
        wall = formatWallParts(parsedEnd.instant, start.timeZone);
      }
      endDate = wall.date;
      endTime = wall.time;
    }
  } else if (!start.allDay) {
    const instant = new Date((start.instant || zonedDateTimeToUtc(start.date, start.time, start.timeZone)).getTime() + 60 * 60 * 1000);
    const wall = formatWallParts(instant, start.timeZone);
    endDate = wall.date;
    endTime = wall.time;
    warnings.push("No end time was supplied, so a one-hour event was used.");
  }

  const description = unescapeText(first("DESCRIPTION")?.value || "");
  const rawUrl = unescapeText(first("URL")?.value || "");
  const organizer = first("ORGANIZER");
  const organizerValue = organizer?.params.CN || organizer?.value.replace(/^mailto:/i, "") || "";
  const joinUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : findUrl(description);

  const event: EventDraft = {
    title: unescapeText(first("SUMMARY")?.value || "Untitled event"),
    startDate: start.date,
    startTime: start.time,
    endDate,
    endTime,
    timeZone: start.timeZone,
    allDay: start.allDay,
    location: unescapeText(first("LOCATION")?.value || ""),
    joinUrl,
    organizer: unescapeText(organizerValue),
    rsvp: unescapeText(first("X-RSVP")?.value || ""),
    description
  };

  return { event, eventCount: count, warnings };
}

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function toIcsTimestamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function buildIcs(event: EventDraft): string {
  const now = toIcsTimestamp(new Date());
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Param Factory//Calendar Handoff Card//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@calendar-handoff-card.sociobot.in`,
    `DTSTAMP:${now}`
  ];

  if (event.allDay) {
    lines.push(`DTSTART;VALUE=DATE:${event.startDate.replaceAll("-", "")}`);
    lines.push(`DTEND;VALUE=DATE:${addDays(event.endDate, 1).replaceAll("-", "")}`);
  } else {
    const start = zonedDateTimeToUtc(event.startDate, event.startTime, event.timeZone);
    const end = zonedDateTimeToUtc(event.endDate, event.endTime, event.timeZone);
    lines.push(`DTSTART:${toIcsTimestamp(start)}`);
    lines.push(`DTEND:${toIcsTimestamp(end)}`);
  }
  lines.push(`SUMMARY:${escapeText(event.title)}`);
  if (event.location) lines.push(`LOCATION:${escapeText(event.location)}`);
  if (event.description) lines.push(`DESCRIPTION:${escapeText(event.description)}`);
  if (event.joinUrl) lines.push(`URL:${event.joinUrl}`);
  if (event.organizer) lines.push(`X-ORGANIZER-NAME:${escapeText(event.organizer)}`);
  if (event.rsvp) lines.push(`X-RSVP:${escapeText(event.rsvp)}`);
  lines.push("END:VEVENT", "END:VCALENDAR", "");
  return lines.join("\r\n");
}
