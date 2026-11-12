import type { WorkloadPresetId } from "../lib/pricing/presets";

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
  relatedPreset: WorkloadPresetId;
  sections: GuideSection[];
}

export const GUIDES: GuideEntry[] = [
  {
    slug: "prompt-caching-write-vs-read-breakeven",
    title: "Prompt Caching Write vs. Read Math: When Caching Costs More",
    metaDescription:
      "Mathematical proof of write/read break-even: why 1.25x 5m write surcharges on Claude 3.5 and 50% reads on GPT-4o can increase costs if cache hit rates drop.",
    publishedAt: "2026-11-12",
    updatedAt: "2026-11-12",
    readingTimeMinutes: 7,
    summary:
      "Most online LLM calculators only model cached reads and omit cache writes. On Anthropic (1.25x 5m write surcharge) and OpenAI (zero write surcharge with 50% read discount), low reuse or frequent prefix churn drastically affects real-world ROI.",
    relatedPreset: "code-generation",
    sections: [
      {
        heading: "Why Cache-Read-Only Calculators Misprice Agent Workloads",
        paragraphs: [
          "Calculators that only ask for a 'Cached input %' silently treat cache misses and cold cache writes as if they cost standard input—or worse, ignore write surcharges altogether. In reality, providers with explicit retention charge a higher total input rate when populating a cache entry.",
          "Anthropic bills 5-minute TTL cache writes at 1.25x standard input ($3.75/1M on Claude 3.5 Sonnet, $1.00/1M on Claude 3.5 Haiku, $18.75/1M on Claude 3 Opus). OpenAI bills prompt cache writes at the standard input rate ($2.50/1M on GPT-4o, $0.15/1M on GPT-4o mini, $15.00/1M on o1) with zero write surcharge.",
        ],
        callout:
          "Verified 2026-11-12: Anthropic cache read rates offer a 90% discount ($0.30/1M on Sonnet, $0.08/1M on Haiku). OpenAI offers a flat 50% discount on cached reads ($1.25/1M on GPT-4o, $0.075/1M on GPT-4o mini).",
      },
      {
        heading: "Exact Break-Even Hits Per Cold Write",
        paragraphs: [
          "Suppose a prefix has P tokens, standard input rate R_in, cache read rate R_read = alpha * R_in, and cache write rate R_write = beta * R_in. Compared against sending N + 1 uncached requests (1 write-equivalent + N reads), caching breaks even when beta + N * alpha < N + 1, or N > (beta - 1) / (1 - alpha).",
          "For Anthropic 5m TTL writes (beta = 1.25) with a 90% read discount (alpha = 0.10), break-even is N > 0.25 / 0.90 = 0.28—meaning even a single subsequent cache hit within the 5-minute TTL saves money. For OpenAI where beta = 1.00 (no write surcharge), every single cache hit saves 50% immediately with zero risk.",
        ],
      },
      {
        heading: "Zero-Write-Surcharge & Storage-Fee Exceptions",
        paragraphs: [
          "DeepSeek-V3 ($0.14 input, $0.014 cache hit) and DeepSeek-R1 ($0.55 input, $0.14 cache hit) provide automatic prompt caching with 64-token block alignment and zero write surcharges.",
          "Google Gemini introduces an hourly storage model: zero per-token write surcharge, minimum 32,768 tokens, but explicit context caching charges an hourly storage fee ($4.50/1M tokens/hour on Gemini 1.5 Pro, $1.00/1M tokens/hour on Gemini 1.5 Flash and 2.0 Flash). Cached reads receive a 75% discount off standard rates.",
        ],
      },
    ],
  },
  {
    slug: "batch-api-stacking-rules",
    title: "Batch API Discounts & Cache Stacking Rules Across 8 Providers",
    metaDescription:
      "Do not assume 50% off Batch works everywhere: verified Batch rates, cache-stacking exceptions, and DeepSeek/Together/Bedrock rules.",
    publishedAt: "2026-11-12",
    updatedAt: "2026-11-12",
    readingTimeMinutes: 6,
    summary:
      "Batch APIs offer up to 50% off asynchronous workloads with 24-hour SLAs, but real-world billing rules diverge: some providers allow caching inside Batch jobs, while others disable caching or charge standard rates.",
    relatedPreset: "extraction",
    sections: [
      {
        heading: "Three Distinct Batch + Cache Regimes",
        paragraphs: [
          "1. Multiplicative Stacking (OpenAI GPT-4o, Anthropic Claude 3.5): Batch cuts standard input, output, AND cached-read rates by 50%. For example, Claude 3.5 Haiku Batch drops from $0.80/$4.00/$0.08 to $0.40/$2.00/$0.04.",
          "2. Batch on Uncached Tokens with Standard Cache Rates: Certain cloud endpoints discount on-demand rates by 50% in Batch but bill context caching reads or storage at standard rates.",
          "3. Batch Disables Caching Entirely: Dedicated specialist providers like Groq or Bedrock Llama endpoints do not combine asynchronous Batch discounts with prompt caching.",
        ],
        callout:
          "Never treat 'Batch = 50% off' as universal. Always inspect model-level eligibility, cache-stacking behavior, and regional rules.",
      },
      {
        heading: "The Biggest Batch Pricing Traps",
        paragraphs: [
          "Together AI Serverless Chat (0% Batch Discount): Together AI's serverless chat endpoints run at standard 100% rates without Batch discounts.",
          "Amazon Bedrock Batch Inference: Bedrock offers 50% discounts for Batch mode on supported models like Llama 3.1 405B and Claude 3.5 Sonnet, but does not allow cache-stacking within Batch jobs.",
          "DeepSeek (No Async Batch—Use 50% Off-Peak Instead): DeepSeek does not run a 24-hour async Batch API; instead, it provides a 50% Off-Peak discount window daily from 16:30 to 00:30 UTC for all traffic.",
        ],
      },
    ],
  },
  {
    slug: "long-context-pricing-cliffs",
    title: "Long-Context Pricing Cliffs: Tiered Token Threshold Traps",
    metaDescription:
      "How full-request threshold cliffs double your LLM bill once a prompt crosses 128K tokens—and which models stay flat up to 200K or 1M.",
    publishedAt: "2026-11-12",
    updatedAt: "2026-11-12",
    readingTimeMinutes: 5,
    summary:
      "Crossing a model's long-context token threshold can double per-token rates. Compare Gemini 1.5 Pro's 128k cliff against flat 200k/1M context models.",
    relatedPreset: "document-summarization",
    sections: [
      {
        heading: "Full-Request Repricing vs. Flat Context Windows",
        paragraphs: [
          "In LLM billing, long-context thresholds are step functions applied to the request. If a prompt exceeds the threshold, higher per-token rates apply to the entire payload or long-context tier.",
          "Models with flat context pricing—such as Claude 3.5 Sonnet (flat $3/$15 up to 200K) and OpenAI GPT-4o (flat $2.50/$10 up to 128K)—avoid mid-window rate surprises.",
        ],
      },
      {
        heading: "Verified Threshold Cliffs (November 2026)",
        paragraphs: [
          "Google Gemini 1.5 Pro (>128K tokens): Input rate doubles from $1.25 to $2.50 per 1M tokens, and output doubles from $5.00 to $10.00 per 1M tokens (up to the 2M token limit).",
          "Google Gemini 1.5 Flash (>128K tokens): Input rate doubles from $0.075 to $0.15 per 1M tokens, and output doubles from $0.30 to $0.60 per 1M tokens (up to 1M tokens).",
          "OpenAI o1 and o3-mini: Flat pricing throughout their full 200,000 token context window, with up to 100,000 maximum completion tokens.",
        ],
        callout:
          "Multi-turn agent warning: A customer support or coding agent that accumulates history can silently cross the 128K threshold, doubling prompt costs for subsequent turns.",
      },
    ],
  },
  {
    slug: "open-weight-hosting-economics",
    title: "Open-Weight Hosting Economics: Groq vs. Together AI vs. Amazon Bedrock vs. Mistral",
    metaDescription:
      "Compare identical open-weight models (Llama 3.3 70B, Llama 3.1 405B, Mistral Large 2) across specialized inference hosts and cloud providers.",
    publishedAt: "2026-11-12",
    updatedAt: "2026-11-12",
    readingTimeMinutes: 5,
    summary:
      "Same weights, different economics: hosting Llama 3.3 70B or 405B on Groq, Together AI, or Amazon Bedrock changes your throughput, latency, Batch discounts, and token rate cards.",
    relatedPreset: "rag-qa",
    sections: [
      {
        heading: "Case Study 1: Meta Llama 3.3 70B (Groq vs. Together AI)",
        paragraphs: [
          "Groq serves Llama 3.3 70B Versatile on custom LPU hardware at $0.59/1M input and $0.79/1M output, delivering ultra-low latency (250+ tokens/sec).",
          "Together AI offers Llama 3.3 70B Turbo at $0.88/1M input and $0.88/1M output on high-throughput GPU clusters, optimized for sustained concurrency and fine-tuned deployments.",
        ],
      },
      {
        heading: "Case Study 2: Meta Llama 3.1 405B (Together AI vs. Amazon Bedrock)",
        paragraphs: [
          "Together AI provides 405B Turbo FP8 inference at $3.50/1M input and $3.50/1M output, making frontier open-weight reasoning accessible at low cost.",
          "Amazon Bedrock offers managed 405B on AWS infrastructure at $5.32/1M input and $16.00/1M output on-demand, with 50% discount in Batch inference ($2.66/$8.00) and enterprise IAM/VPC security.",
        ],
        callout:
          "Takeaway: Always compare endpoint SLAs, compliance guarantees, and batch rules—not just headline weights—before picking an open-weight host.",
      },
    ],
  },
];

export function getGuideBySlug(slug: string): GuideEntry | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
