import { createFileRoute } from "@tanstack/react-router";
import { Plus, Banknote, Calendar } from "lucide-react";
import { toast } from "sonner";
import { AppShell, StatusPill } from "@/components/app-shell";
import { requireAuth } from "@/lib/auth-guards";
import { useDemoStore } from "@/lib/demo-store";
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

export const Route = createFileRoute("/payments")({
  ssr: false,
  beforeLoad: requireAuth("admin"),
  head: () => ({
    meta: [
      { title: "Payments — Vendor Verse" },
      { name: "description", content: "Schedule vendor payments and track payment runs." },
    ],
  }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const { paymentRuns, schedulePaymentRun, reschedulePaymentRun, markPaymentRunProcessed } =
    useDemoStore();
  const nextRun = paymentRuns.find((r) => r.status === "Scheduled") ?? paymentRuns[0];

  return (
    <AppShell
      title="Payments"
      breadcrumb={["Payments"]}
      actions={
        <Button size="sm" onClick={schedulePaymentRun}>
          <Plus /> New payment run
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <FadeIn className="lg:col-span-2">
          <div className="bento-card relative overflow-hidden bg-primary p-6 text-primary-foreground">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 90% 0%, oklch(0.62 0.03 258) 0, transparent 60%)",
              }}
            />
            <div className="relative">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary-foreground/70">
                <Calendar className="h-3.5 w-3.5" /> Next payment run
              </div>
              <div className="mt-3 flex flex-wrap items-baseline gap-4">
                <div className="font-display text-5xl font-bold tabular-nums">
                  {nextRun ? <AnimatedCounter value={nextRun.total} /> : "—"}
                </div>
                <div className="text-sm text-primary-foreground/70">
                  Friday · {nextRun?.date ?? "—"}
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-6 text-sm">
                <div>
                  <div className="text-[11px] uppercase tracking-widest text-primary-foreground/60">
                    Vendors
                  </div>
                  <div className="mt-1 font-display text-2xl font-bold">
                    {nextRun ? <AnimatedCounter value={nextRun.vendors} /> : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-widest text-primary-foreground/60">
                    Invoices
                  </div>
                  <div className="mt-1 font-display text-2xl font-bold">
                    {nextRun ? <AnimatedCounter value={nextRun.count} /> : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-widest text-primary-foreground/60">
                    Method
                  </div>
                  <div className="mt-1 font-display text-2xl font-bold">ACH · Wire</div>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => nextRun && markPaymentRunProcessed(nextRun.id)}
                >
                  Review run
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary-foreground/25 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                  onClick={() => nextRun && reschedulePaymentRun(nextRun.id)}
                >
                  Reschedule
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>

        <div className="bento-card p-6">
          <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Methods on file
          </div>
          <ul className="mt-4 space-y-3">
            {[
              { name: "ACH — Northlake •• 4821", note: "Primary", tone: "success" as const },
              { name: "Wire — Continental •• 9903", note: "International", tone: "info" as const },
              { name: "Virtual card — Ramp", note: "Auto-match", tone: "muted" as const },
            ].map((m) => (
              <li key={m.name} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                    <Banknote className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.note}</div>
                  </div>
                </div>
                <StatusPill tone={m.tone}>Active</StatusPill>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bento-card mt-4 overflow-hidden">
        <div className="border-b border-border px-6 py-4">
          <div className="font-display text-lg font-semibold">Payment runs</div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Run ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Vendors</TableHead>
              <TableHead>Invoices</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentRuns.map((r) => (
              <TableRow
                key={r.id}
                className="cursor-pointer"
                onClick={() => {
                  if (r.status === "Scheduled") {
                    markPaymentRunProcessed(r.id);
                  } else {
                    toast.info(`Run ${r.id}`, { description: `${r.status} · ${r.total}` });
                  }
                }}
              >
                <TableCell className="font-mono text-xs">{r.id}</TableCell>
                <TableCell>{r.date}</TableCell>
                <TableCell className="text-muted-foreground">{r.vendors}</TableCell>
                <TableCell className="text-muted-foreground">{r.count}</TableCell>
                <TableCell className="font-medium tabular-nums">{r.total}</TableCell>
                <TableCell>
                  <StatusPill tone={r.tone}>{r.status}</StatusPill>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AppShell>
  );
}
