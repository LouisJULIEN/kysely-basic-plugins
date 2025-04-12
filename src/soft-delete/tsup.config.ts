import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/soft-delete/soft-delete.plugin.ts"],
  splitting: false,
  sourcemap: true,
  clean: true,
  format: ["cjs", "esm"],
  dts: true,
  outDir: "dist/soft-delete",
});
