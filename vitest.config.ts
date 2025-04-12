import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    fileParallelism: false,
    retry: 0,
    environment: "node",
    include: ["**/*.test.ts"],
    globals: true,
    setupFiles: ["dotenv/config"],
  },
});
