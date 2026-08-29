import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import jsQR from "jsqr";
import { PNG } from "pngjs";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const SAMPLE = {
  title: "Grandma’s birthday lunch",
  place: "42 Orchard Lane, Brooklyn",
  organizer: "Maya Chen",
  rsvp: "Reply to Maya by Thursday",
  link: "https://meet.example/family-lunch",
  notes: "Bring a photo for Grandma’s album. Call in if travel is difficult."
};

type CardManifest = {
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
};

type DownloadFile = { bytes: Buffer; suggestedFilename: string };

async function openDemo(page: import("@playwright/test").Page, url = "/demo"): Promise<void> {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(url);
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
}

async function clipboard(page: import("@playwright/test").Page): Promise<string> {
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: (text: string) => { (window as unknown as { copied: string }).copied = text; return Promise.resolve(); } }
    });
  });
  await page.getByRole("button", { name: /Copy plain text/ }).click();
  return page.evaluate(() => (window as unknown as { copied: string }).copied);
}

async function downloadFile(page: import("@playwright/test").Page, buttonName: RegExp): Promise<DownloadFile> {
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: buttonName }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();
  return { bytes: await readFile(path!), suggestedFilename: download.suggestedFilename() };
}

function pngTextManifest(bytes: Buffer): CardManifest {
  expect(bytes.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString("ascii", offset + 4, offset + 8);
    if (type === "tEXt") {
      const text = bytes.subarray(offset + 8, offset + 8 + length);
      const separator = text.indexOf(0);
      const key = text.subarray(0, separator).toString("utf8");
      if (key === "CalendarHandoffCard") return JSON.parse(text.subarray(separator + 1).toString("utf8")) as CardManifest;
    }
    offset += length + 12;
  }
  throw new Error("PNG did not include Calendar Handoff Card metadata");
}

function pdfManifest(bytes: Buffer): CardManifest {
  expect(bytes.subarray(0, 8).toString("ascii")).toBe("%PDF-1.4");
  const source = bytes.toString("latin1");
  expect((source.match(/\/Type \/Page\b/g) || [])).toHaveLength(1);
  expect(source).toContain("/Subtype /Image");
  expect(source).toMatch(/\/Width 1200 \/Height (1260|1500)/);
  expect(source.includes("\xff\xd8") && source.includes("\xff\xd9")).toBeTruthy();
  const subject = source.match(/\/Subject \(([^)]*)\)/)?.[1];
  expect(subject).toBeTruthy();
  return JSON.parse(decodeURIComponent(subject!)) as CardManifest;
}

function qrValue(png: PNG): string | null {
  const x = 850;
  const y = 395;
  const size = 260;
  const crop = new Uint8ClampedArray(size * size * 4);
  for (let row = 0; row < size; row += 1) {
    const sourceStart = ((y + row) * png.width + x) * 4;
    crop.set(png.data.subarray(sourceStart, sourceStart + size * 4), row * size * 4);
  }
  return jsQR(crop, size, size, { inversionAttempts: "dontInvert" })?.data || null;
}

function expectPublicManifest(manifest: CardManifest): void {
  expect(manifest).toMatchObject({
    card: "Calendar event card",
    title: SAMPLE.title,
    place: SAMPLE.place,
    organizer: SAMPLE.organizer,
    rsvp: SAMPLE.rsvp
  });
}

async function setPrivateOptions(page: import("@playwright/test").Page, values: { link: boolean; notes: boolean; qr: boolean }): Promise<void> {
  for (const [label, selected] of Object.entries({
    "Print the joining link": values.link,
    "Print event notes": values.notes,
    "Encode the joining link as a QR": values.qr
  })) {
    const checkbox = page.getByLabel(label);
    if (await checkbox.isChecked() !== selected) await page.getByText(label, { exact: true }).click();
  }
}

function expectPrivateManifest(manifest: CardManifest, values: { link: boolean; notes: boolean; qr: boolean }): void {
  expect(manifest.joiningLink).toBe(values.link ? SAMPLE.link : undefined);
  expect(manifest.notes).toBe(values.notes ? SAMPLE.notes : undefined);
  expect(manifest.qrUrl).toBe(values.qr ? SAMPLE.link : undefined);
}

