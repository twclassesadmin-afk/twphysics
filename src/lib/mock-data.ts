// Realistic placeholder data for UI-first development.
// Every shape here mirrors the Section 3 schema in TWPHYSICS_Architecture.md so
// swapping in live Supabase queries later is a drop-in replacement, not a rewrite.

export const myAdminProfile = {
  fullName: "Admin User",
  email: "admin@twphysics.example",
  phone: "+91 90000 00001",
};

export const myTutorProfile = {
  fullName: "Dr. Ramesh Chandra",
  email: "ramesh.chandra@twphysics.example",
  phone: "+91 90000 00002",
  subjects: "Physics",
  qualifications: "Ph.D. Physics, IIT Kharagpur",
  availability: "Mon-Sat, 6:30 AM - 9:00 PM",
  bio: "Former NEET/JEE faculty at two leading Hyderabad institutes, 14 years teaching experience.",
};

export const myStudentProfile = {
  fullName: "Anjali Sharma",
  email: "anjali.sharma@twphysics.example",
  phone: "+91 90000 00003",
  address: "Flat 402, Sri Sai Residency, Kukatpally, Hyderabad, Telangana - 500072",
  course: "NEET",
  batch: "NEET Morning Batch A",
};

export const notifications = [
  { id: "n1", title: "Result published", message: "Weekly Full Syllabus Test 5 results are live.", isRead: false, createdAt: "2026-07-13 09:00" },
  { id: "n2", title: "Class reminder", message: "Thermodynamics class starts at 7:00 AM tomorrow.", isRead: false, createdAt: "2026-07-13 18:00" },
  { id: "n3", title: "Syllabus behind", message: "IIT-Mains Weekday Batch A is behind on Coordination Compounds.", isRead: false, createdAt: "2026-07-12 09:00" },
  { id: "n4", title: "Tutor reassigned", message: "Your batch's tutor has been changed to Dr. Ramesh Chandra.", isRead: true, createdAt: "2026-07-10 11:00" },
  { id: "n5", title: "Payment receipt", message: "Payment of ₹24,999 received for NEET enrollment.", isRead: true, createdAt: "2025-08-01 10:15" },
];

export const liveStats = {
  studentsEnrolled: 8420,
  classesConducted: 15230,
  avgRankImprovement: 1840,
  activeBatches: 32,
};

export const howItWorks = [
  { step: 1, title: "Register", description: "Share your details and pick a course to get started." },
  { step: 2, title: "Get Batch & Tutor", description: "You're assigned a batch and a dedicated subject-wise tutor team." },
  { step: 3, title: "Attend Live Classes", description: "Daily live classes over Zoom, online or in person." },
  { step: 4, title: "Track Progress", description: "Syllabus tracking and attendance, visible to you and your parents." },
];

export const tutorRoster = [
  { id: "tut1", name: "Dr. Ramesh Chandra", subject: "Physics" },
  { id: "tut2", name: "Sowmya Reddy", subject: "Chemistry" },
  { id: "tut3", name: "Dr. Vikram Rao", subject: "Biology" },
];

export const faqs = [
  { id: "faq1", question: "Are classes online or offline?", answer: "Both — you can choose whichever fits you better, or a mix of the two, when you register." },
  { id: "faq2", question: "What are the class timings?", answer: "College-going students: 5:00–7:00 AM and 5:30–9:30 PM batches. Long-term students: 5:00 AM–9:30 PM. Pick what fits your schedule at registration." },
  { id: "faq3", question: "How is doubt-clearing handled?", answer: "Raise a doubt anytime through the student dashboard — tutors respond within 24 hours." },
  { id: "faq4", question: "What is the faculty's background?", answer: "Every faculty member is verified and approved by our admin team before teaching, with qualifications and experience shown on their public profile." },
  { id: "faq5", question: "Individual or group learning — which should I pick?", answer: "Individual is more focused one-on-one attention; group batches are more collaborative and often more affordable. You can choose either at registration." },
];

// ---------------------------------------------------------------------------
// Dashboard mock data
// ---------------------------------------------------------------------------

