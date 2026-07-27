export type UserRole = "admin" | "tutor" | "student";

export type Account = {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  linkedId: string;
  mustChangePassword: boolean;
};

export type TutorApplication = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  subjects: string[];
  qualifications: string;
  experience: string;
  availability: string;
  bio: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
};

export type Tutor = {
  id: string;
  applicationId: string | null;
  fullName: string;
  email: string;
  phone: string;
  subjects: string[];
  qualifications: string;
  availability: string;
  bio: string;
  joinedAt: string;
};

export type StudentTag = "topper" | "weak" | "focus_needed" | null;

export type StudentFlag = {
  id: string;
  type: "topper" | "weak" | "focus_needed";
  note: string;
  authorId: string;
  authorName: string;
  authorRole: "tutor" | "admin";
  createdAt: string;
};

export type AttendanceEntry = {
  id: string;
  classId: string | null;
  date: string;
  subject: string;
  attended: boolean;
};

export type StudentCategory = "college_going" | "long_term";
export type Stream = "MPC" | "BiPC";
export type LearningMode = "online" | "offline";
export type LearningType = "individual" | "group";

export type Student = {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number | null;
  parentName: string;
  parentPhone: string;
  address: string;
  courseId: string;
  courseName: string;
  batchId: string;
  batchName: string;
  studentCategory: StudentCategory | null;
  stream: Stream | null;
  targetExams: string[];
  learningMode: LearningMode | null;
  learningType: LearningType | null;
  status: "active" | "expiring_soon";
  attendancePct: number;
  tag: StudentTag;
  tagNote: string;
  attendanceLog: AttendanceEntry[];
  flags: StudentFlag[];
};

export type ResultEntry = {
  id: string;
  name: string;
  exam: string;
  rank: string;
  score: string;
  quote: string;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
};

export type SyllabusItem = {
  id: string;
  batchId: string;
  batchName: string;
  topic: string;
  subject: string;
  deadline: string;
  status: "completed" | "in_progress" | "not_started";
};

export type StudyMaterial = {
  id: string;
  batchId: string;
  batchName: string;
  title: string;
  type: "pdf" | "link";
  url: string;
  uploadedAt: string;
  uploadedBy: string;
};

export type Broadcast = {
  id: string;
  batchId: string;
  batchName: string;
  tutorId: string;
  tutorName: string;
  message: string;
  sentAt: string;
};

export type ActivityEntry = {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
};

export type Course = {
  id: string;
  name: string;
  tagline: string;
  durationMonths: number;
  highlights: string[];
};

export type Batch = {
  id: string;
  name: string;
  courseId: string;
  course: string;
  studentCategory: StudentCategory;
  startDate: string;
  dailyTime: string;
  capacity: number;
};

// A batch can have several tutors, each teaching a different subject — one
// row per (batch, subject). Assigning a new tutor to a subject that already
// has one replaces that row rather than adding a second.
export type BatchTutorAssignment = {
  id: string;
  batchId: string;
  subject: string;
  tutorId: string;
  tutorName: string;
};

// Fee is driven purely by batch size (smaller batch = more personal attention
// = higher fee) — client-confirmed as the same across MPC/BiPC and every
// course. Billed yearly in 3 terms, not monthly — monthlyFeeInr is the unit
// rate a term is computed from (see YEARLY_TERM_MONTHS at the call sites),
// not a standalone monthly billing option. Editable by admin.
export type PricingTier = {
  id: string;
  batchSize: number;
  label: string;
  subjectsCount: number;
  daysPerSubjectPerMonth: number;
  monthlyFeeInr: number;
};

export type Issue = {
  id: string;
  subject: string;
  description: string;
  raisedById: string;
  raisedByName: string;
  raisedByRole: "student" | "tutor";
  status: "open" | "in_progress" | "resolved";
  assignedTo: string | null;
  createdAt: string;
  comments: { author: string; message: string; at: string }[];
};

export type NotificationKind =
  | "issue"
  | "material"
  | "class"
  | "tutor_application"
  | "syllabus"
  | "generic";

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  kind: NotificationKind;
  relatedEntityId?: string;
};

export type ScheduledClass = {
  id: string;
  batchId: string;
  batchName: string;
  subject: string;
  topic: string;
  tutorId: string;
  tutorName: string;
  scheduledAt: string;
  durationMinutes: number;
  joinUrl: string;
};
