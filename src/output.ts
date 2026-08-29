import QRCode from "qrcode";
import type { EventDraft, ExportOptions } from "./types";
import { eventInstants, formatDateRange, formatInZone, timeZoneLabel } from "./time";

export interface CardManifest {
  card: "Calendar event card";
  title: string;
  date: string;
  timezone: string;
  place?: string;
  organizer?: string;
  rsvp?: string;
  joiningLink?: string;
  notes?: string;
  qrUrl?: string;
}

/**
 * This is the single list of details used to draw the downloadable card and
 * to describe it in the file metadata. Private fields are intentionally
 * absent until their matching print option is selected.
 */
export function cardManifest(event: EventDraft, options: ExportOptions): CardManifest {
  return {
    card: "Calendar event card",
    title: event.title,
    date: formatDateRange(event),
    timezone: timeZoneLabel(event.timeZone),
    ...(event.location ? { place: event.location } : {}),
    ...(event.organizer ? { organizer: event.organizer } : {}),
    ...(event.rsvp ? { rsvp: event.rsvp } : {}),
    ...(options.includeLink && event.joinUrl ? { joiningLink: event.joinUrl } : {}),
    ...(options.includeDescription && event.description ? { notes: event.description } : {}),
    ...(options.includeQr && event.joinUrl ? { qrUrl: event.joinUrl } : {})
  };
}

export function plainText(event: EventDraft, deviceZone: string, recipientZone: string): string {
  const lines = [event.title, formatDateRange(event), `Event timezone: ${timeZoneLabel(event.timeZone)}`];

  if (!event.allDay) {
    const { start } = eventInstants(event);
    const zones = [...new Set([deviceZone, recipientZone])].filter((zone) => zone && zone !== event.timeZone);
    for (const zone of zones) {
      lines.push(`${timeZoneLabel(zone)}: ${formatInZone(start, zone)}`);
    }
  }

  if (event.location) lines.push(`Place: ${event.location}`);
  if (event.joinUrl) lines.push(`Join: ${event.joinUrl}`);
  if (event.organizer) lines.push(`Organizer: ${event.organizer}`);
  if (event.rsvp) lines.push(`RSVP: ${event.rsvp}`);
  if (event.description) lines.push("", event.description);
  lines.push("", "Made with Calendar Handoff Card");
  return lines.join("\n");
}

export function safeFileName(title: string, extension: string): string {
  const stem = title
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 60) || "event";
  return `${stem}-handoff.${extension}`;
}