export const adminOverview = {
  totalStudents: 1248,
  activeEnrollments: 1102,
  revenueThisMonthInr: 2840000,
  openIssues: 14,
  flaggedStudents: 27,
  batchesBehindSyllabus: 3,
};

export const needsAttention = [
  { id: "n1", type: "flagged" as const, label: "27 students flagged (inactive / missed class)" },
  { id: "n2", type: "syllabus" as const, label: "3 batches behind on syllabus deadlines" },
  { id: "n3", type: "issue" as const, label: "14 unresolved issues (5 unassigned)" },
];

export const tutorApplications: {
  id: string;
  name: string;
  subject: string;
  experience: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}[] = [
  { id: "ta1", name: "Priya Menon", subject: "Physics", experience: "6 yrs", status: "pending", submittedAt: "2026-07-10" },
  { id: "ta2", name: "Suresh Babu", subject: "Chemistry", experience: "9 yrs", status: "pending", submittedAt: "2026-07-11" },
  { id: "ta3", name: "Lakshmi Iyer", subject: "Biology", experience: "4 yrs", status: "approved", submittedAt: "2026-07-05" },
];

export type StudentTag = "topper" | "weak" | "focus_needed" | null;

export const students: {
  id: string;
  name: string;
  batch: string;
  status: "active" | "expiring_soon";
  attendancePct: number;
  lastScore: number;
  tag: StudentTag;
  tagNote: string;
  examHistory: { title: string; score: number; totalMarks: number }[];
}[] = [
  {
    id: "s1",
    name: "Anjali Sharma",
    batch: "NEET Morning Batch A",
    status: "active",
    attendancePct: 94,
    lastScore: 685,
    tag: "topper",
    tagNote: "Consistently top of the batch across all subjects.",
    examHistory: [
      { title: "Weekly Full Syllabus Test 5", score: 685, totalMarks: 720 },
      { title: "Weekly Full Syllabus Test 4", score: 662, totalMarks: 720 },
    ],
  },
  {
    id: "s2",
    name: "Rahul Verma",
    batch: "NEET Morning Batch A",
    status: "active" as const,
    attendancePct: 61,
    lastScore: 402,
    tag: "weak" as const,
    tagNote: "Struggling with Organic Chemistry — recommend extra practice sets.",
    examHistory: [
      { title: "Weekly Full Syllabus Test 5", score: 402, totalMarks: 720 },
      { title: "Weekly Full Syllabus Test 4", score: 388, totalMarks: 720 },
    ],
  },
  {
    id: "s3",
    name: "Sneha Patil",
    batch: "IIT-Mains Weekday Batch A",
    status: "active" as const,
    attendancePct: 88,
    lastScore: 220,
    tag: null,
    tagNote: "",
    examHistory: [{ title: "Coordination Compounds Unit Test", score: 220, totalMarks: 100 }],
  },
  {
    id: "s4",
    name: "Arjun Kumar",
    batch: "NEET Evening Batch B",
    status: "expiring_soon" as const,
    attendancePct: 76,
    lastScore: 540,
    tag: "focus_needed" as const,
    tagNote: "Attendance dropping — check in on enrollment renewal.",
    examHistory: [{ title: "Weekly Full Syllabus Test 5", score: 540, totalMarks: 720 }],
  },
];

export const adminActivityLog = [
  { id: "a1", actor: "Admin (You)", action: "Approved tutor application", target: "Lakshmi Iyer", at: "2026-07-12 14:20" },
  { id: "a2", actor: "Tutor: Dr. Ramesh Chandra", action: "Marked syllabus topic complete", target: "Mechanics — Batch A", at: "2026-07-12 11:05" },
  { id: "a3", actor: "System (automation)", action: "Flagged student inactive", target: "Rahul Verma", at: "2026-07-12 02:00" },
  { id: "a4", actor: "Admin (You)", action: "Reassigned tutor", target: "IIT-Mains Weekday Batch A", at: "2026-07-11 16:40" },
];

