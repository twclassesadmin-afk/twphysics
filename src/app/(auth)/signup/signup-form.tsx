"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { signup } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { StepProgress } from "@/components/auth/step-progress";
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

const STEPS = ["Student", "Account", "Preparation"];

export function SignupForm({
  courses,
  initialCourseId,
}: {
  courses: CourseOption[];
  initialCourseId: string;
}) {
  const [state, formAction, pending] = useActionState(signup, null);
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState(1);
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

  function next() {
    // Hidden (non-current) steps' fields are excluded from constraint
    // validation by the browser automatically, so this only checks the
    // step currently on screen — no manual per-step field list needed.
    if (formRef.current && !formRef.current.reportValidity()) return;
    setStep((s) => Math.min(s + 1, STEPS.length));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 1));
  }

  return (
    <Card className="w-full shadow-xl shadow-foreground/5 ring-foreground/10">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-2xl font-semibold tracking-tight">Student registration</CardTitle>
        <CardDescription className="text-[15px]">
          Tell us about the student — you&apos;ll be placed in a batch right away.
        </CardDescription>
        <div className="pt-5">
          <StepProgress steps={STEPS} current={step} />
        </div>
      </CardHeader>
      <form ref={formRef} action={formAction}>
        <input type="hidden" name="courseId" value={courseId} />
        <input type="hidden" name="studentCategory" value={studentCategory} />
        <input type="hidden" name="stream" value={stream} />
        <input type="hidden" name="learningMode" value={learningMode} />
        <input type="hidden" name="learningType" value={learningType} />
        {targetExams.map((exam) => (
          <input key={exam} type="hidden" name="targetExams" value={exam} />
        ))}

        <CardContent className="pt-5">
          {/* Step 1 — Student */}
          <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", step !== 1 && "hidden")}>
            <div className="space-y-2">
              <Label htmlFor="fullName">Student name</Label>
              <Input id="fullName" placeholder="e.g. Ravi Kumar" name="fullName" autoComplete="name" required={step === 1} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Student phone</Label>
              <Input id="phone" placeholder="10-digit mobile number" name="phone" type="tel" autoComplete="tel" required={step === 1} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentName">Father&apos;s name</Label>
              <Input id="parentName" placeholder="Parent or guardian name" name="parentName" required={step === 1} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentPhone">Father&apos;s phone</Label>
              <Input id="parentPhone" placeholder="Parent’s 10-digit mobile number" name="parentPhone" type="tel" required={step === 1} />
            </div>
          </div>

          {/* Step 2 — Account */}
          <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", step !== 2 && "hidden")}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="you@example.com" name="email" type="email" autoComplete="email" required={step === 2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" placeholder="At least 6 characters" name="password" type="password" autoComplete="new-password" required={step === 2} />
            </div>
            <div className="space-y-2 sm:col-span-2">
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
            <div className="space-y-2 sm:col-span-2">
              <Label>Course</Label>
              <Select
                items={courses.map((course) => ({ value: course.id, label: course.name }))}
                value={courseId}
                onValueChange={(value) => setCourseId(value ?? "")}
              >
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
          </div>

          {/* Step 3 — Preparation */}
          <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", step !== 3 && "hidden")}>
            <div className="space-y-2 sm:col-span-2">
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

            <div className="space-y-2 sm:col-span-2">
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
              <div className="rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground sm:col-span-2">
                Offline registration is handled in person — please contact us to complete your
                registration:
                <br />
                <span className="font-medium text-foreground">+91 90000 00000</span> ·{" "}
                <span className="font-medium text-foreground">support@twphysics.example</span>
              </div>
            ) : (
              <div className="space-y-2 sm:col-span-2">
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
            )}
            {state?.error && (
              <p className="text-sm text-destructive sm:col-span-2">{state.error}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t-0 bg-transparent pt-6 pb-6">
          <div className="flex w-full gap-3">
            {step > 1 && (
              <Button type="button" variant="outline" size="lg" onClick={back} className="flex-1">
                Back
              </Button>
            )}
            {step < STEPS.length ? (
              <Button type="button" size="lg" onClick={next} className="flex-1">
                Continue
              </Button>
            ) : (
              learningMode === "online" && (
                <Button
                  type="submit"
                  size="lg"
                  className="flex-1"
                  disabled={pending || targetExams.length === 0}
                >
                  {pending ? "Registering..." : "Register"}
                </Button>
              )
            )}
          </div>
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
