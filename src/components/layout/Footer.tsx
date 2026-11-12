import Link from "next/link";

export function Footer() {
  return (
    <footer className="no-print mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="text-sm font-bold text-slate-900">
              LLM Cost Intelligence
            </p>
            <p className="mt-2 max-w-md text-xs leading-relaxed text-slate-600">
              Independent, zero-server LLM API cost modeling across 8 providers.
              All token estimates, pricing calculations, and CSV/PDF quote
              exports run 100% locally in your browser&apos;s memory.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wider text-slate-900 uppercase">
              Workload Comparisons
            </p>
            <ul className="mt-3 space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/compare/rag-qa/" className="hover:text-slate-900">
                  RAG Q&amp;A Costs
                </Link>
              </li>
              <li>
                <Link
                  href="/compare/code-generation/"
                  className="hover:text-slate-900"
                >
                  Code Generation Costs
                </Link>
              </li>
              <li>
                <Link
                  href="/compare/document-summarization/"
                  className="hover:text-slate-900"
                >
                  Document Summarization
                </Link>
              </li>
              <li>
                <Link
                  href="/compare/support-agent/"
                  className="hover:text-slate-900"
                >
                  Multi-Turn Support Agent
                </Link>
              </li>
              <li>
                <Link
                  href="/compare/extraction/"
                  className="hover:text-slate-900"
                >
                  JSON / ETL Extraction
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wider text-slate-900 uppercase">
              Trust &amp; Governance
            </p>
            <ul className="mt-3 space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/methodology/" className="hover:text-slate-900">
                  Methodology &amp; Citations
                </Link>
              </li>
              <li>
                <Link href="/privacy/" className="hover:text-slate-900">
                  Zero-Transmission Privacy
                </Link>
              </li>
              <li>
                <Link href="/about/" className="hover:text-slate-900">
                  About &amp; Disclosures
                </Link>
              </li>
              <li>
                <Link
                  href="/guides/prompt-caching-write-vs-read-breakeven/"
                  className="hover:text-slate-900"
                >
                  Engineering Guides
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-between gap-2 border-t border-slate-100 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>
            Pricing data is verified against official provider documentation
            (USD). Always confirm invoices with your provider console.
          </p>
          <p>Static client-side architecture · Zero cookies for calculation</p>
        </div>
      </div>
    </footer>
  );
}
