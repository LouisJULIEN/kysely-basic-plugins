import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/auto-updated-at/auto-updated-at.plugin.ts"],
  splitting: false,
  sourcemap: true,
  clean: true,
  format: ["cjs", "esm"],
  dts: true,
  outDir: "dist/auto-updated-at",
});
