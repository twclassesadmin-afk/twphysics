import { chromium } from "playwright";
const [, , url, outPath] = process.argv;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: 1440, height: 300 } });
await browser.close();
