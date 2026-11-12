import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About & Editorial Disclosures",
  description:
    "About LLM Cost Intelligence: independent engineering ownership, pricing verification standards, and transparent monetization disclosures.",
  alternates: {
    canonical: "/about/",
  },
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold tracking-wider text-emerald-700 uppercase">
          About &amp; Transparency
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Independent LLM FinOps Tooling
        </h1>
        <p className="text-sm leading-relaxed text-slate-600">
          LLM Cost Intelligence is built and maintained by an independent
          student software engineer in India as a zero-infrastructure,
          privacy-preserving developer utility.
        </p>
      </header>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-700">
        <h2 className="text-base font-bold text-slate-900">
          Editorial &amp; Pricing Verification Standard
        </h2>
        <p>
          Every rate card, caching threshold, batch discount exception, and
          long-context price tier in our registry is manually audited against
          official provider pricing pages and stamped with a{" "}
          <code>lastVerifiedDate</code> and direct{" "}
          <code>officialSourceUrl</code>. We do not scrape unverified community
          spreadsheets or assume flat 50% batch discounts across providers.
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-700">
        <h2 className="text-base font-bold text-slate-900">
          Monetization &amp; Affiliate Disclosure
        </h2>
        <p>
          To keep this calculator 100% free with zero paywalls or accounts, the
          site may display clearly labeled editorial advertisements (Google
          AdSense) separated from interactive calculator controls.
        </p>
        <p>
          If future versions include cloud or developer infrastructure referral
          links, those links will be explicitly labeled as{" "}
          <strong>Partner / Affiliate Links</strong> (
          <code>rel=&quot;sponsored nofollow noopener&quot;</code>) and will
          never influence model cost sorting or benchmark calculations.
        </p>
      </section>

      <div className="flex flex-wrap gap-3 text-xs font-semibold">
        <Link
          href="/"
          className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
        >
          Open Cost Calculator
        </Link>
        <Link
          href="/methodology/"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-800 hover:bg-slate-50"
        >
          View Methodology
        </Link>
      </div>
    </article>
  );
}
