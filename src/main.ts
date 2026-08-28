import "./styles.css";
import { buildIcs, parseIcs } from "./ics";
import { cardPdf, canvasBlob, downloadBlob, plainText, renderCard, safeFileName } from "./output";
import { eventInstants, formatDateRange, formatInZone, formatWallParts, timeZoneLabel } from "./time";
import type { EventDraft, ExportOptions } from "./types";

function requiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing required element: ${selector}`);
  return element;
}

function renderLegalPage(kind: "privacy" | "terms"): boolean {
  const path = window.location.pathname.replace(/\/$/, "");
  if (path !== `/${kind}`) return false;

  const isPrivacy = kind === "privacy";
  document.title = isPrivacy
    ? "Privacy — Calendar Handoff Card"
    : "Terms — Calendar Handoff Card";
  const app = requiredElement<HTMLDivElement>("#app");
  app.innerHTML = `
    <header class="site-header">
      <a class="wordmark" href="/" aria-label="Calendar Handoff Card home">
        <span class="wordmark-mark" aria-hidden="true"><i></i><i></i><i></i></span>
        <span>Calendar Handoff Card</span>
      </a>
      <p class="privacy-stamp"><span aria-hidden="true">●</span> Stays on this device</p>
    </header>
    <main id="main">
      <article class="legal-page">
        <p class="eyebrow">${isPrivacy ? "Plain-language privacy" : "Use terms"}</p>
        <h1>${isPrivacy ? "Your events stay yours." : "A small tool, fair terms."}</h1>
        <p class="legal-date">Effective 28 August 2026</p>
        ${isPrivacy ? `
          <p>Calendar Handoff Card processes event details entirely in your browser. The service does not receive, store, sell, or analyze the event names, times, locations, links, notes, ICS files, cards, or calendar files you use here.</p>
          <h2>What is collected</h2>
          <p>No analytics, advertising identifiers, tracking pixels, cookies, accounts, or contact lists are used. The web host may produce short-lived security and request logs such as IP address, timestamp, and requested path as part of operating the site.</p>
          <h2>On your device</h2>
          <p>The page uses a service worker and browser cache so it can work offline. That cache contains only the application shell and artwork—not your event form entries. Closing or refreshing the page clears entered details because the tool does not write them to local storage.</p>
          <h2>Files and links</h2>
          <p>ICS files are read locally. PNG, PDF, and ICS exports are created locally. If you choose to open a joining link or share a downloaded file, the receiving app or website has its own privacy practices.</p>
          <h2>Questions</h2>
          <p>Review or report an issue through the project’s <a href="https://github.com/B-Divyesh/sf-calendar-handoff-card">public source repository</a>.</p>
        ` : `
          <p>Calendar Handoff Card is a free utility provided “as is” to help people restate calendar information in a portable format.</p>
          <h2>Your responsibility</h2>
          <p>Check the event details and timezone before sharing. Only include joining links, notes, and other information you are allowed to share. The tool does not send invitations, manage RSVPs, host events, or guarantee attendance.</p>
          <h2>No warranty</h2>
          <p>Calendar data can be incomplete or use vendor-specific formats. We aim for dependable conversion but do not warrant that every ICS file, timezone rule, calendar application, or generated document will behave identically.</p>
          <h2>Acceptable use</h2>
          <p>Do not use the service to distribute unlawful, deceptive, harmful, or privacy-invasive content, or to interfere with the service.</p>
          <h2>Open source</h2>
          <p>The software is available under the MIT License. These service terms do not limit rights granted by that license.</p>
        `}
        <p><a href="/">← Return to the card maker</a></p>
      </article>
    </main>
    <footer>
      <p><strong>Calendar Handoff Card</strong> · No accounts, event storage, or tracking.</p>
      <nav aria-label="Legal"><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav>
    </footer>
  `;
  const skip = document.querySelector<HTMLAnchorElement>(".skip-link");
  if (skip) {
    skip.href = "#main";
    skip.textContent = "Skip to content";
  }
  return true;
}

const route = window.location.pathname.replace(/\/$/, "");
if (route === "/privacy") {
  renderLegalPage("privacy");
} else if (route === "/terms") {
  renderLegalPage("terms");
} else {
  initializeApp();
}

function initializeApp(): void {
  const form = requiredElement<HTMLFormElement>("#event-form");
  const titleInput = requiredElement<HTMLInputElement>("#title");
  const startDateInput = requiredElement<HTMLInputElement>("#start-date");
  const startTimeInput = requiredElement<HTMLInputElement>("#start-time");
  const endDateInput = requiredElement<HTMLInputElement>("#end-date");
  const endTimeInput = requiredElement<HTMLInputElement>("#end-time");
  const zoneSelect = requiredElement<HTMLSelectElement>("#event-timezone");
  const recipientSelect = requiredElement<HTMLSelectElement>("#recipient-timezone");
  const allDayInput = requiredElement<HTMLInputElement>("#all-day");
  const joinUrlInput = requiredElement<HTMLInputElement>("#join-url");
  const titleError = requiredElement<HTMLParagraphElement>("#title-error");
  const urlError = requiredElement<HTMLParagraphElement>("#url-error");
  const card = requiredElement<HTMLElement>("#handoff-card");
  const cardTitle = requiredElement<HTMLElement>("#card-title");
  const cardDate = requiredElement<HTMLElement>("#card-date");
  const cardDetails = requiredElement<HTMLElement>("#card-details");
  const cardPrivate = requiredElement<HTMLElement>("#card-private");
  const cardState = requiredElement<HTMLElement>("#card-state");
  const timezoneList = requiredElement<HTMLElement>("#timezone-list");
  const shareHelp = requiredElement<HTMLElement>("#share-help");
  const includeLink = requiredElement<HTMLInputElement>("#include-link");
  const includeDescription = requiredElement<HTMLInputElement>("#include-description");
  const includeQr = requiredElement<HTMLInputElement>("#include-qr");
  const toast = requiredElement<HTMLElement>("#toast");
  const fileInput = requiredElement<HTMLInputElement>("#ics-file");
  const dialog = requiredElement<HTMLDialogElement>("#ics-dialog");
  const icsText = requiredElement<HTMLTextAreaElement>("#ics-text");
  const dialogError = requiredElement<HTMLElement>("#ics-dialog-error");
  const deviceZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  let toastTimer = 0;
  let fieldsTouched = false;

  const supportedZones = typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("timeZone")
    : ["UTC", "America/New_York", "Europe/London", "Asia/Kolkata", "Asia/Tokyo", "Australia/Sydney"];
  const zones = ["UTC", ...supportedZones.filter((zone) => zone !== "UTC")];
  const zoneOptions = zones.map((zone) => `<option value="${zone}">${timeZoneLabel(zone)}</option>`).join("");
  zoneSelect.innerHTML = zoneOptions;
  recipientSelect.innerHTML = zoneOptions;

  const now = new Date();
  const nextHour = new Date(Math.ceil((now.getTime() + 1) / 3_600_000) * 3_600_000);
  const hourLater = new Date(nextHour.getTime() + 3_600_000);
  const startWall = formatWallParts(nextHour, deviceZone);
  const endWall = formatWallParts(hourLater, deviceZone);
  startDateInput.value = startWall.date;
  startTimeInput.value = startWall.time;
  endDateInput.value = endWall.date;
  endTimeInput.value = endWall.time;
  zoneSelect.value = zones.includes(deviceZone) ? deviceZone : "UTC";
  const alternateZone = deviceZone === "America/New_York" ? "Europe/London" : "America/New_York";
  recipientSelect.value = zones.includes(alternateZone) ? alternateZone : "UTC";

  function readEvent(): EventDraft {
    const data = new FormData(form);
    return {
      title: String(data.get("title") || "").trim(),
      startDate: String(data.get("startDate") || ""),
      startTime: String(data.get("startTime") || ""),
      endDate: String(data.get("endDate") || ""),
      endTime: String(data.get("endTime") || ""),
      timeZone: String(data.get("timeZone") || "UTC"),
      allDay: data.get("allDay") === "on",
      location: String(data.get("location") || "").trim(),
      joinUrl: String(data.get("joinUrl") || "").trim(),
      organizer: String(data.get("organizer") || "").trim(),
      rsvp: String(data.get("rsvp") || "").trim(),
      description: String(data.get("description") || "").trim()
    };
  }

  function readOptions(): ExportOptions {
    return {
      includeLink: includeLink.checked,
      includeDescription: includeDescription.checked,
      includeQr: includeQr.checked
    };
  }

  function validate(event: EventDraft, revealErrors = false): string | null {
    let error: string | null = null;
    titleInput.removeAttribute("aria-invalid");
    joinUrlInput.removeAttribute("aria-invalid");
    if (revealErrors || fieldsTouched) {
      titleError.textContent = event.title ? "" : "Add an event name before sharing.";
      if (!event.title) titleInput.setAttribute("aria-invalid", "true");
    }
    if (!event.title) error = "Add an event name before sharing.";

    if (event.joinUrl) {
      try {
        const url = new URL(event.joinUrl);
        if (!["http:", "https:"].includes(url.protocol)) throw new Error("protocol");
        urlError.textContent = "";
      } catch {
        error ||= "Use a complete http:// or https:// joining link.";
        if (revealErrors || fieldsTouched) {
          urlError.textContent = "Use a complete link beginning with https:// or http://.";
          joinUrlInput.setAttribute("aria-invalid", "true");
        }
      }
    } else {
      urlError.textContent = "";
    }

    try {
      eventInstants(event);
    } catch (caught) {
      error ||= caught instanceof Error ? caught.message : "Check the event date and time.";
    }
    return error;
  }

  function detail(label: string, value: string, isLink = false): string {
    if (!value) return "";
    const safeValue = escapeHtml(value);
    return `<div><dt>${label}</dt><dd>${isLink ? `<a href="${escapeAttribute(value)}" rel="noreferrer">${safeValue}</a>` : safeValue}</dd></div>`;
  }

  function render(): void {
    const event = readEvent();
    const error = validate(event);
    const ready = !error;
    const options = readOptions();

    document.querySelectorAll<HTMLElement>(".time-field").forEach((field) => {
      field.hidden = event.allDay;
    });
    startTimeInput.required = !event.allDay;
    endTimeInput.required = !event.allDay;
    includeLink.disabled = !event.joinUrl;
    includeQr.disabled = !event.joinUrl;
    if (!event.joinUrl) {
      includeLink.checked = false;
      includeQr.checked = false;
    }

    cardTitle.textContent = event.title || "Add an event name to start";
    card.classList.toggle("empty", !event.title);
    cardState.textContent = ready ? "Ready to share" : event.title ? "Check the details" : "Waiting for a name";
    cardState.classList.toggle("ready", ready);

    if (ready) {
      cardDate.textContent = formatDateRange(event);
      cardDetails.innerHTML =
        detail("Timezone", timeZoneLabel(event.timeZone)) +
        detail("Place", event.location) +
        detail("Organizer", event.organizer) +
        detail("RSVP", event.rsvp) +
        (options.includeLink ? detail("Join", event.joinUrl, true) : "");
      const privateBits = [];
      if (options.includeDescription && event.description) privateBits.push(event.description);
      if (options.includeQr && event.joinUrl) privateBits.push("A QR code for the joining link will appear in image and PDF downloads.");
      cardPrivate.textContent = privateBits.join("\n\n");
      renderTimezones(event);
    } else {
      cardDate.textContent = event.title && error ? error : "The date and time will land here.";
      cardDetails.innerHTML = "";
      cardPrivate.textContent = "";
      timezoneList.innerHTML = `<p class="empty-note">${event.title && error ? escapeHtml(error) : "Add a valid date and time to compare timezones."}</p>`;
    }

    document.querySelectorAll<HTMLButtonElement>(".share-actions button").forEach((button) => {
      button.disabled = !ready;
    });
    shareHelp.textContent = ready
      ? "Ready. Plain text and calendar files include all entered details; image and PDF follow the privacy choices above."
      : (error || "Add an event name and valid time before exporting.");
  }

  function renderTimezones(event: EventDraft): void {
    if (event.allDay) {
      timezoneList.innerHTML = '<div class="zone-row"><strong>Everywhere</strong><span>All day<small>No time conversion needed</small></span></div>';
      return;
    }
    const { start } = eventInstants(event);
    const rows = [
      { label: "Event time", zone: event.timeZone },
      ...(deviceZone !== event.timeZone ? [{ label: "On this device", zone: deviceZone }] : []),
      ...(![event.timeZone, deviceZone].includes(recipientSelect.value)
        ? [{ label: "Recipient", zone: recipientSelect.value }]
        : [])
    ];
    timezoneList.innerHTML = rows.map(({ label, zone }) => `
      <div class="zone-row">
        <strong>${label}</strong>
        <span>${escapeHtml(formatInZone(start, zone, false))}<small>${escapeHtml(timeZoneLabel(zone))}</small></span>
      </div>
    `).join("");
  }

  function fillForm(event: EventDraft): void {
    const fields: Array<[string, string]> = [
      ["title", event.title],
      ["startDate", event.startDate],
      ["startTime", event.startTime],
      ["endDate", event.endDate],
      ["endTime", event.endTime],
      ["timeZone", event.timeZone],
      ["location", event.location],
      ["joinUrl", event.joinUrl],
      ["organizer", event.organizer],
      ["rsvp", event.rsvp],
      ["description", event.description]
    ];
    for (const [name, value] of fields) {
      const control = form.elements.namedItem(name);
      if (control instanceof HTMLInputElement || control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement) {
        control.value = value;
      }
    }
    allDayInput.checked = event.allDay;
    fieldsTouched = true;
    render();
  }

  function importText(text: string): void {
    const result = parseIcs(text, deviceZone);
    fillForm(result.event);
    const countMessage = result.eventCount > 1 ? ` Imported the first of ${result.eventCount} events.` : "";
    const warningMessage = result.warnings.length ? ` ${result.warnings.join(" ")}` : "";
    showToast(`Event imported.${countMessage}${warningMessage}`);
  }

  function showToast(message: string): void {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 4200);
  }

  function validEvent(): EventDraft | null {
    const event = readEvent();
    const error = validate(event, true);
    if (error) {
      render();
      showToast(error);
      const target = !event.title ? titleInput : form.querySelector<HTMLElement>('[aria-invalid="true"]');
      target?.focus();
      return null;
    }
    return event;
  }

  async function copyText(): Promise<void> {
    const event = validEvent();
    if (!event) return;
    const text = plainText(event, deviceZone, recipientSelect.value);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const fallback = document.createElement("textarea");
      fallback.value = text;
      fallback.style.position = "fixed";
      fallback.style.opacity = "0";
      document.body.append(fallback);
      fallback.select();
      const copied = document.execCommand("copy");
      fallback.remove();
      if (!copied) throw new Error("Clipboard permission was denied.");
    }
    showToast("Plain-text handoff copied.");
  }

  async function exportImage(): Promise<void> {
    const event = validEvent();
    if (!event) return;
    showToast("Drawing the image card…");
    const canvas = await renderCard(event, readOptions());
    downloadBlob(await canvasBlob(canvas), safeFileName(event.title, "png"));
    showToast("Image card downloaded.");
  }

  async function exportPdf(): Promise<void> {
    const event = validEvent();
    if (!event) return;
    showToast("Composing the PDF card…");
    const canvas = await renderCard(event, readOptions());
    downloadBlob(await cardPdf(canvas), safeFileName(event.title, "pdf"));
    showToast("PDF card downloaded.");
  }

  function exportIcs(): void {
    const event = validEvent();
    if (!event) return;
    downloadBlob(new Blob([buildIcs(event)], { type: "text/calendar;charset=utf-8" }), safeFileName(event.title, "ics"));
    showToast("Calendar file downloaded.");
  }

  form.addEventListener("input", () => {
    fieldsTouched = true;
    render();
  });
  recipientSelect.addEventListener("change", render);
  [includeLink, includeDescription, includeQr].forEach((control) => control.addEventListener("change", render));

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    if (file.size > 2_000_000) {
      showToast("That ICS file is over 2 MB. Choose a smaller calendar export.");
      fileInput.value = "";
      return;
    }
    try {
      importText(await file.text());
    } catch (caught) {
      showToast(caught instanceof Error ? caught.message : "The ICS file could not be read.");
    } finally {
      fileInput.value = "";
    }
  });

  requiredElement<HTMLButtonElement>("#paste-ics-button").addEventListener("click", () => {
    dialogError.textContent = "";
    dialog.showModal();
    window.setTimeout(() => icsText.focus(), 0);
  });
  requiredElement<HTMLButtonElement>("#import-ics-text").addEventListener("click", (event) => {
    event.preventDefault();
    try {
      importText(icsText.value);
      dialog.close();
      icsText.value = "";
    } catch (caught) {
      dialogError.textContent = caught instanceof Error ? caught.message : "The ICS text could not be read.";
    }
  });

  requiredElement<HTMLButtonElement>("#copy-text").addEventListener("click", () => void copyText().catch(reportActionError));
  requiredElement<HTMLButtonElement>("#download-image").addEventListener("click", () => void exportImage().catch(reportActionError));
  requiredElement<HTMLButtonElement>("#download-pdf").addEventListener("click", () => void exportPdf().catch(reportActionError));
  requiredElement<HTMLButtonElement>("#download-ics").addEventListener("click", exportIcs);

  const nativeShare = requiredElement<HTMLButtonElement>("#native-share");
  if (typeof navigator.share === "function") {
    nativeShare.hidden = false;
    nativeShare.addEventListener("click", async () => {
      const event = validEvent();
      if (!event) return;
      try {
        await navigator.share({ title: event.title, text: plainText(event, deviceZone, recipientSelect.value) });
        showToast("Handoff sent to your share sheet.");
      } catch (caught) {
        if (caught instanceof DOMException && caught.name === "AbortError") return;
        reportActionError(caught);
      }
    });
  }

  function reportActionError(caught: unknown): void {
    showToast(caught instanceof Error ? caught.message : "That export did not finish. Try another format.");
  }

  function updateConnection(): void {
    requiredElement<HTMLElement>("#connection-status").hidden = navigator.onLine;
  }
  window.addEventListener("online", updateConnection);
  window.addEventListener("offline", updateConnection);
  updateConnection();
  render();

  if ("serviceWorker" in navigator && import.meta.env.PROD) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // The app remains fully usable online if private browsing blocks registration.
      });
    });
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character] || character);
}

function escapeAttribute(value: string): string {
  return escapeHtml(value);
}
