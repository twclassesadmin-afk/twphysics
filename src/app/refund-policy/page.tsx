import { LegalPage } from "@/components/marketing/legal-page";

export default function RefundPolicyPage() {
  return (
    <LegalPage title="Refund Policy" updated="31 July 2026">
      <section>
        <h2>Fee payments</h2>
        <p>
          Course fees are billed yearly, split across 3 terms, as agreed at the time of registration.
          Fees are payable in advance for each term before classes for that term begin.
        </p>
      </section>
      <section>
        <h2>Refund eligibility</h2>
        <p>
          If you withdraw before your batch&apos;s classes have started, the full amount paid for that
          term is refunded. Once classes for a term have begun, a proportionate refund is made based
          on unused days, minus a one-time registration charge.
        </p>
      </section>
      <section>
        <h2>Non-refundable cases</h2>
        <ul>
          <li>Absence from scheduled classes without withdrawing from the batch</li>
          <li>Requests made after a term has been fully completed</li>
          <li>Disciplinary withdrawal</li>
        </ul>
      </section>
      <section>
        <h2>How to request a refund</h2>
        <p>
          Contact us at <span className="font-medium text-foreground">support@twphysics.example</span>{" "}
          or <span className="font-medium text-foreground">+91 90000 00000</span> with your registered
          email and batch details. Approved refunds are processed to the original payment method
          within 7–10 business days.
        </p>
      </section>
    </LegalPage>
  );
}
