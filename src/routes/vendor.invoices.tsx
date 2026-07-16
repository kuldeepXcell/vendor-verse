import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell, StatusPill } from "@/components/app-shell";
import { requireAuth } from "@/lib/auth-guards";
import { useDemoStore } from "@/lib/demo-store";
import { filterByVendor } from "@/lib/demo-data";
import { FileUploadButton } from "@/components/file-upload-button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { AnimatedCounter } from "@/components/animated-counter";
import { FadeIn } from "@/components/motion";

export const Route = createFileRoute("/vendor/invoices")({
  ssr: false,
  beforeLoad: requireAuth("vendor"),
  head: () => ({
    meta: [{ title: "My Invoices — Nexus Portal" }],
  }),
  component: VendorInvoicesPage,
});

function VendorInvoicesPage() {
  const { invoices, uploadInvoice } = useDemoStore();
  const myInvoices = filterByVendor(invoices);

  function handleRowClick(inv: (typeof myInvoices)[number]) {
    toast.info(`Invoice ${inv.id}`, {
      description: `${inv.value} · Against ${inv.po} · Due ${inv.due} · ${inv.match}`,
    });
  }

  return (
    <AppShell
      title="My Invoices"
      breadcrumb={["Invoices"]}
      actions={
        <FileUploadButton
          size="sm"
          accept=".pdf,.png,.jpg,.xlsx,.csv"
          successLabel="Invoice uploaded"
          onFiles={(files) => uploadInvoice(files[0]!.name, "vendor")}
        >
          Upload invoice
        </FileUploadButton>
      }
    >
      <FadeIn>
        <div className="mb-4 flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            <AnimatedCounter value={myInvoices.length} className="font-semibold text-foreground" /> invoices
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={80}>
        <div className="bento-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>PO</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Match</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Info</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myInvoices.map((inv) => (
                <TableRow
                  key={inv.id}
                  className="cursor-pointer"
                  onClick={() => handleRowClick(inv)}
                >
                  <TableCell className="font-mono text-xs">{inv.id}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{inv.po}</TableCell>
                  <TableCell className="tabular-nums font-medium">{inv.value}</TableCell>
                  <TableCell className="text-muted-foreground">{inv.due}</TableCell>
                  <TableCell className="text-xs">
                    <span className={inv.match.includes("✕") ? "text-destructive" : "text-success"}>{inv.match}</span>
                  </TableCell>
                  <TableCell><StatusPill tone={inv.tone}>{inv.status}</StatusPill></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{inv.meta}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </FadeIn>
    </AppShell>
  );
}
