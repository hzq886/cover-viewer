"use client";

import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import { useI18n } from "../i18n/I18nProvider";

type SampleImage = {
  url: string;
  portrait?: boolean;
};

type Props = {
  images: SampleImage[];
  height: number;
  thumbSize: number;
  onSelect: (url: string, meta?: { side?: 'front' | 'back' }) => void;
  // optional: provide poster to render synthetic front/back entries at top
  frontBackSrc?: string;
  activeUrl?: string;
  activeSide?: 'front' | 'back' | null;
};

const Sample = React.forwardRef<HTMLDivElement, Props>(function Sample(
  { images, height, thumbSize, onSelect, frontBackSrc, activeUrl, activeSide },
  ref,
) {
  const { dictionary } = useI18n();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasMore, setHasMore] = useState(false);
  const [hasAbove, setHasAbove] = useState(false);
  useImperativeHandle(ref, () => scrollRef.current as HTMLDivElement);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      setHasMore(el.scrollTop + el.clientHeight < el.scrollHeight - 2);
      setHasAbove(el.scrollTop > 2);
    };
    update();
    el.addEventListener("scroll", update);
    return () => el.removeEventListener("scroll", update);
  }, [images.length, height]);

  const toDisplaySrc = (url: string) =>
    url.startsWith('/api/') ? url : `/api/proxy?url=${encodeURIComponent(url)}`;

  const columnWidth = Math.min(Math.max(thumbSize * 2 + 24, 220), 420);

  return (
    <aside
      className="group relative shrink-0 max-w-full rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm"
      style={{ height: `${height}px`, width: `${columnWidth}px` }}
    >
      <div ref={scrollRef} className="h-full overflow-y-auto hide-scrollbar cursor-pointer">
        <div className="grid w-full grid-cols-2 auto-rows-max justify-items-center gap-3">
          {frontBackSrc && (
            <>
              <button
                type="button"
                onClick={() => onSelect(frontBackSrc, { side: 'front' })}
                className={`group relative block w-full aspect-square rounded-lg overflow-hidden border transition-all duration-200 cursor-pointer ${
                  activeSide === 'front'
                    ? 'border-violet-400/70 ring-2 ring-violet-400/60'
                    : 'border-white/15 hover:border-white/30 hover:ring-2 hover:ring-violet-400/60'
                }`}
                title={dictionary.sample.front}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/split?url=${encodeURIComponent(frontBackSrc)}&side=front&spine=0.02`}
                  alt={dictionary.sample.front}
                  className="h-full w-full object-cover object-top"
                  loading="lazy"
                />
                <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10 group-hover:ring-white/25" />
              </button>
              <button
                type="button"
                onClick={() => onSelect(frontBackSrc, { side: 'back' })}
                className={`group relative block w-full aspect-square rounded-lg overflow-hidden border transition-all duration-200 cursor-pointer ${
                  activeSide === 'back'
                    ? 'border-violet-400/70 ring-2 ring-violet-400/60'
                    : 'border-white/15 hover:border-white/30 hover:ring-2 hover:ring-violet-400/60'
                }`}
                title={dictionary.sample.back}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/split?url=${encodeURIComponent(frontBackSrc)}&side=back&spine=0.02`}
                  alt={dictionary.sample.back}
                  className="h-full w-full object-cover object-top"
                  loading="lazy"
                />
                <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10 group-hover:ring-white/25" />
              </button>
            </>
          )}
          {images.map((item, i) => {
            const src = toDisplaySrc(item.url);
            const isActive = activeUrl === item.url;
            const objectPos = item.portrait ? 'object-top' : 'object-center';
            return (
              <button
                key={`${item.url}-${i}`}
                type="button"
                onClick={() => onSelect(item.url)}
                className={`group relative block w-full aspect-square rounded-lg overflow-hidden border transition-all duration-200 cursor-pointer ${
                  isActive ? 'border-violet-400/70 ring-2 ring-violet-400/60' : 'border-white/15 hover:border-white/30 hover:ring-2 hover:ring-violet-400/60'
                }`}
                title={dictionary.sample.view}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={dictionary.sample.view} className={`h-full w-full object-cover ${objectPos}`} loading="lazy" />
                <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10 group-hover:ring-white/25" />
              </button>
            );
          })}
        </div>
      </div>
      {hasAbove && <div className="pointer-events-none absolute top-0 left-0 right-0 h-14 bg-gradient-to-b from-black/25 to-transparent rounded-t-xl" />}
      {hasMore && <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-black/25 to-transparent rounded-b-xl" />}
      {hasMore && (
        <button
          type="button"
          onClick={() => {
            const first = scrollRef.current?.querySelector('button') as HTMLElement | null;
            const step = first?.offsetWidth ? first.offsetWidth + 12 : (thumbSize || 120) + 12;
            scrollRef.current?.scrollBy({ top: step, behavior: 'smooth' });
          }}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 h-9 w-9 rounded-full bg-black/35 text-white/80 border border-white/20 backdrop-blur-sm hover:bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto cursor-pointer transition-opacity"
          title={dictionary.sample.more}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      )}
      {hasAbove && (
        <button
          type="button"
          onClick={() => {
            const first = scrollRef.current?.querySelector('button') as HTMLElement | null;
            const step = first?.offsetWidth ? first.offsetWidth + 12 : (thumbSize || 120) + 12;
            scrollRef.current?.scrollBy({ top: -step, behavior: 'smooth' });
          }}
          className="absolute top-2 left-1/2 -translate-x-1/2 z-10 h-9 w-9 rounded-full bg-black/35 text-white/80 border border-white/20 backdrop-blur-sm hover:bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto cursor-pointer transition-opacity"
          title={dictionary.sample.backToTop}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 15 12 9 18 15"/></svg>
        </button>
      )}
    </aside>
  );
});

export default Sample;
