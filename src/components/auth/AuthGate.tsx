// components/AuthGate.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { UserProvider, User } from "./UserContext";
import { useRouter } from "next/navigation";

const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_BASE_URL || "https://authbackend-cc2d.onrender.com/api/auth";
// const AUTH_BASE = "http://localhost:9000";

const API_ROOT = AUTH_BASE.replace(/\/api\/auth\/?$/, "");

type Mode = "public" | "soft" | "block";

export default function AuthGate({
  children,
  mode = "block",          // ← blocks first paint by default
  redirectTo = "/vaultx/login",        // where unauth users go (soft/block)
  authedTo = "/vaultx/dashboard", // where authed users go (public)
  requireRole,             // e.g. "admin"
  fallback = null,         // loader/skeleton while checking
}: {
  children: React.ReactNode;
  mode?: Mode;
  redirectTo?: string;
  authedTo?: string;
  requireRole?: string;
  fallback?: React.ReactNode;
}) {
  const router = useRouter();
  const ran = useRef(false);                 // prevent double-run in dev
  const [allowed, setAllowed] = useState(mode !== "block"); // block hides until allowed
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      try {
        const res = await fetch(`${API_ROOT}/me`, {
          credentials: "include",
          cache: "no-store",
        });
        const ok = res.ok;

        if (mode === "public") {
          if (ok) router.replace(authedTo);
          return;
        }

        if (!ok) { router.replace(redirectTo); return; }

        let userData: User | null = null;
        try {
          userData = (await res.json())?.user || null;
        } catch { }
        setUser(userData);

        if (requireRole) {
          if (userData?.role !== requireRole) { router.replace(redirectTo); return; }
        }

        if (mode === "block") setAllowed(true);
      } catch {
        if (mode !== "public") router.replace(redirectTo);
      }
    })();
  }, [mode, redirectTo, authedTo, requireRole, router]);

  if (mode === "block" && !allowed) return <>{fallback}</>;
  return <UserProvider value={user}>{children}</UserProvider>;
}

