import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { requireAuth } from "@/lib/auth-guards";
import { Bell, ShieldCheck, Users, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/settings")({
  ssr: false,
  beforeLoad: requireAuth("admin"),
  head: () => ({ meta: [{ title: "Settings — Nexus Portal" }] }),
  component: SettingsPage,
});

const cardDefs = [
  {
    id: "notifications",
    icon: Bell,
    title: "Notifications",
    description: "Configure email and in-app alerts for PO updates, invoice submissions, and compliance expirations.",
  },
  {
    id: "approvals",
    icon: ShieldCheck,
    title: "Approval workflows",
    description: "Set thresholds for auto-approval, multi-level sign-off chains, and delegation rules.",
  },
  {
    id: "team",
    icon: Users,
    title: "Team & roles",
    description: "Manage admin users, assign roles, and control workspace permissions.",
  },
  {
    id: "integrations",
    icon: Link2,
    title: "Integrations",
    description: "Connect your ERP, accounting software, and payment gateways.",
  },
];

function SettingsPage() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});

  function toggleCard(id: string, title: string) {
    setEnabled((prev) => {
      const next = !prev[id];
      toast.success(next ? `${title} enabled` : `${title} disabled`);
      return { ...prev, [id]: next };
    });
  }

  return (
    <AppShell title="Settings" breadcrumb={["Settings"]}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {cardDefs.map((c) => (
          <div key={c.id} className="bento-card p-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                <c.icon className="h-4 w-4" />
              </div>
              <div className="font-display font-semibold">{c.title}</div>
            </div>
            <p className="text-sm text-muted-foreground">{c.description}</p>
            <Button
              variant={enabled[c.id] ? "default" : "outline"}
              size="sm"
              className="mt-4"
              onClick={() => toggleCard(c.id, c.title)}
            >
              {enabled[c.id] ? "Enabled ✓" : "Configure"}
            </Button>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