function drawPaperTexture(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = "#f3e9d2";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "rgba(32,27,24,0.09)";
  for (let y = 7; y < height; y += 13) {
    for (let x = (y % 26) + 5; x < width; x += 17) {
      ctx.fillRect(x, y, 2, 2);
    }
  }
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const paragraphs = text.split("\n");
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    if (!paragraph) {
      lines.push("");
      continue;
    }
    const words = paragraph.split(/\s+/);
    let current = "";
    for (const word of words) {
      if (ctx.measureText(word).width > maxWidth) {
        if (current) {
          lines.push(current);
          current = "";
        }
        let segment = "";
        for (const char of word) {
          if (ctx.measureText(segment + char).width > maxWidth && segment) {
            lines.push(segment);
            segment = char;
          } else segment += char;
        }
        current = segment;
      } else {
        const candidate = current ? `${current} ${word}` : word;
        if (ctx.measureText(candidate).width > maxWidth && current) {
          lines.push(current);
          current = word;
        } else current = candidate;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

function drawWrapped(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = Infinity
): number {
  const lines = wrapLines(ctx, text, maxWidth).slice(0, maxLines);
  lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
  return y + lines.length * lineHeight;
}

async function qrCanvas(url: string): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  await QRCode.toCanvas(canvas, url, {
    width: 230,
    margin: 2,
    color: { dark: "#201b18", light: "#fff9ea" },
    errorCorrectionLevel: "M"
  });
  return canvas;
}

export async function renderCard(event: EventDraft, options: ExportOptions): Promise<HTMLCanvasElement> {
  const manifest = cardManifest(event, options);
  const hasQr = Boolean(manifest.qrUrl);
  const hasNotes = Boolean(manifest.notes);
  const height = hasNotes ? 1500 : 1260;
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser cannot draw an image card.");

  drawPaperTexture(ctx, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(35, 34);
  ctx.rotate(-0.008);
  ctx.fillStyle = "#c9482d";
  ctx.fillRect(56, 64, 1068, height - 150);
  ctx.fillStyle = "#201b18";
  ctx.fillRect(68, 76, 1068, height - 150);
  ctx.fillStyle = "#fff9ea";
  ctx.fillRect(40, 38, 1068, height - 150);
  ctx.strokeStyle = "#201b18";
  ctx.lineWidth = 5;
  ctx.strokeRect(40, 38, 1068, height - 150);

  ctx.fillStyle = "rgba(228,184,60,0.82)";
  ctx.save();
  ctx.translate(850, 8);
  ctx.rotate(0.08);
  ctx.fillRect(0, 0, 230, 92);
  ctx.restore();

  ctx.strokeStyle = "#c9482d";
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.arc(82, 80, 19, 0, Math.PI * 2);
  ctx.stroke();

  const left = 112;
  const contentWidth = hasQr ? 720 : 910;
  let y = 156;
  ctx.fillStyle = "#c9482d";
  ctx.font = "700 24px Arial, sans-serif";
  ctx.letterSpacing = "4px";
  ctx.fillText("YOU’RE INVITED", left, y);
  ctx.letterSpacing = "0px";

  y += 78;
  ctx.fillStyle = "#201b18";
  ctx.font = "bold 68px Georgia, serif";
  y = drawWrapped(ctx, event.title, left, y, contentWidth, 75, 3);

  y += 26;
  ctx.fillStyle = "#17337a";
  ctx.font = "bold 31px Arial, sans-serif";
  y = drawWrapped(ctx, manifest.date, left, y, contentWidth, 42, 4);

  y += 30;
  ctx.strokeStyle = "#8e7e6e";
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.moveTo(left, y);
  ctx.lineTo(left + contentWidth, y);
  ctx.stroke();
  ctx.setLineDash([]);
  y += 48;

  const detail = (label: string, value: string): void => {
    ctx.fillStyle = "#62564c";
    ctx.font = "bold 22px Arial, sans-serif";
    ctx.fillText(label.toUpperCase(), left, y);
    ctx.fillStyle = "#201b18";
    ctx.font = "600 28px Arial, sans-serif";
    y = drawWrapped(ctx, value, left + 174, y, contentWidth - 174, 36, 3);
    y += 22;
  };

  detail("Timezone", manifest.timezone);
  if (manifest.place) detail("Place", manifest.place);
  if (manifest.organizer) detail("Organizer", manifest.organizer);
  if (manifest.rsvp) detail("RSVP", manifest.rsvp);
  if (manifest.joiningLink) detail("Join", manifest.joiningLink);

  if (manifest.qrUrl) {
    const qr = await qrCanvas(manifest.qrUrl);
    ctx.drawImage(qr, 842, 385, 215, 215);
    ctx.fillStyle = "#201b18";
    ctx.font = "bold 19px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SCAN TO JOIN", 950, 628);
    ctx.textAlign = "left";
  }

  if (hasNotes) {
    y += 8;
    ctx.strokeStyle = "#8e7e6e";
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(1020, y);
    ctx.stroke();
    ctx.setLineDash([]);
    y += 42;
    ctx.fillStyle = "#62564c";
    ctx.font = "bold 22px Arial, sans-serif";
    ctx.fillText("NOTES", left, y);
    y += 38;
    ctx.fillStyle = "#201b18";
    ctx.font = "500 26px Arial, sans-serif";
    drawWrapped(ctx, manifest.notes || "", left, y, 900, 36, 8);
  }

  const footerY = height - 180;
  ctx.fillStyle = "#2146a3";
  for (let x = 72; x < 1100; x += 20) {
    ctx.beginPath();
    ctx.arc(x, footerY, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#62564c";
  ctx.font = "600 20px Arial, sans-serif";
  ctx.fillText("CALENDAR EVENT CARD  ·  SHARE DETAILS CLEARLY", left, footerY + 52);
  ctx.restore();
  return canvas;
}

export function canvasBlob(canvas: HTMLCanvasElement, type = "image/png", quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("The card could not be encoded.")), type, quality);
  });
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function uint32(value: number): Uint8Array {
  return new Uint8Array([(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff]);
}

function readUint32(bytes: Uint8Array, offset: number): number {
  return ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;
}

function pngTextChunk(keyword: string, value: string): Uint8Array {
  const text = new TextEncoder().encode(`${keyword}\0${value}`);
  const type = new TextEncoder().encode("tEXt");
  const crcInput = new Uint8Array(type.length + text.length);
  crcInput.set(type);
  crcInput.set(text, type.length);
  const chunk = new Uint8Array(12 + text.length);
  chunk.set(uint32(text.length), 0);
  chunk.set(type, 4);
  chunk.set(text, 8);
  chunk.set(uint32(crc32(crcInput)), 8 + text.length);
  return chunk;
}

async function addPngManifest(blob: Blob, manifest: CardManifest): Promise<Blob> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let offset = 8;
  let iendOffset = -1;
  while (offset + 12 <= bytes.length) {
    const length = readUint32(bytes, offset);
    const type = String.fromCharCode(...bytes.slice(offset + 4, offset + 8));
    if (type === "IEND") {
      iendOffset = offset;
      break;
    }
    offset += 12 + length;
  }
  if (iendOffset < 0) throw new Error("The image card could not be encoded.");
  const annotation = pngTextChunk("CalendarHandoffCard", JSON.stringify(manifest));
  const output = new Uint8Array(bytes.length + annotation.length);
  output.set(bytes.slice(0, iendOffset));
  output.set(annotation, iendOffset);
  output.set(bytes.slice(iendOffset), iendOffset + annotation.length);
  return new Blob([output], { type: "image/png" });
}

export async function pngCardBlob(canvas: HTMLCanvasElement, event: EventDraft, options: ExportOptions): Promise<Blob> {
  return addPngManifest(await canvasBlob(canvas), cardManifest(event, options));
}

function ascii(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function concat(chunks: Uint8Array[]): Uint8Array {
  const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const output = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.length;
  }
  return output;
}

function pdfLiteral(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/[\r\n]/g, " ");
}

