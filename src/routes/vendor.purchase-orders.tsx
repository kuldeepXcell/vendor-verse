import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell, StatusPill } from "@/components/app-shell";
import { requireAuth } from "@/lib/auth-guards";
import { useDemoStore } from "@/lib/demo-store";
import { filterByVendor } from "@/lib/demo-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle2, PackageOpen } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnimatedCounter } from "@/components/animated-counter";
import { FadeIn } from "@/components/motion";

export const Route = createFileRoute("/vendor/purchase-orders")({
  ssr: false,
  beforeLoad: requireAuth("vendor"),
  head: () => ({
    meta: [{ title: "My Purchase Orders — Vendor Verse" }],
  }),
  component: VendorPOPage,
});

function VendorPOPage() {
  const { purchaseOrders, acknowledgePurchaseOrder } = useDemoStore();
  const myPOs = filterByVendor(purchaseOrders);
  const [query, setQuery] = useState("");

  const filtered = myPOs.filter((po) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      po.id.toLowerCase().includes(q) ||
      po.status.toLowerCase().includes(q) ||
      (po.description?.toLowerCase().includes(q) ?? false)
    );
  });

  function handleRowClick(po: (typeof myPOs)[number]) {
    toast.info(`PO ${po.id}`, {
      description: `${po.description ?? "Purchase order"} · ${po.value} · ${po.items} items · Ship by ${po.delivery}`,
    });
  }

  return (
    <AppShell title="My Purchase Orders" breadcrumb={["Purchase Orders"]}>
      <FadeIn>
        <div className="mb-4 flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            <AnimatedCounter value={myPOs.length} className="font-semibold text-foreground" /> total
            POs
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={80}>
        <div className="bento-card overflow-hidden">
          <div className="border-b border-border p-4">
            <div className="relative max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search POs…"
                className="h-9 pl-9 bg-secondary/60 border-transparent"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
              <PackageOpen className="h-10 w-10" />
              <p className="text-sm">No purchase orders match your search.</p>
              {query && (
                <Button variant="outline" size="sm" onClick={() => setQuery("")}>
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO #</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((po) => (
                  <TableRow
                    key={po.id}
                    className="cursor-pointer"
                    onClick={() => handleRowClick(po)}
                  >
                    <TableCell className="font-mono text-xs">{po.id}</TableCell>
                    <TableCell className="max-w-48 truncate text-sm">{po.description}</TableCell>
                    <TableCell className="text-muted-foreground">{po.items}</TableCell>
                    <TableCell className="tabular-nums">{po.value}</TableCell>
                    <TableCell className="text-muted-foreground">{po.created}</TableCell>
                    <TableCell className="text-muted-foreground">{po.delivery}</TableCell>
                    <TableCell>
                      <StatusPill tone={po.tone}>{po.status}</StatusPill>
                    </TableCell>
                    <TableCell className="text-right">
                      {po.status.toLowerCase().includes("acknowledgement") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            acknowledgePurchaseOrder(po.id);
                          }}
                        >
                          <CheckCircle2 className="size-3.5" /> Acknowledge
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </FadeIn>
    </AppShell>
  );
}
