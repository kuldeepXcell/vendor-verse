import { Outlet, createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/auth-guards";

export const Route = createFileRoute("/vendor")({
  ssr: false,
  beforeLoad: requireAuth("vendor"),
  component: VendorLayout,
});

function VendorLayout() {
  return <Outlet />;
}
