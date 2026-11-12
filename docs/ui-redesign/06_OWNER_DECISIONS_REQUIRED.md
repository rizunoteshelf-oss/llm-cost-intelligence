# 06: Highest-Leverage Product Decisions Required
**Target Platform:** LLM Cost Intelligence (`https://llm.everydaypdf.me/`)  
**Audit Date:** 13 November 2026  
**Document Standard:** Strictly tagged options, trade-offs, and concise sign-off prompts.  
**Authoritative Scope:** Strategic product positioning, FinOps user experience, and architectural defaults.

---

## 1. Overview & Sign-Off Gate

The forensic audit and prototype have resolved all major layout and mathematical anomalies (including preset card occlusion, KPI contradiction, and mobile pan friction). However, five core product architecture decisions require explicit owner sign-off before committing changes to production code.

---

### Decision 1: Default Reference Baseline Model Designation
**Problem:** The current live site matched `gpt-4o-mini` as the default reference model, displaying modest spreads (3x). Enterprise FinOps buyers frequently benchmark open-weight models against frontier flagships like `Claude 3.5 Sonnet` or `GPT-4o` to illustrate 10x–20x cost reductions.

- **Option A (Frontier Standard — Recommended):** Set default baseline strictly to `anthropic/claude-3-5-sonnet-latest` ($3.00 in / $15.00 out). Labeled: `"Frontier Flagship Baseline"`. Shows realistic enterprise savings vs the industry's most widely adopted coding model.
- **Option B (Market Recognition):** Set default baseline strictly to `openai/gpt-4o` ($2.50 in / $10.00 out). Labeled: `"Frontier Flagship Baseline"`. Maximizes mainstream enterprise familiarity.
- **Option C (Dual-Mode Toggle):** Provide an inline segmented switch directly on the leaderboard card: `[ Claude 3.5 Sonnet (Frontier) ]` | `[ GPT-4o mini (Budget) ]`.
- **Trade-Off:** Option A and B provide compelling ROI marketing data (demonstrating that Llama 3.3 or DeepSeek is 10x cheaper). Option C provides the highest user control without forcing an assumption.
- **Decision Prompt for Owner:** *Should the default baseline comparison model be Claude 3.5 Sonnet (Frontier Flagship), GPT-4o, or a user-switchable dual toggle?*

---

### Decision 2: Progressive Information Architecture (Default Level 2 State)
**Problem:** First-time visitors are presented with 12 simultaneous sliders and toggles, creating unnecessary friction for users who only need a quick monthly estimate.

- **Option A (Progressive Accordion — Recommended):** Default to **Level 1 (Quick Estimate)** with 4 core inputs (Preset + Input, Output, Volume). Advanced caching write fees, TTL, and multi-turn session sliders are nested in a clean collapsible accordion labeled: `"Level 2: Advanced FinOps Workload Dynamics"`.
- **Option B (Dual View Mode Toggle):** Add a persistent header/toolbar switch: `[ Quick Calculator ]` vs `[ FinOps Pro Studio ]`. Pro Mode loads all 12 controls simultaneously and persists user preference in `localStorage`.
- **Option C (Unified Flat Grid):** Keep all 12 controls permanently visible (as in v2), but enhance card dividers, section headers, and step badges to minimize visual clutter.
- **Trade-Off:** Option A dramatically lowers initial bounce rate on mobile and desktop. Option B accommodates both quick casual estimates and advanced enterprise architectural modeling.
- **Decision Prompt for Owner:** *Do you prefer a progressive collapsible accordion (Option A) or a persistent Quick vs Pro mode toggle (Option B)?*

---

### Decision 3: Catalogue Lifecycle Filtering (Active GA vs Legacy)
**Problem:** The repository tracks 20 models, including legacy/superseded versions (e.g. `Gemini 1.5 Flash/Pro`, `Claude 3 Opus`, `Llama 3.1 8B`) alongside current generation models (`Gemini 2.0 Flash`, `Claude 3.5 Sonnet`, `Llama 3.3 70B`).

- **Option A (Curated Default with Legacy Toggle — Recommended):** Leaderboard displays only `Current Production` models (~14 models) by default, with a clear filter checkbox: `[✓] Include Legacy & Superseded Models (6)`. Every model card displays a visual pill (`CURRENT`, `LEGACY`, or `CLOUD`).
- **Option B (All Models Unfiltered):** Display all 20 models sorted strictly by price, relying entirely on visual badge chips (`LEGACY` in amber) to alert buyers.
- **Trade-Off:** Option A prevents buyers from accidentally selecting obsolete models for new architecture plans while preserving dedicated `/models/[slug]/` detail pages for SEO traffic. Option B preserves maximum comparison density.
- **Decision Prompt for Owner:** *Should the comparison table hide legacy models behind a filter toggle by default (Option A), or show all 20 models with status badges (Option B)?*

---

### Decision 4: Mobile Ergonomics for the Live Spend Leaderboard
**Problem:** On mobile screens (`390px`), the calculation inputs push the Spend Leaderboard 2,200px down the page, leaving users blind to spend changes as they adjust sliders.

- **Option A (Sticky Bottom Floating Spend Bar — Recommended):** A compact floating pill at the bottom of mobile viewports displaying: `Lowest: $17.16/mo · [View Leaderboard]`. Tapping smoothly scrolls down to the ranked comparison.
- **Option B (Interactive Slide-Up Sheet):** A floating bottom bar that opens an animated slide-up modal bottom sheet when tapped, allowing mobile users to view the top 5 models without losing their position on the sliders.
- **Option C (Top/Bottom Split Tabs):** Replace the single vertical page on mobile with two tabs: `[1. Configure Workload]` and `[2. Spend Leaderboard]`.
- **Trade-Off:** Option A is lightweight, zero-dependency, and completely accessible. Option B provides instant comparison without scrolling.
- **Decision Prompt for Owner:** *Should mobile devices use a floating bottom spend anchor bar (Option A) or an interactive slide-up sheet (Option B)?*

---

### Decision 5: Durable Root Title & Meta Positioning Strategy
**Problem:** The existing root title (`"LLM API Pricing Calculator 2026 - Claude 3.5 Sonnet, GPT-4o, DeepSeek V3 & Gemini 2.0"`) is 82 characters, truncates on Google desktop SERPs, and requires code deploys whenever model naming evolves.

- **Option A (Category Authority — Recommended):**  
  `<title>`: `"LLM API Pricing Calculator & FinOps Simulator (2026)"` (54 characters — 100% visible on SERPs).  
  Targeting: Institutional FinOps buyers, CTOs, and engineering leaders modeling production budgets.
- **Option B (Mathematical Differentiation):**  
  `<title>`: `"LLM Cost Intelligence — Real Prompt Caching & Batch Calculator"` (62 characters).  
  Targeting: Developers seeking break-even calculations for Anthropic, OpenAI, and DeepSeek caching.
- **Option C (Search Volume Hybrid):**  
  `<title>`: `"LLM API Pricing Calculator 2026 | Real Cache, Batch & Token Simulator"` (69 characters).  
  Targeting: Broad high-volume token calculator search traffic.
- **Trade-Off:** Option A builds lasting brand equity and authority without keyword obsolescence. Option C maximizes click-through rate across developer search queries.
- **Decision Prompt for Owner:** *Which title tag strategy aligns best with your SEO vision: Institutional FinOps Authority (Option A) or Search Volume Hybrid (Option C)?*
