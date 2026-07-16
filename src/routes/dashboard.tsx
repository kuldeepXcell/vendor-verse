import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Filter,
  FileText,
  Receipt,
  Wallet,
  Users,
  CheckCircle2,
  AlertTriangle,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell, StatusPill } from "@/components/app-shell";
import { requireAuth } from "@/lib/auth-guards";
import { useDemoStore } from "@/lib/demo-store";
import { PrototypeFormDialog } from "@/components/prototype-form-dialog";
import { downloadCsv } from "@/lib/download-csv";
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
import { AnimatedProgress, AnimatedBar } from "@/components/animated-progress";
import { FadeIn, AnimatedChartBar } from "@/components/motion";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  beforeLoad: requireAuth("admin"),
  head: () => ({
    meta: [
      { title: "Dashboard — Nexus Portal" },
      {
        name: "description",
        content: "Admin overview: vendors, purchase orders, invoices, and payables.",
      },
    ],
  }),
  component: Dashboard,
});

const periods = ["Last 30 days", "Last 7 days", "Last 90 days", "Year to date"] as const;

function Dashboard() {
  const { vendors, invoices, purchaseOrders, createPurchaseOrder } = useDemoStore();
  const navigate = useNavigate();
  const recentPOs = purchaseOrders.slice(0, 5);
  const [periodIdx, setPeriodIdx] = useState(0);

  const activeVendors = vendors.filter((v) => v.status === "Active").length;
  const openPOs = purchaseOrders.filter(
    (po) => po.status.toLowerCase() !== "delivered" && po.status.toLowerCase() !== "draft",
  ).length;
  const invoicesToReview = invoices.filter(
    (i) => i.status.toLowerCase().includes("awaiting") || i.status.toLowerCase().includes("review"),
  ).length;
  const onboardingCount = vendors.filter((v) => v.status === "Onboarding").length;

  function cyclePeriod() {
    const next = (periodIdx + 1) % periods.length;
    setPeriodIdx(next);
    toast.info("Period changed", { description: periods[next] });
  }

  function handleExportDocs() {
    downloadCsv(
      "documents-expiring.csv",
      ["Name", "Vendor", "Expires", "Status"],
      docs.map((d) => [d.name, d.vendor, d.date, d.label]),
    );
    toast.success("CSV exported", { description: "documents-expiring.csv" });
  }

  return (
    <AppShell
      title="Overview"
      breadcrumb={["Dashboard"]}
      actions={
        <>
          <Button variant="outline" size="sm" onClick={cyclePeriod}>
            <Filter /> {periods[periodIdx]}
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
      {/* KPI row */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {([
          { label: "Active vendors", value: activeVendors, delta: "+12", trend: "up" as const, icon: Users, sub: "8 pending onboarding" },
          { label: "Open purchase orders", value: openPOs, delta: "+4", trend: "up" as const, icon: FileText, sub: "$1.24M committed" },
          { label: "Invoices to review", value: invoicesToReview, delta: "-3", trend: "down" as const, icon: Receipt, sub: "4 overdue for approval" },
          { label: "Payables this week", value: "$284,910", delta: "+6.2%", trend: "up" as const, icon: Wallet, sub: "Next run · Friday" },
        ] as const).map((kpi, idx) => (
          <FadeIn key={kpi.label} delay={idx * 80}>
            <Kpi
              label={kpi.label}
              value={kpi.value}
              delta={kpi.delta}
              trend={kpi.trend}
              icon={kpi.icon}
              sub={kpi.sub}
            />
          </FadeIn>
        ))}
      </section>

      {/* Bento grid */}
      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-6">
        {/* Cashflow */}
        <div className="bento-card lg:col-span-4 p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Payables — 12 week outlook
              </div>
              <div className="mt-1 flex items-baseline gap-3">
                <div className="font-display text-3xl font-bold tracking-tight">$3.41M</div>
                <StatusPill tone="success">
                  <ArrowUpRight className="h-3 w-3" /> 4.8% vs prior period
                </StatusPill>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <LegendDot className="bg-primary" label="Scheduled" />
              <LegendDot className="bg-accent" label="Pending approval" />
              <LegendDot className="bg-muted-foreground/40" label="Draft" />
            </div>
          </div>
          <Chart />
        </div>

        {/* Onboarding pipeline */}
        <div className="bento-card lg:col-span-2 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Vendor onboarding
            </div>
            <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
              <Link to="/vendors">
                View all <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
          <div className="font-display text-3xl font-bold tracking-tight">
            <AnimatedCounter value={onboardingCount} />
          </div>
          <div className="mb-5 text-xs text-muted-foreground">in progress this month</div>

          <ul className="space-y-4">
            {[
              { name: "Orbit Logistics", stage: "KYC review", pct: 75, tone: "info" as const },
              { name: "Kenji Metals", stage: "Contract sent", pct: 55, tone: "warning" as const },
              { name: "Northwind Textiles", stage: "Docs pending", pct: 25, tone: "muted" as const },
              { name: "Halcyon Print Co.", stage: "Approved", pct: 100, tone: "success" as const },
            ].map((v, idx) => (
              <li key={v.name}>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">{v.name}</span>
                  <StatusPill tone={v.tone}>{v.stage}</StatusPill>
                </div>
                <AnimatedProgress value={v.pct} className="h-1.5" delayMs={idx * 100} />
              </li>
            ))}
          </ul>
        </div>

        {/* Recent POs */}
        <div className="bento-card lg:col-span-4 p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Recent purchase orders
              </div>
              <div className="mt-0.5 font-display text-lg font-semibold">Awaiting your review</div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/purchase-orders">Open PO desk</Link>
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO #</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPOs.map((po) => (
                <TableRow
                  key={po.id}
                  className="cursor-pointer"
                  onClick={() => {
                    toast.info(`Opening ${po.id}`, { description: po.vendor });
                    navigate({ to: "/purchase-orders" });
                  }}
                >
                  <TableCell className="font-mono text-xs">{po.id}</TableCell>
                  <TableCell className="font-medium">{po.vendor}</TableCell>
                  <TableCell>{po.value}</TableCell>
                  <TableCell className="text-muted-foreground">{po.delivery}</TableCell>
                  <TableCell>
                    <StatusPill tone={po.tone}>{po.status}</StatusPill>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Activity feed */}
        <div className="bento-card lg:col-span-2 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Activity
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => toast.info("Activity feed is live")}
            >
              Live
            </Button>
          </div>
          <ol className="relative space-y-5 border-l border-border pl-5">
            {activity.map((a, i) => (
              <li
                key={i}
                className="relative cursor-pointer"
                onClick={() => toast.info(a.title, { description: a.meta })}
              >
                <span
                  className={
                    "absolute -left-[26px] top-1 grid h-4 w-4 place-items-center rounded-full " +
                    a.dot
                  }
                >
                  <a.icon className="h-2.5 w-2.5 text-background" />
                </span>
                <div className="text-sm font-medium leading-tight">{a.title}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{a.meta}</div>
              </li>
            ))}
          </ol>
        </div>

        {/* Documents due */}
        <div className="bento-card lg:col-span-3 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Documents expiring
              </div>
              <div className="mt-0.5 font-display text-lg font-semibold">Next 30 days</div>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportDocs}>
              <Download className="size-3.5" /> Export
            </Button>
          </div>
          <ul className="divide-y divide-border">
            {docs.map((d) => (
              <li
                key={d.name}
                className="flex cursor-pointer items-center gap-4 py-3 first:pt-0 last:pb-0"
                onClick={() => toast.info(d.name, { description: `${d.vendor} · Expires ${d.date}` })}
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{d.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {d.vendor} · Expires {d.date}
                  </div>
                </div>
                <StatusPill tone={d.tone}>{d.label}</StatusPill>
              </li>
            ))}
          </ul>
        </div>

        {/* Top vendors */}
        <div className="bento-card lg:col-span-3 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Top vendors by spend
              </div>
              <div className="mt-0.5 font-display text-lg font-semibold">This quarter</div>
            </div>
            <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
              <Link to="/vendors">
                All vendors <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
          <ul className="space-y-4">
            {topVendors.map((v, idx) => (
              <li key={v.name}>
                <div className="mb-1 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground font-display text-xs font-bold">
                      {v.initial}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{v.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{v.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold tabular-nums">{v.spend}</div>
                    <div
                      className={
                        "text-[11px] " + (v.up ? "text-success" : "text-muted-foreground")
                      }
                    >
                      {v.up ? "▲" : "▼"} {v.change}
                    </div>
                  </div>
                </div>
                <AnimatedBar percent={v.share} delayMs={idx * 120} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </AppShell>
  );
}

function Kpi({
  label,
  value,
  delta,
  trend,
  icon: Icon,
  sub,
}: {
  label: string;
  value: string | number;
  delta: string;
  trend: "up" | "down";
  icon: any;
  sub: string;
}) {
  return (
    <div className="bento-card bento-card-interactive p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-secondary-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <span
          className={
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold " +
            (trend === "up" ? "bg-success/12 text-success" : "bg-destructive/10 text-destructive")
          }
        >
          {trend === "up" ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {delta}
        </span>
      </div>
      <div className="mt-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-display text-3xl font-bold tracking-tight tabular-nums">
        <AnimatedCounter value={value} />
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={"h-2 w-2 rounded-full " + className} />
      {label}
    </span>
  );
}

function Chart() {
  const weeks: [number, number, number][] = [
    [60, 20, 8], [45, 30, 12], [70, 25, 5], [55, 40, 15], [80, 30, 10], [65, 45, 20],
    [90, 25, 12], [75, 55, 18], [60, 35, 8], [85, 50, 22], [70, 40, 15], [95, 60, 25],
  ];
  const max = 180;
  return (
    <div className="mt-2">
      <div className="grid h-56 grid-cols-12 items-end gap-2">
        {weeks.map((segments, i) => (
          <AnimatedChartBar key={i} segments={segments} max={max} index={i} />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-12 gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
        {["W1","W2","W3","W4","W5","W6","W7","W8","W9","W10","W11","W12"].map((w) => (
          <div key={w} className="text-center">{w}</div>
        ))}
      </div>
    </div>
  );
}

const activity = [
  { title: "Invoice INV-8842 approved", meta: "Ava K. · 4 min ago", icon: CheckCircle2, dot: "bg-success" },
  { title: "PO-24817 sent to Aster", meta: "Automated · 12 min ago", icon: FileText, dot: "bg-primary" },
  { title: "COI expiring — Kenji Metals", meta: "Compliance · 1h ago", icon: AlertTriangle, dot: "bg-warning" },
  { title: "Payment run scheduled", meta: "Finance · 3h ago", icon: Wallet, dot: "bg-accent" },
  { title: "New vendor Orbit onboarded", meta: "Yesterday", icon: Users, dot: "bg-primary" },
];

const docs = [
  { name: "Certificate of Insurance", vendor: "Aster Manufacturing", date: "Aug 24", tone: "warning" as const, label: "8 days" },
  { name: "W-9 Tax Form", vendor: "Halcyon Print Co.", date: "Aug 30", tone: "info" as const, label: "14 days" },
  { name: "ISO 9001 Certification", vendor: "Kenji Metals", date: "Sep 06", tone: "muted" as const, label: "21 days" },
  { name: "MSA — v3.1", vendor: "Orbit Logistics", date: "Aug 18", tone: "destructive" as const, label: "Overdue" },
];

const topVendors = [
  { name: "Aster Manufacturing", initial: "AM", category: "Components", spend: "$412,880", change: "8.2%", up: true, share: 92 },
  { name: "Kenji Metals", initial: "KM", category: "Raw materials", spend: "$298,410", change: "3.4%", up: true, share: 68 },
  { name: "Orbit Logistics", initial: "OL", category: "Freight & 3PL", spend: "$184,200", change: "1.1%", up: false, share: 44 },
  { name: "Halcyon Print Co.", initial: "HP", category: "Packaging", spend: "$96,540", change: "5.6%", up: true, share: 26 },
];
