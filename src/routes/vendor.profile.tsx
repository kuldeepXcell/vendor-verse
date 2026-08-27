import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell, StatusPill } from "@/components/app-shell";
import { requireAuth } from "@/lib/auth-guards";
import { useDemoStore } from "@/lib/demo-store";
import { DEMO_VENDOR_NAME, DEMO_VENDOR_INITIAL } from "@/lib/demo-data";
import { FileUploadButton } from "@/components/file-upload-button";
import { Building2, MapPin, Banknote, User, ShieldCheck } from "lucide-react";
import { FadeIn } from "@/components/motion";

export const Route = createFileRoute("/vendor/profile")({
  ssr: false,
  beforeLoad: requireAuth("vendor"),
  head: () => ({
    meta: [{ title: "Profile — Vendor Verse" }],
  }),
  component: VendorProfilePage,
});

function VendorProfilePage() {
  const { documents, uploadDocument } = useDemoStore();
  const myDocs = documents.filter((d) => d.vendor === DEMO_VENDOR_NAME);

  function handleComplianceClick(doc: (typeof myDocs)[number]) {
    toast.info(doc.name.replace(` — ${DEMO_VENDOR_NAME}`, ""), {
      description: `${doc.meta} · Status: ${doc.status}`,
    });
  }

  return (
    <AppShell title="Company Profile" breadcrumb={["Profile"]}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <FadeIn className="lg:col-span-2">
          <div className="bento-card p-6">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-xl bg-primary text-primary-foreground font-display text-xl font-bold">
                {DEMO_VENDOR_INITIAL}
              </div>
              <div>
                <div className="font-display text-xl font-bold">{DEMO_VENDOR_NAME}</div>
                <div className="text-sm text-muted-foreground">Components supplier</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoRow icon={Building2} label="Category" value="Components" />
              <InfoRow icon={MapPin} label="Location" value="Portland, OR" />
              <InfoRow icon={Banknote} label="Banking" value="Northlake •• 4821" />
              <InfoRow icon={User} label="Primary contact" value="Sara Chen" />
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={80}>
          <div className="bento-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              <div className="font-display font-semibold">Compliance</div>
            </div>
            <ul className="space-y-3">
              {myDocs.map((d) => (
                <li
                  key={d.id}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-1 py-1 transition-colors hover:bg-muted/50"
                  onClick={() => handleComplianceClick(d)}
                >
                  <span className="truncate text-sm">
                    {d.name.replace(` — ${DEMO_VENDOR_NAME}`, "")}
                  </span>
                  <StatusPill tone={d.tone}>{d.status}</StatusPill>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <FileUploadButton
                variant="outline"
                size="sm"
                className="w-full"
                successLabel="Compliance doc uploaded"
                onFiles={(files) => uploadDocument(files[0]!.name, DEMO_VENDOR_NAME)}
              >
                Upload compliance doc
              </FileUploadButton>
            </div>
          </div>
        </FadeIn>
      </div>
    </AppShell>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-secondary-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}
