"use client";

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

function fmtCompactTokens(count: number): string {
  if (count >= 1_000_000) {
    const val = count / 1_000_000;
    return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}M`;
  }
  if (count >= 1_000) {
    const val = count / 1_000;
    return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}k`;
  }
  return String(count);
}

export function PresetBar({ activePresetId, onSelectPreset }: PresetBarProps) {
  const activePreset = WORKLOAD_PRESETS.find((p) => p.id === activePresetId);
  const activeEditorial = activePreset ? PRESET_EDITORIAL[activePreset.id] : null;

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
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5"
      >
        {WORKLOAD_PRESETS.map((preset) => {
          const isActive = activePresetId === preset.id;
          const Icon = PRESET_ICONS[preset.id] || Sparkles;
          const totalInTokens = preset.prefixTokens + preset.dynamicInputTokens;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset.id)}
              className={`group relative flex w-full flex-col justify-between rounded-xl border p-3 text-left transition-all ${
                isActive
                  ? "border-emerald-500/60 bg-emerald-500/10 dark:bg-emerald-500/15 text-slate-900 dark:text-white shadow-xs ring-1 ring-emerald-500/40"
                  : "border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-[#161F30]"
              }`}
            >
              <div>
                <div className="flex w-full items-center justify-between gap-1.5">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-lg transition-colors ${
                      isActive
                        ? "bg-emerald-500 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                  </div>
                  {isActive && (
                    <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="mt-2 space-y-0.5 w-full">
                  <span className="block text-xs font-bold leading-tight tracking-tight text-slate-900 dark:text-white truncate">
                    {preset.name}
                  </span>
                  <div className="flex items-center gap-1 font-mono text-[10px] sm:text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      {fmtCompactTokens(totalInTokens)} in
                    </span>
                    <span className="text-slate-400 dark:text-slate-600">·</span>
                    <span className="text-cyan-600 dark:text-cyan-400 font-medium">
                      {fmtCompactTokens(preset.outputTokens)} out
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between w-full text-[10px] text-slate-400 dark:text-slate-500 font-mono border-t border-slate-100 dark:border-white/5 pt-1.5">
                <span>{fmtCompactTokens(preset.requestsPerDay)} req/d</span>
                <span>{Math.round(preset.cacheHitRate * 100)}% hit</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Dedicated Inline Contextual Profile Bar (Zero Tooltip Occlusion) */}
      {activeEditorial && activePreset ? (
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors">
          <div className="flex items-start sm:items-center gap-2">
            <HelpCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
              <strong className="text-slate-900 dark:text-white font-semibold">
                {activePreset.name}:
              </strong>{" "}
              {activeEditorial.summary}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 font-mono text-[10px] sm:text-[11px]">
            <span className="rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-cyan-600 dark:text-cyan-400 font-medium">
              Prefix: {activePreset.prefixTokens.toLocaleString()} tok
            </span>
            <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-emerald-600 dark:text-emerald-400 font-medium">
              Output: {activePreset.outputTokens.toLocaleString()} tok
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
