import { describe, expect, it } from "vitest";
import { buildEstimatesCsv, sanitizeCsvCell } from "./csv";
import { calculateModelCost } from "../pricing/engine";
import { PRESET_BY_ID } from "../pricing/presets";
import type { PricingModel } from "../pricing/schema";

describe("csv sanitizer & export", () => {
  it("neutralizes spreadsheet formula-injection prefixes", () => {
    expect(sanitizeCsvCell("=CMD()")).toBe("'=CMD()");
    expect(sanitizeCsvCell("+1+1")).toBe("'+1+1");
    expect(sanitizeCsvCell("-100")).toBe("'-100");
    expect(sanitizeCsvCell("@SUM(A1)")).toBe("'@SUM(A1)");
    expect(sanitizeCsvCell("\tfoo")).toBe("'\tfoo");
    expect(sanitizeCsvCell("hello, world")).toBe('"hello, world"');
    expect(sanitizeCsvCell('say "hi"')).toBe('"say ""hi"""');
    expect(sanitizeCsvCell(-12.5)).toBe("-12.5");
  });

  it("builds a complete quote CSV with metadata and rows", () => {
    const model: PricingModel = {
      id: "openai/gpt-4o-mini",
      slug: "gpt-4o-mini",
      displayName: "GPT-4o mini",
      apiModelId: "gpt-4o-mini",
      provider: "openai",
      modelFamily: "GPT-4o",
      openWeight: false,
      contextWindowTokens: 128000,
      maxOutputTokens: 16384,
      reasoningTokensBilledAsOutput: false,
      featuredDetailPage: true,
      pricingTiers: [
        {
          label: "Standard (<= 128K)",
          upToTokens: null,
          inputPer1M: 0.15,
          outputPer1M: 0.6,
          cachedInputReadPer1M: 0.075,
          cacheWrite5mPer1M: null,
          cacheWrite1hPer1M: null,
          batchInputPer1M: 0.075,
          batchOutputPer1M: 0.3,
        },
      ],
      promptCaching: {
        supported: true,
        mode: "automatic",
        minCacheableTokens: 1024,
        ttlOptions: ["automatic"],
        storagePer1MPerHour: null,
        notes: "Automatic prompt caching with 50% discount on cached reads.",
      },
      batchApi: {
        supported: true,
        discountPercent: 50,
        cachingAllowedInBatch: true,
        batchDiscountAppliesToCache: true,
        turnaroundWindow: "24h",
        notes: "50% off via OpenAI Batch API",
      },
      hosting: {
        endpointProvider: "OpenAI First-Party",
        endpointType: "first_party",
        hostingNotes: "Global",
      },
      effectiveDate: "2026-11-12",
      promotionalExpiryDate: null,
      lastVerifiedDate: "2026-11-12",
      officialSourceUrl: "https://openai.com/api/pricing/",
      notes: "Test",
    };

    const preset = PRESET_BY_ID["rag-qa"];
    const input = { ...preset, useOffPeak: false, referenceDate: "2026-11-12" };
    const est = calculateModelCost(model, input);
    const csv = buildEstimatesCsv([est], input, {
      presetLabel: preset.name,
      registryUpdatedAt: "2026-11-12",
      exportedAtIso: "2026-11-12T10:00:00Z",
    });

    expect(csv).toContain("RAG Q&A");
    expect(csv).toContain("GPT-4o mini");
    expect(csv).toContain("https://openai.com/api/pricing/");
  });
});
