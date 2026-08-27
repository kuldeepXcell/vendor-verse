import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

// Absolute origin for <loc> entries. The sitemap spec requires absolute URLs,
// so set VITE_SITE_URL (e.g. https://vendor-verse.example.com) before building.
// VITE_* values are inlined at build time, not read at boot — rebuild to change it.
const BASE_URL = (import.meta.env.VITE_SITE_URL ?? "").replace(/\/$/, "");

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/vendors", changefreq: "weekly", priority: "0.8" },
          { path: "/purchase-orders", changefreq: "weekly", priority: "0.8" },
          { path: "/invoices", changefreq: "weekly", priority: "0.8" },
          { path: "/documents", changefreq: "weekly", priority: "0.7" },
          { path: "/payments", changefreq: "weekly", priority: "0.7" },
          { path: "/messages", changefreq: "weekly", priority: "0.6" },
          { path: "/vendor", changefreq: "weekly", priority: "0.7" },
        ];
        const urls = entries.map(
          (e) =>
            `  <url><loc>${BASE_URL}${e.path}</loc>${e.changefreq ? `<changefreq>${e.changefreq}</changefreq>` : ""}${e.priority ? `<priority>${e.priority}</priority>` : ""}</url>`,
        );
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
