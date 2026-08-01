import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { ApplyForm } from "./apply-form";

export default function ApplyPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center bg-muted/30 px-4 py-12">
        <div className="w-full max-w-md">
          <ApplyForm />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
