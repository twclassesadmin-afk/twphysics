// Seeds the hosted Supabase project with the same demo data the app's old
// in-memory mock store used to ship with, so the client sees no visible
// change after the backend migration. Safe to re-run — every insert is
// guarded by a "does this already exist" check first.
//
// Usage: node scripts/seed-demo-data.mjs
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or
// SUPABASE_SECRET_KEY) in the environment — load .env.local before running:
//   set -a && source .env.local && set +a && node scripts/seed-demo-data.mjs

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
if (!url || !serviceKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SECRET_KEY");
}
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

let authUsersCache = null;
async function getOrCreateUser(email, password, fullName) {
  if (!authUsersCache) {
    const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (error) throw error;
    authUsersCache = data.users;
  }
  let user = authUsersCache.find((u) => u.email === email);
  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (error) throw error;
    user = data.user;
    authUsersCache.push(user);
    console.log(`  created auth user ${email}`);
  }
  return user;
}

async function getOrCreateByMatch(table, match, insertData) {
  const { data: existing, error: selectError } = await supabase.from(table).select("*").match(match).maybeSingle();
  if (selectError) throw new Error(`${table} select failed: ${selectError.message}`);
  if (existing) return existing;
  const { data, error } = await supabase.from(table).insert(insertData).select().single();
  if (error) throw new Error(`${table} insert failed: ${error.message}`);
  return data;
}

