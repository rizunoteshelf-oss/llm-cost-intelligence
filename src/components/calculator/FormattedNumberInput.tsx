"use client";

import { useEffect, useState } from "react";

interface FormattedNumberInputProps {
  id?: string;
  "aria-label"?: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (val: number) => void;
  className?: string;
  disabled?: boolean;
}

export function FormattedNumberInput({
  id,
  "aria-label": ariaLabel,
  value,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  onChange,
  className = "",
  disabled = false,
}: FormattedNumberInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState(() =>
    value.toLocaleString("en-US"),
  );

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value.toLocaleString("en-US"));
    }
  }, [value, isFocused]);

  function handleFocus() {
    setIsFocused(true);
    // On focus, show digits without commas for easy editing
    setDisplayValue(value === 0 ? "" : String(value));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^\d]/g, "");
    setDisplayValue(raw);
    const num = raw === "" ? 0 : Number(raw);
    if (!Number.isNaN(num)) {
      const clamped = Math.min(max, Math.max(min, num));
      onChange(clamped);
    }
  }

  function handleBlur() {
    setIsFocused(false);
    const raw = displayValue.replace(/[^\d]/g, "");
    const num = raw === "" ? min : Number(raw);
    const clamped = Math.min(max, Math.max(min, num));
    onChange(clamped);
    setDisplayValue(clamped.toLocaleString("en-US"));
  }

  return (
    <input
      id={id}
      aria-label={ariaLabel}
      type="text"
      inputMode="numeric"
      disabled={disabled}
      value={displayValue}
      onFocus={handleFocus}
      onChange={handleChange}
      onBlur={handleBlur}
      className={`rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#161F30] px-2.5 py-1.5 font-mono text-xs tabular-nums text-slate-900 dark:text-slate-100 shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 disabled:opacity-40 transition-colors ${className}`}
    />
  );
}
