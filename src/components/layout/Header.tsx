import Link from "next/link";
import { FinOpsEmblem } from "./FinOpsEmblem";
import { ThemeToggle } from "./ThemeToggle";

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
    <header className="no-print sticky top-0 z-30 border-b border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#090D16]/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 text-slate-900 dark:text-white transition-opacity hover:opacity-90"
        >
          <FinOpsEmblem className="h-8 w-8 shrink-0" />
          <span className="flex flex-col leading-tight">
            <span className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight sm:text-base font-sans">
                LLM Cost Intelligence
              </span>
              <span className="hidden rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 sm:inline-block">
                FinOps
              </span>
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Institutional API Token &amp; Caching Economics
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <nav
            aria-label="Primary Navigation"
            className="flex flex-wrap items-center gap-1 sm:gap-1.5"
          >
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white sm:text-sm"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="h-4 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