test("@claim:demo-sample opens a product-first isolated sample and resets it", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Try it with sample data" }).click();
  await expect(page).toHaveURL(/\?demo=1$/);
  await expect(page.getByLabel("Demo mode")).toContainText("Demo — sample data, nothing is saved");
  await expect(page.getByLabel("Event name")).toHaveValue(SAMPLE.title);
  await expect(page.locator("#handoff-card")).toContainText(SAMPLE.place);
  const viewport = await page.evaluate(() => window.innerHeight);
  for (const selector of ["#demo-banner", "#handoff-card", "#card-title"]) {
    const box = await page.locator(selector).boundingBox();
    expect(box, `${selector} should be visible without scrolling`).not.toBeNull();
    expect(box!.y).toBeLessThan(viewport);
    expect(box!.y + box!.height).toBeGreaterThan(0);
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const stickyBanner = (await page.getByLabel("Demo mode").boundingBox())!;
  // The banner stays in the top quarter even when its containing main region
  // reaches its footer boundary; do not couple this behavior to one header height.
  expect(stickyBanner.y).toBeGreaterThanOrEqual(0);
  expect(stickyBanner.y).toBeLessThanOrEqual(viewport / 4);
  await page.getByLabel("Event name").fill("Changed sample");
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.getByLabel("Event name")).toHaveValue(SAMPLE.title);
  const storage = await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }));
  expect(storage.local).toEqual([]);
  expect(storage.session).toEqual(["demo:calendar-handoff-card"]);
  await page.getByRole("link", { name: "Start for real" }).click();
  await expect(page.getByLabel("Event name")).toHaveValue("");
  expect(await page.evaluate(() => sessionStorage.getItem("demo:calendar-handoff-card"))).toBeNull();
});

test("@claim:no-account creates the sample without sign-in", async ({ page }) => {
  await openDemo(page);
  await expect(page.getByLabel("Event name")).toHaveValue(SAMPLE.title);
  await expect(page.getByText(/sign in|log in|create account/i)).toHaveCount(0);
});

test("@claim:local-processing keeps calendar import and every export on this origin", async ({ page }) => {
  const requests: Array<{ url: string; method: string; body: string | null }> = [];
  page.on("request", (request) => requests.push({ url: request.url(), method: request.method(), body: request.postData() }));
  await openDemo(page);
  await page.getByRole("button", { name: "Paste calendar text" }).click();
  await page.getByLabel("Calendar event text").fill(`BEGIN:VCALENDAR
BEGIN:VEVENT
SUMMARY:Imported local event
DTSTART;TZID=Europe/London:20261020T153000
DTEND;TZID=Europe/London:20261020T160000
END:VEVENT
END:VCALENDAR`);
  await page.getByRole("button", { name: "Import first event" }).click();
  await expect(page.getByLabel("Event name")).toHaveValue("Imported local event");
  await page.getByRole("link", { name: "Demo" }).first().click();
  await expect(page.getByLabel("Event name")).toHaveValue(SAMPLE.title);
  await clipboard(page);
  await downloadFile(page, /Download calendar file/);
  await downloadFile(page, /Download image/);
  await downloadFile(page, /Download PDF/);
  expect(requests).not.toEqual([]);
  expect(requests.every((request) => new URL(request.url).origin === "http://127.0.0.1:4173")).toBeTruthy();
  expect(requests.every((request) => request.method === "GET" && request.body === null)).toBeTruthy();
});

test("@claim:dst-conversion shows date-specific local times", async ({ page }) => {
  await openDemo(page);
  const rows = page.locator("#timezone-list .zone-row");
  await expect(rows).toHaveCount(3);
  await expect(rows.nth(0)).toContainText("12:30 PM");
  await expect(rows.nth(0)).toContainText("America / New York");
  await expect(rows.nth(2)).toContainText("5:30 PM");
  await expect(rows.nth(2)).toContainText("Europe / London");
});

test("@claim:text-export copies every entered event detail", async ({ page }) => {
  await openDemo(page);
  const copied = await clipboard(page);
  for (const value of [SAMPLE.title, SAMPLE.place, SAMPLE.organizer, SAMPLE.rsvp, SAMPLE.link, "Bring a photo for Grandma’s album."]) expect(copied).toContain(value);
});

test("@claim:ics-download downloads a calendar file with every event detail", async ({ page }) => {
  await openDemo(page);
  const file = await downloadFile(page, /Download calendar file/);
  expect(file.suggestedFilename).toBe("grandmas-birthday-lunch-handoff.ics");
  const ics = file.bytes.toString("utf8");
  for (const value of ["SUMMARY:Grandma’s birthday lunch", "LOCATION:42 Orchard Lane\\, Brooklyn", "URL:https://meet.example/family-lunch", "X-ORGANIZER-NAME:Maya Chen", "X-RSVP:Reply to Maya by Thursday", "DESCRIPTION:Bring a photo for Grandma’s album.", "DTSTART:20261101T173000Z", "DTEND:20261101T193000Z"]) expect(ics).toContain(value);
});

