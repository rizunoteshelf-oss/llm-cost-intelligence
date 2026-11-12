import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Calculator" },
  { href: "/models/", label: "Models" },
  { href: "/compare/", label: "Workloads" },
  { href: "/guides/prompt-caching-write-vs-read-breakeven/", label: "Guides" },
  { href: "/methodology/", label: "Methodology" },
  { href: "/about/", label: "About" },
] as const;

export function Header() {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      {/* Ecosystem Network Announcement Bar */}
      <div className="border-b border-slate-800 bg-slate-900 px-4 py-1.5 text-[11px] text-slate-300 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <span className="font-medium text-slate-400">
            Everyday Suite Ecosystem
          </span>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <a
              href="https://everydaypdf.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Need PDF Tools? 52+ free at EverydayPDF.me →
            </a>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <a
              href="https://cut.everydaypdf.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Free Photo &amp; ID Studio: EverydayCut →
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-slate-900 hover:text-emerald-700"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 font-mono text-sm font-bold text-emerald-400">
            $0
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight sm:text-base">
              LLM Cost Intelligence
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              Client-Side FinOps &amp; Token Budgeting
            </span>
          </span>
        </Link>

        <nav
          aria-label="Primary Navigation"
          className="flex flex-wrap items-center gap-1 sm:gap-2"
        >
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:text-sm"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
