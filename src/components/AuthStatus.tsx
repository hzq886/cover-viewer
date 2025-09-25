"use client";

import Link from "next/link";
import { useAuth } from "@/auth/AuthProvider";

type Props = {
  className?: string;
};

export default function AuthStatus({ className }: Props) {
  const { user, isAuthenticated, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className={`text-xs text-slate-200/70 ${className ?? ""}`.trim()}>
        Auth…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        className={`inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/40 px-4 py-2 text-sm text-slate-100 shadow-[0_12px_30px_-18px_rgba(76,29,149,0.7)] backdrop-blur hover:border-violet-300/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-400/50 ${className ?? ""}`.trim()}
      >
        Login
      </Link>
    );
  }

  const label = user?.email || "Account";
  return (
    <div className={`inline-flex items-center gap-2 ${className ?? ""}`.trim()}>
      <span className="hidden md:inline text-xs uppercase tracking-[0.24em] text-slate-200/70">
        {label}
      </span>
      <button
        type="button"
        onClick={() => {
          void signOut();
        }}
        className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/40 px-4 py-2 text-sm text-slate-100 shadow-[0_12px_30px_-18px_rgba(76,29,149,0.7)] backdrop-blur hover:border-violet-300/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-400/50"
      >
        Logout
      </button>
    </div>
  );
}

