import { LegalPage } from "@/components/marketing/legal-page";

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="31 July 2026">
      <section>
        <h2>Information we collect</h2>
        <p>
          When you register as a student or apply to teach with us, we collect your name, contact
          details, academic/professional background, and — for students — a parent/guardian&apos;s
          name and phone number.
        </p>
      </section>
      <section>
        <h2>How we use it</h2>
        <ul>
          <li>To create and manage your account, batch placement, and class schedule</li>
          <li>To send you class reminders, syllabus updates, and important announcements</li>
          <li>To respond to issues or questions you raise with us</li>
        </ul>
      </section>
      <section>
        <h2>Who can see your information</h2>
        <p>
          Your academic records and contact details are visible only to TWPHYSICS admin staff and
          the tutor(s) assigned to your batch. We do not sell or share your information with third
          parties for marketing purposes.
        </p>
      </section>
      <section>
        <h2>Data retention</h2>
        <p>
          We retain your account information for as long as you&apos;re enrolled, and for a
          reasonable period afterward for academic records. You can request deletion of your data
          by contacting us.
        </p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>
          Questions about this policy: <span className="font-medium text-foreground">support@twphysics.example</span>
        </p>
      </section>
    </LegalPage>
  );
}