test("@claim:all-entered-details includes every sample detail in plain text and calendar files", async ({ page }) => {
  await openDemo(page);
  const copied = await clipboard(page);
  const file = await downloadFile(page, /Download calendar file/);
  const ics = file.bytes.toString("utf8");
  for (const value of [SAMPLE.title, SAMPLE.place, SAMPLE.organizer, SAMPLE.rsvp, SAMPLE.link, "Bring a photo for Grandma’s album."]) {
    expect(copied).toContain(value);
    expect(ics).toContain(value.replace(",", "\\,"));
  }
});

test("@claim:image-download creates a valid PNG card with deterministic sample content", async ({ page }) => {
  await openDemo(page);
  const file = await downloadFile(page, /Download image/);
  expect(file.suggestedFilename).toBe("grandmas-birthday-lunch-handoff.png");
  const png = PNG.sync.read(file.bytes);
  expect(png).toMatchObject({ width: 1200, height: 1260 });
  expectPublicManifest(pngTextManifest(file.bytes));
  expect(qrValue(png)).toBeNull();
  const sampleDigest = createHash("sha256").update(png.data).digest("hex");
  await page.getByLabel("Event name").fill("A changed sample event");
  const changed = PNG.sync.read((await downloadFile(page, /Download image/)).bytes);
  expect(createHash("sha256").update(changed.data).digest("hex")).not.toBe(sampleDigest);
});

test("@claim:pdf-download creates a valid one-page PDF card with an embedded image", async ({ page }) => {
  await openDemo(page);
  const file = await downloadFile(page, /Download PDF/);
  expect(file.suggestedFilename).toBe("grandmas-birthday-lunch-handoff.pdf");
  expectPublicManifest(pdfManifest(file.bytes));
});

test("@claim:private-output-options keeps private values out of PNG and PDF until each choice is selected", async ({ page }) => {
  test.setTimeout(120_000);
  await openDemo(page);
  for (const values of [
    { link: false, notes: false, qr: false },
    { link: true, notes: false, qr: false },
    { link: false, notes: true, qr: false },
    { link: false, notes: false, qr: true }
  ]) {
    await setPrivateOptions(page, values);
    const pngFile = await downloadFile(page, /Download image/);
    const png = PNG.sync.read(pngFile.bytes);
    const pdfFile = await downloadFile(page, /Download PDF/);
    expectPrivateManifest(pngTextManifest(pngFile.bytes), values);
    expectPrivateManifest(pdfManifest(pdfFile.bytes), values);
    expect(qrValue(png)).toBe(values.qr ? SAMPLE.link : null);
  }
});

test("@claim:ics-import imports the first event from calendar text", async ({ page }) => {
  await openDemo(page);
  await page.getByRole("button", { name: "Paste calendar text" }).click();
  await page.getByLabel("Calendar event text").fill(`BEGIN:VCALENDAR
BEGIN:VEVENT
SUMMARY:School pickup
DTSTART;TZID=Europe/London:20261020T153000
DTEND;TZID=Europe/London:20261020T160000
LOCATION:North gate
DESCRIPTION:Ask for Lee
END:VEVENT
BEGIN:VEVENT
SUMMARY:Ignored event
DTSTART:20261021T120000Z
DTEND:20261021T130000Z
END:VEVENT
END:VCALENDAR`);
  await page.getByRole("button", { name: "Import first event" }).click();
  await expect(page.getByLabel("Event name")).toHaveValue("School pickup");
  await expect(page.getByText(/first of 2 events/i)).toBeVisible();
});

test("@claim:timezone-equivalents labels event, device, and recipient times", async ({ page }) => {
  await openDemo(page);
  await expect(page.locator("#timezone-list .zone-row strong")).toHaveText(["Event time", "On this device", "Recipient"]);
});

test("@claim:offline-reload reloads the filled sample after first visit", async ({ page, context }) => {
  await openDemo(page);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect(page.getByLabel("Event name")).toHaveValue(SAMPLE.title);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByLabel("Event name")).toHaveValue(SAMPLE.title);
  await expect(page.locator("#handoff-card")).toContainText(SAMPLE.title);
  await context.setOffline(false);
});

