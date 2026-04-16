export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="container mx-auto max-w-4xl px-4 py-20 sm:py-24">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
          <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Legal</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            Monvia is designed to help freelancers and small teams manage financial data with clarity and care.
            This page explains what information we collect, how we use it, and the choices available to you.
          </p>

          <div className="mt-12 space-y-10">
            <section>
              <h2 className="text-2xl font-semibold text-slate-900">Information We Collect</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                We may collect account details, profile information, workspace data, and the records you create inside
                the product, such as income, expenses, time entries, and related settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900">How We Use Information</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Your information is used to operate the product, secure access, improve reliability, support account
                features, and provide the bookkeeping experience described throughout the app.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900">Data Protection</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                We take reasonable technical and organizational measures to protect data in transit and at rest. No
                online system can promise absolute security, but protecting financial information remains a core
                priority.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900">Your Choices</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                You can review and update profile details from your account and contact support if you need help with
                privacy-related questions or requests.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
