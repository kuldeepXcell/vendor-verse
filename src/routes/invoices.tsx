import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Filter, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { AppShell, StatusPill } from "@/components/app-shell";
import { requireAuth } from "@/lib/auth-guards";
import { useDemoStore } from "@/lib/demo-store";
import { FileUploadButton } from "@/components/file-upload-button";
import { Button } from "@/components/ui/button";
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

export const Route = createFileRoute("/invoices")({
  ssr: false,
  beforeLoad: requireAuth("admin"),
  head: () => ({
    meta: [
      { title: "Invoices — Vendor Verse" },
      { name: "description", content: "Approve invoices, match POs, and schedule payments." },
    ],
  }),
  component: InvoicesPage,
});

const statusChips = ["All", "Awaiting", "Approved", "Scheduled", "Paid", "Rejected"] as const;
type StatusChip = (typeof statusChips)[number];

function InvoicesPage() {
  const { invoices, approveInvoice, rejectInvoice, uploadInvoice } = useDemoStore();
  const [showFilters, setShowFilters] = useState(true);
  const [activeChip, setActiveChip] = useState<StatusChip>("All");

  const awaitingCount = invoices.filter(
    (i) => i.status.toLowerCase().includes("awaiting") || i.status.toLowerCase().includes("review"),
  ).length;

  const filtered = useMemo(() => {
    if (activeChip === "All") return invoices;
    return invoices.filter((i) => i.status.toLowerCase().includes(activeChip.toLowerCase()));
  }, [invoices, activeChip]);

  function toggleFilters() {
    setShowFilters((prev) => {
      const next = !prev;
      toast.info(next ? "Filters shown" : "Filters hidden");
      return next;
    });
  }

  return (
    <AppShell
      title="Invoices"
      breadcrumb={["Invoices"]}
      actions={
        <>
          <Button variant="outline" size="sm" onClick={toggleFilters}>
            <Filter /> Filter
          </Button>
          <FileUploadButton
            size="sm"
            accept=".pdf,.png,.jpg,.xlsx,.csv"
            successLabel="Invoice uploaded"
            onFiles={(files) => uploadInvoice(files[0]!.name, "admin")}
          >
            Upload invoice
          </FileUploadButton>
        </>
      }
    >
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <FadeIn delay={0}>
          <div className="bento-card p-5">
            <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Awaiting approval
            </div>
            <div className="mt-1 font-display text-3xl font-bold tabular-nums">
              <AnimatedCounter value="$284,910" />
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              <AnimatedCounter value={awaitingCount} /> invoices · 4 overdue
            </div>
          </div>
        </FadeIn>
        <FadeIn delay={80}>
          <div className="bento-card p-5">
            <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Scheduled to pay
            </div>
            <div className="mt-1 font-display text-3xl font-bold tabular-nums">
              <AnimatedCounter value="$412,220" />
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Next run · Friday Aug 22</div>
          </div>
        </FadeIn>
        <FadeIn delay={160}>
          <div className="bento-card p-5">
            <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Paid this month
            </div>
            <div className="mt-1 font-display text-3xl font-bold tabular-nums">
              <AnimatedCounter value="$1.12M" />
            </div>
            <div className="mt-1 text-xs text-success">▲ 6.2% vs July</div>
          </div>
        </FadeIn>
      </div>

      {showFilters && (
        <div className="mb-4 flex flex-wrap gap-1.5 text-xs">
          {statusChips.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveChip(t)}
              className={
                "rounded-full px-3 py-1.5 font-medium transition-colors " +
                (activeChip === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/70")
              }
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <div className="bento-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>PO</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Match</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((i) => (
              <TableRow
                key={i.id}
                className="cursor-pointer"
                onClick={() =>
                  toast.info(`Invoice ${i.id}`, { description: `${i.vendor} · ${i.value}` })
                }
              >
                <TableCell className="font-mono text-xs">{i.id}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{i.po}</TableCell>
                <TableCell className="font-medium">{i.vendor}</TableCell>
                <TableCell className="text-xs">
                  <span className={i.match.includes("✕") ? "text-destructive" : "text-success"}>
                    {i.match}
                  </span>
                </TableCell>
                <TableCell className="tabular-nums">{i.value}</TableCell>
                <TableCell className="text-muted-foreground">{i.due}</TableCell>
                <TableCell>
                  <StatusPill tone={i.tone}>{i.status}</StatusPill>
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-success"
                      onClick={() => approveInvoice(i.id)}
                      aria-label={`Approve ${i.id}`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive"
                      onClick={() => rejectInvoice(i.id)}
                      aria-label={`Reject ${i.id}`}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AppShell>
  );
}
