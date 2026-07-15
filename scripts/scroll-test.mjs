import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
page.on("pageerror", (err) => errors.push(String(err)));

await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

// Simulate a real user scrolling down in steps, like a human would.
const height = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < height; y += 600) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(150);
}
await page.waitForTimeout(500);

// Check each section's heading text is actually visible (opacity > 0.5) after scrolling through.
const sections = ["Choose your track", "Numbers our students are proud of", "How it works", "What students and parents say", "Seats are filling up", "Common questions"];
for (const text of sections) {
  const locator = page.getByText(text, { exact: true }).first();
  const opacity = await locator.evaluate((el) => getComputedStyle(el).opacity).catch(() => "MISSING");
  console.log(`${text}: opacity=${opacity}`);
}

console.log("ERRORS:", errors.length ? errors : "none");
await page.screenshot({ path: process.argv[2], fullPage: true });
await browser.close();
