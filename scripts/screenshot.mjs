import { chromium } from "playwright";

const [, , url, outPath, waitSelector] = process.argv;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => consoleErrors.push(String(err)));

await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
if (waitSelector) {
  await page.waitForSelector(waitSelector, { timeout: 10000 }).catch(() => {});
}
// fullPage capture doesn't fire real scroll/resize events, so IntersectionObserver-based
// reveal animations need their fallback timers to elapse before this is representative.
await page.waitForTimeout(1000);
await page.screenshot({ path: outPath, fullPage: true });
await browser.close();

console.log("SCREENSHOT_OK:", outPath);
if (consoleErrors.length) {
  console.log("CONSOLE_ERRORS:");
  consoleErrors.forEach((e) => console.log(" -", e));
} else {
  console.log("CONSOLE_ERRORS: none");
}
