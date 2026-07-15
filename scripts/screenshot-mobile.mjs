import { chromium } from "playwright";
const [, , url, outPath] = process.argv;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
await page.screenshot({ path: outPath, fullPage: false });
await browser.close();
console.log("SCREENSHOT_OK:", outPath);
