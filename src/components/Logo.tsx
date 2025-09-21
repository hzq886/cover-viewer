"use client";

import Link from "next/link";
import React from "react";
import { useI18n } from "../i18n/I18nProvider";

type Props = {
  onHome?: () => void;
  className?: string;
};

export default function Logo({ onHome, className }: Props) {
  const { t } = useI18n();
  return (
    <Link
      href="/"
      onClick={(e) => {
        // Prefer soft reset without full navigation
        e.preventDefault();
        onHome?.();
      }}
      aria-label={t("logo.homeAria")}
      className={`group inline-flex items-center gap-2 select-none ${className || ""}`}
    >
      <span className="text-3xl font-semibold tracking-tight bg-gradient-to-tr from-violet-200 to-fuchsia-200 bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(168,85,247,0.35)]">
        Lucky
      </span>
      <span className="text-3xl font-semibold tracking-tight bg-gradient-to-tr from-pink-400 to-rose-400 bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(168,85,247,0.35)]">
        JAV
      </span>
      <span className="text-3xl font-semibold tracking-tight bg-gradient-to-tr from-violet-200 to-fuchsia-200 bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(168,85,247,0.35)]">
        Cover
      </span>
    </Link>
  );
}
