"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { useI18n } from "@/i18n/I18nProvider";

type Props = {
  className?: string;
};

export default function AuthBar({ className }: Props) {
  const { isAuthenticated, loading, signOut } = useAuth();
  const { dictionary } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(event: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  if (loading) {
    return (
      <div className={`text-xs text-slate-200/70 ${className ?? ""}`.trim()}>
        {dictionary.authBar.loading}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        className={`inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/40 px-4 py-2 text-sm text-slate-100 shadow-[0_12px_30px_-18px_rgba(76,29,149,0.7)] backdrop-blur hover:border-violet-300/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-400/50 ${className ?? ""}`.trim()}
      >
        {dictionary.authBar.login}
      </Link>
    );
  }

  return (
    <div
      ref={menuRef}
      className={`relative inline-flex items-center ${className ?? ""}`.trim()}
    >
      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-black/40 p-1 text-slate-100 shadow-[0_12px_30px_-18px_rgba(76,29,149,0.7)] backdrop-blur transition hover:border-violet-300/70 focus:outline-none focus:ring-2 focus:ring-violet-400/50 cursor-pointer"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label={dictionary.authBar.menuAria}
      >
        <Image
          src="/mypage_icon.png"
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 rounded-full object-cover"
        />
      </button>
      {menuOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-12 w-40 rounded-lg border border-white/12 bg-black/90 py-1 text-sm text-slate-100 shadow-[0_18px_45px_-24px_rgba(99,102,241,0.85)] backdrop-blur"
        >
          <Link
            href="/mypage"
            role="menuitem"
            className="block px-4 py-2 transition hover:bg-white/10"
            onClick={() => setMenuOpen(false)}
          >
            {dictionary.authBar.myPage}
          </Link>
          <button
            type="button"
            role="menuitem"
            className="block w-full px-4 py-2 text-left transition hover:bg-white/10 cursor-pointer"
            onClick={() => {
              setMenuOpen(false);
              void signOut();
            }}
          >
            {dictionary.authBar.logout}
          </button>
        </div>
      ) : null}
    </div>
  );
}
