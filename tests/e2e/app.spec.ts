import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";

async function openDemo(page: import("@playwright/test").Page, url = "/demo"): Promise<void> {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
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

test("@claim:demo-sample opens an isolated filled sample and resets it", async ({ page }) => {
  await openDemo(page, "/?demo=1");
  await expect(page.getByLabel("Demo mode")).toContainText("Demo — sample data, nothing is saved");
  await expect(page.getByLabel("Event name")).toHaveValue("Grandma’s birthday lunch");
  await expect(page.locator("#handoff-card")).toContainText("42 Orchard Lane, Brooklyn");
  await page.getByLabel("Event name").fill("Changed sample");
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.getByLabel("Event name")).toHaveValue("Grandma’s birthday lunch");
  const storage = await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }));
  expect(storage.local).toEqual([]);
  expect(storage.session.every((key) => key.startsWith("demo:"))).toBeTruthy();
  await page.getByRole("link", { name: "Start for real" }).click();
  await expect(page.getByLabel("Event name")).toHaveValue("");
  expect(await page.evaluate(() => sessionStorage.getItem("demo:calendar-handoff-card"))).toBeNull();
});

test("@claim:no-account creates the sample without sign-in", async ({ page }) => {
  await openDemo(page);
  await expect(page.getByLabel("Event name")).toHaveValue("Grandma’s birthday lunch");
  await expect(page.getByText(/sign in|log in|create account/i)).toHaveCount(0);
});

test("@claim:local-processing keeps the whole sample flow on this origin", async ({ page }) => {
  const requests: Array<{ url: string; method: string; body: string | null }> = [];
  page.on("request", (request) => requests.push({ url: request.url(), method: request.method(), body: request.postData() }));
  await openDemo(page);
  await clipboard(page);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: /Download calendar file/ }).click();
  await download;
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
  for (const value of ["Grandma’s birthday lunch", "42 Orchard Lane, Brooklyn", "Maya Chen", "Reply to Maya by Thursday", "https://meet.example/family-lunch", "Bring a photo for Grandma’s album."]) expect(copied).toContain(value);
});

test("@claim:ics-download downloads a calendar file with event details", async ({ page }) => {
  await openDemo(page);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Download calendar file/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("grandmas-birthday-lunch-handoff.ics");
  const path = await download.path();
  expect(path).toBeTruthy();
  expect(await readFile(path!, "utf8")).toContain("SUMMARY:Grandma’s birthday lunch");
});

test("@claim:image-download downloads a PNG card", async ({ page, isMobile }) => {
  test.skip(Boolean(isMobile), "one browser download check is sufficient");
  await openDemo(page);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: /Download image/ }).click();
  expect((await download).suggestedFilename()).toBe("grandmas-birthday-lunch-handoff.png");
});

test("@claim:pdf-download downloads a PDF card", async ({ page, isMobile }) => {
  test.skip(Boolean(isMobile), "one browser download check is sufficient");
  await openDemo(page);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: /Download PDF/ }).click();
  expect((await download).suggestedFilename()).toBe("grandmas-birthday-lunch-handoff.pdf");
});

test("@claim:private-output-options keeps private choices off until selected", async ({ page }) => {
  await openDemo(page);
  await expect(page.getByLabel("Print the joining link")).not.toBeChecked();
  await expect(page.getByLabel("Print event notes")).not.toBeChecked();
  await expect(page.locator("#handoff-card")).not.toContainText("family-lunch");
  await page.getByText("Print the joining link", { exact: true }).click();
  await page.getByText("Print event notes", { exact: true }).click();
  await expect(page.locator("#handoff-card")).toContainText("family-lunch");
  await expect(page.locator("#handoff-card")).toContainText("Bring a photo");
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
  await expect(page.getByLabel("Event name")).toHaveValue("Grandma’s birthday lunch");
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByLabel("Event name")).toHaveValue("Grandma’s birthday lunch");
  await expect(page.locator("#handoff-card")).toContainText("Grandma’s birthday lunch");
  await context.setOffline(false);
});

test("routes set titles, focus the new heading, and expose a useful 404", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Calendar Handoff Card — create an event card");
  await expect(page.getByLabel("Demo mode")).toBeHidden();
  expect(await page.evaluate(() => sessionStorage.getItem("demo:calendar-handoff-card"))).toBeNull();
  await page.getByRole("link", { name: "Privacy" }).first().click();
  await expect(page).toHaveTitle("Privacy — Calendar Handoff Card");
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  await page.goBack();
  await expect(page).toHaveTitle("Calendar Handoff Card — create an event card");
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  await page.goForward();
  await expect(page).toHaveTitle("Privacy — Calendar Handoff Card");
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  await page.goto("/demo");
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  const direct404 = await page.goto("/404.html");
  expect(direct404?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Try the sample event" })).toHaveAttribute("href", "/demo");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://calendar-handoff-card.sociobot.in/404.html");
  const notFoundAxe = await new AxeBuilder({ page: page as never }).analyze();
  expect(notFoundAxe.violations.filter((violation) => ["serious", "critical"].includes(violation.impact || ""))).toEqual([]);
  expect(errors).toEqual([]);
  const missing = await page.goto("/not-a-real-page");
  expect(missing?.status()).toBe(404);
  await expect(page).toHaveTitle("Page not found — Calendar Handoff Card");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});

test("metadata, accessibility, keyboard order, and mobile layout work", async ({ page, isMobile }) => {
  await page.goto("/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://calendar-handoff-card.sociobot.in/");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /og-image\.png$/);
  await expect(page.locator("h1")).toHaveCount(1);
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact || ""))).toEqual([]);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to event builder" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Calendar Handoff Card home" })).toBeFocused();
  if (isMobile) {
    const sizes = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
    expect(sizes.scrollWidth).toBeLessThanOrEqual(sizes.clientWidth);
  }
});
