"use client";

import { useEffect } from "react";

interface AdSlotProps {
  slotId: string;
  format?: "auto" | "horizontal" | "rectangle";
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Isolated editorial AdSense container.
 * - Enforces >= 48px vertical separation (mt-12) from interactive calculator controls.
 * - Reserves min-h-[250px] to keep CLS < 0.1.
 * - Renders nothing when NEXT_PUBLIC_ENABLE_ADSENSE !== "true" or client ID is missing.
 */
export function AdSlot({
  slotId,
  format = "auto",
  className = "",
}: AdSlotProps) {
  const enabled = process.env.NEXT_PUBLIC_ENABLE_ADSENSE === "true";
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "";
  const resolvedSlotId = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID || slotId;
  const hasNumericSlot = /^\d+$/.test(resolvedSlotId);

  useEffect(() => {
    if (!enabled || !clientId || !hasNumericSlot) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ignore AdSense push errors if script is blocked by client extensions
    }
  }, [enabled, clientId, hasNumericSlot, resolvedSlotId]);

  if (!enabled || !clientId || !hasNumericSlot) {
    return null;
  }

  return (
    <aside
      data-ad-slot={resolvedSlotId}
      aria-label="Advertisement"
      className={`no-print mt-12 mb-8 rounded-xl border border-slate-200 bg-slate-50/80 p-4 ${className}`}
    >
      <p className="mb-2 text-center text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
        Advertisement
      </p>
      <div className="flex min-h-[250px] items-center justify-center overflow-hidden">
        <ins
          className="adsbygoogle block w-full"
          style={{ display: "block" }}
          data-ad-client={clientId}
          data-ad-slot={resolvedSlotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
}
