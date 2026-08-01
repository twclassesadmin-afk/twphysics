import { LegalPage } from "@/components/marketing/legal-page";

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="31 July 2026">
      <section>
        <h2>Enrollment</h2>
        <p>
          By registering, you confirm the information you provide is accurate. TWPHYSICS places
          students into batches based on course, category, and available capacity, and will notify
          you once your batch is confirmed if one wasn&apos;t open at the time you registered.
        </p>
      </section>
      <section>
        <h2>Classes and attendance</h2>
        <p>
          Class schedules, timings, and assigned tutors may be adjusted by TWPHYSICS as needed.
          Students are expected to join scheduled classes on time; attendance is tracked and shared
          with you on your dashboard.
        </p>
      </section>
      <section>
        <h2>Conduct</h2>
        <p>
          Students and tutors are expected to communicate respectfully. TWPHYSICS reserves the right
          to suspend access for accounts found to violate this.
        </p>
      </section>
      <section>
        <h2>Fees</h2>
        <p>
          Fees are billed as described in our <a className="underline underline-offset-4" href="/refund-policy">Refund Policy</a>.
          Continued access to classes and materials is contingent on fees being paid on schedule.
        </p>
      </section>
      <section>
        <h2>Changes to these terms</h2>
        <p>
          We may update these terms from time to time. Continued use of your account after an
          update constitutes acceptance of the revised terms.
        </p>
      </section>
    </LegalPage>
  );
}
