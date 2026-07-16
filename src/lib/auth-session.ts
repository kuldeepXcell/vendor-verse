import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

export type AuthRole = "admin" | "vendor";

export type AuthSession = {
  email: string;
  role: AuthRole;
};

const SESSION_KEY = "nexus.session";
const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 7;

function parseSession(raw: string | null | undefined): AuthSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    if (
      typeof parsed.email !== "string" ||
      (parsed.role !== "admin" && parsed.role !== "vendor")
    ) {
      return null;
    }
    return { email: parsed.email, role: parsed.role };
  } catch {
    return null;
  }
}

function readCookieValue(
  cookieHeader: string | null | undefined,
  name: string,
): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(/;\s*/)) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq) !== name) continue;
    try {
      return decodeURIComponent(part.slice(eq + 1));
    } catch {
      return part.slice(eq + 1);
    }
  }
  return null;
}

function writeClientCookie(session: AuthSession | null): void {
  if (typeof document === "undefined") return;
  if (!session) {
    document.cookie = `${SESSION_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
    return;
  }
  const value = encodeURIComponent(JSON.stringify(session));
  document.cookie = `${SESSION_KEY}=${value}; Path=/; Max-Age=${COOKIE_MAX_AGE_SEC}; SameSite=Lax`;
}

/** Resolves session on both SSR (cookie) and client (sessionStorage + cookie). */
export const getSession = createIsomorphicFn()
  .server((): AuthSession | null => {
    return parseSession(readCookieValue(getRequestHeader("cookie"), SESSION_KEY));
  })
  .client((): AuthSession | null => {
    try {
      const fromStorage = parseSession(sessionStorage.getItem(SESSION_KEY));
      if (fromStorage) {
        writeClientCookie(fromStorage);
        return fromStorage;
      }
      const fromCookie = parseSession(readCookieValue(document.cookie, SESSION_KEY));
      if (fromCookie) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(fromCookie));
        return fromCookie;
      }
      return null;
    } catch {
      return null;
    }
  });

export function setSession(session: AuthSession): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  writeClientCookie(session);
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
  writeClientCookie(null);
}

export function homeForRole(role: AuthRole): "/dashboard" | "/vendor" {
  return role === "admin" ? "/dashboard" : "/vendor";
}
