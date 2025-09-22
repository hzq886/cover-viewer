"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { MediaSlide } from "./MediaCarousel";

type Props = {
  open: boolean;
  onClose: (finalIndex?: number) => void;
  slides: MediaSlide[];
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
};

export default function ZoomModal({
  open,
  onClose,
  slides,
  initialIndex = 0,
  onIndexChange,
}: Props) {
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(initialIndex);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const total = slides.length;
  // Crossfade state for image transitions
  const lastSlideRef = useRef<MediaSlide | null>(null);
  const [prevImage, setPrevImage] = useState<MediaSlide | null>(null);
  const [animating, setAnimating] = useState(false);
  const [showNew, setShowNew] = useState(true);

  useEffect(() => {
    if (open && total) {
      const safeIndex = Math.min(initialIndex, total - 1);
      setIndex(safeIndex);
      // Avoid crossfade on initial open
      lastSlideRef.current = slides[safeIndex] ?? null;
      setShowNew(true);
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

  useEffect(
    () => () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    },
    [],
  );

  const current = useMemo(() => slides[index] ?? null, [slides, index]);

  // Mirror MediaCarousel's stronger transition for images
  useLayoutEffect(() => {
    const prev = lastSlideRef.current;
    if (!prev || !current) {
      lastSlideRef.current = current;
      return;
    }
    if (prev === current) {
      lastSlideRef.current = current;
      return;
    }
    if (prev.type !== "video" && current.type !== "video") {
      setPrevImage(prev);
      setAnimating(true);
      setShowNew(false);
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setShowNew(true));
      });
      const timer = window.setTimeout(() => {
        setAnimating(false);
        setPrevImage(null);
      }, 750);
      lastSlideRef.current = current;
      return () => {
        cancelAnimationFrame(raf1);
        if (raf2) cancelAnimationFrame(raf2);
        clearTimeout(timer);
      };
    }
    setPrevImage(null);
    setAnimating(false);
    setShowNew(false);
    lastSlideRef.current = current;
  }, [current]);

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
      if (event.key === "ArrowLeft" && index > 0) {
        event.preventDefault();
        setIndex((prev) => Math.max(prev - 1, 0));
      } else if (event.key === "ArrowRight" && index < total - 1) {
        event.preventDefault();
        setIndex((prev) => Math.min(prev + 1, total - 1));
      }
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [rendered, total, handleClose, index]);

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
    transform: visible
      ? "translateY(0px) scale(1)"
      : "translateY(18px) scale(0.94)",
    transition:
      "opacity 300ms cubic-bezier(0.22,1,0.36,1), transform 300ms cubic-bezier(0.22,1,0.36,1)",
  } as const;

  const videoClass = "h-full w-auto max-w-full object-contain select-none";
  const imageClass = "object-contain select-none";

  const renderMedia = () => {
    const displaySrc = current.zoomUrl || current.displayUrl;
    if (current.type === "video") {
      return (
        <video
          key={`modal-video-${current.url}`}
          ref={(el) => {
            videoRef.current = el;
          }}
          src={displaySrc}
          className={videoClass}
          controls
          muted
          playsInline
          autoPlay
        />
      );
    }
    return (
      <div className="relative h-full w-full">
        {prevImage && animating && prevImage.type !== "video" ? (
          <Image
            key={`modal-prev-${prevImage.url}`}
            src={prevImage.zoomUrl || prevImage.displayUrl}
            alt="previous"
            fill
            unoptimized
            sizes="100vw"
            draggable={false}
            className={`object-contain select-none filter transition-all duration-500 ease-out ${
              showNew
                ? "opacity-0 scale-92 blur-sm brightness-90"
                : "opacity-100 scale-100 blur-0 brightness-100"
            }`}
          />
        ) : null}
        <Image
          key={`modal-image-${current.url}`}
          src={displaySrc}
          alt="zoomed"
          fill
          unoptimized
          sizes="100vw"
          draggable={false}
          className={`object-contain select-none filter transition-all duration-500 ease-out ${
            showNew
              ? "opacity-100 scale-100 blur-0 brightness-100"
              : "opacity-0 scale-110 blur-sm brightness-110"
          }`}
        />
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl"
      style={overlayStyle}
    >
      <button
        type="button"
        aria-label="Close zoom viewer"
        className="absolute inset-0 z-10 cursor-zoom-out bg-transparent"
        onClick={handleClose}
      />
      <div
        className="relative z-20 flex h-full w-full items-center justify-center"
        style={cardStyle}
      >
        {total > 1 && (
          <button
            type="button"
            className={`absolute left-6 top-1/2 z-40 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 text-white/90 backdrop-blur-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
              index === 0
                ? "cursor-not-allowed bg-black/25 opacity-50"
                : "cursor-pointer bg-black/45 hover:bg-black/60"
            }`}
            disabled={index === 0}
            onClick={(event) => {
              event.stopPropagation();
              if (index === 0) return;
              setIndex((prev) => Math.max(prev - 1, 0));
            }}
            aria-label="Previous"
          >
            <svg
              width="26"
              height="26"
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
        )}

        {total > 1 && (
          <button
            type="button"
            className={`absolute right-6 top-1/2 z-40 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 text-white/90 backdrop-blur-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
              index >= total - 1
                ? "cursor-not-allowed bg-black/25 opacity-50"
                : "cursor-pointer bg-black/45 hover:bg-black/60"
            }`}
            disabled={index >= total - 1}
            onClick={(event) => {
              event.stopPropagation();
              if (index >= total - 1) return;
              setIndex((prev) => Math.min(prev + 1, total - 1));
            }}
            aria-label="Next"
          >
            <svg
              width="26"
              height="26"
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
        )}

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleClose();
          }}
          className="absolute left-6 top-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white/90 backdrop-blur-md transition hover:bg-black/70 cursor-pointer"
          aria-label="Close"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <title>Close</title>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="pointer-events-none absolute right-6 top-6 z-40 rounded-full bg-black/60 px-4 py-1 text-sm font-medium text-white/90 backdrop-blur-md">
          {index + 1}/{total}
        </div>

        {total > 1 && (
          <div className="pointer-events-none absolute bottom-6 left-1/2 z-40 flex -translate-x-1/2">
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

        <button
          type="button"
          className="flex h-full w-full cursor-zoom-out items-center justify-center bg-transparent"
          onClick={(event) => {
            event.stopPropagation();
            handleClose();
          }}
          aria-label="Close zoom viewer"
        >
          {renderMedia()}
        </button>
      </div>
    </div>
  );
}
