"use client";

import Image from "next/image";
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

export type MediaSlide =
  | {
      type: "poster";
      side: "front" | "back";
      url: string;
      displayUrl: string;
      portrait: boolean;
      label: string;
      zoomUrl?: string;
    }
  | {
      type: "image";
      url: string;
      displayUrl: string;
      portrait: boolean;
      zoomUrl?: string;
    }
  | {
      type: "video";
      url: string;
      displayUrl: string;
      zoomUrl?: string;
    };

type Props = {
  slides: MediaSlide[];
  width: number;
  height: number;
  initialIndex?: number;
  onSlideChange?: (slide: MediaSlide, index: number) => void;
  onRequestZoom?: (index: number, slide: MediaSlide) => void;
  disableKeyboardNavigation?: boolean;
};

const MediaCarousel = React.forwardRef<HTMLDivElement, Props>(
  function MediaCarousel(
    {
      slides,
      width,
      height,
      initialIndex = 0,
      onSlideChange,
      onRequestZoom,
      disableKeyboardNavigation = false,
    },
    ref,
  ) {
    const [index, setIndex] = useState(initialIndex);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const rootRef = useRef<HTMLDivElement | null>(null);

    useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

    const total = slides.length;
    const current = useMemo(() => slides[index] ?? null, [slides, index]);
    const [isActive, setIsActive] = useState(false);
    const syncingRef = useRef(false);
    const lastInitialRef = useRef(initialIndex);
    const canZoom = current?.type !== "video";
    const openCurrent = useCallback(() => {
      if (!canZoom || !onRequestZoom) return;
      onRequestZoom(index, current);
    }, [canZoom, current, index, onRequestZoom]);

    const handleMouseEnter = useCallback(() => setIsActive(true), []);
    const handleMouseLeave = useCallback(() => setIsActive(false), []);
    const handleFocusCapture = useCallback(() => setIsActive(true), []);
    const handleBlurCapture = useCallback(
      (event: React.FocusEvent<HTMLDivElement>) => {
        const next = event.relatedTarget as Node | null;
        if (!next || !event.currentTarget.contains(next)) {
          setIsActive(false);
        }
      },
      [],
    );

    useEffect(() => {
      if (!total) return;
      if (lastInitialRef.current === initialIndex) return;
      lastInitialRef.current = initialIndex;
      const safeIndex = Math.min(initialIndex, total - 1);
      if (safeIndex === index) return;
      syncingRef.current = true;
      setIndex(safeIndex);
    }, [initialIndex, total, index]);

    useEffect(() => {
      if (!total) return;
      if (index < total) return;
      syncingRef.current = true;
      setIndex(Math.max(0, total - 1));
    }, [total, index]);

    useEffect(() => {
      if (!current || !onSlideChange) return;
      if (syncingRef.current) {
        syncingRef.current = false;
        return;
      }
      onSlideChange(current, index);
    }, [current, index, onSlideChange]);

    useEffect(() => {
      const el = videoRef.current;
      if (!current || current.type !== "video") {
        if (el) {
          el.pause();
          el.currentTime = 0;
        }
        return;
      }
      if (!el) return;
      const play = () => {
        try {
          const maybePromise = el.play();
          if (maybePromise && typeof maybePromise.then === "function") {
            maybePromise.catch(() => {});
          }
        } catch {
          // ignore autoplay failure
        }
      };
      el.currentTime = 0;
      play();
    }, [current]);

    const goTo = useCallback(
      (next: number) => {
        if (!total) return;
        const clamped = Math.min(Math.max(next, 0), total - 1);
        setIndex(clamped);
      },
      [total],
    );

    const step = useCallback(
      (delta: number) => {
        if (!total) return;
        setIndex((prev) => {
          const next = Math.min(Math.max(prev + delta, 0), total - 1);
          return next;
        });
      },
      [total],
    );

    const handleKey = useCallback(
      (event: KeyboardEvent) => {
        if (!total || total < 2 || disableKeyboardNavigation) return;
        const target = event.target as HTMLElement | null;
        if (target) {
          const tag = target.tagName;
          if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable)
            return;
        }
        if (event.key === "ArrowLeft" && index > 0) {
          event.preventDefault();
          step(-1);
        } else if (event.key === "ArrowRight" && index < total - 1) {
          event.preventDefault();
          step(1);
        }
      },
      [disableKeyboardNavigation, index, step, total],
    );

    useEffect(() => {
      if (!total || disableKeyboardNavigation) return;
      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    }, [disableKeyboardNavigation, handleKey, total]);

    if (!total || !current) {
      return null;
    }

    const renderMedia = () => {
      if (current.type === "video") {
        return (
          <video
            key={`video-${current.url}`}
            ref={(el) => {
              videoRef.current = el;
            }}
            src={current.displayUrl}
            className="h-full w-full object-contain"
            controls
            muted
            playsInline
            autoPlay
          />
        );
      }
      return (
        <Image
          key={`img-${current.url}`}
          src={current.displayUrl}
          alt="preview"
          fill
          unoptimized
          draggable={false}
          sizes="(max-width: 1024px) 90vw, 70vw"
          className="object-contain select-none"
        />
      );
    };

    return (
      <div ref={rootRef} className="relative w-full">
        {/* biome-ignore lint/a11y/noStaticElementInteractions: hover handlers manage control visibility */}
        <div
          className={`relative flex items-center justify-center overflow-hidden rounded-[28px] border border-white/15 bg-black/35 p-4 shadow-[0_40px_120px_-45px_rgba(0,0,0,0.85)] backdrop-blur-xl transition-colors hover:border-violet-200/60 ${
            canZoom ? "cursor-zoom-in" : "cursor-default"
          }`}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            maxWidth: "100%",
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onFocusCapture={handleFocusCapture}
          onBlurCapture={handleBlurCapture}
        >
          {canZoom ? (
            <button
              type="button"
              aria-label="Open media in fullscreen"
              className="absolute inset-0 z-20 cursor-zoom-in bg-transparent"
              onClick={openCurrent}
            >
              <span className="sr-only">Open media in fullscreen</span>
            </button>
          ) : null}
          <div className="absolute inset-0 z-0">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/10 opacity-60" />
          </div>
          <div className="relative z-10 flex h-full w-full items-center justify-center">
            {renderMedia()}
          </div>

          {total > 1 && (
            <div
              className={`pointer-events-none absolute inset-0 z-30 flex items-center justify-between px-3 transition-opacity duration-300 ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
            >
              <button
                type="button"
                className={`pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white/90 backdrop-blur-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                  index === 0
                    ? "cursor-not-allowed bg-black/25 opacity-50"
                    : "cursor-pointer bg-black/45 hover:bg-black/60"
                }`}
                disabled={index === 0}
                onClick={(event) => {
                  event.stopPropagation();
                  if (index === 0) return;
                  step(-1);
                }}
                aria-label="Previous"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <title>Previous</title>
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                className={`pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white/90 backdrop-blur-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                  index >= total - 1
                    ? "cursor-not-allowed bg-black/25 opacity-50"
                    : "cursor-pointer bg-black/45 hover:bg-black/60"
                }`}
                disabled={index >= total - 1}
                onClick={(event) => {
                  event.stopPropagation();
                  if (index >= total - 1) return;
                  step(1);
                }}
                aria-label="Next"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <title>Next</title>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          )}

          <div
            className={`pointer-events-none absolute top-4 right-4 z-30 rounded-full bg-black/55 px-4 py-1 text-sm font-medium text-white/90 backdrop-blur-md transition-opacity duration-300 ${
              isActive ? "opacity-100" : "opacity-0"
            }`}
          >
            {index + 1}/{total}
          </div>

          {total > 1 && (
            <div className="pointer-events-none absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2">
              <div className="relative flex gap-2 rounded-full px-3 py-1.5 pointer-events-auto">
                <span
                  className={`pointer-events-none absolute inset-0 rounded-full border border-white/15 bg-black/45 backdrop-blur-md shadow-[0_10px_30px_-20px_rgba(15,23,42,0.8)] transition-opacity duration-200 ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                />
                {slides.map((slide, slideIndex) => {
                  const isActive = slideIndex === index;
                  return (
                    <button
                      key={`${slide.type}-${slide.url}-${slideIndex}`}
                      type="button"
                      className={`relative z-10 h-2.5 w-2.5 rounded-full transition cursor-pointer focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none ${
                        isActive
                          ? "bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.35)]"
                          : "bg-white/30 hover:bg-white/50"
                      }`}
                      onClick={(event) => {
                        event.stopPropagation();
                        goTo(slideIndex);
                      }}
                      aria-label={`Go to ${slideIndex + 1}`}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

export default MediaCarousel;
