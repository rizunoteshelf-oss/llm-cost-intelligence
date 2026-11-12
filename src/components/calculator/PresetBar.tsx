"use client";

import {
  WORKLOAD_PRESETS,
  type WorkloadPresetId,
} from "@/lib/pricing/presets";

interface PresetBarProps {
  activePresetId: WorkloadPresetId | "custom";
  onSelectPreset: (presetId: WorkloadPresetId) => void;
}

export function PresetBar({ activePresetId, onSelectPreset }: PresetBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
          1. Select Workload Preset
        </span>
        {activePresetId === "custom" && (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
            Custom Parameters Active
          </span>
        )}
      </div>

      <div
        role="group"
        aria-label="Workload presets"
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"
      >
        {WORKLOAD_PRESETS.map((preset) => {
          const isActive = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset.id)}
              className={`flex flex-col items-start rounded-xl border px-3 py-2.5 text-left transition-all ${
                isActive
                  ? "border-emerald-600 bg-emerald-50/80 text-slate-900 ring-1 ring-emerald-600"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span className="text-xs font-bold sm:text-sm">
                {preset.name}
              </span>
              <span className="mt-0.5 text-[11px] text-slate-500 tabular-nums">
                {(preset.prefixTokens + preset.dynamicInputTokens).toLocaleString("en-US")}{" "}
                in · {preset.outputTokens.toLocaleString("en-US")} out
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