test("@claim:cache-privacy stores app resources but never the edited event", async ({ page }) => {
  await openDemo(page);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.getByLabel("Event name").fill("Cache-private event name");
  const cached = await page.evaluate(async () => {
    const records: Array<{ url: string; body: string }> = [];
    for (const cacheName of await caches.keys()) {
      const cache = await caches.open(cacheName);
      for (const request of await cache.keys()) {
        const response = await cache.match(request);
        let body = "";
        try { body = await response!.clone().text(); } catch { body = "[binary]"; }
        records.push({ url: request.url, body: body.slice(0, 50_000) });
      }
    }
    return records;
  });
  expect(cached.some((record) => record.url.endsWith("/index.html"))).toBeTruthy();
  expect(cached.some((record) => /calendar-bridge/.test(record.url))).toBeTruthy();
  expect(cached.every((record) => !record.url.includes("Cache-private") && !record.body.includes("Cache-private event name"))).toBeTruthy();
});

test("@claim:scope-limits completes the sample without an invitation or sync action", async ({ page }) => {
  const requests: Array<{ method: string; url: string }> = [];
  page.on("request", (request) => requests.push({ method: request.method(), url: request.url() }));
  await openDemo(page);
  await clipboard(page);
  await downloadFile(page, /Download calendar file/);
  await downloadFile(page, /Download image/);
  await downloadFile(page, /Download PDF/);
  const controls = await page.locator("button, a").allTextContents();
  expect(controls.join(" ")).not.toMatch(/send invitation|send invite|sync calendar/i);
  expect(requests.every((request) => request.method === "GET" && new URL(request.url).origin === "http://127.0.0.1:4173")).toBeTruthy();
});

test("routes, metadata, build IDs, focus, and the designed 404 work", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Calendar Handoff Card — create an event card");
  await expect(page.getByLabel("Demo mode")).toBeHidden();
  expect(await page.locator("h1:visible").count()).toBe(1);
  expect(await page.locator("[data-build-id]").textContent()).toMatch(/^[a-f0-9]{7}$/);
  await page.getByRole("link", { name: "Privacy" }).first().click();
  await expect(page).toHaveTitle("Privacy — Calendar Handoff Card");
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  expect(await page.locator("[data-build-id]").textContent()).toMatch(/^[a-f0-9]{7}$/);
  await page.goBack();
  await expect(page).toHaveTitle("Calendar Handoff Card — create an event card");
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  await page.goForward();
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  expect(await page.locator("[data-build-id]").textContent()).toMatch(/^[a-f0-9]{7}$/);
  await page.goto("/demo");
  await expect(page).toHaveTitle("Demo — Calendar Handoff Card");
  await expect(page.getByRole("heading", { level: 1, name: "Try a sample event card" })).toBeFocused();
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  const direct404 = await page.goto("/404.html");
  expect(direct404?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  expect(await page.locator("[data-build-id]").textContent()).toMatch(/^[a-f0-9]{7}$/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://calendar-handoff-card.sociobot.in/404.html");
  expect(errors).toEqual([]);
  const missing = await page.goto("/not-a-real-page");
  expect(missing?.status()).toBe(404);
  await expect(page).toHaveTitle("Page not found — Calendar Handoff Card");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});

test("accessibility, keyboard order, recovery messages, and mobile layout work", async ({ page, isMobile }) => {
  for (const route of ["/", "/demo", "/privacy", "/terms", "/404.html"]) {
    await page.goto(route);
    const results = await new AxeBuilder({ page: page as never }).analyze();
    expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact || ""))).toEqual([]);
  }
  await page.goto("/");
  await page.evaluate(() => {
    document.body.tabIndex = -1;
    document.body.focus();
  });
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to event builder" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Calendar Handoff Card home" })).toBeFocused();
  if (isMobile) {
    const sizes = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
    expect(sizes.scrollWidth).toBeLessThanOrEqual(sizes.clientWidth);
  }
  await openDemo(page);
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => Promise.reject(new Error("denied")) } });
    document.execCommand = () => false;
  });
  await page.getByRole("button", { name: /Copy plain text/ }).click();
  await expect(page.locator("#toast")).toContainText("Copy the event details manually");
  await page.evaluate(() => { HTMLCanvasElement.prototype.getContext = () => null; });
  await page.getByRole("button", { name: /Download image/ }).click();
  await expect(page.locator("#toast")).toContainText("Download the PDF or calendar file instead");
});
