export function FinOpsEmblem({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect
        width="32"
        height="32"
        rx="8"
        className="fill-slate-900 dark:fill-slate-950 stroke-slate-800 dark:stroke-white/10"
        strokeWidth="1"
      />
      <defs>
        <linearGradient
          id="finops-emblem-grad"
          x1="6"
          y1="24"
          x2="26"
          y2="8"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#10B981" />
          <stop offset="0.5" stopColor="#06B6D4" />
          <stop offset="1" stopColor="#818CF8" />
        </linearGradient>
        <linearGradient
          id="finops-glow"
          x1="8"
          y1="24"
          x2="24"
          y2="8"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#10B981" stopOpacity="0.4" />
          <stop offset="1" stopColor="#06B6D4" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid reference dots */}
      <circle cx="8" cy="8" r="1" className="fill-slate-600 dark:fill-slate-700" fillOpacity="0.5" />
      <circle cx="16" cy="8" r="1" className="fill-slate-600 dark:fill-slate-700" fillOpacity="0.5" />
      <circle cx="24" cy="8" r="1" className="fill-slate-600 dark:fill-slate-700" fillOpacity="0.5" />
      <circle cx="8" cy="16" r="1" className="fill-slate-600 dark:fill-slate-700" fillOpacity="0.5" />
      <circle cx="24" cy="16" r="1" className="fill-slate-600 dark:fill-slate-700" fillOpacity="0.5" />
      <circle cx="8" cy="24" r="1" className="fill-slate-600 dark:fill-slate-700" fillOpacity="0.5" />
      <circle cx="16" cy="24" r="1" className="fill-slate-600 dark:fill-slate-700" fillOpacity="0.5" />
      <circle cx="24" cy="24" r="1" className="fill-slate-600 dark:fill-slate-700" fillOpacity="0.5" />

      {/* Trajectory glow backdrop */}
      <path
        d="M 6 24 C 11 24, 13 18, 17 14 C 20 11, 22 9, 26 8"
        stroke="url(#finops-emblem-grad)"
        strokeWidth="4"
        strokeOpacity="0.25"
        strokeLinecap="round"
      />

      {/* Vector curve representing token flow and caching optimization */}
      <path
        d="M 6 24 C 11 24, 13 18, 17 14 C 20 11, 22 9, 26 8"
        stroke="url(#finops-emblem-grad)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Break-even caching inflection node */}
      <circle cx="17" cy="14" r="3" fill="url(#finops-glow)" />
      <circle cx="17" cy="14" r="1.75" fill="#34D399" />

      {/* Frontier end node */}
      <circle cx="26" cy="8" r="1.75" fill="#38BDF8" />

      {/* Base entry node */}
      <circle cx="6" cy="24" r="1.75" fill="#10B981" />
    </svg>
  );
}
