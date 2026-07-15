import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
page.on("pageerror", (err) => errors.push(String(err)));

// Test 1: Admin - add a student end to end
await page.goto("http://localhost:3000/admin/users", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Add Student" }).click();
await page.getByLabel("Full name").fill("Test Student QA");
await page.getByRole("button", { name: "Add Student" }).last().click();
await page.waitForTimeout(400);
const studentAdded = await page.getByText("Test Student QA").count();
console.log("Student added and visible in table:", studentAdded > 0);

// Test 2: Admin - approve a tutor application
await page.getByRole("tab", { name: "Tutor Applications" }).click();
await page.waitForTimeout(200);
await page.getByRole("button", { name: "Approve" }).first().click();
await page.waitForTimeout(400);
const approvedToast = await page.getByText("Tutor approved").count();
console.log("Tutor approved toast shown:", approvedToast > 0);

// Test 3: Student - raise an issue end to end
await page.goto("http://localhost:3000/student/issues", { waitUntil: "networkidle" });
await page.getByLabel("Subject").fill("QA test issue");
await page.getByLabel("Description").fill("Testing the raise-issue flow end to end.");
await page.getByRole("button", { name: "Submit Issue" }).click();
await page.waitForTimeout(400);
const issueAdded = await page.getByText("QA test issue").count();
console.log("Issue added and visible in list:", issueAdded > 0);

// Test 4: Tutor - mark syllabus in progress
await page.goto("http://localhost:3000/tutor/syllabus", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Mark In Progress" }).first().click();
await page.waitForTimeout(400);
const toastShown = await page.getByText("Syllabus status updated").count();
console.log("Syllabus status update toast shown:", toastShown > 0);

console.log("ERRORS:", errors.length ? errors : "none");
await browser.close();
