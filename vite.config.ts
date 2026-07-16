import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tanstackStart({
      // Keep custom SSR error wrapper in src/server.ts
      server: { entry: "server" },
    }),
    // No hardcoded preset: Nitro uses `vercel` on Vercel builds and
    // `node-server` locally so `pnpm start` keeps working.
    nitro(),
    viteReact(),
    tailwindcss(),
  ],
});
