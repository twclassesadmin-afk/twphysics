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
  subjects: string;
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
  subjects: string;
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
  status: "active" | "expiring_soon";
  attendancePct: number;
  lastScore: number;
  tag: StudentTag;
  tagNote: string;
  examHistory: { title: string; score: number; totalMarks: number }[];
  attendanceLog: AttendanceEntry[];
  flags: StudentFlag[];
};

export type FreeResource = {
  id: string;
  title: string;
  description: string;
  type: "demo" | "pdf" | "test";
  url: string;
  createdAt: string;
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

export type DemoRequest = {
  id: string;
  name: string;
  phone: string;
  email: string;
  courseInterest: string;
  preferredTime: string;
  status: "new" | "contacted" | "closed";
  createdAt: string;
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
  priceInInr: number;
  emiFromInr: number;
  durationMonths: number;
  highlights: string[];
};

export type Batch = {
  id: string;
  name: string;
  courseId: string;
  course: string;
  startDate: string;
  dailyTime: string;
  capacity: number;
  tutorId: string | null;
  tutor: string;
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
  | "exam_scheduled"
  | "exam_published"
  | "issue"
  | "material"
  | "class"
  | "demo_request"
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
  recordingUrl: string | null;
};

export type QuestionOption = [string, string, string, string];

export type Question = {
  id: string;
  examId: string;
  text: string;
  options: QuestionOption;
  correctOptionIndex: 0 | 1 | 2 | 3;
  marks: number;
  negativeMarks: number;
};

export type Exam = {
  id: string;
  title: string;
  subject: string;
  batchId: string;
  batchName: string;
  scheduledAt: string;
  durationMinutes: number;
  totalMarks: number;
  createdBy: string;
  createdAt: string;
  publishedAt: string | null;
};

export type ExamAnswer = { questionId: string; selectedOptionIndex: 0 | 1 | 2 | 3 | null };

export type ExamAttempt = {
  id: string;
  examId: string;
  studentId: string;
  answers: ExamAnswer[];
  startedAt: string;
  submittedAt: string | null;
  autoSubmitted: boolean;
  score: number | null;
  computedAt: string | null;
};
