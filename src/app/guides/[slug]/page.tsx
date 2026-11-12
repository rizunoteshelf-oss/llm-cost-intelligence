import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES } from "@/content/guides";
import { AdSlot } from "@/components/ads/AdSlot";

export const dynamicParams = false;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://llm.everydaypdf.me";

export function generateStaticParams(): Array<{ slug: string }> {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = GUIDES.find((g) => g.slug === slug);
  if (!guide) {
    return { title: "Engineering Guide" };
  }
  return {
    title: guide.title,
    description: guide.metaDescription,
    alternates: {
      canonical: `/guides/${guide.slug}/`,
    },
  };
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = GUIDES.find((g) => g.slug === slug);
  if (!guide) {
    notFound();
  }

  const techArticleJsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: guide.title,
    description: guide.metaDescription,
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    url: `${SITE_URL}/guides/${guide.slug}/`,
    author: {
      "@type": "Organization",
      name: "LLM Cost Intelligence",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Calculator",
        item: `${SITE_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: guide.title,
        item: `${SITE_URL}/guides/${guide.slug}/`,
      },
    ],
  };

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(techArticleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-900">
          Calculator
        </Link>{" "}
        / <span className="font-semibold text-slate-800">{guide.title}</span>
      </nav>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-semibold text-emerald-800">
            Engineering Guide
          </span>
          <span>{guide.readingTimeMinutes} min read</span>
          <span>·</span>
          <span className="font-mono">Updated {guide.updatedAt}</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          {guide.title}
        </h1>
        <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
          {guide.summary}
        </p>
      </header>

      <div className="space-y-6">
        {guide.sections.map((section, idx) => (
          <section
            key={idx}
            className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6"
          >
            <h2 className="text-lg font-bold text-slate-900">
              {section.heading}
            </h2>
            {section.paragraphs.map((p, pIdx) => (
              <p
                key={pIdx}
                className="text-sm leading-relaxed text-slate-700"
              >
                {p}
              </p>
            ))}
            {section.callout && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs leading-relaxed text-emerald-950">
                {section.callout}
              </div>
            )}
          </section>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white">
        <h2 className="text-base font-bold">
          Test These Numbers on Your Own Workload
        </h2>
        <p className="mt-1 text-xs text-slate-300">
          All calculations execute locally in your browser with zero server
          calls.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold">
          {guide.relatedPreset ? (
            <Link
              href={`/compare/${guide.relatedPreset}/`}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-slate-950 hover:bg-emerald-400"
            >
              Open {guide.relatedPreset} Comparison →
            </Link>
          ) : null}
          <Link
            href="/"
            className="rounded-lg border border-slate-600 px-4 py-2 text-white hover:bg-slate-800"
          >
            Launch Main Calculator
          </Link>
        </div>
      </section>

      <nav
        aria-label="More Engineering Guides"
        className="rounded-2xl border border-slate-200 bg-white p-6"
      >
        <h2 className="text-sm font-bold text-slate-900">
          More FinOps &amp; Pricing Guides
        </h2>
        <ul className="mt-3 space-y-2 text-xs">
          {GUIDES.filter((g) => g.slug !== guide.slug).map((other) => (
            <li key={other.slug}>
              <Link
                href={`/guides/${other.slug}/`}
                className="font-medium text-emerald-700 hover:underline"
              >
                {other.title} →
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <AdSlot slotId={`guide-${guide.slug}-bottom`} />
    </article>
  );
}
