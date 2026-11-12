import fs from "node:fs";
import path from "node:path";
import { validateRegistry } from "../src/lib/pricing/schema";

const registryPath = path.resolve(process.cwd(), "data/models.json");

if (!fs.existsSync(registryPath)) {
  console.error(`Registry file not found at ${registryPath}`);
  process.exit(1);
}

const raw = fs.readFileSync(registryPath, "utf8");
const parsed: unknown = JSON.parse(raw);
const result = validateRegistry(parsed);

if (!result.valid || !result.registry) {
  console.error("Registry validation FAILED:");
  for (const err of result.errors) {
    console.error(`  - ${err}`);
  }
  process.exit(1);
}

const featuredCount = result.registry.models.filter(
  (m) => m.featuredDetailPage,
).length;

console.log(
  `Registry validation PASSED: ${result.registry.models.length} models (${featuredCount} featured detail pages), updated ${result.registry.registryUpdatedAt}.`,
);
