import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  CheckCircle2,
  Circle,
  Upload,
  FileText,
  Receipt,
  Wallet,
  ArrowUpRight,
} from "lucide-react";
import { AppShell, StatusPill } from "@/components/app-shell";
import {
  DEMO_VENDOR_NAME,
  filterByVendor,
  vendorPayments,
} from "@/lib/demo-data";
import { useDemoStore } from "@/lib/demo-store";
import { FileUploadButton } from "@/components/file-upload-button";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/animated-counter";
import { AnimatedProgress } from "@/components/animated-progress";
import { FadeIn } from "@/components/motion";

export const Route = createFileRoute("/vendor/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Vendor Home — Nexus Portal" },
      {
        name: "description",
        content: "Vendor-facing home: your POs, invoices, documents, and payments.",
      },
    ],
  }),
  component: VendorHome,
});

function VendorHome() {
  const { purchaseOrders, invoices, uploadInvoice, onboardingSteps, completeOnboardingStep } =
    useDemoStore();
  const navigate = useNavigate();
  const myPOs = filterByVendor(purchaseOrders).slice(0, 3);
  const myInvoices = filterByVendor(invoices).slice(0, 3);
  const doneCount = onboardingSteps.filter((s) => s.done).length;
  const progressPct = Math.round((doneCount / onboardingSteps.length) * 100);
  const nextPayment = vendorPayments.find((p) => p.status === "Scheduled") ?? vendorPayments[0];

  const activePOCount = filterByVendor(purchaseOrders).length;
  const inReviewCount = filterByVendor(invoices).filter((i) =>
    /review|awaiting/i.test(i.status),
  ).length;

  function handlePOClick(po: (typeof myPOs)[number]) {
    toast.info(`PO ${po.id}`, {
      description: `${po.description ?? "Purchase order"} · ${po.value} · Ship by ${po.delivery}`,
    });
    navigate({ to: "/vendor/purchase-orders" });
  }

  return (
    <AppShell
      title={`Welcome back, ${DEMO_VENDOR_NAME}`}
      breadcrumb={["Home"]}
      actions={
        <FileUploadButton
          size="sm"
          accept=".pdf,.png,.jpg,.xlsx,.csv"
          successLabel="Invoice submitted"
          onFiles={(files) => uploadInvoice(files[0]!.name, "vendor")}
        >
          <Upload /> Submit invoice
        </FileUploadButton>
      }
    >
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-6">
        <FadeIn className="lg:col-span-4">
          <div className="bento-card relative overflow-hidden bg-primary p-8 text-primary-foreground">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 100% 0%, oklch(0.62 0.03 258) 0, transparent 55%)",
              }}
            />
            <div className="relative">
              <div className="text-[11px] font-medium uppercase tracking-widest text-primary-foreground/60">
                Your account
              </div>
              <div className="mt-2 font-display text-3xl font-bold tracking-tight">
                You're {onboardingSteps.length - doneCount} steps from being fully onboarded
              </div>
              <p className="mt-2 max-w-lg text-sm text-primary-foreground/75">
                Complete the remaining tasks to unlock automatic payments and priority scheduling.
              </p>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-primary-foreground/70">Progress</span>
                  <span className="tabular-nums">
                    {doneCount} of {onboardingSteps.length} complete
                  </span>
                </div>
                <AnimatedProgress
                  value={progressPct}
                  className="h-1.5 bg-primary-foreground/20"
                  indicatorClassName="bg-primary-foreground"
                />
              </div>

              <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {onboardingSteps.map((s) => (
                  <li key={s.label} className="flex items-center gap-2 text-sm">
                    {s.done ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <button
                        type="button"
                        className="flex items-center gap-2 rounded-md px-1 py-0.5 transition-colors hover:bg-primary-foreground/10"
                        onClick={() => completeOnboardingStep(s.label)}
                      >
                        <Circle className="h-4 w-4 text-primary-foreground/50" />
                        <span>{s.label}</span>
                      </button>
                    )}
                    {s.done && (
                      <span className="text-primary-foreground/70 line-through">{s.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={80} className="lg:col-span-2">
          <div className="bento-card p-6">
            <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Next payment
            </div>
            <div className="mt-2 font-display text-4xl font-bold">
              <AnimatedCounter value={nextPayment?.amount ?? "—"} />
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {nextPayment
                ? `${nextPayment.date.split(",")[0]} · ${nextPayment.method}`
                : "No scheduled payments"}
            </div>

            <div className="my-6 h-px bg-border" />

            <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              YTD earned
            </div>
            <div className="mt-1 font-display text-2xl font-bold">
              <AnimatedCounter value="$412,880" />
            </div>
            <div className="mt-1 text-xs text-success">▲ 8.2% vs last year</div>

            <Button variant="outline" size="sm" className="mt-5 w-full" asChild>
              <Link to="/vendor/payments">
                View payment history <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </FadeIn>

        <FadeIn delay={160} className="lg:col-span-3">
          <div className="bento-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-display font-semibold">Your open POs</div>
                  <div className="text-xs text-muted-foreground">
                    <AnimatedCounter value={activePOCount} /> active
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/vendor/purchase-orders">View all</Link>
              </Button>
            </div>
            <ul className="divide-y divide-border">
              {myPOs.map((p) => (
                <li
                  key={p.id}
                  className="flex cursor-pointer items-center gap-4 py-3 transition-colors first:pt-0 last:pb-0 hover:bg-muted/50"
                  onClick={() => handlePOClick(p)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{p.id}</span>
                      <StatusPill tone={p.tone}>{p.status}</StatusPill>
                    </div>
                    <div className="mt-1 truncate text-sm font-medium">
                      {p.description ?? "Purchase order"}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      Ship by {p.delivery}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold tabular-nums">{p.value}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>

        <FadeIn delay={240} className="lg:col-span-3">
          <div className="bento-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                  <Receipt className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-display font-semibold">Your invoices</div>
                  <div className="text-xs text-muted-foreground">
                    <AnimatedCounter value={inReviewCount} /> in review
                  </div>
                </div>
              </div>
              <FileUploadButton
                variant="outline"
                size="sm"
                accept=".pdf,.png,.jpg,.xlsx,.csv"
                successLabel="Invoice submitted"
                onFiles={(files) => uploadInvoice(files[0]!.name, "vendor")}
              >
                <Upload className="size-3.5" /> Submit new
              </FileUploadButton>
            </div>
            <ul className="divide-y divide-border">
              {myInvoices.map((i) => (
                <li key={i.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{i.id}</span>
                      <StatusPill tone={i.tone}>{i.status}</StatusPill>
                    </div>
                    <div className="mt-1 text-sm">
                      Against <span className="font-mono text-xs">{i.po}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{i.meta ?? `Due ${i.due}`}</div>
                  </div>
                  <div className="text-right font-semibold tabular-nums">{i.value}</div>
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>

        <FadeIn delay={320} className="lg:col-span-6">
          <div className="bento-card p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                  Your buyer contact
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    AK
                  </div>
                  <div>
                    <div className="font-medium">Ava Klein</div>
                    <div className="text-xs text-muted-foreground">Procurement lead</div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                  <Link to="/vendor/messages">Message Ava</Link>
                </Button>
              </div>
              <div>
                <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                  Compliance
                </div>
                <ul className="mt-3 space-y-2 text-sm">
                  <li className="flex items-center justify-between">
                    <span>COI</span>
                    <StatusPill tone="warning">8 days</StatusPill>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>W-9</span>
                    <StatusPill tone="success">On file</StatusPill>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>MSA</span>
                    <StatusPill tone="success">Signed</StatusPill>
                  </li>
                </ul>
              </div>
              <div>
                <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                  Recent activity
                </div>
                <ul className="mt-3 space-y-3 text-sm">
                  <li className="flex gap-2">
                    <Wallet className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" /> Payment
                    scheduled for Aug 22
                  </li>
                  <li className="flex gap-2">
                    <FileText className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" /> PO-24817
                    issued to you
                  </li>
                  <li className="flex gap-2">
                    <Receipt className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" /> INV-8830
                    approved
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>
    </AppShell>
  );
}
