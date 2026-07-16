import { redirect } from "@tanstack/react-router";
import { getSession, homeForRole, type AuthRole } from "@/lib/auth-session";

/** Session gate for protected routes. Runs on SSR and client. */
export function requireAuth(role?: AuthRole) {
  return () => {
    const session = getSession();
    if (!session) {
      throw redirect({ to: "/" });
    }
    if (role && session.role !== role) {
      throw redirect({ to: homeForRole(session.role) });
    }
  };
}
