"use client";

import { useState } from "react";
import {
  BookOpen,
  Bot,
  Braces,
  Code2,
  FileText,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { PRESET_EDITORIAL } from "@/content/presets";
import {
  WORKLOAD_PRESETS,
  type WorkloadPresetId,
} from "@/lib/pricing/presets";

interface PresetBarProps {
  activePresetId: WorkloadPresetId | "custom";
  onSelectPreset: (presetId: WorkloadPresetId) => void;
}

const PRESET_ICONS: Record<WorkloadPresetId, React.ComponentType<{ className?: string }>> = {
  "rag-qa": BookOpen,
  "code-generation": Code2,
  "document-summarization": FileText,
  "support-agent": Bot,
  extraction: Braces,
};

export function PresetBar({ activePresetId, onSelectPreset }: PresetBarProps) {
  const [hoveredPreset, setHoveredPreset] = useState<WorkloadPresetId | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold">
            1
          </span>
          <span className="text-xs font-semibold tracking-wider text-slate-700 dark:text-slate-300 uppercase">
            Select Workload Preset
          </span>
        </div>

        {activePresetId === "custom" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Custom Parameters Active
          </span>
        ) : (
          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
            Click any profile or customize parameters below
          </span>
        )}
      </div>

      <div
        role="group"
        aria-label="Workload presets"
        className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5"
      >
        {WORKLOAD_PRESETS.map((preset) => {
          const isActive = activePresetId === preset.id;
          const Icon = PRESET_ICONS[preset.id] || Sparkles;
          const editorial = PRESET_EDITORIAL[preset.id];

          return (
            <div
              key={preset.id}
              className="relative"
              onMouseEnter={() => setHoveredPreset(preset.id)}
              onMouseLeave={() => setHoveredPreset(null)}
            >
              <button
                type="button"
                onClick={() => onSelectPreset(preset.id)}
                className={`group relative flex w-full flex-col items-start rounded-xl border p-3 text-left transition-all ${
                  isActive
                    ? "border-emerald-500/60 bg-emerald-500/10 dark:bg-emerald-500/15 text-slate-900 dark:text-white shadow-xs ring-1 ring-emerald-500/40"
                    : "border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-[#161F30]"
                }`}
              >
                <div className="flex w-full items-center justify-between gap-1.5">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                      isActive
                        ? "bg-emerald-500 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  {isActive && (
                    <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="mt-2.5 space-y-0.5">
                  <span className="block text-xs font-bold leading-snug tracking-tight text-slate-900 dark:text-white sm:text-sm">
                    {preset.name}
                  </span>
                  <div className="flex items-center gap-1 font-mono text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      {(preset.prefixTokens + preset.dynamicInputTokens).toLocaleString("en-US")}
                    </span>
                    <span className="text-slate-400 dark:text-slate-600">in</span>
                    <span>·</span>
                    <span className="text-cyan-600 dark:text-cyan-400 font-medium">
                      {preset.outputTokens.toLocaleString("en-US")}
                    </span>
                    <span className="text-slate-400 dark:text-slate-600">out</span>
                  </div>
                </div>

                <div className="mt-1.5 flex items-center justify-between w-full text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  <span>{preset.requestsPerDay.toLocaleString("en-US")} req/d</span>
                  <span>{Math.round(preset.cacheHitRate * 100)}% hit</span>
                </div>
              </button>

              {/* Hover Tooltip / Profile Drawer */}
              {hoveredPreset === preset.id && editorial && (
                <div className="pointer-events-none absolute left-0 top-full z-40 mt-1.5 w-64 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-900/95 dark:bg-[#0B101D]/95 p-3 text-white shadow-xl backdrop-blur-sm transition-opacity hidden sm:block">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                    <HelpCircle className="h-3 w-3" />
                    <span>Traffic Profile: {preset.name}</span>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-slate-300">
                    {editorial.summary}
                  </p>
                  <div className="mt-2 border-t border-white/10 pt-1.5 font-mono text-[10px] text-slate-400">
                    Prefix: {preset.prefixTokens.toLocaleString()} tok · Output:{" "}
                    {preset.outputTokens.toLocaleString()} tok
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
