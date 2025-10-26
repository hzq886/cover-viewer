"use client";

import Image from "next/image";
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useI18n } from "@/i18n/I18nProvider";
import VideoPanel from "./VideoPanel";

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

const PosterPanel = React.forwardRef<HTMLDivElement, Props>(
  function PosterPanel(
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
    const { dictionary, t } = useI18n();
    const posterText = dictionary.posterPanel;
    const [index, setIndex] = useState(initialIndex);
    const rootRef = useRef<HTMLDivElement | null>(null);

    useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

    const total = slides.length;
    const current = useMemo(() => slides[index] ?? null, [slides, index]);
    const lastSlideRef = useRef<MediaSlide | null>(null);
    const [prevImage, setPrevImage] = useState<MediaSlide | null>(null);
    const [animating, setAnimating] = useState(false);
    // Start true to avoid initial mount flicker
    const [showNew, setShowNew] = useState(true);
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

    // Smooth transition between images (poster/image types)
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
        // Double rAF to ensure styles apply before transitioning
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
      // Fallback for video or mixed transitions: no crossfade
      setPrevImage(null);
      setAnimating(false);
      setShowNew(true);
      lastSlideRef.current = current;
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
          <VideoPanel
            layout="inline"
            videoUrl={current.displayUrl}
            width={width}
            height={height}
          />
        );
      }
      return (
        <Image
          key={`img-${current.url}`}
          src={current.displayUrl}
          alt={posterText.currentAlt}
          fill
          unoptimized
          draggable={false}
          sizes="(max-width: 1024px) 90vw, 70vw"
          className="poster-panel__static"
        />
      );
    };

    return (
      <div
        ref={rootRef}
        className="poster-panel"
        style={{ width, height }}
        data-active={isActive ? "true" : "false"}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocusCapture={handleFocusCapture}
        onBlurCapture={handleBlurCapture}
      >
        {canZoom ? (
          <button
            type="button"
            className="poster-panel__zoom"
            aria-label={posterText.openFullscreenAria}
            onClick={openCurrent}
          >
            <span className="sr-only">{posterText.openFullscreen}</span>
          </button>
        ) : null}
        <div className="poster-panel__media">
          {current.type === "video" ? (
            renderMedia()
          ) : (
            <div className="poster-panel__image">
              {prevImage && animating && prevImage.type !== "video" ? (
                <Image
                  key={`prev-${prevImage.url}`}
                  src={prevImage.displayUrl}
                  alt={posterText.previousAlt}
                  fill
                  unoptimized
                  draggable={false}
                  sizes="100vw"
                  className={`poster-panel__image-layer ${
                    showNew ? "poster-panel__image-layer--outgoing" : ""
                  }`}
                />
              ) : null}
              <Image
                key={`img-${current.url}`}
                src={current.displayUrl}
                alt={posterText.currentAlt}
                fill
                unoptimized
                draggable={false}
                sizes="100vw"
                className={`poster-panel__image-layer ${
                  showNew ? "poster-panel__image-layer--incoming" : ""
                }`}
              />
            </div>
          )}
        </div>
        {total > 1 ? (
          <div className="poster-panel__nav">
            <button
              type="button"
              className="poster-panel__arrow"
              disabled={index === 0}
              onClick={(event) => {
                event.stopPropagation();
                if (index === 0) return;
                step(-1);
              }}
              aria-label={posterText.previous}
            >
              ‹
            </button>
            <button
              type="button"
              className="poster-panel__arrow"
              disabled={index >= total - 1}
              onClick={(event) => {
                event.stopPropagation();
                if (index >= total - 1) return;
                step(1);
              }}
              aria-label={posterText.next}
            >
              ›
            </button>
          </div>
        ) : null}
        <div className="poster-panel__counter">
          {index + 1}/{total}
        </div>
        {total > 1 && current.type !== "video" ? (
          <div className="poster-panel__dots">
            {slides.map((slide, slideIndex) => {
              const active = slideIndex === index;
              const isVideo = slide.type === "video";
              return (
                <button
                  key={`${slide.type}-${slide.url}-${slideIndex}`}
                  type="button"
                  className={`poster-panel__dot ${
                    active ? "poster-panel__dot--active" : ""
                  } ${
                    isVideo ? "poster-panel__dot--video" : ""
                  }`}
                  onClick={(event) => {
                    event.stopPropagation();
                    goTo(slideIndex);
                  }}
                  aria-label={t("posterPanel.goTo", {
                    index: slideIndex + 1,
                  })}
                >
                  {isVideo ? (
                    <span aria-hidden className="poster-panel__dot-icon">
                      ▶
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  },
);

export default PosterPanel;
