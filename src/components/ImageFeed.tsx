"use client";

import Image from "next/image";
import { useI18n } from "@/i18n/I18nProvider";
import type { DmmItem } from "@/types/dmm";

export type FeedCard = {
  id: string;
  item: DmmItem;
  coverUrl: string;
  title: string;
  maker: string;
  releaseDate?: string;
};

type Props = {
  loading: boolean;
  hasError: boolean;
  errorMessage: string | null;
  hasSearched: boolean;
  resultsCount: number;
  feedCards: FeedCard[];
  onOpenDetail: (item: DmmItem) => void;
  startHint: string;
  emptyLabel: string;
};

function ImageFeed({
  loading,
  hasError,
  errorMessage,
  hasSearched,
  resultsCount,
  feedCards,
  onOpenDetail,
  startHint,
  emptyLabel,
}: Props) {
  const { t } = useI18n();
  const fallbackAlt = t("imageFeed.posterAlt");
  const noCoverLabel = t("imageFeed.noCover");
  const untitledLabel = t("imageFeed.untitled");

  if (loading) {
    return (
      <div className="flex h-[60svh] items-center justify-center">
        <div className="h-24 w-24 animate-pulse rounded-full border border-white/15 bg-white/10 shadow-[0_0_60px_-20px_rgba(148,163,184,0.6)]" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex h-[50svh] items-center justify-center">
        <div className="rounded-xl border border-red-400/30 bg-red-600/10 px-4 py-3 text-red-200">
          {errorMessage}
        </div>
      </div>
    );
  }

  if (!hasSearched && resultsCount === 0) {
    return (
      <div className="flex h-[40svh] items-center justify-center">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-center text-sm text-slate-200/80 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.9)]">
          {startHint}
        </div>
      </div>
    );
  }

  if (hasSearched && resultsCount === 0) {
    return (
      <div className="flex h-[50svh] items-center justify-center">
        <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-slate-200">
          {emptyLabel}
        </div>
      </div>
    );
  }

  if (resultsCount === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {feedCards.map((card, index) => {
        const releaseLabel = card.releaseDate
          ? card.releaseDate.slice(0, 10)
          : "";
        return (
          <button
            key={`${card.id}-${index}`}
            type="button"
            onClick={() => onOpenDetail(card.item)}
            className="group relative flex flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white/5 text-left shadow-[0_32px_90px_-40px_rgba(15,23,42,0.85)] transition duration-300 hover:-translate-y-1 hover:border-violet-200/40 hover:bg-white/10 cursor-pointer"
          >
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
              {card.coverUrl ? (
                <Image
                  src={card.coverUrl}
                  alt={card.title || fallbackAlt}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 80vw, (max-width: 1024px) 30vw, 220px"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-slate-300/70">
                  {noCoverLabel}
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/55 opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
            <div className="flex flex-col gap-2 px-4 py-4">
              <span className="line-clamp-2 text-sm font-semibold leading-snug text-white/90">
                {card.title || untitledLabel}
              </span>
              {card.maker ? (
                <span className="text-xs text-slate-300/75">{card.maker}</span>
              ) : null}
              {releaseLabel ? (
                <span className="text-[11px] text-slate-300/60">
                  {releaseLabel}
                </span>
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default ImageFeed;
