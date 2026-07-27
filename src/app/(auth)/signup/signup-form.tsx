"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signup } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

type CourseOption = { id: string; name: string };
type Stream = "MPC" | "BiPC";

const TARGET_EXAMS: Record<Stream, string[]> = {
  MPC: ["JEE Mains", "BITSAT", "EAPCET"],
  BiPC: ["NEET", "EAPCET"],
};

export function SignupForm({
  courses,
  initialCourseId,
}: {
  courses: CourseOption[];
  initialCourseId: string;
}) {
  const [state, formAction, pending] = useActionState(signup, null);
  const [courseId, setCourseId] = useState(initialCourseId || (courses[0]?.id ?? ""));
  const [studentCategory, setStudentCategory] = useState<"college_going" | "long_term">("college_going");
  const [stream, setStream] = useState<Stream>("MPC");
  const [targetExams, setTargetExams] = useState<string[]>([]);
  const [learningMode, setLearningMode] = useState<"online" | "offline">("online");
  const [learningType, setLearningType] = useState<"individual" | "group">("group");

  function toggleExam(exam: string) {
    setTargetExams((prev) => (prev.includes(exam) ? prev.filter((e) => e !== exam) : [...prev, exam]));
  }

  function selectStream(next: Stream) {
    setStream(next);
    setTargetExams([]);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student registration</CardTitle>
        <CardDescription>Tell us about the student — you&apos;ll be placed in a batch right away.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <input type="hidden" name="courseId" value={courseId} />
        <input type="hidden" name="studentCategory" value={studentCategory} />
        <input type="hidden" name="stream" value={stream} />
        <input type="hidden" name="learningMode" value={learningMode} />
        <input type="hidden" name="learningType" value={learningType} />
        {targetExams.map((exam) => (
          <input key={exam} type="hidden" name="targetExams" value={exam} />
        ))}

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Student name</Label>
              <Input id="fullName" name="fullName" autoComplete="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Student phone</Label>
              <Input id="phone" name="phone" type="tel" autoComplete="tel" required />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="parentName">Father&apos;s name</Label>
              <Input id="parentName" name="parentName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentPhone">Father&apos;s phone</Label>
              <Input id="parentPhone" name="parentPhone" type="tel" required />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" autoComplete="new-password" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Student type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={studentCategory === "college_going" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setStudentCategory("college_going")}
              >
                College-going
              </Button>
              <Button
                type="button"
                variant={studentCategory === "long_term" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setStudentCategory("long_term")}
              >
                Long-term
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Course</Label>
            <Select value={courseId} onValueChange={(value) => setCourseId(value ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Are you preparing for?</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={stream === "MPC" ? "default" : "outline"}
                className="flex-1"
                onClick={() => selectStream("MPC")}
              >
                MPC
              </Button>
              <Button
                type="button"
                variant={stream === "BiPC" ? "default" : "outline"}
                className="flex-1"
                onClick={() => selectStream("BiPC")}
              >
                BiPC
              </Button>
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              {TARGET_EXAMS[stream].map((exam) => (
                <label key={exam} className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={targetExams.includes(exam)}
                    onChange={() => toggleExam(exam)}
                    className="size-4 rounded border-input"
                  />
                  {exam}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Learning mode</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={learningMode === "online" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setLearningMode("online")}
              >
                Online
              </Button>
              <Button
                type="button"
                variant={learningMode === "offline" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setLearningMode("offline")}
              >
                Offline
              </Button>
            </div>
          </div>

          {learningMode === "offline" ? (
            <div className="rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground">
              Offline registration is handled in person — please contact us to complete your
              registration:
              <br />
              <span className="font-medium text-foreground">+91 90000 00000</span> ·{" "}
              <span className="font-medium text-foreground">support@twphysics.example</span>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Learning type</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={learningType === "individual" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setLearningType("individual")}
                  >
                    Individual
                  </Button>
                  <Button
                    type="button"
                    variant={learningType === "group" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setLearningType("group")}
                  >
                    Group
                  </Button>
                </div>
              </div>
              {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {learningMode === "online" && (
            <Button type="submit" className="w-full" disabled={pending || targetExams.length === 0}>
              {pending ? "Registering..." : "Register"}
            </Button>
          )}
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Log in
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">
            <Link href="/" className="underline underline-offset-4">
              &larr; Back to home
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
