import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});

test("builds and exports a complete handoff", async ({ page }) => {
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("button", { name: /Copy plain text/ })).toBeDisabled();

  await page.getByLabel("Event name").fill("Sunday family lunch");
  await page.getByLabel("Place").fill("12 Orchard Lane");
  await page.getByRole("textbox", { name: "Joining link", exact: true }).fill("https://meet.example/family");
  await page.getByLabel("Organizer").fill("Maya");
  await page.getByLabel("RSVP details").fill("Reply by Saturday");
  await page.getByRole("textbox", { name: "Notes", exact: true }).fill("Bring a photo for the album.");

  await expect(page.getByText("Ready to share")).toBeVisible();
  await expect(page.locator("#handoff-card")).toContainText("Sunday family lunch");
  await expect(page.locator("#timezone-list .zone-row")).toHaveCount(2);
  await expect(page.locator("#handoff-card")).not.toContainText("https://meet.example/family");

  await page.getByText("Print the joining link", { exact: true }).click();
  await expect(page.locator("#handoff-card")).toContainText("https://meet.example/family");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Add to calendar/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("sunday-family-lunch-handoff.ics");

  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: (text: string) => { (window as unknown as { copied: string }).copied = text; return Promise.resolve(); } }
    });
  });
  await page.getByRole("button", { name: /Copy plain text/ }).click();
  const copied = await page.evaluate(() => (window as unknown as { copied: string }).copied);
  expect(copied).toContain("Sunday family lunch");
  expect(copied).toContain("Join: https://meet.example/family");
});

test("imports pasted ICS and reports the first event", async ({ page }) => {
  await page.getByRole("button", { name: "Paste ICS text" }).click();
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
  await expect(page.locator("#handoff-card")).toContainText("North gate");
});

test("has no serious accessibility violations", async ({ page }) => {
  // axe accepts every supported Playwright Page; its broad peer dependency
  // can otherwise resolve a newer structural type than our pinned browser.
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact || ""))).toEqual([]);
});

test("shows a useful offline state and keeps the form available", async ({ page, context }) => {
  await context.setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));
  await expect(page.getByText("Offline, still useful.")).toBeVisible();
  await page.getByLabel("Event name").fill("Offline planning");
  await expect(page.locator("#handoff-card")).toContainText("Offline planning");
  await context.setOffline(false);
});

test("legal pages explain storage and limits", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your events stay yours.");
  await expect(page.locator("main")).toContainText("does not receive, store, sell, or analyze");
  await page.goto("/terms");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("A small tool, fair terms.");
});

test("mobile layout does not overflow", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile project only");
  const sizes = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));
  expect(sizes.scrollWidth).toBeLessThanOrEqual(sizes.clientWidth);
});

test("renders PNG and PDF cards with an opt-in QR", async ({ page, isMobile }) => {
  test.skip(Boolean(isMobile), "one browser export check is sufficient");
  await page.getByLabel("Event name").fill("Community check-in");
  await page.getByRole("textbox", { name: "Joining link", exact: true }).fill("https://meet.example/check-in");
  await page.getByText("Encode the joining link as a QR", { exact: true }).click();

  const imageDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: /Download image/ }).click();
  expect((await imageDownload).suggestedFilename()).toBe("community-check-in-handoff.png");

  const pdfDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: /Download PDF/ }).click();
  expect((await pdfDownload).suggestedFilename()).toBe("community-check-in-handoff.pdf");
});

test("the primary source actions are keyboard reachable", async ({ page }) => {
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to event builder" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Calendar Handoff Card home" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: /Make a handoff card/ })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Import an ICS file" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Paste ICS text" })).toBeFocused();
});
