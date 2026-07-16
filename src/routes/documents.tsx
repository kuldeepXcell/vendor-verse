import { createFileRoute } from "@tanstack/react-router";
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  FileArchive,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell, StatusPill } from "@/components/app-shell";
import { requireAuth } from "@/lib/auth-guards";
import { useDemoStore } from "@/lib/demo-store";
import { FileUploadButton } from "@/components/file-upload-button";
import { FadeIn } from "@/components/motion";
import type { DocumentItem } from "@/lib/demo-data";

export const Route = createFileRoute("/documents")({
  ssr: false,
  beforeLoad: requireAuth("admin"),
  head: () => ({
    meta: [
      { title: "Documents — Nexus Portal" },
      {
        name: "description",
        content: "Central vault for contracts, certifications, and vendor documents.",
      },
    ],
  }),
  component: DocumentsPage,
});

const groupMeta: Record<
  DocumentItem["group"],
  { icon: LucideIcon }
> = {
  "Contracts & MSAs": { icon: FileText },
  Compliance: { icon: FileArchive },
  "Tax & Banking": { icon: FileSpreadsheet },
  "Product & Brand": { icon: FileImage },
};

const groupOrder: DocumentItem["group"][] = [
  "Contracts & MSAs",
  "Compliance",
  "Tax & Banking",
  "Product & Brand",
];

function DocumentsPage() {
  const { documents, uploadDocument } = useDemoStore();

  const groups = groupOrder.map((label) => ({
    label,
    icon: groupMeta[label].icon,
    items: documents.filter((d) => d.group === label),
  }));

  return (
    <AppShell
      title="Documents"
      breadcrumb={["Documents"]}
      actions={
        <FileUploadButton
          size="sm"
          successLabel="Document uploaded"
          onFiles={(files) => uploadDocument(files[0]!.name)}
        >
          Upload
        </FileUploadButton>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {groups.map((g, gIdx) => (
          <FadeIn key={g.label} delay={gIdx * 80}>
            <div className="bento-card p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                  <g.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-display font-semibold">{g.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {g.items.length} documents
                  </div>
                </div>
              </div>
              <ul className="divide-y divide-border">
                {g.items.map((d) => (
                  <li
                    key={d.id}
                    className="flex cursor-pointer items-center gap-3 py-3 first:pt-0 last:pb-0"
                    onClick={() => toast.info(d.name, { description: d.meta })}
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
        ))}
      </div>
    </AppShell>
  );
}