async function main() {
  console.log("Seeding tutors (auth users)...");
  const tut1 = await getOrCreateUser("ramesh.chandra@twphysics.example", "tutor123", "Dr. Ramesh Chandra");
  const tut2 = await getOrCreateUser("sowmya.reddy@twphysics.example", "tutor123", "Sowmya Reddy");
  const tut3 = await getOrCreateUser("lakshmi.iyer@twphysics.example", "tutor123", "Lakshmi Iyer");
  const tut4 = await getOrCreateUser("vikram.rao@twphysics.example", "tutor123", "Vikram Rao");

  for (const u of [tut1, tut2, tut3, tut4]) {
    const { error } = await supabase.from("profiles").update({ role: "tutor" }).eq("id", u.id);
    if (error) throw error;
  }

  console.log("Seeding students (auth users)...");
  const s1 = await getOrCreateUser("anjali.sharma@twphysics.example", "student123", "Anjali Sharma");
  const s2 = await getOrCreateUser("rahul.verma@twphysics.example", "student123", "Rahul Verma");
  const s3 = await getOrCreateUser("sneha.patil@twphysics.example", "student123", "Sneha Patil");
  const s4 = await getOrCreateUser("arjun.kumar@twphysics.example", "student123", "Arjun Kumar");

  console.log("Seeding courses...");
  const courseJee = await getOrCreateByMatch(
    "courses",
    { name: "JEE Mains" },
    {
      name: "JEE Mains",
      tagline: "Physics, Chemistry & Maths for JEE Main",
      duration_months: 12,
      highlights: [
        "Concept-first + JEE pattern practice",
        "Previous 15-year PYQ bank",
        "Choice of online or offline learning",
        "Individual or group learning tracks",
      ],
    },
  );
  const courseNeet = await getOrCreateByMatch(
    "courses",
    { name: "NEET" },
    {
      name: "NEET",
      tagline: "Complete Physics, Chemistry & Biology coverage",
      duration_months: 12,
      highlights: [
        "Daily live classes across all 3 subjects",
        "NCERT-first structured notes",
        "Doubt-clearing within 24 hours",
        "Choice of online or offline learning",
      ],
    },
  );
  const courseEapcet = await getOrCreateByMatch(
    "courses",
    { name: "EAPCET" },
    {
      name: "EAPCET",
      tagline: "Physics, Chemistry & Maths/Biology for EAPCET",
      duration_months: 12,
      highlights: [
        "EAPCET-pattern practice tests",
        "Concept-first structured notes",
        "Choice of online or offline learning",
        "Individual or group learning tracks",
      ],
    },
  );

  console.log("Seeding batches...");
  const b1 = await getOrCreateByMatch(
    "batches",
    { name: "NEET College-Going Batch A" },
    {
      name: "NEET College-Going Batch A",
      course_id: courseNeet.id,
      student_category: "college_going",
      start_date: "2026-08-03",
      daily_time: "5:00–7:00 AM / 5:30–9:30 PM",
      capacity: 60,
    },
  );
  const b2 = await getOrCreateByMatch(
    "batches",
    { name: "NEET Long-Term Batch A" },
    {
      name: "NEET Long-Term Batch A",
      course_id: courseNeet.id,
      student_category: "long_term",
      start_date: "2026-08-10",
      daily_time: "5:00 AM–9:30 PM",
      capacity: 60,
    },
  );
  const b3 = await getOrCreateByMatch(
    "batches",
    { name: "JEE Mains College-Going Batch A" },
    {
      name: "JEE Mains College-Going Batch A",
      course_id: courseJee.id,
      student_category: "college_going",
      start_date: "2026-08-05",
      daily_time: "5:00–7:00 AM / 5:30–9:30 PM",
      capacity: 50,
    },
  );
  const b4 = await getOrCreateByMatch(
    "batches",
    { name: "EAPCET Long-Term Batch A" },
    {
      name: "EAPCET Long-Term Batch A",
      course_id: courseEapcet.id,
      student_category: "long_term",
      start_date: "2026-08-05",
      daily_time: "5:00 AM–9:30 PM",
      capacity: 50,
    },
  );

  console.log("Seeding tutors (extension rows)...");
  async function upsertTutor(user, patch) {
    const { data, error } = await supabase
      .from("tutors")
      .upsert({ id: user.id, ...patch }, { onConflict: "id" })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  await upsertTutor(tut1, {
    subjects: ["Physics"],
    phone: "+91 90000 00002",
    qualifications: "Ph.D. Physics, IIT Kharagpur",
    availability: "Mon-Sat, 6:30 AM - 9:00 PM",
    bio: "Former NEET/JEE faculty at two leading Hyderabad institutes, 14 years teaching experience.",
    joined_at: "2025-06-01",
  });
  await upsertTutor(tut2, {
    subjects: ["Chemistry"],
    phone: "+91 90000 00004",
    qualifications: "M.Sc. Chemistry, Osmania University",
    availability: "Mon-Sat, 8:00 AM - 8:00 PM",
    bio: "8 years teaching organic and inorganic chemistry for NEET/JEE aspirants.",
    joined_at: "2025-07-15",
  });
  await upsertTutor(tut3, {
    subjects: ["Biology"],
    phone: "+91 90000 00005",
    qualifications: "M.Sc. Zoology, Andhra University",
    availability: "Mon-Fri, 7:00 AM - 6:00 PM",
    bio: "4 years teaching Biology with a focus on NCERT-first conceptual clarity.",
    joined_at: "2026-07-05",
  });
  await upsertTutor(tut4, {
    subjects: ["Mathematics", "Reasoning"],
    phone: "+91 90000 00009",
    qualifications: "M.Sc. Mathematics, Osmania University",
    availability: "Mon-Sat, 6:00 AM - 9:00 PM",
    bio: "10 years teaching Mathematics and Reasoning for JEE Main and EAPCET aspirants.",
    joined_at: "2025-08-01",
  });

  const { data: admin } = await supabase.from("profiles").select("id").eq("role", "admin").limit(1).maybeSingle();

  console.log("Seeding tutor applications...");
  await getOrCreateByMatch(
    "tutor_applications",
    { email: "priya.menon@example.com" },
    {
      full_name: "Priya Menon",
      email: "priya.menon@example.com",
      phone: "+91 98765 00001",
      subjects: ["Physics"],
      qualifications: "M.Sc. Physics, Delhi University",
      experience: "6 yrs",
      availability: "Mon-Sat, 6:00 AM - 9:00 PM",
      bio: "6 years of NEET/JEE Physics coaching experience, specializing in mechanics and modern physics.",
      status: "pending",
      submitted_at: "2026-07-10",
    },
  );
  await getOrCreateByMatch(
    "tutor_applications",
    { email: "suresh.babu@example.com" },
    {
      full_name: "Suresh Babu",
      email: "suresh.babu@example.com",
      phone: "+91 98765 00002",
      subjects: ["Chemistry"],
      qualifications: "Ph.D. Chemistry, Anna University",
      experience: "9 yrs",
      availability: "Mon-Fri, 7:00 AM - 7:00 PM",
      bio: "9 years teaching organic chemistry, published NEET prep material with two coaching chains.",
      status: "pending",
      submitted_at: "2026-07-11",
    },
  );
  const ta3 = await getOrCreateByMatch(
    "tutor_applications",
    { email: "lakshmi.iyer@twphysics.example" },
    {
      full_name: "Lakshmi Iyer",
      email: "lakshmi.iyer@twphysics.example",
      phone: "+91 90000 00005",
      subjects: ["Biology"],
      qualifications: "M.Sc. Zoology, Andhra University",
      experience: "4 yrs",
      availability: "Mon-Fri, 7:00 AM - 6:00 PM",
      bio: "4 years teaching Biology with a focus on NCERT-first conceptual clarity.",
      status: "approved",
      submitted_at: "2026-07-05",
      reviewed_by: admin?.id ?? null,
      reviewed_at: "2026-07-06",
    },
  );
  await supabase.from("tutors").update({ application_id: ta3.id }).eq("id", tut3.id);

  console.log("Seeding batch_tutors...");
  async function upsertBatchTutor(batchId, subject, tutorId) {
    const { error } = await supabase
      .from("batch_tutors")
      .upsert({ batch_id: batchId, subject, tutor_id: tutorId }, { onConflict: "batch_id,subject" });
    if (error) throw error;
  }
  for (const [batch, subj, tutor] of [
    [b1, "Physics", tut1],
    [b1, "Chemistry", tut2],
    [b1, "Biology", tut3],
    [b2, "Physics", tut1],
    [b2, "Chemistry", tut2],
    [b2, "Biology", tut3],
    [b3, "Physics", tut1],
    [b3, "Chemistry", tut2],
    [b3, "Mathematics", tut4],
    [b4, "Physics", tut1],
    [b4, "Chemistry", tut2],
    [b4, "Mathematics", tut4],
  ]) {
    await upsertBatchTutor(batch.id, subj, tutor.id);
  }

  console.log("Seeding pricing tiers...");
  await getOrCreateByMatch(
    "pricing_tiers",
    { batch_size: 9 },
    { batch_size: 9, label: "Group of 9", subjects_count: 3, days_per_subject_per_month: 12, monthly_fee_inr: 9000 },
  );
  await getOrCreateByMatch(
    "pricing_tiers",
    { batch_size: 5 },
    { batch_size: 5, label: "Group of 5", subjects_count: 3, days_per_subject_per_month: 12, monthly_fee_inr: 12000 },
  );
  await getOrCreateByMatch(
    "pricing_tiers",
    { batch_size: 3 },
    { batch_size: 3, label: "Group of 3", subjects_count: 3, days_per_subject_per_month: 12, monthly_fee_inr: 16000 },
  );

  console.log("Seeding students (extension rows)...");
  async function upsertStudent(user, patch) {
    const { data, error } = await supabase
      .from("students")
      .upsert({ id: user.id, ...patch }, { onConflict: "id" })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  const studentS1 = await upsertStudent(s1, {
    phone: "+91 90000 00003",
    age: 17,
    parent_name: "Rakesh Sharma",
    parent_phone: "+91 90000 10003",
    address: "Flat 402, Sri Sai Residency, Kukatpally, Hyderabad, Telangana - 500072",
    course_id: courseNeet.id,
    batch_id: b1.id,
    student_category: "college_going",
    stream: "BiPC",
    target_exams: ["NEET"],
    learning_mode: "online",
    learning_type: "group",
    status: "active",
    attendance_pct: 94,
    tag: "topper",
    tag_note: "Consistently attentive and keeps up with every topic.",
  });
  const studentS2 = await upsertStudent(s2, {
    phone: "+91 90000 00006",
    age: 17,
    parent_name: "Sunil Verma",
    parent_phone: "+91 90000 10006",
    address: "H.No 8-2-120, Banjara Hills, Hyderabad, Telangana - 500034",
    course_id: courseNeet.id,
    batch_id: b1.id,
    student_category: "college_going",
    stream: "BiPC",
    target_exams: ["NEET"],
    learning_mode: "online",
    learning_type: "group",
    status: "active",
    attendance_pct: 61,
    tag: "weak",
    tag_note: "Struggling with Organic Chemistry — recommend extra practice sets.",
  });
  await upsertStudent(s3, {
    phone: "+91 90000 00007",
    age: 18,
    parent_name: "Mahesh Patil",
    parent_phone: "+91 90000 10007",
    address: "Plot 12, Madhapur, Hyderabad, Telangana - 500081",
    course_id: courseJee.id,
    batch_id: b3.id,
    student_category: "college_going",
    stream: "MPC",
    target_exams: ["JEE Mains"],
    learning_mode: "online",
    learning_type: "individual",
    status: "active",
    attendance_pct: 88,
    tag: null,
    tag_note: "",
  });
  await upsertStudent(s4, {
    phone: "+91 90000 00008",
    age: 16,
    parent_name: "Vijay Kumar",
    parent_phone: "+91 90000 10008",
    address: "3-4-56, Dilsukhnagar, Hyderabad, Telangana - 500060",
    course_id: courseEapcet.id,
    batch_id: b4.id,
    student_category: "long_term",
    stream: "MPC",
    target_exams: ["EAPCET"],
    learning_mode: "online",
    learning_type: "group",
    status: "expiring_soon",
    attendance_pct: 76,
    tag: "focus_needed",
    tag_note: "Attendance dropping — check in on enrollment renewal.",
  });

  console.log("Seeding student flags...");
  await getOrCreateByMatch(
    "student_flags",
    { student_id: s1.id, note: "Consistently attentive and keeps up with every topic." },
    {
      student_id: s1.id,
      type: "topper",
      note: "Consistently attentive and keeps up with every topic.",
      author_id: tut1.id,
      author_role: "tutor",
      created_at: "2026-07-08T00:00:00Z",
    },
  );
  await getOrCreateByMatch(
    "student_flags",
    { student_id: s2.id, note: "Struggling with Organic Chemistry — recommend extra practice sets." },
    {
      student_id: s2.id,
      type: "weak",
      note: "Struggling with Organic Chemistry — recommend extra practice sets.",
      author_id: tut1.id,
      author_role: "tutor",
      created_at: "2026-07-09T00:00:00Z",
    },
  );
  await getOrCreateByMatch(
    "student_flags",
    { student_id: s4.id, note: "Attendance dropping — check in on enrollment renewal." },
    {
      student_id: s4.id,
      type: "focus_needed",
      note: "Attendance dropping — check in on enrollment renewal.",
      author_id: tut2.id,
      author_role: "tutor",
      created_at: "2026-07-11T00:00:00Z",
    },
  );

  console.log("Seeding classes...");
  const cl1 = await getOrCreateByMatch(
    "classes",
    { batch_id: b1.id, subject: "Physics", topic: "Thermodynamics" },
    {
      batch_id: b1.id,
      subject: "Physics",
      topic: "Thermodynamics",
      tutor_id: tut1.id,
      scheduled_at: "2026-07-15T07:00:00Z",
      duration_minutes: 60,
      join_url: "https://zoom.us/j/twp-demo-thermo",
    },
  );
  await getOrCreateByMatch(
    "classes",
    { batch_id: b1.id, subject: "Chemistry", topic: "Chemical Bonding" },
    {
      batch_id: b1.id,
      subject: "Chemistry",
      topic: "Chemical Bonding",
      tutor_id: tut2.id,
      scheduled_at: "2026-07-15T17:00:00Z",
      duration_minutes: 60,
      join_url: "https://zoom.us/j/twp-demo-bonding",
    },
  );
  await getOrCreateByMatch(
    "classes",
    { batch_id: b1.id, subject: "Biology", topic: "Genetics — Part 2" },
    {
      batch_id: b1.id,
      subject: "Biology",
      topic: "Genetics — Part 2",
      tutor_id: tut3.id,
      scheduled_at: "2026-07-12T07:00:00Z",
      duration_minutes: 60,
      join_url: "https://zoom.us/j/twp-demo-genetics",
    },
  );

  console.log("Seeding attendance entries...");
  const attendanceRows = [
    [studentS1, "2026-07-12", "Biology", true, cl1.id],
    [studentS1, "2026-07-11", "Chemistry", true, null],
    [studentS1, "2026-07-10", "Physics", false, null],
    [studentS1, "2026-07-09", "Biology", true, null],
    [studentS1, "2026-07-08", "Chemistry", true, null],
    [studentS2, "2026-07-12", "Biology", false, null],
    [studentS2, "2026-07-11", "Chemistry", true, null],
    [studentS2, "2026-07-10", "Physics", false, null],
  ];
  for (const [student, date, subject, attended, classId] of attendanceRows) {
    await getOrCreateByMatch(
      "attendance_entries",
      { student_id: student.id, date, subject },
      { student_id: student.id, date, subject, attended, class_id: classId },
    );
  }

  console.log("Seeding syllabus items...");
  for (const [batch, topic, subject, deadline, status] of [
    [b1, "Laws of Motion", "Physics", "2026-07-15", "completed"],
    [b1, "Thermodynamics", "Physics", "2026-07-20", "in_progress"],
    [b1, "Chemical Bonding", "Chemistry", "2026-07-18", "not_started"],
    [b1, "Genetics & Evolution", "Biology", "2026-07-14", "not_started"],
    [b3, "Coordination Compounds", "Chemistry", "2026-07-12", "in_progress"],
  ]) {
    await getOrCreateByMatch(
      "syllabus_items",
      { batch_id: batch.id, topic },
      { batch_id: batch.id, topic, subject, deadline, status },
    );
  }

  console.log("Seeding study materials...");
  for (const [batch, title, type, materialUrl, uploadedBy] of [
    [b1, "Thermodynamics — Full Notes", "pdf", "https://example.com/materials/thermodynamics-notes.pdf", tut1],
    [b1, "Laws of Motion — Practice Problems", "pdf", "https://example.com/materials/laws-of-motion-practice.pdf", tut1],
    [b1, "NCERT Chapter Summary Videos", "link", "https://example.com/materials/ncert-summary-videos", tut2],
  ]) {
    await getOrCreateByMatch(
      "study_materials",
      { batch_id: batch.id, title },
      { batch_id: batch.id, title, type, url: materialUrl, uploaded_by: uploadedBy.id },
    );
  }

  console.log("Seeding broadcasts...");
  for (const [batch, tutor, message] of [
    [b1, tut1, "Tomorrow's class moved to 7:30 AM due to a schedule change."],
    [b1, tut1, "Great engagement in yesterday's class — keep it up!"],
  ]) {
    await getOrCreateByMatch(
      "broadcasts",
      { batch_id: batch.id, message },
      { batch_id: batch.id, tutor_id: tutor.id, message },
    );
  }

  console.log("Seeding issues...");
  const issue1 = await getOrCreateByMatch(
    "issues",
    { subject: "Batch timing clash with college hours", raised_by_id: s1.id },
    {
      subject: "Batch timing clash with college hours",
      description: "The current batch timing overlaps with college classes on Mondays.",
      raised_by_id: s1.id,
      raised_by_role: "student",
      status: "resolved",
      assigned_to: "Admin (You)",
    },
  );
  await getOrCreateByMatch(
    "issues",
    { subject: "Couldn't join yesterday's live class", raised_by_id: s1.id },
    {
      subject: "Couldn't join yesterday's live class",
      description: "The Zoom link didn't work when I tried to join.",
      raised_by_id: s1.id,
      raised_by_role: "student",
      status: "in_progress",
      assigned_to: "Admin (You)",
    },
  );
  await getOrCreateByMatch(
    "issues",
    { subject: "Need help reassigning a student's batch", raised_by_id: tut1.id },
    {
      subject: "Need help reassigning a student's batch",
      description: "Requesting a batch reassignment for a student who relocated.",
      raised_by_id: tut1.id,
      raised_by_role: "tutor",
      status: "open",
    },
  );
  await getOrCreateByMatch(
    "issues",
    { subject: "Study material upload failing", raised_by_id: tut2.id },
    {
      subject: "Study material upload failing",
      description: "Getting an error when uploading PDF notes over 10MB.",
      raised_by_id: tut2.id,
      raised_by_role: "tutor",
      status: "open",
    },
  );

  console.log("Seeding issue comments...");
  await getOrCreateByMatch(
    "issue_comments",
    { issue_id: issue1.id, message: "Moved to the evening batch — confirmed with the tutor." },
    {
      issue_id: issue1.id,
      author_id: admin?.id ?? s1.id,
      message: "Moved to the evening batch — confirmed with the tutor.",
    },
  );

  console.log("Seeding notifications...");
  const notifRows = [
    [s1.id, "Class reminder", "Thermodynamics class starts at 7:00 AM tomorrow.", "class", false],
    [
      admin?.id,
      "Syllabus behind",
      "JEE Mains College-Going Batch A is behind on Coordination Compounds.",
      "syllabus",
      false,
    ],
    [s1.id, "Tutor reassigned", "Your batch's tutor has been changed to Dr. Ramesh Chandra.", "generic", true],
  ];
  for (const [userId, title, message, kind, isRead] of notifRows) {
    if (!userId) continue;
    const existing = await getOrCreateByMatch(
      "notifications",
      { user_id: userId, title, message },
      { user_id: userId, title, message, kind, is_read: isRead },
    );
    if (existing.is_read !== isRead) {
      await supabase.from("notifications").update({ is_read: isRead }).eq("id", existing.id);
    }
  }

  console.log("Seeding activity log...");
  for (const [actor, action, target] of [
    ["Admin User", "Approved tutor application", "Lakshmi Iyer"],
    ["Dr. Ramesh Chandra", "Marked syllabus topic complete", "Laws of Motion — NEET College-Going Batch A"],
    ["System (automation)", "Flagged student inactive", "Rahul Verma"],
  ]) {
    await getOrCreateByMatch("activity_log", { actor, action, target }, { actor, action, target });
  }

  console.log("Seeding results...");
  for (const [name, exam, rank, score, quote] of [
    ["Anjali Sharma", "NEET 2025", "AIR 342", "685/720", "The daily doubt sessions made the difference for me."],
    [
      "Karthik Naidu",
      "JEE Main 2025",
      "AIR 891",
      "98.7 percentile",
      "The tutors here go the extra mile — that's why it worked.",
    ],
    [
      "Divya Reddy",
      "NEET 2025",
      "AIR 1204",
      "662/720",
      "Coming from a Telugu-medium school, the way faculty explained things just clicked.",
    ],
    ["Mohammed Arshad", "JEE Main 2025", "AIR 2033", "97.2 percentile", "Structured, and the tutors actually respond."],
  ]) {
    await getOrCreateByMatch("results", { name, exam }, { name, exam, rank, score, quote });
  }

  console.log("Seeding testimonials...");
  for (const [name, role, quote] of [
    [
      "Anjali Sharma",
      "NEET 2025, AIR 342",
      "I could ask doubts at midnight and get a reply by morning. That responsiveness is rare.",
    ],
    [
      "Ramesh (Parent)",
      "Parent of a Class 12 student",
      "As a parent, the progress reports gave me real visibility — not just promises.",
    ],
    ["Karthik Naidu", "JEE Main 2025, AIR 891", "Live classes and a real tutor to ask — exactly what I needed."],
  ]) {
    await getOrCreateByMatch("testimonials", { name, quote }, { name, role, quote });
  }

  console.log("\nDone. Demo logins:");
  console.log("  tutors:   ramesh.chandra@twphysics.example / sowmya.reddy@ / lakshmi.iyer@ / vikram.rao@  (tutor123)");
  console.log("  students: anjali.sharma@twphysics.example / rahul.verma@ / sneha.patil@ / arjun.kumar@  (student123)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