export const tutorBatches = [
  { id: "b1", name: "NEET Morning Batch A", students: 52, upcomingClass: "Today, 7:00 AM — Thermodynamics", syllabusStatus: "on_track" as const },
  { id: "b3", name: "IIT-Mains Weekday Batch A", students: 47, upcomingClass: "Tomorrow, 6:00 PM — Coordination Compounds", syllabusStatus: "behind" as const },
];

export const syllabusItems = [
  { id: "sy1", topic: "Laws of Motion", subject: "Physics", deadline: "2026-07-15", status: "completed" as const },
  { id: "sy2", topic: "Thermodynamics", subject: "Physics", deadline: "2026-07-20", status: "in_progress" as const },
  { id: "sy3", topic: "Chemical Bonding", subject: "Chemistry", deadline: "2026-07-18", status: "not_started" as const },
  { id: "sy4", topic: "Genetics & Evolution", subject: "Biology", deadline: "2026-07-14", status: "not_started" as const },
];

export const myEnrollment = {
  course: "NEET",
  batch: "NEET Morning Batch A",
  purchaseDate: "2025-08-01",
  expiryDate: "2026-08-01",
  durationMonths: 12,
  assignedTutors: [
    { subject: "Physics", name: "Dr. Ramesh Chandra" },
    { subject: "Chemistry", name: "Sowmya Reddy" },
    { subject: "Biology", name: "Dr. Vikram Rao" },
  ],
};

export const batchmates = [
  { id: "bm1", name: "Rahul Verma" },
  { id: "bm2", name: "Sneha Patil" },
  { id: "bm3", name: "Karthik Naidu" },
  { id: "bm4", name: "Divya Reddy" },
  { id: "bm5", name: "Mohammed Arshad" },
];

export const studyMaterials = [
  { id: "sm1", title: "Thermodynamics — Full Notes", type: "pdf" as const, batch: "NEET Morning Batch A", uploadedAt: "2026-07-10" },
  { id: "sm2", title: "Laws of Motion — Practice Problems", type: "pdf" as const, batch: "NEET Morning Batch A", uploadedAt: "2026-07-08" },
  { id: "sm3", title: "NCERT Chapter Summary Videos", type: "link" as const, batch: "NEET Morning Batch A", uploadedAt: "2026-07-05" },
];

export const tutorExams = [
  { id: "te1", title: "Weekly Full Syllabus Test 5", batch: "NEET Morning Batch A", examDate: "2026-07-07", status: "results_visible" as const, average: 542, topper: "Anjali Sharma", topperScore: 685, totalMarks: 720 },
  { id: "te2", title: "Weekly Full Syllabus Test 6", batch: "NEET Morning Batch A", examDate: "2026-07-14", status: "upcoming" as const, average: null, topper: null, topperScore: null, totalMarks: 720 },
  { id: "te3", title: "Coordination Compounds Unit Test", batch: "IIT-Mains Weekday Batch A", examDate: "2026-07-05", status: "grading" as const, average: null, topper: null, topperScore: null, totalMarks: 100 },
];

export const tutorReceivedIssues = [
  {
    id: "tri1",
    studentName: "Rahul Verma",
    subject: "Doubt in Thermodynamics numerical",
    description: "Couldn't follow the second law application in yesterday's class problem set.",
    status: "open" as const,
    createdAt: "2026-07-13 20:10",
    replies: [] as { author: string; message: string; at: string }[],
  },
  {
    id: "tri2",
    studentName: "Sneha Patil",
    subject: "Recording not available",
    description: "Can't find the recording for Monday's Coordination Compounds class.",
    status: "resolved" as const,
    createdAt: "2026-07-10 09:00",
    replies: [
      { author: "Dr. Ramesh Chandra", message: "Uploaded — check Study Material now.", at: "2026-07-10 11:30" },
    ],
  },
];

export const tutorBroadcasts = [
  { id: "tb1", message: "Tomorrow's class moved to 7:30 AM due to a schedule change.", batch: "NEET Morning Batch A", sentAt: "2026-07-12 18:00" },
  { id: "tb2", message: "Great performance in Weekly Test 5 — keep it up!", batch: "NEET Morning Batch A", sentAt: "2026-07-08 09:00" },
];

