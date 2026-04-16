export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="container mx-auto max-w-4xl px-4 py-20 sm:py-24">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
          <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Legal</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            These terms describe the basic rules for using Monvia. By using the product, you agree to use it
            responsibly, provide accurate information, and comply with applicable laws and regulations.
          </p>

          <div className="mt-12 space-y-10">
            <section>
              <h2 className="text-2xl font-semibold text-slate-900">Using the Service</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                You are responsible for the activity that occurs in your account and for keeping your login credentials
                secure. The service should be used only for lawful business or personal finance workflows.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900">Your Content</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                You retain ownership of the data you enter into the product. You are responsible for ensuring that your
                records, reports, and financial information are accurate and appropriately maintained.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900">Availability and Changes</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                We may improve, update, or modify the service over time. We aim to keep Monvia reliable and useful, but
                availability can be affected by maintenance, updates, or third-party infrastructure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900">Support</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                If you have questions about these terms or need help using the service, you can reach out through the
                support channels already listed in the site footer.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
