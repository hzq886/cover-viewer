"use client";

import { useMemo } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { LANGUAGE_DISPLAY_NAMES, type LanguageCode } from "@/i18n/translations";

type Props = {
  className?: string;
};

export default function LanguageSwitcher({ className }: Props) {
  const { language, setLanguage, languages, dictionary } = useI18n();

  const options = useMemo(
    () =>
      languages.map((code) => ({
        code,
        label: LANGUAGE_DISPLAY_NAMES[code],
      })),
    [languages],
  );

  return (
    <div className={`inline-flex items-center gap-2 ${className ?? ""}`.trim()}>
      <label className="relative">
        <span className="sr-only">{dictionary.languageSwitcher.ariaLabel}</span>
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value as LanguageCode)}
          className="appearance-none rounded-full border border-white/12 bg-black/40 py-2 pl-4 pr-10 text-sm text-slate-100 shadow-[0_12px_30px_-18px_rgba(76,29,149,0.7)] backdrop-blur focus:border-violet-300/70 focus:outline-none focus:ring-2 focus:ring-violet-400/50 cursor-pointer"
          aria-label={dictionary.languageSwitcher.ariaLabel}
        >
          {options.map((item) => (
            <option
              key={item.code}
              value={item.code}
              className="text-slate-900"
            >
              {item.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-200/70">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <title>Toggle language options</title>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </label>
    </div>
  );
}