export async function cardPdf(canvas: HTMLCanvasElement, event: EventDraft, options: ExportOptions): Promise<Blob> {
  const jpeg = new Uint8Array(await (await canvasBlob(canvas, "image/jpeg", 0.9)).arrayBuffer());
  const manifest = encodeURIComponent(JSON.stringify(cardManifest(event, options)));
  const pageWidth = 612;
  const pageHeight = 792;
  const drawWidth = 540;
  const drawHeight = drawWidth * canvas.height / canvas.width;
  const fittedHeight = Math.min(drawHeight, 720);
  const fittedWidth = fittedHeight * canvas.width / canvas.height;
  const x = (pageWidth - fittedWidth) / 2;
  const y = (pageHeight - fittedHeight) / 2;
  const content = `q\n${fittedWidth.toFixed(2)} 0 0 ${fittedHeight.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm\n/Im0 Do\nQ\n`;

  const objects: Uint8Array[] = [
    ascii("<< /Type /Catalog /Pages 2 0 R >>"),
    ascii("<< /Type /Pages /Kids [3 0 R] /Count 1 >>"),
    ascii("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>"),
    concat([
      ascii(`<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`),
      jpeg,
      ascii("\nendstream")
    ]),
    ascii(`<< /Length ${ascii(content).length} >>\nstream\n${content}endstream`),
    ascii(`<< /Title (Calendar event card) /Subject (${pdfLiteral(manifest)}) >>`)
  ];

  const chunks: Uint8Array[] = [ascii("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n")];
  const offsets: number[] = [0];
  let length = chunks[0].length;
  objects.forEach((object, index) => {
    offsets.push(length);
    const wrapped = concat([ascii(`${index + 1} 0 obj\n`), object, ascii("\nendobj\n")]);
    chunks.push(wrapped);
    length += wrapped.length;
  });
  const xrefOffset = length;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i += 1) {
    xref += `${offsets[i].toString().padStart(10, "0")} 00000 n \n`;
  }
  xref += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  chunks.push(ascii(xref));
  return new Blob([concat(chunks)], { type: "application/pdf" });
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
