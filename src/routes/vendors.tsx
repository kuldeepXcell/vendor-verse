import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Filter, MoreHorizontal, MapPin } from "lucide-react";
import { toast } from "sonner";
import { AppShell, StatusPill } from "@/components/app-shell";
import { requireAuth } from "@/lib/auth-guards";
import { useDemoStore } from "@/lib/demo-store";
import { PrototypeFormDialog } from "@/components/prototype-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/vendors")({
  ssr: false,
  beforeLoad: requireAuth("admin"),
  head: () => ({
    meta: [
      { title: "Vendors — Nexus Portal" },
      { name: "description", content: "Manage vendor profiles, onboarding status, and compliance." },
    ],
  }),
  component: VendorsPage,
});

const statusFilters = ["All", "Active", "Onboarding", "Review", "Paused"] as const;

function VendorsPage() {
  const { vendors, inviteVendor } = useDemoStore();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<(typeof statusFilters)[number]>("All");
  const [showFilters, setShowFilters] = useState(true);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vendors.filter((v) => {
      const matchesStatus = statusFilter === "All" || v.status === statusFilter;
      if (!matchesStatus) return false;
      if (!q) return true;
      return (
        v.name.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q)
      );
    });
  }, [query, statusFilter, vendors]);

  function toggleFilters() {
    setShowFilters((prev) => {
      const next = !prev;
      toast.info(next ? "Filters shown" : "Filters hidden");
      return next;
    });
  }

  return (
    <AppShell
      title="Vendors"
      breadcrumb={["Vendors"]}
      actions={
        <>
          <Button variant="outline" size="sm" onClick={toggleFilters}>
            <Filter /> Filters
          </Button>
          <PrototypeFormDialog
            trigger={
              <Button size="sm">
                <Plus /> Invite vendor
              </Button>
            }
            title="Invite Vendor"
            description="Send an onboarding invitation to a new vendor."
            fields={[
              { name: "name", label: "Vendor name", placeholder: "e.g. Acme Corp" },
              { name: "category", label: "Category", placeholder: "e.g. Raw materials" },
              { name: "location", label: "Location", placeholder: "e.g. Portland, OR" },
            ]}
            submitLabel="Send invite"
            onSubmit={(v) => inviteVendor(v as { name: string; category: string; location: string })}
          />
        </>
      }
    >
      <div className="bento-card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="relative min-w-64 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${vendors.length} vendors…`}
              className="h-9 border-transparent bg-secondary/60 pl-9"
            />
          </div>
          {showFilters && (
            <div className="flex flex-wrap gap-1.5 text-xs">
              {statusFilters.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setStatusFilter(t)}
                  className={
                    "rounded-full px-3 py-1.5 font-medium transition-colors " +
                    (statusFilter === t
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/70")
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((v, idx) => (
            <div
              key={v.name}
              className="motion-fade-up group cursor-pointer bg-card p-5 transition-colors hover:bg-secondary/30"
              style={{ animationDelay: `${idx * 60}ms` }}
              onClick={() => toast.info(`Opening ${v.name}`)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground">
                    {v.initial}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-display font-semibold">{v.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{v.category}</div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-secondary group-hover:opacity-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => toast.info("Opening message", { description: v.name })}>
                      Message
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.info("Viewing profile", { description: v.name })}>
                      View profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.warning("Vendor paused", { description: v.name })}>
                      Pause vendor
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> {v.location}
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    YTD spend
                  </div>
                  <div className="font-display text-xl font-bold tabular-nums">{v.spend}</div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <StatusPill tone={v.tone}>{v.status}</StatusPill>
                  <span className="text-[11px] text-muted-foreground">Risk · {v.risk}</span>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 ? (
            <div className="col-span-full bg-card p-10 text-center text-sm text-muted-foreground">
              No vendors match your search.
            </div>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
