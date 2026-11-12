import type { PresetId } from "./presets";

export interface GuideSection {
  heading: string;
  paragraphs: string[];
  callout?: string;
}

export interface GuideEntry {
  slug: string;
  title: string;
  metaDescription: string;
  publishedAt: string;
  updatedAt: string;
  readingTimeMinutes: number;
  summary: string;
  sections: GuideSection[];
  relatedPreset?: PresetId;
}

export const GUIDES: GuideEntry[] = [
  {
    slug: "prompt-caching-write-vs-read-breakeven",
    title: "Prompt Caching Math: Cache Write Surcharges vs. Read Break-Even",
    metaDescription:
      "Why ignoring cache-write fees (5m 1.25x, 1h 2.0x, 12h 2.5x) distorts LLM budgets, plus exact break-even formulas and provider TTL rules.",
    publishedAt: "2026-11-12",
    updatedAt: "2026-11-12",
    readingTimeMinutes: 6,
    summary:
      "Most online LLM calculators only model cached reads (0.02x–0.10x) and omit cache writes. On Anthropic (1.25x 5m / 2.0x 1h) and OpenAI (1.25x 30m / 2.50x 12h), low reuse or frequent prefix churn can make caching cost more than uncached calls.",
    relatedPreset: "code-generation",
    sections: [
      {
        heading: "Why Cache-Read-Only Calculators Misprice Agent Workloads",
        paragraphs: [
          "Calculators that only ask for a 'Cached input %' silently treat cache misses and cold cache writes as if they cost 1.0x—or worse, ignore write surcharges altogether. In reality, providers with explicit or tiered retention charge a higher total input rate when populating a cache entry.",
          "Anthropic bills 5-minute TTL cache writes at 1.25x standard input ($2.50/1M on Claude Sonnet 5.5, $10.00/1M on Claude Fable 5.2) and 1-hour TTL cache writes at 2.0x standard input ($4.00/1M on Sonnet 5.5, $16.00/1M on Fable 5.2). OpenAI bills 30-minute in-memory writes at 1.25x ($2.50/1M on GPT-6.1 Sol) and 12-hour Responses API writes at 2.50x ($5.00/1M on GPT-6.1 Sol). Note that these write rates are total rates per written token, not additive surcharges.",
        ],
        callout:
          "Verified 2026-11-12: Anthropic 5.x cache read multipliers span 0.025x (Fable 5.2, 97.5% off), 0.05x (Opus/Sonnet 5.5, 95% off), and 0.10x (Haiku 5.5, 90% off). OpenAI spans 0.05x (GPT-6.1 Sol/Terra) and 0.10x (GPT-6 Astra/Luna).",
      },
      {
        heading: "Exact Break-Even Hits Per Cold Write",
        paragraphs: [
          "Suppose a prefix has P tokens, standard input rate R_in, cache read rate R_read = alpha * R_in, and cache write rate R_write = beta * R_in. Compared against sending N + 1 uncached requests (1 write-equivalent + N reads), caching breaks even when beta + N * alpha < N + 1, or N > (beta - 1) / (1 - alpha).",
          "For a 5m/30m write (beta = 1.25) with a 90% read discount (alpha = 0.10), break-even is N > 0.25 / 0.90 = 0.28—meaning even a single subsequent cache hit within the TTL saves money. For a 1h Anthropic write (beta = 2.00, alpha = 0.10), break-even requires at least 2 cache hits per write (N > 1.11). For an OpenAI 12h write (beta = 2.50, alpha = 0.10), you need at least 2 hits (N > 1.67) and ideally 5+ hits to justify locking in 12h retention.",
        ],
      },
      {
        heading: "Zero-Write-Surcharge & Storage-Fee Exceptions",
        paragraphs: [
          "DeepSeek (98% off on DeepSeek-V4.1-Flash: $0.003 off-peak / $0.006 peak), Mistral (10% default via 64-token prompt_cache_key blocks, or $0.007 on hosted DeepSeek-V4.1-Flash), Groq (50% off on gpt-oss-20b/120b/safeguard-20b, 2h TTL), and Together AI (e.g., $0.006 on DeepSeek-V4.1-Flash, ~1h best-effort) charge $0 write surcharge.",
          "Google Gemini introduces a third model: zero per-token write surcharge, minimum 4,096 tokens, but explicit context caching charges an hourly storage fee ($0.50/1M tokens/hour on Gemini 3.8 Flash through 2026-12-31, rising to $1.00/hr on 2027-01-01; $4.50/1M tokens/hour on Gemini 3.1 Pro Preview). Meanwhile, Gemini 4 Carbon supports implicit caching only (no explicit storage fee, but multi-turn requests require >=2,050 new tokens to extend the prior cache).",
        ],
      },
    ],
  },
  {
    slug: "batch-api-stacking-rules",
    title: "Batch API Discounts & Cache Stacking Rules Across 8 Providers",
    metaDescription:
      "Do not assume 50% off Batch works everywhere: verified Batch rates, cache-stacking exceptions, and DeepSeek/Together/Bedrock traps.",
    publishedAt: "2026-11-12",
    updatedAt: "2026-11-12",
    readingTimeMinutes: 6,
    summary:
      "Batch APIs promise 50% off asynchronous workloads, but real-world billing diverges sharply: Together AI discounts 0% on serverless chat, Bedrock excludes Claude 5.x and gives 25% on Mistral Large 2, and Gemini 3.1 Pro Preview keeps cached reads at full standard price.",
    relatedPreset: "extraction",
    sections: [
      {
        heading: "Three Distinct Batch + Cache Regimes",
        paragraphs: [
          "1. Multiplicative Stacking (OpenAI GPT-5+, Anthropic Claude, Gemini 4 Carbon & 3.8 Flash): Batch cuts input, output, AND cached-read rates by 50% (plus cache writes on OpenAI and Anthropic). For example, Claude Haiku 5.5 Batch drops from $0.10/$0.50/$0.01 to $0.05/$0.25/$0.005 (<=100K tier).",
          "2. Batch on Uncached Tokens Only, Cache at Standard Rate (Gemini 3.1 Pro Preview): Google's Batch API documentation explicitly bills Gemini 3.1 Pro Preview cached reads ($0.20 <=200K, $0.40 >200K) and explicit cache storage ($4.50/1M/hr) at 'Same as Standard', while discounting uncached input and output by 50% ($1.00/$6.00 <=200K).",
          "3. Batch Disables Caching Entirely (Groq & Amazon Bedrock): Groq's 50% Batch (24h–7d window on 5 text models) does not stack with prompt caching. Amazon Bedrock explicitly restricts prompt caching to on-demand inference endpoints—never Batch.",
        ],
        callout:
          "Never treat 'Batch = 50% off' as universal. Always inspect model-level eligibility, cache-stacking behavior, and regional rules.",
      },
      {
        heading: "The Four Biggest Batch Pricing Traps",
        paragraphs: [
          "Together AI (0% Serverless Chat Batch Discount): Although Together AI's marketing mentions up to 50% lower costs, its Batch API documentation specifies that only openai/whisper-large-v3 receives 50% off—all serverless chat models run at standard 100% rates in a separate rate-limit pool.",
          "Amazon Bedrock Claude 5.x (N/A) & Mistral Large 2 (25% off): Bedrock lists Claude Fable 5.2, Opus 5.5, Sonnet 5.5, and Haiku 5.5 as N/A for Batch inference (use Claude Sonnet 4.6 at $1.50/$7.50 or Opus 5 at $2.50/$12.50 for 50% Bedrock Batch). Meanwhile, Bedrock's Mistral Large 2 (24.07) drops from $2.00/$6.00 to $1.50/$4.50 in Batch—a 25% discount, not 50%.",
          "DeepSeek (No Batch API—Use Off-Peak Instead): DeepSeek has no Batch API; instead, it automatically applies 50% Off-Peak pricing outside Peak UTC windows (01:00–04:00 and 06:00–10:00 UTC Monday–Friday, excluding Chinese public holidays).",
        ],
      },
    ],
  },
  {
    slug: "long-context-pricing-cliffs",
    title: "Long-Context Pricing Cliffs: >100K, >200K, and >272K Traps",
    metaDescription:
      "How full-request threshold cliffs double or 5x your LLM bill once a prompt crosses 100K, 200K, or 272K tokens—and which models stay flat to 1M.",
    publishedAt: "2026-11-12",
    updatedAt: "2026-11-12",
    readingTimeMinutes: 5,
    summary:
      "Crossing a model's long-context token threshold does not just tax the tokens above the line—on OpenAI, Anthropic Haiku 5.5, and Gemini 3.1 Pro Preview, it reprices the ENTIRE request, including cached tokens and output.",
    relatedPreset: "document-summarization",
    sections: [
      {
        heading: "Full-Request Repricing vs. Marginal Tiers",
        paragraphs: [
          "In LLM billing, long-context cliffs are step functions applied to the whole request, not progressive marginal tax brackets. If a model triggers a long-context threshold at 100,001 tokens, every single input token, cached read, cache write, and output token in that API call jumps to the higher tier.",
          "Only models that explicitly advertise flat 1M pricing—such as Claude Sonnet 5.5 ($2/$10), Claude Fable 5.2 ($8/$40), Gemini 4 Carbon, Gemini 3.8 Flash, DeepSeek V4.1 Flash, and Mistral Large 4—avoid mid-window rate jumps.",
        ],
      },
      {
        heading: "Verified Threshold Cliffs (November 2026)",
        paragraphs: [
          "Claude Haiku 5.5 (>100K total input = input + cache_read + cache_write): Jumps 5x across the board—from $0.10/$0.50 ($0.01 cached read, $0.125 5m write) to $0.50/$2.50 ($0.05 read, $0.625 5m write, $1.00 1h write). Once a prompt crosses 100K tokens, Haiku 5.5 flips from 3x cheaper than DeepSeek-V4.1-Flash Peak ($0.10 vs. $0.30 input) to 1.67x more expensive on input ($0.50 vs. $0.30) and 2.08x more expensive on output ($2.50 vs. $1.20).",
          "Gemini 3.1 Pro Preview (>200K prompt tokens): Doubles standard input from $2.00 to $4.00/1M, doubles cached read from $0.20 to $0.40/1M, and raises output by 1.5x from $12.00 to $18.00/1M (storage stays $4.50/1M/hr).",
          "OpenAI GPT-6 Astra, GPT-6.1 Sol, and GPT-6 Luna (>272K input tokens): Doubles input, cache read, and cache write rates (2.0x) and multiplies output by 1.5x for the full request. For instance, GPT-6.1 Sol jumps from $2.00/$10.00 ($0.10 read) to $4.00/$15.00 ($0.20 read), within a 922K max input limit.",
        ],
        callout:
          "Multi-turn agent warning: A support or coding agent that starts at 12K tokens can quietly cross Haiku 5.5's 100K cliff by Turn 12, multiplying the remaining turns' costs by 5x.",
      },
    ],
  },
  {
    slug: "open-weight-hosting-economics",
    title: "Open-Weight Hosting Economics: Groq vs. Together AI vs. Amazon Bedrock vs. Mistral",
    metaDescription:
      "Compare identical open-weight models (gpt-oss-120b, DeepSeek-V4.1-Flash, GLM-5.3, Llama) across specialized inference hosts and managed clouds.",
    publishedAt: "2026-11-12",
    updatedAt: "2026-11-12",
    readingTimeMinutes: 5,
    summary:
      "Same weights, wildly different economics: hosting gpt-oss-120b or DeepSeek-V4.1-Flash on Groq, Together AI, Mistral, or Amazon Bedrock changes your caching availability, Batch discount (0% vs. 50%), US residency surcharge (+10% vs. +25%), and throughput.",
    relatedPreset: "rag-qa",
    sections: [
      {
        heading: "Case Study 1: openai/gpt-oss-120b (Groq vs. Together AI vs. Amazon Bedrock)",
        paragraphs: [
          "All three providers list the exact same headline synchronous price of $0.15/1M input and $0.60/1M output (in US standard regions). Yet real-world monthly spend diverges as soon as you enable caching, Batch, or residency:",
          "• Groq (~500 tok/s LPU, 131K ctx): Offers 50% automatic prompt caching ($0.075 read, 2h inactivity TTL) AND 50% Batch ($0.075/$0.30)—but Batch and caching do not stack. Sibling gpt-oss-20b drops to $0.075/$0.30 ($0.0375 cached/Batch).",
          "• Amazon Bedrock (US Std): Offers 50% Batch AND 50% Flex tier ($0.075/$0.30), plus Priority tier (+75% = $0.2625/$1.05), but zero prompt caching on gpt-oss models (Bedrock OpenAI caching is GPT-5.6+ only). Sydney region edges up slightly to $0.1545/$0.6180.",
          "• Together AI (Serverless MXFP4): Offers zero prompt caching ('-') and 0% Batch discount ($0.15/$0.60 even in Batch). Pinning US-only execution via us-api.together.ai adds a +25% (1.25x) uplift to $0.1875/$0.75.",
        ],
      },
      {
        heading: "Case Study 2: DeepSeek-V4.1-Flash (DeepSeek 1P vs. Mistral vs. Together AI)",
        paragraphs: [
          "DeepSeek's own API bills $0.30/$1.20 during Peak UTC hours and drops 50% to $0.15/$0.60 Off-Peak (outside 01:00–04:00 and 06:00–10:00 UTC Mon–Fri, plus all day on weekends/CN holidays), with automatic $0.003/$0.006 disk KV cache reads (98% off), 384K max output, and no Batch API.",
          "If your enterprise requires non-China hosting or true async Batch queues, Mistral hosts deepseek-v4-1-flash-1017 at $0.30/$1.20 flat 24/7 with $0.007 cached reads (64-token blocks) AND 50% Batch ($0.15/$0.60)—matching DeepSeek's Off-Peak rate at any hour of the day. Together AI hosts DeepSeek-V4.1-Flash (FP8) at $0.30/$1.20 with $0.006 best-effort caching (~1h TTL), 0% Batch discount, and a 1.25x US-only uplift ($0.375/$1.50).",
        ],
        callout:
          "Takeaway: Always compare endpoint rules—not just weights—before locking in an open-weight provider. Also note Groq gates llama-3.3-70b-versatile and llama-3.1-8b-instant behind 'Contact Sales' while Bedrock publishes $0.72/$0.72 ($0.36 Batch) for Llama 3.3 70B.",
      },
    ],
  },
];

export function getGuideBySlug(slug: string): GuideEntry | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
