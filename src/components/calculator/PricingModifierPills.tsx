"use client";

import { useState } from "react";
import { Info, ShieldAlert, Sparkles, Zap } from "lucide-react";

interface ModifierInfo {
  id: "cache" | "batch" | "offpeak" | "us";
  title: string;
  badge: string;
  discountSummary: string;
  description: string;
  supportedProviders: string;
}

const MODIFIER_INFOS: Record<string, ModifierInfo> = {
  cache: {
    id: "cache",
    title: "Prompt Caching",
    badge: "50%–90% OFF",
    discountSummary: "Up to 90% discount on cache-read input tokens",
    description:
      "Avoids re-paying full input rates on stable prefixes. OpenAI charges 50% of base rate with 1,024-token minimum (free writes). Anthropic charges 10% of base rate (90% off) with 1,024-token minimum plus a 1.25x 5-minute write fee. DeepSeek offers 90% off on 64-token block minimums. Gemini requires 32,768 prefix tokens.",
    supportedProviders: "OpenAI, Anthropic, Google Gemini, DeepSeek",
  },
  batch: {
    id: "batch",
    title: "Batch API (24h)",
    badge: "50% OFF",
    discountSummary: "Flat 50% discount on async 24h turnaround",
    description:
      "50% discount across input and output tokens for non-realtime asynchronous requests. Stacks on top of prompt caching for Anthropic and OpenAI. DeepSeek does not offer Batch (use Off-Peak instead). Together AI serverless chat has 0% batch discount.",
    supportedProviders: "OpenAI, Anthropic, Google Gemini, Mistral",
  },
  offpeak: {
    id: "offpeak",
    title: "DeepSeek Off-Peak",
    badge: "50% OFF",
    discountSummary: "50% off during 16:30–00:30 UTC daily",
    description:
      "DeepSeek offers 50% discount on input, output, and cached tokens during daily off-peak window (16:30 to 00:30 UTC) for DeepSeek-V3 and DeepSeek-R1 via official direct API.",
    supportedProviders: "DeepSeek Official API",
  },
  us: {
    id: "us",
    title: "US-Only Geo Uplift",
    badge: "+10% UPLIFT",
    discountSummary: "Regulatory geographic data residency multiplier",
    description:
      "Models hosted in strict US-only geographic regions (such as Amazon Bedrock US endpoints) incur a ~1.10x residency multiplier for compliance and domestic data routing guarantees.",
    supportedProviders: "Amazon Bedrock (US regions)",
  },
};

interface PricingModifierPillsProps {
  useCaching: boolean;
  onToggleCaching: (val: boolean) => void;
  useBatch: boolean;
  onToggleBatch: (val: boolean) => void;
  useOffPeak: boolean;
  onToggleOffPeak: (val: boolean) => void;
  useUsResidency: boolean;
  onToggleUsResidency: (val: boolean) => void;
}

export function PricingModifierPills({
  useCaching,
  onToggleCaching,
  useBatch,
  onToggleBatch,
  useOffPeak,
  onToggleOffPeak,
  useUsResidency,
  onToggleUsResidency,
}: PricingModifierPillsProps) {
  const [activeInfoKey, setActiveInfoKey] = useState<string | null>(null);

  const pills = [
    {
      key: "cache",
      label: "Prompt Caching",
      checked: useCaching,
      onChange: onToggleCaching,
      accent: "emerald",
    },
    {
      key: "batch",
      label: "Batch API (24h)",
      checked: useBatch,
      onChange: onToggleBatch,
      accent: "cyan",
    },
    {
      key: "offpeak",
      label: "DeepSeek Off-Peak",
      checked: useOffPeak,
      onChange: onToggleOffPeak,
      accent: "violet",
    },
    {
      key: "us",
      label: "US-Only Geo Uplift",
      checked: useUsResidency,
      onChange: onToggleUsResidency,
      accent: "amber",
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          Pricing Modifiers &amp; Discount Rules
        </span>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          Hover or click (i) for provider rules
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {pills.map((pill) => {
          const info = MODIFIER_INFOS[pill.key];
          if (!info) return null;
          const isInfoOpen = activeInfoKey === pill.key;

          return (
            <div key={pill.key} className="relative inline-flex items-center">
              <label
                className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all select-none ${
                  pill.checked
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30"
                    : "border-slate-200 dark:border-white/10 bg-white dark:bg-[#161F30] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20"
                }`}
              >
                <input
                  type="checkbox"
                  checked={pill.checked}
                  onChange={(e) => pill.onChange(e.target.checked)}
                  className="h-3.5 w-3.5 rounded accent-emerald-500"
                />
                <span>{pill.label}</span>
              </label>

              {/* Info Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveInfoKey(isInfoOpen ? null : pill.key);
                }}
                onMouseEnter={() => setActiveInfoKey(pill.key)}
                onMouseLeave={() => setActiveInfoKey(null)}
                aria-label={`View pricing rules for ${pill.label}`}
                className="ml-1 flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <Info className="h-3.5 w-3.5" />
              </button>

              {/* Popover */}
              {isInfoOpen && (
                <div
                  onMouseEnter={() => setActiveInfoKey(pill.key)}
                  onMouseLeave={() => setActiveInfoKey(null)}
                  className="absolute left-0 top-full z-50 mt-1.5 w-72 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-900/95 dark:bg-[#0B101D]/95 p-3.5 text-white shadow-2xl backdrop-blur-md transition-all text-xs"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                    <span className="font-bold text-emerald-400">
                      {info.title}
                    </span>
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-300">
                      {info.badge}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-300">
                    {info.description}
                  </p>
                  <div className="mt-2.5 border-t border-white/10 pt-2 text-[10px] text-slate-400">
                    <strong className="text-slate-200">Supported:</strong>{" "}
                    {info.supportedProviders}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
