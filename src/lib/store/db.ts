import { hashPassword } from "./password";
import type {
  Account,
  ActivityEntry,
  Batch,
  BatchTutorAssignment,
  Broadcast,
  Course,
  Issue,
  Notification,
  PricingTier,
  ResultEntry,
  ScheduledClass,
  Student,
  StudyMaterial,
  SyllabusItem,
  Testimonial,
  Tutor,
  TutorApplication,
} from "./types";

export type StoreShape = {
  accounts: Account[];
  tutorApplications: TutorApplication[];
  tutors: Tutor[];
  students: Student[];
  courses: Course[];
  batches: Batch[];
  batchTutors: BatchTutorAssignment[];
  pricingTiers: PricingTier[];
  issues: Issue[];
  notifications: Notification[];
  classes: ScheduledClass[];
  syllabus: SyllabusItem[];
  materials: StudyMaterial[];
  broadcasts: Broadcast[];
  activityLog: ActivityEntry[];
  results: ResultEntry[];
  testimonials: Testimonial[];
};

// Demo credentials (mock phase only — see password.ts):
//   admin@twphysics.example    / admin123
//   ramesh.chandra@twphysics.example / tutor123  (and sowmya.reddy@, vikram.rao@ — same password)
//   anjali.sharma@twphysics.example  / student123 (and rahul.verma@, sneha.patil@, arjun.kumar@ — same password)
function seed(): StoreShape {
  const courses: Course[] = [
    {
      id: "c-jee",
      name: "JEE Mains",
      tagline: "Physics, Chemistry & Maths for JEE Main",
      durationMonths: 12,
      highlights: [
        "Concept-first + JEE pattern practice",
        "Previous 15-year PYQ bank",
        "Choice of online or offline learning",
        "Individual or group learning tracks",
      ],
    },
    {
      id: "c-neet",
      name: "NEET",
      tagline: "Complete Physics, Chemistry & Biology coverage",
      durationMonths: 12,
      highlights: [
        "Daily live classes across all 3 subjects",
        "NCERT-first structured notes",
        "Doubt-clearing within 24 hours",
        "Choice of online or offline learning",
      ],
    },
    {
      id: "c-eapcet",
      name: "EAPCET",
      tagline: "Physics, Chemistry & Maths/Biology for EAPCET",
      durationMonths: 12,
      highlights: [
        "EAPCET-pattern practice tests",
        "Concept-first structured notes",
        "Choice of online or offline learning",
        "Individual or group learning tracks",
      ],
    },
  ];

  const tutors: Tutor[] = [
    {
      id: "tut1",
      applicationId: null,
      fullName: "Dr. Ramesh Chandra",
      email: "ramesh.chandra@twphysics.example",
      phone: "+91 90000 00002",
      subjects: ["Physics"],
      qualifications: "Ph.D. Physics, IIT Kharagpur",
      availability: "Mon-Sat, 6:30 AM - 9:00 PM",
      bio: "Former NEET/JEE faculty at two leading Hyderabad institutes, 14 years teaching experience.",
      joinedAt: "2025-06-01",
    },
    {
      id: "tut2",
      applicationId: null,
      fullName: "Sowmya Reddy",
      email: "sowmya.reddy@twphysics.example",
      phone: "+91 90000 00004",
      subjects: ["Chemistry"],
      qualifications: "M.Sc. Chemistry, Osmania University",
      availability: "Mon-Sat, 8:00 AM - 8:00 PM",
      bio: "8 years teaching organic and inorganic chemistry for NEET/JEE aspirants.",
      joinedAt: "2025-07-15",
    },
    {
      id: "tut3",
      applicationId: "ta3",
      fullName: "Lakshmi Iyer",
      email: "lakshmi.iyer@twphysics.example",
      phone: "+91 90000 00005",
      subjects: ["Biology"],
      qualifications: "M.Sc. Zoology, Andhra University",
      availability: "Mon-Fri, 7:00 AM - 6:00 PM",
      bio: "4 years teaching Biology with a focus on NCERT-first conceptual clarity.",
      joinedAt: "2026-07-05",
    },
    {
      id: "tut4",
      applicationId: null,
      fullName: "Vikram Rao",
      email: "vikram.rao@twphysics.example",
      phone: "+91 90000 00009",
      subjects: ["Mathematics", "Reasoning"],
      qualifications: "M.Sc. Mathematics, Osmania University",
      availability: "Mon-Sat, 6:00 AM - 9:00 PM",
      bio: "10 years teaching Mathematics and Reasoning for JEE Main and EAPCET aspirants.",
      joinedAt: "2025-08-01",
    },
  ];

  const tutorApplications: TutorApplication[] = [
    {
      id: "ta1",
      fullName: "Priya Menon",
      email: "priya.menon@example.com",
      phone: "+91 98765 00001",
      subjects: ["Physics"],
      qualifications: "M.Sc. Physics, Delhi University",
      experience: "6 yrs",
      availability: "Mon-Sat, 6:00 AM - 9:00 PM",
      bio: "6 years of NEET/JEE Physics coaching experience, specializing in mechanics and modern physics.",
      status: "pending",
      submittedAt: "2026-07-10",
      reviewedBy: null,
      reviewedAt: null,
    },
    {
      id: "ta2",
      fullName: "Suresh Babu",
      email: "suresh.babu@example.com",
      phone: "+91 98765 00002",
      subjects: ["Chemistry"],
      qualifications: "Ph.D. Chemistry, Anna University",
      experience: "9 yrs",
      availability: "Mon-Fri, 7:00 AM - 7:00 PM",
      bio: "9 years teaching organic chemistry, published NEET prep material with two coaching chains.",
      status: "pending",
      submittedAt: "2026-07-11",
      reviewedBy: null,
      reviewedAt: null,
    },
    {
      id: "ta3",
      fullName: "Lakshmi Iyer",
      email: "lakshmi.iyer@twphysics.example",
      phone: "+91 90000 00005",
      subjects: ["Biology"],
      qualifications: "M.Sc. Zoology, Andhra University",
      experience: "4 yrs",
      availability: "Mon-Fri, 7:00 AM - 6:00 PM",
      bio: "4 years teaching Biology with a focus on NCERT-first conceptual clarity.",
      status: "approved",
      submittedAt: "2026-07-05",
      reviewedBy: "Admin User",
      reviewedAt: "2026-07-06",
    },
  ];

  // Two timing patterns, per the client's brief: college-going students get
  // an early-morning + evening slot (so it doesn't clash with college hours),
  // long-term students get one open all-day slot.
  const batches: Batch[] = [
    { id: "b1", name: "NEET College-Going Batch A", courseId: "c-neet", course: "NEET", studentCategory: "college_going", startDate: "2026-08-03", dailyTime: "5:00–7:00 AM / 5:30–9:30 PM", capacity: 60 },
    { id: "b2", name: "NEET Long-Term Batch A", courseId: "c-neet", course: "NEET", studentCategory: "long_term", startDate: "2026-08-10", dailyTime: "5:00 AM–9:30 PM", capacity: 60 },
    { id: "b3", name: "JEE Mains College-Going Batch A", courseId: "c-jee", course: "JEE Mains", studentCategory: "college_going", startDate: "2026-08-05", dailyTime: "5:00–7:00 AM / 5:30–9:30 PM", capacity: 50 },
    { id: "b4", name: "EAPCET Long-Term Batch A", courseId: "c-eapcet", course: "EAPCET", studentCategory: "long_term", startDate: "2026-08-05", dailyTime: "5:00 AM–9:30 PM", capacity: 50 },
  ];

  // A batch can have several tutors, one per subject — mirrors the classes
  // seed below (b1 already has Physics/Chemistry/Biology classes taught by
  // three different tutors).
  const batchTutors: BatchTutorAssignment[] = [
    { id: "bt1", batchId: "b1", subject: "Physics", tutorId: "tut1", tutorName: "Dr. Ramesh Chandra" },
    { id: "bt2", batchId: "b1", subject: "Chemistry", tutorId: "tut2", tutorName: "Sowmya Reddy" },
    { id: "bt3", batchId: "b1", subject: "Biology", tutorId: "tut3", tutorName: "Lakshmi Iyer" },
    { id: "bt4", batchId: "b2", subject: "Physics", tutorId: "tut1", tutorName: "Dr. Ramesh Chandra" },
    { id: "bt5", batchId: "b2", subject: "Chemistry", tutorId: "tut2", tutorName: "Sowmya Reddy" },
    { id: "bt6", batchId: "b2", subject: "Biology", tutorId: "tut3", tutorName: "Lakshmi Iyer" },
    { id: "bt7", batchId: "b3", subject: "Physics", tutorId: "tut1", tutorName: "Dr. Ramesh Chandra" },
    { id: "bt8", batchId: "b3", subject: "Chemistry", tutorId: "tut2", tutorName: "Sowmya Reddy" },
    { id: "bt9", batchId: "b3", subject: "Mathematics", tutorId: "tut4", tutorName: "Vikram Rao" },
    { id: "bt10", batchId: "b4", subject: "Physics", tutorId: "tut1", tutorName: "Dr. Ramesh Chandra" },
    { id: "bt11", batchId: "b4", subject: "Chemistry", tutorId: "tut2", tutorName: "Sowmya Reddy" },
    { id: "bt12", batchId: "b4", subject: "Mathematics", tutorId: "tut4", tutorName: "Vikram Rao" },
  ];

  // Client-confirmed fee schedule (2026-07-27) — same fee applies across
  // MPC/BiPC and every course; smaller batch size costs more per student
  // since it means more individual attention. Billed yearly in 3 terms, not
  // monthly (see YEARLY_TERM_MONTHS in the UI that renders these).
  const pricingTiers: PricingTier[] = [
    { id: "pt1", batchSize: 9, label: "Group of 9", subjectsCount: 3, daysPerSubjectPerMonth: 12, monthlyFeeInr: 9000 },
    { id: "pt2", batchSize: 5, label: "Group of 5", subjectsCount: 3, daysPerSubjectPerMonth: 12, monthlyFeeInr: 12000 },
    { id: "pt3", batchSize: 3, label: "Group of 3", subjectsCount: 3, daysPerSubjectPerMonth: 12, monthlyFeeInr: 16000 },
  ];

  const students: Student[] = [
    {
      id: "s1",
      name: "Anjali Sharma",
      email: "anjali.sharma@twphysics.example",
      phone: "+91 90000 00003",
      age: 17,
      parentName: "Rakesh Sharma",
      parentPhone: "+91 90000 10003",
      address: "Flat 402, Sri Sai Residency, Kukatpally, Hyderabad, Telangana - 500072",
      courseId: "c-neet",
      courseName: "NEET",
      batchId: "b1",
      batchName: "NEET College-Going Batch A",
      studentCategory: "college_going",
      stream: "BiPC",
      targetExams: ["NEET"],
      learningMode: "online",
      learningType: "group",
      status: "active",
      attendancePct: 94,
      tag: "topper",
      tagNote: "Consistently attentive and keeps up with every topic.",
      attendanceLog: [
        { id: "att1", classId: null, date: "2026-07-12", subject: "Biology", attended: true },
        { id: "att2", classId: null, date: "2026-07-11", subject: "Chemistry", attended: true },
        { id: "att3", classId: null, date: "2026-07-10", subject: "Physics", attended: false },
        { id: "att4", classId: null, date: "2026-07-09", subject: "Biology", attended: true },
        { id: "att5", classId: null, date: "2026-07-08", subject: "Chemistry", attended: true },
      ],
      flags: [
        { id: "fl1", type: "topper", note: "Consistently attentive and keeps up with every topic.", authorId: "tut1", authorName: "Dr. Ramesh Chandra", authorRole: "tutor", createdAt: "2026-07-08" },
      ],
    },
    {
      id: "s2",
      name: "Rahul Verma",
      email: "rahul.verma@twphysics.example",
      phone: "+91 90000 00006",
      age: 17,
      parentName: "Sunil Verma",
      parentPhone: "+91 90000 10006",
      address: "H.No 8-2-120, Banjara Hills, Hyderabad, Telangana - 500034",
      courseId: "c-neet",
      courseName: "NEET",
      batchId: "b1",
      batchName: "NEET College-Going Batch A",
      studentCategory: "college_going",
      stream: "BiPC",
      targetExams: ["NEET"],
      learningMode: "online",
      learningType: "group",
      status: "active",
      attendancePct: 61,
      tag: "weak",
      tagNote: "Struggling with Organic Chemistry — recommend extra practice sets.",
      attendanceLog: [
        { id: "att6", classId: null, date: "2026-07-12", subject: "Biology", attended: false },
        { id: "att7", classId: null, date: "2026-07-11", subject: "Chemistry", attended: true },
        { id: "att8", classId: null, date: "2026-07-10", subject: "Physics", attended: false },
      ],
      flags: [
        { id: "fl2", type: "weak", note: "Struggling with Organic Chemistry — recommend extra practice sets.", authorId: "tut1", authorName: "Dr. Ramesh Chandra", authorRole: "tutor", createdAt: "2026-07-09" },
      ],
    },
    {
      id: "s3",
      name: "Sneha Patil",
      email: "sneha.patil@twphysics.example",
      phone: "+91 90000 00007",
      age: 18,
      parentName: "Mahesh Patil",
      parentPhone: "+91 90000 10007",
      address: "Plot 12, Madhapur, Hyderabad, Telangana - 500081",
      courseId: "c-jee",
      courseName: "JEE Mains",
      batchId: "b3",
      batchName: "JEE Mains College-Going Batch A",
      studentCategory: "college_going",
      stream: "MPC",
      targetExams: ["JEE Mains"],
      learningMode: "online",
      learningType: "individual",
      status: "active",
      attendancePct: 88,
      tag: null,
      tagNote: "",
      attendanceLog: [
        { id: "att9", classId: null, date: "2026-07-12", subject: "Chemistry", attended: true },
      ],
      flags: [],
    },
    {
      id: "s4",
      name: "Arjun Kumar",
      email: "arjun.kumar@twphysics.example",
      phone: "+91 90000 00008",
      age: 16,
      parentName: "Vijay Kumar",
      parentPhone: "+91 90000 10008",
      address: "3-4-56, Dilsukhnagar, Hyderabad, Telangana - 500060",
      courseId: "c-eapcet",
      courseName: "EAPCET",
      batchId: "b4",
      batchName: "EAPCET Long-Term Batch A",
      studentCategory: "long_term",
      stream: "MPC",
      targetExams: ["EAPCET"],
      learningMode: "online",
      learningType: "group",
      status: "expiring_soon",
      attendancePct: 76,
      tag: "focus_needed",
      tagNote: "Attendance dropping — check in on enrollment renewal.",
      attendanceLog: [
        { id: "att10", classId: null, date: "2026-07-11", subject: "Chemistry", attended: false },
      ],
      flags: [
        { id: "fl3", type: "focus_needed", note: "Attendance dropping — check in on enrollment renewal.", authorId: "tut2", authorName: "Sowmya Reddy", authorRole: "tutor", createdAt: "2026-07-11" },
      ],
    },
  ];

  const issues: Issue[] = [
    {
      id: "ai1",
      subject: "Batch timing clash with college hours",
      description: "The current batch timing overlaps with college classes on Mondays.",
      raisedById: "s1",
      raisedByName: "Anjali Sharma",
      raisedByRole: "student",
      status: "resolved",
      assignedTo: "Admin (You)",
      createdAt: "2026-07-01",
      comments: [{ author: "Admin (You)", message: "Moved to the evening batch — confirmed with the tutor.", at: "2026-07-01 15:00" }],
    },
    {
      id: "ai2",
      subject: "Couldn't join yesterday's live class",
      description: "The Zoom link didn't work when I tried to join.",
      raisedById: "s1",
      raisedByName: "Anjali Sharma",
      raisedByRole: "student",
      status: "in_progress",
      assignedTo: "Admin (You)",
      createdAt: "2026-07-11",
      comments: [],
    },
    {
      id: "ai3",
      subject: "Need help reassigning a student's batch",
      description: "Requesting a batch reassignment for a student who relocated.",
      raisedById: "tut1",
      raisedByName: "Dr. Ramesh Chandra",
      raisedByRole: "tutor",
      status: "open",
      assignedTo: null,
      createdAt: "2026-07-12",
      comments: [],
    },
    {
      id: "ai4",
      subject: "Study material upload failing",
      description: "Getting an error when uploading PDF notes over 10MB.",
      raisedById: "tut2",
      raisedByName: "Sowmya Reddy",
      raisedByRole: "tutor",
      status: "open",
      assignedTo: null,
      createdAt: "2026-07-13",
      comments: [],
    },
  ];

  const notifications: Notification[] = [
    { id: "n2", userId: "s1", title: "Class reminder", message: "Thermodynamics class starts at 7:00 AM tomorrow.", isRead: false, createdAt: "2026-07-13 18:00", kind: "class" },
    { id: "n3", userId: "admin-1", title: "Syllabus behind", message: "JEE Mains College-Going Batch A is behind on Coordination Compounds.", isRead: false, createdAt: "2026-07-12 09:00", kind: "syllabus" },
    { id: "n4", userId: "s1", title: "Tutor reassigned", message: "Your batch's tutor has been changed to Dr. Ramesh Chandra.", isRead: true, createdAt: "2026-07-10 11:00", kind: "generic" },
  ];

  const classes: ScheduledClass[] = [
    { id: "cl1", batchId: "b1", batchName: "NEET College-Going Batch A", subject: "Physics", topic: "Thermodynamics", tutorId: "tut1", tutorName: "Dr. Ramesh Chandra", scheduledAt: "2026-07-15T07:00:00", durationMinutes: 60, joinUrl: "https://zoom.us/j/twp-demo-thermo" },
    { id: "cl2", batchId: "b1", batchName: "NEET College-Going Batch A", subject: "Chemistry", topic: "Chemical Bonding", tutorId: "tut2", tutorName: "Sowmya Reddy", scheduledAt: "2026-07-15T17:00:00", durationMinutes: 60, joinUrl: "https://zoom.us/j/twp-demo-bonding" },
    { id: "cl3", batchId: "b1", batchName: "NEET College-Going Batch A", subject: "Biology", topic: "Genetics — Part 2", tutorId: "tut3", tutorName: "Lakshmi Iyer", scheduledAt: "2026-07-12T07:00:00", durationMinutes: 60, joinUrl: "https://zoom.us/j/twp-demo-genetics" },
  ];

  const accounts: Account[] = [
    { id: "acc-admin", email: "admin@twphysics.example", passwordHash: hashPassword("admin123"), role: "admin", linkedId: "admin-1", mustChangePassword: false },
    { id: "acc-tut1", email: "ramesh.chandra@twphysics.example", passwordHash: hashPassword("tutor123"), role: "tutor", linkedId: "tut1", mustChangePassword: false },
    { id: "acc-tut2", email: "sowmya.reddy@twphysics.example", passwordHash: hashPassword("tutor123"), role: "tutor", linkedId: "tut2", mustChangePassword: false },
    { id: "acc-tut3", email: "lakshmi.iyer@twphysics.example", passwordHash: hashPassword("tutor123"), role: "tutor", linkedId: "tut3", mustChangePassword: false },
    { id: "acc-tut4", email: "vikram.rao@twphysics.example", passwordHash: hashPassword("tutor123"), role: "tutor", linkedId: "tut4", mustChangePassword: false },
    { id: "acc-s1", email: "anjali.sharma@twphysics.example", passwordHash: hashPassword("student123"), role: "student", linkedId: "s1", mustChangePassword: false },
    { id: "acc-s2", email: "rahul.verma@twphysics.example", passwordHash: hashPassword("student123"), role: "student", linkedId: "s2", mustChangePassword: false },
    { id: "acc-s3", email: "sneha.patil@twphysics.example", passwordHash: hashPassword("student123"), role: "student", linkedId: "s3", mustChangePassword: false },
    { id: "acc-s4", email: "arjun.kumar@twphysics.example", passwordHash: hashPassword("student123"), role: "student", linkedId: "s4", mustChangePassword: false },
  ];

  const syllabus: SyllabusItem[] = [
    { id: "sy1", batchId: "b1", batchName: "NEET College-Going Batch A", topic: "Laws of Motion", subject: "Physics", deadline: "2026-07-15", status: "completed" },
    { id: "sy2", batchId: "b1", batchName: "NEET College-Going Batch A", topic: "Thermodynamics", subject: "Physics", deadline: "2026-07-20", status: "in_progress" },
    { id: "sy3", batchId: "b1", batchName: "NEET College-Going Batch A", topic: "Chemical Bonding", subject: "Chemistry", deadline: "2026-07-18", status: "not_started" },
    { id: "sy4", batchId: "b1", batchName: "NEET College-Going Batch A", topic: "Genetics & Evolution", subject: "Biology", deadline: "2026-07-14", status: "not_started" },
    { id: "sy5", batchId: "b3", batchName: "JEE Mains College-Going Batch A", topic: "Coordination Compounds", subject: "Chemistry", deadline: "2026-07-12", status: "in_progress" },
  ];

  const materials: StudyMaterial[] = [
    { id: "sm1", batchId: "b1", batchName: "NEET College-Going Batch A", title: "Thermodynamics — Full Notes", type: "pdf", url: "https://example.com/materials/thermodynamics-notes.pdf", uploadedAt: "2026-07-10", uploadedBy: "Dr. Ramesh Chandra" },
    { id: "sm2", batchId: "b1", batchName: "NEET College-Going Batch A", title: "Laws of Motion — Practice Problems", type: "pdf", url: "https://example.com/materials/laws-of-motion-practice.pdf", uploadedAt: "2026-07-08", uploadedBy: "Dr. Ramesh Chandra" },
    { id: "sm3", batchId: "b1", batchName: "NEET College-Going Batch A", title: "NCERT Chapter Summary Videos", type: "link", url: "https://example.com/materials/ncert-summary-videos", uploadedAt: "2026-07-05", uploadedBy: "Sowmya Reddy" },
  ];

  const broadcasts: Broadcast[] = [
    { id: "tb1", batchId: "b1", batchName: "NEET College-Going Batch A", tutorId: "tut1", tutorName: "Dr. Ramesh Chandra", message: "Tomorrow's class moved to 7:30 AM due to a schedule change.", sentAt: "2026-07-12 18:00" },
    { id: "tb2", batchId: "b1", batchName: "NEET College-Going Batch A", tutorId: "tut1", tutorName: "Dr. Ramesh Chandra", message: "Great engagement in yesterday's class — keep it up!", sentAt: "2026-07-08 09:00" },
  ];

  const activityLog: ActivityEntry[] = [
    { id: "a1", actor: "Admin User", action: "Approved tutor application", target: "Lakshmi Iyer", at: "2026-07-12 14:20" },
    { id: "a2", actor: "Dr. Ramesh Chandra", action: "Marked syllabus topic complete", target: "Laws of Motion — NEET College-Going Batch A", at: "2026-07-12 11:05" },
    { id: "a3", actor: "System (automation)", action: "Flagged student inactive", target: "Rahul Verma", at: "2026-07-12 02:00" },
  ];

  const results: ResultEntry[] = [
    { id: "res1", name: "Anjali Sharma", exam: "NEET 2025", rank: "AIR 342", score: "685/720", quote: "The daily doubt sessions made the difference for me." },
    { id: "res2", name: "Karthik Naidu", exam: "JEE Main 2025", rank: "AIR 891", score: "98.7 percentile", quote: "The tutors here go the extra mile — that's why it worked." },
    { id: "res3", name: "Divya Reddy", exam: "NEET 2025", rank: "AIR 1204", score: "662/720", quote: "Coming from a Telugu-medium school, the way faculty explained things just clicked." },
    { id: "res4", name: "Mohammed Arshad", exam: "JEE Main 2025", rank: "AIR 2033", score: "97.2 percentile", quote: "Structured, and the tutors actually respond." },
  ];

  const testimonials: Testimonial[] = [
    { id: "t1", name: "Anjali Sharma", role: "NEET 2025, AIR 342", quote: "I could ask doubts at midnight and get a reply by morning. That responsiveness is rare." },
    { id: "t2", name: "Ramesh (Parent)", role: "Parent of a Class 12 student", quote: "As a parent, the progress reports gave me real visibility — not just promises." },
    { id: "t3", name: "Karthik Naidu", role: "JEE Main 2025, AIR 891", quote: "Live classes and a real tutor to ask — exactly what I needed." },
  ];

  return {
    accounts,
    tutorApplications,
    tutors,
    students,
    courses,
    batches,
    batchTutors,
    pricingTiers,
    issues,
    notifications,
    classes,
    syllabus,
    materials,
    broadcasts,
    activityLog,
    results,
    testimonials,
  };
}

declare global {
  var __twStore: StoreShape | undefined;
}

// Survives Next dev-server Fast Refresh (module re-evaluation on file edits)
// via the globalThis singleton guard below; resets only on a full `next dev`
// restart. Single-process only — irrelevant here since this app runs as one
// Next server process, but would NOT hold across multiple serverless
// instances in a real deployment.
export const db: StoreShape = globalThis.__twStore ?? (globalThis.__twStore = seed());

export function nextId(prefix: string): string {
  return `${prefix}-${globalThis.crypto.randomUUID()}`;
}
