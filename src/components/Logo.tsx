"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";

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
      <span className="text-3xl font-semibold tracking-tight text-white bg-black px-2 py-1 rounded-l-md leading-none shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
        Jav
      </span>
      <span className="text-3xl font-semibold tracking-tight text-black bg-[#ff9900] px-2 py-1 rounded-md leading-none shadow-[0_4px_24px_rgba(255,153,0,0.35)]">
        hub
      </span>
    </Link>
  );
}
