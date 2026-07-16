import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell, StatusPill } from "@/components/app-shell";
import { requireAuth } from "@/lib/auth-guards";
import { useDemoStore } from "@/lib/demo-store";
import { Banknote, Calendar } from "lucide-react";
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

export const Route = createFileRoute("/vendor/payments")({
  ssr: false,
  beforeLoad: requireAuth("vendor"),
  head: () => ({
    meta: [{ title: "My Payments — Nexus Portal" }],
  }),
  component: VendorPaymentsPage,
});

function VendorPaymentsPage() {
  const { vendorPayments } = useDemoStore();
  const next = vendorPayments.find((p) => p.status === "Scheduled") ?? vendorPayments[0];
  const paidCount = vendorPayments.filter((p) => p.status === "Paid").length;

  function handleRowClick(p: (typeof vendorPayments)[number]) {
    toast.info(`Payment ${p.id}`, {
      description: `${p.amount} · ${p.method} · ${p.date} · Invoice ${p.invoice}`,
    });
  }

  return (
    <AppShell title="My Payments" breadcrumb={["Payments"]}>
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <FadeIn className="md:col-span-2">
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
                <Calendar className="h-3.5 w-3.5" /> Next payment
              </div>
              <div className="mt-3 font-display text-4xl font-bold">
                <AnimatedCounter value={next?.amount ?? "—"} />
              </div>
              <div className="mt-2 text-sm text-primary-foreground/70">
                {next ? `${next.date} · ${next.method}` : "No payment scheduled"}
              </div>
              {next ? (
                <div className="mt-4 text-xs text-primary-foreground/60">
                  Against invoice {next.invoice}
                </div>
              ) : null}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={80}>
          <div className="bento-card p-6">
            <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Method on file
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                <Banknote className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-medium">ACH — Chase •• 4821</div>
                <div className="text-xs text-muted-foreground">Primary · Verified</div>
              </div>
            </div>
            <div className="mt-6 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Paid YTD
            </div>
            <div className="mt-1 font-display text-2xl font-bold">
              <AnimatedCounter value={paidCount} /> payments
            </div>
          </div>
        </FadeIn>
      </div>

      <FadeIn delay={160}>
        <div className="bento-card overflow-hidden">
          <div className="border-b border-border px-6 py-4">
            <div className="font-display text-lg font-semibold">Payment history</div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendorPayments.map((p) => (
                <TableRow
                  key={p.id}
                  className="cursor-pointer"
                  onClick={() => handleRowClick(p)}
                >
                  <TableCell className="font-mono text-xs">{p.id}</TableCell>
                  <TableCell>{p.date}</TableCell>
                  <TableCell className="text-muted-foreground">{p.method}</TableCell>
                  <TableCell className="font-mono text-xs">{p.invoice}</TableCell>
                  <TableCell className="font-medium tabular-nums">{p.amount}</TableCell>
                  <TableCell>
                    <StatusPill tone={p.tone}>{p.status}</StatusPill>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </FadeIn>
    </AppShell>
  );
}
