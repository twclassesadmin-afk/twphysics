import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
let errors = [];
page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
page.on("pageerror", (err) => errors.push(String(err)));

const pages = [
  "/", "/login", "/signup",
  "/admin", "/admin/users", "/admin/batches", "/admin/syllabus", "/admin/exams", "/admin/activity", "/admin/issues", "/admin/profile",
  "/tutor", "/tutor/batches", "/tutor/syllabus", "/tutor/exams", "/tutor/materials", "/tutor/communication", "/tutor/students", "/tutor/profile",
  "/student", "/student/course", "/student/classes", "/student/exams", "/student/leaderboard", "/student/progress", "/student/issues", "/student/profile",
];

for (const p of pages) {
  errors = [];
  await page.goto(`http://localhost:3000${p}`, { waitUntil: "networkidle", timeout: 15000 });
  if (errors.length) {
    console.log(`FAIL [${p}]:`);
    errors.forEach(e => console.log("   -", e.slice(0, 200)));
  } else {
    console.log(`OK   [${p}]`);
  }
}
await browser.close();
