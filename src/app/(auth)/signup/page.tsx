import { listCourses } from "@/lib/store/batches";
import { SignupForm } from "./signup-form";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string }>;
}) {
  const { course } = await searchParams;
  const courses = listCourses().map((c) => ({
    id: c.id,
    name: c.name,
    priceInInr: c.priceInInr,
    emiFromInr: c.emiFromInr,
  }));

  return <SignupForm courses={courses} initialCourseId={course ?? ""} />;
}
