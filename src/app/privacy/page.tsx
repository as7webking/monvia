import { LegalPage } from '@/components/legal-page'

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={
        <p>
          This page is designed as a Germany/EU-friendly privacy notice template for Monvia. Replace the placeholders
          below with your real company details, processing activities, and legal review before going live.
        </p>
      }
      sections={[
        {
          title: '1. Data Controller / Provider',
          content: (
            <>
              <p>[Legal company or provider name]</p>
              <p>[Street and house number]</p>
              <p>[Postal code, city, country]</p>
              <p>Email: [privacy@your-domain.com]</p>
              <p>Phone: [contact phone number]</p>
            </>
          ),
        },
        {
          title: '2. What Data We Collect',
          content: (
            <>
              <p>
                We may process account data, authentication data, profile details, workspace/company information, and
                bookkeeping data entered into the app, such as income, expenses, time entries, currencies, and settings.
              </p>
              <p>
                We may also process technical data such as IP address, browser/device information, log data, and
                security-related metadata required to operate the service.
              </p>
            </>
          ),
        },
        {
          title: '3. Purposes of Processing',
          content: (
            <>
              <p>
                Personal data may be processed to provide the service, manage user accounts, authenticate users,
                maintain security, deliver support, operate infrastructure, and improve reliability.
              </p>
              <p>
                Add your actual processing purposes here, including onboarding, billing/account access, support, email
                communication, analytics, and compliance needs where applicable.
              </p>
            </>
          ),
        },
        {
          title: '4. Legal Basis',
          content: (
            <>
              <p>
                Placeholder: specify the lawful basis under GDPR/EEA rules for each processing activity, for example
                contract performance, legal obligation, legitimate interests, or consent where required.
              </p>
              <p>
                This section should be reviewed with your legal advisor and aligned with the actual data flows in the
                product.
              </p>
            </>
          ),
        },
        {
          title: '5. Third-Party Processors / Services',
          content: (
            <>
              <p>
                List the third-party processors and service providers used to run the SaaS, for example hosting,
                authentication, database, storage, email delivery, analytics, monitoring, or payment providers.
              </p>
              <p>
                For each provider, add the provider name, purpose, region/country, and a link to the provider privacy
                information if relevant.
              </p>
            </>
          ),
        },
        {
          title: '6. Storage and Retention',
          content: (
            <>
              <p>
                Explain how long account, financial, support, log, and backup data is kept, and what criteria determine
                retention periods.
              </p>
              <p>
                Add any mandatory statutory retention requirements that apply to your business and region.
              </p>
            </>
          ),
        },
        {
          title: '7. User Rights',
          content: (
            <>
              <p>
                Users may have rights to access, rectify, erase, restrict processing, object to processing, and request
                data portability, subject to applicable law.
              </p>
              <p>
                Add the process for submitting a request and, if applicable, the right to lodge a complaint with a
                supervisory authority.
              </p>
            </>
          ),
        },
        {
          title: '8. Contact Details',
          content: (
            <>
              <p>Privacy contact: [privacy@your-domain.com]</p>
              <p>Support contact: [support@your-domain.com]</p>
              <p>
                If you appoint a data protection officer, add the DPO contact details here: [DPO name and contact].
              </p>
            </>
          ),
        },
        {
          title: '9. Cookies / Analytics',
          content: (
            <>
              <p>
                Add a clear description of cookies, analytics, tracking, consent requirements, and any consent banner or
                preference center used on the public site.
              </p>
              <p>
                If no analytics or non-essential cookies are used, state that explicitly here.
              </p>
            </>
          ),
        },
      ]}
    />
  )
}