export const studentClasses = [
  { id: "cl1", subject: "Physics", topic: "Thermodynamics", startTime: "2026-07-13 07:00", tutor: "Dr. Ramesh Chandra", status: "upcoming" as const },
  { id: "cl2", subject: "Chemistry", topic: "Chemical Bonding", startTime: "2026-07-13 17:00", tutor: "Sowmya Reddy", status: "upcoming" as const },
  { id: "cl3", subject: "Biology", topic: "Genetics — Part 2", startTime: "2026-07-12 07:00", tutor: "Dr. Vikram Rao", status: "recorded" as const },
];

export const studentExams: {
  id: string;
  title: string;
  subject: string;
  examDate: string;
  status: "upcoming" | "results_visible";
  score?: number;
  rank?: number;
  totalMarks?: number;
}[] = [
  { id: "ex1", title: "Weekly Full Syllabus Test 6", subject: "All", examDate: "2026-07-14", status: "upcoming" },
  { id: "ex2", title: "Weekly Full Syllabus Test 5", subject: "All", examDate: "2026-07-07", status: "results_visible", score: 612, rank: 8, totalMarks: 720 },
  { id: "ex3", title: "Weekly Full Syllabus Test 4", subject: "All", examDate: "2026-06-30", status: "results_visible", score: 588, rank: 14, totalMarks: 720 },
];

export const leaderboard = [
  { rank: 1, name: "Anjali Sharma", score: 685 },
  { rank: 2, name: "Karthik Naidu", score: 671 },
  { rank: 3, name: "Divya Reddy", score: 662 },
  { rank: 4, name: "You", score: 612, isCurrentUser: true },
  { rank: 5, name: "Mohammed Arshad", score: 604 },
];

export const adminIssues: {
  id: string;
  subject: string;
  raisedBy: string;
  role: "student" | "tutor";
  status: "open" | "in_progress" | "resolved";
  assignedTo: string | null;
  createdAt: string;
  comments: { author: string; message: string; at: string }[];
}[] = [
  {
    id: "ai1",
    subject: "Payment not reflecting",
    raisedBy: "Anjali Sharma",
    role: "student",
    status: "resolved",
    assignedTo: "Admin (You)",
    createdAt: "2026-07-01",
    comments: [{ author: "Admin (You)", message: "Confirmed with Razorpay, enrollment activated.", at: "2026-07-01 15:00" }],
  },
  {
    id: "ai2",
    subject: "Recording not available for missed class",
    raisedBy: "Rahul Verma",
    role: "student",
    status: "in_progress",
    assignedTo: "Admin (You)",
    createdAt: "2026-07-11",
    comments: [],
  },
  {
    id: "ai3",
    subject: "Need help reassigning a student's batch",
    raisedBy: "Dr. Ramesh Chandra",
    role: "tutor",
    status: "open",
    assignedTo: null,
    createdAt: "2026-07-12",
    comments: [],
  },
  {
    id: "ai4",
    subject: "Study material upload failing",
    raisedBy: "Sowmya Reddy",
    role: "tutor",
    status: "open",
    assignedTo: null,
    createdAt: "2026-07-13",
    comments: [],
  },
];

export const myAttendance = {
  overallPct: 94,
  recent: [
    { date: "2026-07-12", subject: "Biology", attended: true },
    { date: "2026-07-11", subject: "Chemistry", attended: true },
    { date: "2026-07-10", subject: "Physics", attended: false },
    { date: "2026-07-09", subject: "Biology", attended: true },
    { date: "2026-07-08", subject: "Chemistry", attended: true },
  ],
};

export const studentIssues: {
  id: string;
  subject: string;
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
}[] = [
  { id: "is1", subject: "Payment not reflecting", status: "resolved", createdAt: "2026-07-01" },
  { id: "is2", subject: "Recording not available for missed class", status: "in_progress", createdAt: "2026-07-11" },
];
