import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
let errors = [];
page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
page.on("pageerror", (err) => errors.push(String(err)));

async function report(label) {
  if (errors.length) {
    console.log(`FAIL [${label}]:`);
    errors.forEach(e => console.log("   -", e.slice(0, 200)));
  } else {
    console.log(`OK   [${label}]`);
  }
  errors = [];
}

async function openEveryButtonDialog(pageUrl, buttonNames) {
  await page.goto(`http://localhost:3000${pageUrl}`, { waitUntil: "networkidle" });
  await report(`load ${pageUrl}`);
  for (const name of buttonNames) {
    try {
      await page.getByRole("button", { name, exact: false }).first().click({ timeout: 3000 });
      await page.waitForTimeout(250);
      await report(`${pageUrl} -> click "${name}"`);
      // close any open dialog via Escape
      await page.keyboard.press("Escape");
      await page.waitForTimeout(150);
    } catch (e) {
      console.log(`SKIP [${pageUrl} -> "${name}"]: ${e.message.split("\n")[0]}`);
    }
  }
}

await openEveryButtonDialog("/admin/users", ["Add Student"]);
await openEveryButtonDialog("/admin/batches", ["New Course", "New Batch", "Assign Tutor"]);
await openEveryButtonDialog("/admin/syllabus", ["Add Topic"]);
await openEveryButtonDialog("/admin/exams", ["Create Exam"]);
await openEveryButtonDialog("/admin/issues", []);
await openEveryButtonDialog("/tutor/students", ["Edit Tag"]);
await openEveryButtonDialog("/tutor/materials", ["Upload Material"]);
await openEveryButtonDialog("/student/classes", ["Add Note"]);
await openEveryButtonDialog("/tutor/profile", ["Request change"]);

await browser.close();
