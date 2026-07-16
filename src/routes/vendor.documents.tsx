import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell, StatusPill } from "@/components/app-shell";
import { requireAuth } from "@/lib/auth-guards";
import { useDemoStore } from "@/lib/demo-store";
import { DEMO_VENDOR_NAME } from "@/lib/demo-data";
import { FileUploadButton } from "@/components/file-upload-button";
import { FileText } from "lucide-react";
import { FadeIn } from "@/components/motion";

export const Route = createFileRoute("/vendor/documents")({
  ssr: false,
  beforeLoad: requireAuth("vendor"),
  head: () => ({
    meta: [{ title: "My Documents — Nexus Portal" }],
  }),
  component: VendorDocumentsPage,
});

function VendorDocumentsPage() {
  const { documents, uploadDocument } = useDemoStore();
  const myDocs = documents.filter((d) => d.vendor === DEMO_VENDOR_NAME);
  const groups = [...new Set(myDocs.map((d) => d.group))];

  function handleDocClick(doc: (typeof myDocs)[number]) {
    toast.info(doc.name, {
      description: `${doc.meta} · ${doc.status}`,
    });
  }

  return (
    <AppShell
      title="My Documents"
      breadcrumb={["Documents"]}
      actions={
        <FileUploadButton
          size="sm"
          successLabel="Document uploaded"
          onFiles={(files) => uploadDocument(files[0]!.name, DEMO_VENDOR_NAME)}
        >
          Upload document
        </FileUploadButton>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {groups.map((group, groupIdx) => {
          const items = myDocs.filter((d) => d.group === group);
          return (
            <FadeIn key={group} delay={groupIdx * 80}>
              <div className="bento-card p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-display font-semibold">{group}</div>
                    <div className="text-xs text-muted-foreground">{items.length} documents</div>
                  </div>
                </div>
                <ul className="divide-y divide-border">
                  {items.map((d) => (
                    <li
                      key={d.id}
                      className="flex cursor-pointer items-center gap-3 py-3 transition-colors first:pt-0 last:pb-0 hover:bg-muted/50"
                      onClick={() => handleDocClick(d)}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{d.name}</div>
                        <div className="truncate text-xs text-muted-foreground">{d.meta}</div>
                      </div>
                      <StatusPill tone={d.tone}>{d.status}</StatusPill>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          );
        })}
      </div>
    </AppShell>
  );
}
