import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Filter, Download, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { AppShell, StatusPill } from "@/components/app-shell";
import { requireAuth } from "@/lib/auth-guards";
import { useDemoStore } from "@/lib/demo-store";
import { PrototypeFormDialog } from "@/components/prototype-form-dialog";
import { downloadCsv } from "@/lib/download-csv";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

export const Route = createFileRoute("/purchase-orders")({
  ssr: false,
  beforeLoad: requireAuth("admin"),
  head: () => ({
    meta: [
      { title: "Purchase Orders — Nexus Portal" },
      {
        name: "description",
        content: "Track, approve, and manage purchase orders across all vendors.",
      },
    ],
  }),
  component: POPage,
});

type StatusChip = "All" | "Open" | "Delivered";

function isOpenStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s !== "delivered" && s !== "draft";
}

function POPage() {
  const { purchaseOrders, createPurchaseOrder } = useDemoStore();
  const [chip, setChip] = useState<StatusChip>("All");
  const [showChips, setShowChips] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (chip === "All") return purchaseOrders;
    if (chip === "Delivered") {
      return purchaseOrders.filter((po) => po.status.toLowerCase() === "delivered");
    }
    return purchaseOrders.filter((po) => isOpenStatus(po.status));
  }, [purchaseOrders, chip]);

  const openCount = purchaseOrders.filter((po) => isOpenStatus(po.status)).length;
  const awaiting = purchaseOrders.filter((po) =>
    po.status.toLowerCase().includes("awaiting"),
  ).length;
  const inProduction = purchaseOrders.filter((po) =>
    po.status.toLowerCase().includes("production"),
  ).length;
  const delayed = purchaseOrders.filter((po) =>
    po.status.toLowerCase().includes("delayed"),
  ).length;

  function handleExport() {
    downloadCsv(
      "purchase-orders.csv",
      ["PO #", "Vendor", "Items", "Value", "Created", "Delivery", "Status"],
      filtered.map((po) => [po.id, po.vendor, String(po.items), po.value, po.created, po.delivery, po.status]),
    );
    toast.success("CSV exported", { description: `${filtered.length} purchase orders` });
  }

  function toggleFilter() {
    setShowChips((prev) => {
      const next = !prev;
      toast.info(next ? "Filters shown" : "Filters hidden");
      return next;
    });
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((po) => po.id)));
    }
  }

  return (
    <AppShell
      title="Purchase Orders"
      breadcrumb={["Purchase Orders"]}
      actions={
        <>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={toggleFilter}>
            <Filter /> Filter
          </Button>
          <PrototypeFormDialog
            trigger={
              <Button size="sm">
                <Plus /> New PO
              </Button>
            }
            title="Create Purchase Order"
            description="Fill in details to create a new PO."
            fields={[
              { name: "vendor", label: "Vendor", placeholder: "e.g. Aster Manufacturing" },
              { name: "value", label: "Value ($)", placeholder: "e.g. 12500" },
              { name: "delivery", label: "Delivery date", placeholder: "e.g. Sep 15" },
              { name: "description", label: "Description", placeholder: "Brief description" },
            ]}
            submitLabel="Create PO"
            onSubmit={(v) => createPurchaseOrder(v as { vendor: string; value: string; delivery: string; description: string })}
          />
        </>
      }
    >
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Open", value: openCount, tone: "text-foreground" },
          {
            label: "Awaiting acknowledgement",
            value: awaiting,
            tone: "text-warning-foreground",
          },
          {
            label: "In production",
            value: inProduction,
            tone: "text-info",
          },
          { label: "Delayed", value: delayed, tone: "text-destructive" },
        ].map((s, idx) => (
          <FadeIn key={s.label} delay={idx * 80}>
            <div className="bento-card px-4 py-3">
              <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                {s.label}
              </div>
              <div className={"font-display text-2xl font-bold tabular-nums " + s.tone}>
                <AnimatedCounter value={s.value} />
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      {showChips && (
        <div className="mb-4 flex flex-wrap gap-1.5 text-xs">
          {(["All", "Open", "Delivered"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setChip(t)}
              className={
                "rounded-full px-3 py-1.5 font-medium transition-colors " +
                (chip === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/70")
              }
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {selected.size > 0 && (
        <div className="mb-3 text-xs text-muted-foreground">
          {selected.size} selected
        </div>
      )}

      <div className="bento-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                <Checkbox
                  checked={selected.size === filtered.length && filtered.length > 0}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>
                <span
                  className="inline-flex cursor-pointer items-center gap-1"
                  onClick={() => toast.info("Sorted by PO #")}
                >
                  PO # <ArrowUpDown className="h-3 w-3" />
                </span>
              </TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((po) => (
              <TableRow
                key={po.id}
                className="cursor-pointer"
                onClick={() => toast.info(`PO ${po.id}`, { description: `${po.vendor} · ${po.value}` })}
              >
                <TableCell>
                  <Checkbox
                    checked={selected.has(po.id)}
                    onCheckedChange={() => toggleSelect(po.id)}
                  />
                </TableCell>
                <TableCell className="font-mono text-xs">{po.id}</TableCell>
                <TableCell className="font-medium">{po.vendor}</TableCell>
                <TableCell className="text-muted-foreground">{po.items}</TableCell>
                <TableCell className="tabular-nums">{po.value}</TableCell>
                <TableCell className="text-muted-foreground">{po.created}</TableCell>
                <TableCell className="text-muted-foreground">{po.delivery}</TableCell>
                <TableCell>
                  <StatusPill tone={po.tone}>{po.status}</StatusPill>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AppShell>
  );
}
