import { db, nextId } from "./db";
import type {
  AttendanceEntry,
  LearningMode,
  LearningType,
  Stream,
  Student,
  StudentCategory,
  StudentFlag,
  StudentTag,
} from "./types";

export function listStudents(): Student[] {
  return db.students;
}

export function getStudent(id: string): Student | undefined {
  return db.students.find((s) => s.id === id);
}

export function listStudentsByBatch(batchId: string): Student[] {
  return db.students.filter((s) => s.batchId === batchId);
}

export function addStudent(input: {
  name: string;
  email: string;
  courseId: string;
  courseName: string;
  batchId: string;
  batchName: string;
  phone?: string;
  age?: number | null;
  parentName?: string;
  parentPhone?: string;
  address?: string;
  studentCategory?: StudentCategory | null;
  stream?: Stream | null;
  targetExams?: string[];
  learningMode?: LearningMode | null;
  learningType?: LearningType | null;
}): Student {
  const student: Student = {
    id: nextId("s"),
    name: input.name,
    email: input.email,
    phone: input.phone ?? "",
    age: input.age ?? null,
    parentName: input.parentName ?? "",
    parentPhone: input.parentPhone ?? "",
    address: input.address ?? "",
    courseId: input.courseId,
    courseName: input.courseName,
    batchId: input.batchId,
    batchName: input.batchName,
    studentCategory: input.studentCategory ?? null,
    stream: input.stream ?? null,
    targetExams: input.targetExams ?? [],
    learningMode: input.learningMode ?? null,
    learningType: input.learningType ?? null,
    status: "active",
    attendancePct: 0,
    tag: null,
    tagNote: "",
    attendanceLog: [],
    flags: [],
  };
  db.students.push(student);
  return student;
}

export function assignStudentToBatch(studentId: string, batchId: string, batchName: string, courseId: string, courseName: string): void {
  const student = db.students.find((s) => s.id === studentId);
  if (!student) return;
  student.batchId = batchId;
  student.batchName = batchName;
  student.courseId = courseId;
  student.courseName = courseName;
}

export function updateStudentContact(studentId: string, patch: { phone?: string; address?: string }): void {
  const student = db.students.find((s) => s.id === studentId);
  if (!student) return;
  if (patch.phone !== undefined) student.phone = patch.phone;
  if (patch.address !== undefined) student.address = patch.address;
}

export function setStudentTag(studentId: string, tag: StudentTag, note: string): void {
  const student = db.students.find((s) => s.id === studentId);
  if (!student) return;
  student.tag = tag;
  student.tagNote = note;
}

export function addStudentFlag(
  studentId: string,
  flag: { type: StudentFlag["type"]; note: string; authorId: string; authorName: string; authorRole: StudentFlag["authorRole"] },
): void {
  const student = db.students.find((s) => s.id === studentId);
  if (!student) return;
  const entry: StudentFlag = { id: nextId("fl"), createdAt: new Date().toISOString(), ...flag };
  student.flags.unshift(entry);
  student.tag = flag.type;
  student.tagNote = flag.note;
}

export function recordAttendance(
  studentId: string,
  entry: { classId: string | null; date: string; subject: string; attended: boolean },
): void {
  const student = db.students.find((s) => s.id === studentId);
  if (!student) return;
  const record: AttendanceEntry = { id: nextId("att"), ...entry };
  student.attendanceLog.unshift(record);
  const total = student.attendanceLog.length;
  const attended = student.attendanceLog.filter((a) => a.attended).length;
  student.attendancePct = total === 0 ? 0 : Math.round((attended / total) * 100);
}
