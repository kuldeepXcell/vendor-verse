import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  FolderOpen,
  Wallet,
  MessagesSquare,
  Settings,
  Bell,
  Search,
  ChevronRight,
  LogOut,
  Home,
  UserCircle2,
} from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { DEMO_VENDOR_NAME } from "@/lib/demo-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type NavItem = {
  title: string;
  to:
    | "/dashboard"
    | "/vendors"
    | "/purchase-orders"
    | "/invoices"
    | "/documents"
    | "/payments"
    | "/messages"
    | "/settings"
    | "/vendor"
    | "/vendor/purchase-orders"
    | "/vendor/invoices"
    | "/vendor/documents"
    | "/vendor/payments"
    | "/vendor/messages"
    | "/vendor/profile";
  icon: typeof LayoutDashboard;
  badge?: number;
};

const adminNav: NavItem[] = [
  { title: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { title: "Vendors", to: "/vendors", icon: Users },
  { title: "Purchase Orders", to: "/purchase-orders", icon: FileText },
  { title: "Invoices", to: "/invoices", icon: Receipt },
  { title: "Documents", to: "/documents", icon: FolderOpen },
  { title: "Payments", to: "/payments", icon: Wallet },
  { title: "Messages", to: "/messages", icon: MessagesSquare, badge: 3 },
  { title: "Settings", to: "/settings", icon: Settings },
];

const vendorNav: NavItem[] = [
  { title: "Home", to: "/vendor", icon: Home },
  { title: "My POs", to: "/vendor/purchase-orders", icon: FileText },
  { title: "My Invoices", to: "/vendor/invoices", icon: Receipt },
  { title: "Documents", to: "/vendor/documents", icon: FolderOpen },
  { title: "Payments", to: "/vendor/payments", icon: Wallet },
  { title: "Messages", to: "/vendor/messages", icon: MessagesSquare, badge: 1 },
  { title: "Profile", to: "/vendor/profile", icon: UserCircle2 },
];

const adminNotifications = [
  { title: "PO-24817 awaiting acknowledgement", meta: "Aster · 12 min ago" },
  { title: "INV-8842 ready for approval", meta: "Kenji Metals · 1h ago" },
  { title: "COI expiring in 8 days", meta: "Aster · Compliance" },
];

const vendorNotifications = [
  { title: "New PO issued — PO-24817", meta: "Procurement · 12 min ago" },
  { title: "Payment scheduled for Aug 22", meta: "Finance · today" },
  { title: "COI expires in 8 days", meta: "Compliance" },
];

function isActivePath(pathname: string, to: NavItem["to"]): boolean {
  if (to === "/dashboard") return pathname === "/dashboard";
  if (to === "/vendor") return pathname === "/vendor" || pathname === "/vendor/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

function initialsFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "U";
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

export function AppShell({
  title,
  breadcrumb,
  actions,
  children,
}: {
  title: string;
  breadcrumb?: string[];
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const role = session?.role;
  const [query, setQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);

  // Avoid painting the wrong shell before session is known (SSR/hydration).
  if (!role || !session) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background text-muted-foreground">
        <span className="text-sm">Loading workspace…</span>
      </div>
    );
  }

  const nav = role === "vendor" ? vendorNav : adminNav;
  const homeTo = role === "vendor" ? "/vendor" : "/dashboard";

  const displayName =
    role === "admin"
      ? "Ava Klein"
      : session.email.split("@")[0]?.replace(/[._]/g, " ") ?? "Vendor";
  const displayTitle = role === "admin" ? "Procurement lead" : DEMO_VENDOR_NAME;
  const avatar = role === "admin" ? "AK" : initialsFromEmail(session.email);

  function handleSignOut() {
    signOut();
    void navigate({ to: "/" });
  }

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (!q) {
      toast.message("Enter a search term");
      return;
    }
    if (role === "vendor") {
      void navigate({ to: "/vendor/purchase-orders" });
    } else if (/^po/i.test(q) || q.toLowerCase().includes("po")) {
      void navigate({ to: "/purchase-orders" });
    } else if (/^inv/i.test(q) || q.toLowerCase().includes("invoice")) {
      void navigate({ to: "/invoices" });
    } else {
      void navigate({ to: "/vendors" });
    }
    toast.success("Search", { description: `Showing results for “${q}”` });
  }

  const notifications = role === "vendor" ? vendorNotifications : adminNotifications;

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
        <Link
          to={homeTo}
          className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5 transition-opacity hover:opacity-90"
        >
          <img
            src="/logo-animated.svg"
            alt="Nexus"
            className="h-9 w-9 shrink-0 rounded-lg"
            width={36}
            height={36}
          />
          <div className="min-w-0">
            <div className="font-display text-sm font-bold tracking-tight">Nexus</div>
            <div className="truncate text-[11px] uppercase tracking-widest text-sidebar-foreground/60">
              {role === "vendor" ? "Vendor workspace" : "Admin workspace"}
            </div>
          </div>
        </Link>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          <div className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/50">
            Workspace
          </div>
          {nav.map((item) => {
            const active = isActivePath(pathname, item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors " +
                  (active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground")
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{item.title}</span>
                {item.badge ? (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-sidebar-primary px-1.5 text-[10px] font-semibold text-sidebar-primary-foreground motion-pulse-dot">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-md bg-sidebar-accent/40 p-2.5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground font-semibold">
              {avatar}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium capitalize text-sidebar-foreground">
                {displayName}
              </div>
              <div className="truncate text-[11px] text-sidebar-foreground/60">
                {displayTitle}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              onClick={handleSignOut}
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-background/85 px-4 backdrop-blur md:px-8">
          <div className="hidden min-w-0 items-center gap-2 text-sm text-muted-foreground md:flex">
            <span className="font-display font-semibold text-foreground">
              {role === "admin" ? "Admin" : "Vendor"}
            </span>
            {breadcrumb?.map((b, i) => (
              <span key={i} className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                <span className={i === breadcrumb.length - 1 ? "text-foreground" : ""}>
                  {b}
                </span>
              </span>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <form onSubmit={handleSearch} className="relative hidden md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  role === "vendor"
                    ? "Search your POs, invoices…"
                    : "Search vendors, POs, invoices…"
                }
                className="h-9 w-72 border-transparent bg-secondary/60 pl-9 focus-visible:bg-background"
              />
            </form>
            <Button
              variant="ghost"
              size="icon"
              className="relative lg:hidden"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
            </Button>
            <Popover open={notifOpen} onOpenChange={setNotifOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <div className="border-b border-border px-4 py-3">
                  <div className="font-display text-sm font-semibold">Notifications</div>
                </div>
                <ul className="max-h-72 divide-y divide-border overflow-y-auto">
                  {notifications.map((n) => (
                    <li key={n.title}>
                      <button
                        type="button"
                        className="w-full px-4 py-3 text-left transition-colors hover:bg-secondary/50"
                        onClick={() => {
                          setNotifOpen(false);
                          toast.message(n.title, { description: n.meta });
                        }}
                      >
                        <div className="text-sm font-medium">{n.title}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">{n.meta}</div>
                      </button>
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 lg:pb-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <h1 className="truncate font-display text-2xl font-bold tracking-tight md:text-3xl">
                {title}
              </h1>
            </div>
            {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
          </div>
          {children}
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur lg:hidden">
          <div className="flex items-stretch justify-around px-1 py-2">
            {nav.slice(0, 5).map((item) => {
              const active = isActivePath(pathname, item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={
                    "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-[10px] font-medium transition-colors " +
                    (active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.title.split(" ")[0]}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

export function StatusPill({
  tone = "muted",
  children,
}: {
  tone?: "muted" | "success" | "warning" | "info" | "destructive";
  children: ReactNode;
}) {
  const tones: Record<string, string> = {
    muted: "bg-secondary text-secondary-foreground",
    success: "bg-success/12 text-success",
    warning: "bg-warning/15 text-warning-foreground border border-warning/40",
    info: "bg-info/12 text-info",
    destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium " +
        tones[tone]
      }
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {children}
    </span>
  );
}

export { Badge };
