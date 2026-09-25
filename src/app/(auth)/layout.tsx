import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AuthBrandPanel
        eyebrow="TWPHYSICS"
        title="Structured prep,"
        accent="real progress."
        description="Live daily classes, syllabus tracking, and a dedicated subject-wise tutor team — built for how toppers actually prepare."
        points={[
          "Batches of 9, 5, or 3 students",
          "Physics, Chemistry & Maths, every day",
          "Doubt-clearing within 24 hours",
        ]}
      />
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-muted/20 px-4 py-10 sm:py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative w-full max-w-2xl">{children}</div>
      </div>
    </div>
  );
}
