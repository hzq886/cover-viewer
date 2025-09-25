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
    <div className={`inline-flex items-center gap-3 ${className ?? ""}`.trim()}>
      <span className="hidden text-xs uppercase tracking-[0.24em] text-slate-200/70 md:inline">
        {label}
      </span>
      <Link
        href="/mypage"
        className="inline-flex items-center gap-2 rounded-full border border-violet-200/20 bg-gradient-to-r from-violet-500/80 via-fuchsia-500/60 to-sky-500/70 px-4 py-2 text-sm font-medium text-white shadow-[0_18px_45px_-24px_rgba(99,102,241,0.85)] backdrop-blur transition hover:scale-[1.02] hover:shadow-[0_22px_60px_-28px_rgba(129,140,248,0.9)] focus:outline-none focus:ring-2 focus:ring-violet-300/60"
      >
        My Page
      </Link>
      <button
        type="button"
        onClick={() => {
          void signOut();
        }}
        className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/40 px-4 py-2 text-sm text-slate-100 shadow-[0_12px_30px_-18px_rgba(76,29,149,0.7)] backdrop-blur transition hover:border-violet-300/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-400/50"
      >
        Logout
      </button>
    </div>
  );
}
