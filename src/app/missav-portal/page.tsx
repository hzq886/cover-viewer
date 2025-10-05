"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useI18n } from "@/i18n/I18nProvider";

export default function MissavPortal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { dictionary, t } = useI18n();
  const portalText = dictionary.portal;

  const contentId = searchParams?.get("contentId") ?? "";
  const fallbackUrl = searchParams?.get("url") ?? "";

  const targetUrl = useMemo(() => {
    if (fallbackUrl) return fallbackUrl;
    if (!contentId) return "";
    return `https://missav.ai/${encodeURIComponent(contentId)}`;
  }, [contentId, fallbackUrl]);

  useEffect(() => {
    if (!targetUrl) return;
    const timeout = window.setTimeout(() => {
      window.location.href = targetUrl;
    }, 5000);
    return () => window.clearTimeout(timeout);
  }, [targetUrl]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        router.back();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [router]);

  const runes = useMemo(
    () => [
      { char: "ᚠ", top: "5%", left: "15%", delay: "0s" },
      { char: "ᚢ", top: "12%", left: "70%", delay: "1s" },
      { char: "ᛟ", top: "78%", left: "28%", delay: "2s" },
      { char: "ᛞ", top: "60%", left: "80%", delay: "1.5s" },
      { char: "ᚨ", top: "35%", left: "50%", delay: "0.5s" },
    ],
    [],
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#100b07] text-amber-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(113,63,18,0.45),transparent_60%),radial-gradient(circle_at_bottom,_rgba(80,34,8,0.6),transparent_55%)]" />
      <div
        className="pointer-events-none absolute inset-0 mix-blend-soft-light"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 160 160\\'%3E%3Cpath fill=\\'%2340291a0b\\' d=\\'M0 0h160v160H0z\\'/%3E%3Cg fill=\\'%236b3a1a0f\\'%3E%3Cpath d=\\'M0 0h20L0 20z\\'/%3E%3Cpath d=\\'M160 160h-20l20-20z\\'/%3E%3Cpath d=\\'M0 160h20l-20-20z\\'/%3E%3Cpath d=\\'M160 0h-20l20 20z\\'/%3E%3C/g%3E%3C/svg%3E')",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,_rgba(235,173,73,0.12),transparent_65%)]" />

      {runes.map((rune) => (
        <span
          key={`${rune.char}-${rune.left}`}
          className="pointer-events-none absolute text-3xl font-semibold text-amber-200/30 drop-shadow-[0_0_12px_rgba(250,204,21,0.35)]"
          style={{
            top: rune.top,
            left: rune.left,
            transform: "translate(-50%, -50%)",
            animation: `floatRune 6s ease-in-out ${rune.delay} infinite alternate`,
          }}
        >
          {rune.char}
        </span>
      ))}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <div className="relative w-full max-w-2xl overflow-hidden rounded-[42px] border border-amber-900/40 bg-black/40 p-10 text-center shadow-[0_38px_120px_-45px_rgba(166,95,36,0.8)] backdrop-blur">
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <div className="absolute -inset-40 animate-[spin_18s_linear_infinite] rounded-full border-2 border-dashed border-amber-900/40" />
            <div className="absolute -inset-28 animate-[spin_12s_linear_reverse_infinite] rounded-full border border-dashed border-amber-500/50" />
            <div className="absolute inset-12 rounded-full bg-gradient-to-br from-amber-400/25 via-orange-700/15 to-amber-900/30 blur-3xl" />
          </div>

          <div className="relative mx-auto h-52 w-52">
            <div className="absolute inset-0 animate-[spin_16s_linear_infinite] rounded-full border-4 border-dashed border-amber-500/40" />
            <div className="absolute inset-4 animate-[spin_10s_linear_reverse_infinite] rounded-full border-2 border-dashed border-amber-300/50" />
            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-amber-400/50 via-amber-600/30 to-amber-900/20 blur" />
            <div className="absolute inset-12 flex items-center justify-center rounded-full bg-black/70 shadow-[0_0_30px_rgba(253,224,71,0.25)]">
              <div className="relative h-20 w-20">
                <div className="absolute inset-0 animate-[spin_8s_linear_infinite] rounded-full border-4 border-transparent border-t-amber-300/80" />
                <div className="absolute inset-3 animate-[pulse_2.4s_ease-in-out_infinite] rounded-full bg-gradient-to-br from-amber-500/40 to-amber-200/10 blur-sm" />
              </div>
            </div>
          </div>

          <div className="relative mt-8 space-y-4">
            <h1 className="text-3xl font-black tracking-[0.35em] text-amber-200 drop-shadow-[0_0_18px_rgba(255,196,107,0.55)]">
              {portalText.title}
            </h1>
            <p className="text-base leading-relaxed text-amber-100/90">
              {contentId
                ? t("portal.subtitle", { code: contentId })
                : portalText.subtitleFallback}
            </p>
            {targetUrl ? (
              <p className="text-sm uppercase tracking-[0.5em] text-amber-200/80">
                {portalText.redirecting}
              </p>
            ) : (
              <p className="text-sm text-rose-200/90">
                Missing destination. Please close this tab.
              </p>
            )}
          </div>

          <div className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-6">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="relative h-16 w-4 rounded-b-full bg-gradient-to-b from-amber-200/10 via-amber-400/40 to-transparent"
              >
                <div className="absolute bottom-0 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-amber-200/70 blur-sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx global>{`
      @keyframes floatRune {
        0% {
          transform: translate(-50%, -50%) scale(0.9);
          opacity: 0.4;
        }
        50% {
          transform: translate(-50%, -55%) scale(1.1);
          opacity: 0.7;
        }
        100% {
          transform: translate(-50%, -60%) scale(0.95);
          opacity: 0.45;
        }
      }
    `}</style>
    </div>
  );
}
