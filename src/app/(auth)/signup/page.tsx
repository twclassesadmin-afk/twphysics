import { listCourses } from "@/lib/store/batches";
import { SignupForm } from "./signup-form";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string }>;
}) {
  const { course } = await searchParams;
  const allCourses = await listCourses();
  const courses = allCourses.map((c) => ({ id: c.id, name: c.name }));

  return <SignupForm courses={courses} initialCourseId={course ?? ""} />;
}
