import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Building2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { getSession, homeForRole, type AuthRole } from "@/lib/auth-session";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: () => {
    const session = getSession();
    if (session) {
      throw redirect({ to: homeForRole(session.role) });
    }
  },
  head: () => ({
    meta: [
      { title: "Sign in — Nexus Portal" },
      {
        name: "description",
        content:
          "Sign in to Nexus as an admin or vendor to manage procurement and vendor operations.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingRole, setPendingRole] = useState<AuthRole | null>(null);

  function submit(role: AuthRole) {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Enter your email and password to continue.");
      return;
    }

    setError(null);
    setPendingRole(role);
    signIn(trimmedEmail, role);
    void navigate({ to: homeForRole(role) });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="relative hidden w-[42%] shrink-0 overflow-hidden bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 100% 0%, oklch(0.62 0.03 258) 0, transparent 55%), linear-gradient(135deg, oklch(0.245 0.03 260), oklch(0.32 0.035 260))",
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <div className="flex items-center gap-3">
            <img
              src="/logo-animated.svg"
              alt="Nexus"
              className="h-11 w-11 shrink-0 rounded-lg"
              width={44}
              height={44}
            />
            <div>
              <div className="font-display text-lg font-bold tracking-tight">Nexus</div>
              <div className="text-[11px] uppercase tracking-widest text-sidebar-foreground/60">
                Vendor Portal
              </div>
            </div>
          </div>

          <div className="max-w-md animate-in fade-in slide-in-from-bottom-2 duration-500">
            <p className="text-[11px] font-medium uppercase tracking-widest text-sidebar-foreground/55">
              Procurement & vendor ops
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight xl:text-5xl">
              One workspace for vendors, POs, and payments.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-sidebar-foreground/70">
              Sign in to review purchase orders, track invoices, and keep vendor documents current —
              whether you run the desk or supply the goods.
            </p>
          </div>

          <p className="text-xs text-sidebar-foreground/45">Secure access · Demo environment</p>
        </div>
      </aside>

      <main className="flex flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-border px-6 py-4 lg:hidden">
          <img
            src="/logo-animated.svg"
            alt="Nexus"
            className="h-9 w-9 shrink-0 rounded-lg"
            width={36}
            height={36}
          />
          <div>
            <div className="font-display text-sm font-bold tracking-tight">Nexus</div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Vendor Portal
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-[380px] animate-in fade-in slide-in-from-bottom-3 duration-500">
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Sign in
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your credentials, then choose the workspace for your role.
            </p>

            <form className="mt-8 space-y-5" onSubmit={onSubmit} noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  aria-invalid={Boolean(error)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  aria-invalid={Boolean(error)}
                />
              </div>

              {error ? (
                <p className="text-center text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : null}

              <div className="space-y-3 pt-1">
                <Button
                  type="button"
                  className="h-11 w-full"
                  disabled={pendingRole !== null}
                  onClick={() => submit("admin")}
                >
                  <Shield />
                  {pendingRole === "admin" ? "Signing in…" : "Sign in as Admin"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full"
                  disabled={pendingRole !== null}
                  onClick={() => submit("vendor")}
                >
                  <Building2 />
                  {pendingRole === "vendor" ? "Signing in…" : "Sign in as Vendor"}
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                &copy; 2026 Nexus. All rights reserved.
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
