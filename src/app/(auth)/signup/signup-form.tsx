"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signup } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

type CourseOption = { id: string; name: string; priceInInr: number; emiFromInr: number };

export function SignupForm({
  courses,
  initialCourseId,
}: {
  courses: CourseOption[];
  initialCourseId: string;
}) {
  const [state, formAction, pending] = useActionState(signup, null);
  const [courseId, setCourseId] = useState(initialCourseId || (courses[0]?.id ?? ""));
  const selectedCourse = courses.find((c) => c.id === courseId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student enrollment</CardTitle>
        <CardDescription>
          Enrollment includes course purchase — you&apos;ll be placed in a batch right away.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <input type="hidden" name="courseId" value={courseId} />
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" autoComplete="name" required />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" autoComplete="tel" required />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input id="age" name="age" type="number" min={10} max={60} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" autoComplete="new-password" required />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="parentName">Parent/guardian name</Label>
              <Input id="parentName" name="parentName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentPhone">Parent/guardian phone</Label>
              <Input id="parentPhone" name="parentPhone" type="tel" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" name="address" rows={2} required />
          </div>
          <div className="space-y-2">
            <Label>Course</Label>
            <Select value={courseId} onValueChange={(value) => setCourseId(value ?? "")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name} — ₹{course.priceInInr.toLocaleString("en-IN")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCourse && (
              <p className="text-xs text-muted-foreground">
                ₹{selectedCourse.priceInInr.toLocaleString("en-IN")} one-time, or ₹
                {selectedCourse.emiFromInr.toLocaleString("en-IN")}/mo EMI. Payment is mocked in
                this preview — Razorpay is wired in the backend phase.
              </p>
            )}
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending
              ? "Enrolling..."
              : `Pay ₹${selectedCourse?.priceInInr.toLocaleString("en-IN") ?? ""} & Enroll`}
          </Button>
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
