import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@/data": path.resolve(__dirname, "./data"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
