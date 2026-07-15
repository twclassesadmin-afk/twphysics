import { db, nextId } from "./db";
import type { AttendanceEntry, Student, StudentFlag, StudentTag } from "./types";

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
    status: "active",
    attendancePct: 0,
    lastScore: 0,
    tag: null,
    tagNote: "",
    examHistory: [],
    attendanceLog: [],
    flags: [],
  };
  db.students.push(student);
  return student;
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

export function recordExamResult(studentId: string, title: string, score: number, totalMarks: number): void {
  const student = db.students.find((s) => s.id === studentId);
  if (!student) return;
  student.examHistory.unshift({ title, score, totalMarks });
  student.lastScore = score;
}
