"use client";

import Link from "next/link";
import React from "react";

type Props = {
  onHome?: () => void;
  className?: string;
};

export default function Logo({ onHome, className }: Props) {
  return (
    <Link
      href="/"
      onClick={(e) => {
        // Prefer soft reset without full navigation
        e.preventDefault();
        onHome?.();
      }}
      aria-label="返回首页"
      className={`group inline-flex items-center gap-2 select-none ${className || ""}`}
    >
      <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-500/30 to-fuchsia-500/25 ring-1 ring-inset ring-white/20 shadow-[0_8px_22px_-14px_rgba(168,85,247,0.9)]">
        {/* Simple film icon */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-violet-200"
          aria-hidden
        >
          <rect x="3" y="5" width="14" height="14" rx="2" />
          <path d="M17 7l4-2v14l-4-2" />
          <path d="M7 9h6M7 13h6M7 17h3" />
        </svg>
      </span>
      <span className="text-lg font-semibold tracking-tight bg-gradient-to-tr from-violet-200 to-fuchsia-200 bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(168,85,247,0.35)]">
        海报搜索
      </span>
    </Link>
  );
}

