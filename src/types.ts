export interface EventDraft {
  title: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  timeZone: string;
  allDay: boolean;
  location: string;
  joinUrl: string;
  organizer: string;
  rsvp: string;
  description: string;
}

export interface ExportOptions {
  includeLink: boolean;
  includeDescription: boolean;
  includeQr: boolean;
}
