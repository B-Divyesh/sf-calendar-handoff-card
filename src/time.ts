import type { EventDraft } from "./types";

export interface DateTimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const partsFormatterCache = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = partsFormatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    });
    partsFormatterCache.set(timeZone, formatter);
  }
  return formatter;
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone }).format();
    return true;
  } catch {
    return false;
  }
}

export function getPartsAt(date: Date, timeZone: string): DateTimeParts {
  const values: Record<string, number> = {};
  for (const part of partsFormatter(timeZone).formatToParts(date)) {
    if (part.type !== "literal") values[part.type] = Number(part.value);
  }
  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second
  };
}

function sameParts(a: DateTimeParts, b: DateTimeParts): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day &&
    a.hour === b.hour && a.minute === b.minute;
}

function offsetAt(date: Date, timeZone: string): number {
  const parts = getPartsAt(date, timeZone);
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second) -
    Math.floor(date.getTime() / 1000) * 1000;
}

/**
 * Converts a wall-clock value in an IANA timezone to an instant.
 * If a fall-back hour occurs twice, the earlier instant is chosen.
 * Nonexistent spring-forward times are rejected rather than silently shifted.
 */
export function zonedDateTimeToUtc(dateValue: string, timeValue: string, timeZone: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue) || !/^\d{2}:\d{2}$/.test(timeValue)) {
    throw new Error("Enter a complete date and time.");
  }
  if (!isValidTimeZone(timeZone)) throw new Error(`Unknown timezone: ${timeZone}`);

  const [year, month, day] = dateValue.split("-").map(Number);
  const [hour, minute] = timeValue.split(":").map(Number);
  const wanted = { year, month, day, hour, minute, second: 0 };
  const wallAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  const offsets = new Set<number>();

  for (const delta of [-86_400_000, -21_600_000, 0, 21_600_000, 86_400_000]) {
    offsets.add(offsetAt(new Date(wallAsUtc + delta), timeZone));
  }

  const matches = [...offsets]
    .map((offset) => new Date(wallAsUtc - offset))
    .filter((candidate) => sameParts(getPartsAt(candidate, timeZone), wanted))
    .sort((a, b) => a.getTime() - b.getTime());

  if (!matches.length) {
    throw new Error(`${dateValue} at ${timeValue} does not exist in ${timeZone} because the clock changes then. Choose another time.`);
  }
  return matches[0];
}

export function eventInstants(event: EventDraft): { start: Date; end: Date } {
  const startTime = event.allDay ? "00:00" : event.startTime;
  const endTime = event.allDay ? "23:59" : event.endTime;
  const start = zonedDateTimeToUtc(event.startDate, startTime, event.timeZone);
  const end = zonedDateTimeToUtc(event.endDate, endTime, event.timeZone);
  if (end.getTime() <= start.getTime()) throw new Error("The end must be after the start.");
  return { start, end };
}

export function formatInZone(date: Date, timeZone: string, includeZone = true): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: includeZone ? "short" : undefined
  }).format(date);
}

export function formatDateRange(event: EventDraft): string {
  if (event.allDay) {
    const start = new Date(`${event.startDate}T12:00:00Z`);
    const end = new Date(`${event.endDate}T12:00:00Z`);
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });
    if (event.startDate === event.endDate) return `${formatter.format(start)} · All day`;
    return `${formatter.format(start)} – ${formatter.format(end)} · All day`;
  }

  const { start, end } = eventInstants(event);
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: event.timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: event.timeZone,
    hour: "numeric",
    minute: "2-digit"
  });
  const startDate = dateFormatter.format(start);
  const endDate = dateFormatter.format(end);
  if (startDate === endDate) {
    return `${startDate} · ${timeFormatter.format(start)}–${timeFormatter.format(end)}`;
  }
  return `${dateFormatter.format(start)} at ${timeFormatter.format(start)} – ${dateFormatter.format(end)} at ${timeFormatter.format(end)}`;
}

export function formatWallParts(date: Date, timeZone: string): { date: string; time: string } {
  const parts = getPartsAt(date, timeZone);
  return {
    date: `${parts.year.toString().padStart(4, "0")}-${parts.month.toString().padStart(2, "0")}-${parts.day.toString().padStart(2, "0")}`,
    time: `${parts.hour.toString().padStart(2, "0")}:${parts.minute.toString().padStart(2, "0")}`
  };
}

export function addDays(dateValue: string, days: number): string {
  const date = new Date(`${dateValue}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function timeZoneLabel(timeZone: string): string {
  return timeZone.replaceAll("_", " ").replace("/", " / ");
}
