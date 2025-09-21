"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MediaSlide } from "./MediaCarousel";

type Props = {
  open: boolean;
  onClose: (finalIndex?: number) => void;
  slides: MediaSlide[];
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
};

export default function ZoomModal({ open, onClose, slides, initialIndex = 0, onIndexChange }: Props) {
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(initialIndex);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const total = slides.length;

  useEffect(() => {
    if (open && total) {
      const safeIndex = Math.min(initialIndex, total - 1);
      setIndex(safeIndex);
      setRendered(true);
      requestAnimationFrame(() => setVisible(true));
      return;
    }

    if (!open) {
      setVisible(false);
      const timer = setTimeout(() => setRendered(false), 220);
      return () => clearTimeout(timer);
    }
  }, [open, total, initialIndex]);

  const handleClose = useCallback(() => {
    setVisible(false);
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      onClose(index);
    }, 200);
  }, [index, onClose]);

  useEffect(() => () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const current = useMemo(() => slides[index] ?? null, [slides, index]);

  useEffect(() => {
    onIndexChange?.(index);
  }, [index, onIndexChange]);

  useEffect(() => {
    if (!rendered) return;
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
        return;
      }
      if (total < 2) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setIndex((prev) => (prev - 1 + total) % total);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setIndex((prev) => (prev + 1) % total);
      }
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [rendered, total, handleClose]);

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
    try {
      const maybePromise = el.play();
      if (maybePromise && typeof maybePromise.then === "function") {
        maybePromise.catch(() => {});
      }
    } catch {
      // ignore
    }
  }, [current]);

  if (!rendered || !current) return null;

  const overlayStyle = {
    opacity: visible ? 1 : 0,
    transition: "opacity 260ms cubic-bezier(0.22,1,0.36,1)",
  } as const;

  const cardStyle = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0px) scale(1)" : "translateY(18px) scale(0.94)",
    transition: "opacity 300ms cubic-bezier(0.22,1,0.36,1), transform 300ms cubic-bezier(0.22,1,0.36,1)",
  } as const;

  const renderMedia = () => {
    if (current.type === "video") {
      return (
        <video
          key={`modal-video-${current.url}`}
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
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={`modal-image-${current.url}`}
        src={current.displayUrl}
        alt="zoomed"
        className="h-full w-full object-contain select-none"
        draggable={false}
      />
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-6"
      style={overlayStyle}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="group relative w-[92vw] max-w-5xl" style={cardStyle}>
        <button
          type="button"
          onClick={handleClose}
          className="absolute left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white/90 backdrop-blur-md transition hover:bg-black/70"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[32px]" style={{ height: "min(80vh, 760px)" }}>
          <div className="flex h-full w-full items-center justify-center">
            {renderMedia()}
          </div>

          {total > 1 && (
            <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-30 flex items-center justify-between px-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
              <button
                type="button"
                className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white/90 backdrop-blur-md transition hover:bg-black/60 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                onClick={(event) => {
                  event.stopPropagation();
                  setIndex((prev) => (prev - 1 + total) % total);
                }}
                aria-label="Previous"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white/90 backdrop-blur-md transition hover:bg-black/60 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                onClick={(event) => {
                  event.stopPropagation();
                  setIndex((prev) => (prev + 1) % total);
                }}
                aria-label="Next"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          )}

          <div className="pointer-events-none absolute right-6 top-6 z-30 rounded-full bg-black/60 px-4 py-1 text-sm font-medium text-white/90 backdrop-blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
            {index + 1}/{total}
          </div>

          {total > 1 && (
            <div className="pointer-events-none absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2">
              <div className="group/dots relative flex gap-2 rounded-full px-3 py-1.5 pointer-events-auto">
                <span className="pointer-events-none absolute inset-0 rounded-full border border-white/15 bg-black/45 backdrop-blur-md shadow-[0_14px_40px_-24px_rgba(15,23,42,0.85)] opacity-0 transition-opacity duration-200 group-hover/dots:opacity-100 group-focus-within/dots:opacity-100" />
                {slides.map((slide, slideIndex) => {
                  const isActive = slideIndex === index;
                  return (
                    <button
                      key={`${slide.type}-${slide.url}-modal-${slideIndex}`}
                      type="button"
                      className={`relative z-10 h-2.5 w-2.5 rounded-full transition cursor-pointer focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none ${
                        isActive
                          ? "bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.35)]"
                          : "bg-white/35 hover:bg-white/55"
                      }`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setIndex(slideIndex);
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
    </div>
  );
}
