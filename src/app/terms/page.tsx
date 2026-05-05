import { LegalPage } from '@/components/legal-page'

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro={
        <p>
          These terms provide an editable SaaS terms structure for Monvia. Replace the placeholders with your actual
          business terms, support commitments, pricing rules, and legal review before production use.
        </p>
      }
      sections={[
        {
          title: '1. Provider and Scope',
          content: (
            <>
              <p>
                These Terms of Service govern access to and use of Monvia, provided by [legal entity / provider name].
              </p>
              <p>
                Define here whether the service is intended for businesses, freelancers, consumers, or a combination of
                these groups.
              </p>
            </>
          ),
        },
        {
          title: '2. Accounts and Access',
          content: (
            <>
              <p>
                Users are responsible for maintaining the confidentiality of account credentials and for all activity
                under their account.
              </p>
              <p>
                Add your rules for eligibility, account registration, suspension, admin overrides, and acceptable use.
              </p>
            </>
          ),
        },
        {
          title: '3. Service Description',
          content: (
            <>
              <p>
                Monvia is a SaaS application for bookkeeping-related workflows such as income tracking, expense
                tracking, workspace management, and time tracking.
              </p>
              <p>
                This description should stay factual and should not promise uninterrupted availability, regulatory
                compliance, or guaranteed accounting outcomes unless you actually provide them.
              </p>
            </>
          ),
        },
        {
          title: '4. Fees, Plans, and Billing',
          content: (
            <>
              <p>
                Add your pricing model, trial rules, renewal terms, taxes/VAT handling, cancellation timing, and what
                happens when a subscription expires or is manually overridden.
              </p>
              <p>
                If billing is not yet live, state that access terms are currently managed manually or by invitation.
              </p>
            </>
          ),
        },
        {
          title: '5. Customer Data',
          content: (
            <>
              <p>
                Users retain responsibility for the accuracy, legality, and integrity of the data they enter into the
                service.
              </p>
              <p>
                Add your terms for data export, deletion, backup expectations, and any processing relationship between
                provider and customer.
              </p>
            </>
          ),
        },
        {
          title: '6. Availability and Changes',
          content: (
            <>
              <p>
                The service may change over time. Features may be updated, improved, restricted, or discontinued where
                reasonably necessary.
              </p>
              <p>
                Planned maintenance, security updates, or third-party outages may affect service availability.
              </p>
            </>
          ),
        },
        {
          title: '7. Liability and Warranty',
          content: (
            <>
              <p>
                Add your jurisdiction-appropriate limitation of liability and warranty wording here, reviewed by legal
                counsel. Do not promise results, tax outcomes, uninterrupted uptime, or legal/accounting correctness
                unless contractually supported.
              </p>
            </>
          ),
        },
        {
          title: '8. Termination',
          content: (
            <>
              <p>
                Define how users can terminate the service, how the provider may suspend or terminate accounts, and how
                long data remains available after termination.
              </p>
            </>
          ),
        },
        {
          title: '9. Governing Law and Contact',
          content: (
            <>
              <p>
                Add the governing law, venue, mandatory consumer-law carve-outs if applicable, and a support/legal
                contact address.
              </p>
              <p>Contact: [legal@your-domain.com]</p>
            </>
          ),
        },
      ]}
    />
  )
}
