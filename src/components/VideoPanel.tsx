"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import type { APITypes, PlyrOptions } from "plyr-react";
import "plyr-react/plyr.css";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useI18n } from "@/i18n/I18nProvider";

const Plyr = dynamic(() => import("plyr-react").then((mod) => mod.default), {
  ssr: false,
});

export const VIDEO_MIN_WIDTH = 720;
export const VIDEO_MIN_HEIGHT = 480;
const DEFAULT_VOLUME = 0.7;
const VIDEO_ASPECT_RATIO = VIDEO_MIN_HEIGHT / VIDEO_MIN_WIDTH;

type PromiseLikeValue<_T = unknown> = { then?: unknown } & object;

type PlyrLike = {
  togglePlay?: () => void;
  playing?: boolean;
};

type Props = {
  videoUrl: string;
  posterUrl?: string;
  width?: number;
  height?: number;
  active?: boolean;
  onActivate?: () => void;
  onDeactivate?: () => void;
  layout?: "panel" | "inline";
};

const normalizeVideoSrc = (url: string) =>
  url.startsWith("/api/") ? url : `/api/proxy?url=${encodeURIComponent(url)}`;

const isPromise = (value: unknown): value is Promise<unknown> =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as PromiseLikeValue).then === "function";

const getTogglePlay = (value: unknown): (() => void) | undefined => {
  if (!value || typeof value !== "object") return undefined;
  const candidate = value as PlyrLike;
  return typeof candidate.togglePlay === "function"
    ? candidate.togglePlay
    : undefined;
};

const isPlyrPlaying = (value: unknown): boolean =>
  Boolean(value && typeof value === "object" && (value as PlyrLike).playing);

export default function VideoPanel({
  videoUrl,
  posterUrl,
  width,
  height,
  active = false,
  onActivate,
  onDeactivate,
  layout = "panel",
}: Props) {
  const { dictionary } = useI18n();
  const videoText = dictionary.video;
  const playTitle = dictionary.infoPanel.play;
  const playerRef = useRef<APITypes | null>(null);
  const isInline = layout === "inline";
  const panelActive = isInline ? true : active;
  const activeRef = useRef(panelActive);
  const initializedRef = useRef(false);
  const lastVideoUrlRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    activeRef.current = panelActive;
  }, [panelActive]);

  const handleKey = useCallback(
    (event: KeyboardEvent) => {
      if (!activeRef.current) return;
      if (event.defaultPrevented) return;
      const target = event.target as HTMLElement | null;
      if (target) {
        const tagName = target.tagName;
        const isEditable = target.isContentEditable;
        const isFormField =
          isEditable ||
          tagName === "INPUT" ||
          tagName === "TEXTAREA" ||
          tagName === "SELECT" ||
          tagName === "BUTTON";
        if (isFormField && event.key !== "Escape") {
          return;
        }
      }
      const instance = playerRef.current?.plyr;
      if (!instance) return;
      if (event.key === "Escape") {
        event.preventDefault();
        onDeactivate?.();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        if (typeof instance.rewind === "function") {
          instance.rewind(5);
        } else if (typeof instance.currentTime === "number") {
          instance.currentTime = Math.max(0, instance.currentTime - 5);
        }
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        if (typeof instance.forward === "function") {
          instance.forward(5);
        } else if (
          typeof instance.currentTime === "number" &&
          typeof instance.duration === "number"
        ) {
          instance.currentTime = Math.min(
            instance.duration || 0,
            instance.currentTime + 5,
          );
        }
      } else if (event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        const toggle = getTogglePlay(instance);
        if (toggle) {
          toggle();
          return;
        }
        if (
          typeof instance.play === "function" &&
          typeof instance.pause === "function"
        ) {
          if (isPlyrPlaying(instance)) {
            instance.pause();
          } else {
            const result = instance.play();
            if (isPromise(result)) result.catch(() => {});
          }
        }
      }
    },
    [onDeactivate],
  );

  useEffect(() => {
    if (!panelActive) return;
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [panelActive, handleKey]);

  useEffect(() => {
    const api = playerRef.current;
    const instance = api?.plyr;
    const shouldActivate = isInline || panelActive;

    if (!shouldActivate) {
      initializedRef.current = false;
      lastVideoUrlRef.current = undefined;
      if (instance && typeof instance.pause === "function") {
        instance.pause();
      }
      return;
    }

    let cancelled = false;

    const applyDefaults = (plyrInstance: typeof instance) => {
      if (!plyrInstance) return;
      const shouldInit =
        !initializedRef.current || lastVideoUrlRef.current !== videoUrl;
      if (!shouldInit) return;
      initializedRef.current = true;
      lastVideoUrlRef.current = videoUrl;
      plyrInstance.muted = true;
      plyrInstance.volume = DEFAULT_VOLUME;
      plyrInstance.speed = 1;
      if (typeof plyrInstance.play === "function") {
        const result = plyrInstance.play();
        if (isPromise(result)) result.catch(() => {});
      }
    };

    const ensureReady = () => {
      if (cancelled) return;
      const current = playerRef.current?.plyr;
      if (!current) {
        requestAnimationFrame(ensureReady);
        return;
      }
      applyDefaults(current);
    };

    ensureReady();

    return () => {
      cancelled = true;
    };
  }, [panelActive, videoUrl, isInline]);

  const proxiedUrl = useMemo(() => normalizeVideoSrc(videoUrl), [videoUrl]);

  const source = useMemo(() => {
    if (!proxiedUrl) return null;
    return {
      type: "video" as const,
      sources: [
        {
          src: proxiedUrl,
          type: "video/mp4",
          size: 720,
        },
      ],
    };
  }, [proxiedUrl]);

  const options: PlyrOptions = useMemo(
    () => ({
      autoplay: true,
      muted: true,
      ratio: `${VIDEO_MIN_WIDTH}:${VIDEO_MIN_HEIGHT}`,
      seekTime: 5,
      volume: DEFAULT_VOLUME,
      tooltips: { controls: true, seek: true },
      storage: { enabled: false },
      controls: [
        "play-large",
        "play",
        "progress",
        "current-time",
        "duration",
        "mute",
        "volume",
        "settings",
        "airplay",
        "fullscreen",
      ],
      settings: ["speed", "quality"],
      speed: { selected: 1, options: [1, 1.5, 2] },
    }),
    [],
  );

  if (isInline) {
    const inlineStyle: CSSProperties = {
      width: width ? `${width}px` : "100%",
      height: height ? `${height}px` : "100%",
    };
    return (
      <div className="inline-video-player h-full w-full" style={inlineStyle}>
        {source ? (
          <Plyr ref={playerRef} source={source} options={options} />
        ) : null}
      </div>
    );
  }

  const baseWidth = width ?? VIDEO_MIN_WIDTH;
  const baseHeight = height ?? Math.round(baseWidth * VIDEO_ASPECT_RATIO);
  const effectiveWidth = panelActive
    ? Math.max(baseWidth, VIDEO_MIN_WIDTH)
    : baseWidth;
  const activeHeight = Math.round(effectiveWidth * VIDEO_ASPECT_RATIO);
  const effectiveHeight = panelActive
    ? Math.max(VIDEO_MIN_HEIGHT, activeHeight)
    : baseHeight;

  const cardStyle: CSSProperties = {
    width: `${effectiveWidth}px`,
    height: `${effectiveHeight}px`,
    maxWidth: "100%",
    transition: "width 0.45s ease, height 0.45s ease",
  };

  if (panelActive) {
    cardStyle.minWidth = `${VIDEO_MIN_WIDTH}px`;
    cardStyle.minHeight = `${VIDEO_MIN_HEIGHT}px`;
    cardStyle.aspectRatio = `${VIDEO_MIN_WIDTH} / ${VIDEO_MIN_HEIGHT}`;
  }

  if (!panelActive) {
    return (
      <button
        type="button"
        onClick={() => onActivate?.()}
        className="relative flex w-full select-none flex-col items-center justify-center overflow-hidden rounded-[28px] border border-white/15 bg-black/35 p-6 text-slate-200 shadow-[0_40px_120px_-45px_rgba(0,0,0,0.85)] backdrop-blur-xl transition hover:border-violet-200/60 hover:bg-black/45 cursor-pointer"
        style={cardStyle}
        aria-label={videoText.activateAria}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/10 opacity-60" />
        <div className="relative z-10 flex flex-col items-center gap-3 text-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white/90">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <title>{playTitle}</title>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <span className="text-base font-medium text-white/90">
            {videoText.activate}
          </span>
        </div>
        {posterUrl && (
          <Image
            src={posterUrl}
            alt={videoText.previewAlt}
            fill
            unoptimized
            sizes="(max-width: 1024px) 90vw, 70vw"
            className="absolute inset-0 -z-10 object-cover opacity-40"
          />
        )}
      </button>
    );
  }

  return (
    <div
      className="relative flex w-full overflow-hidden rounded-[28px] border border-white/15 bg-black/35 p-4 shadow-[0_40px_120px_-45px_rgba(0,0,0,0.85)] backdrop-blur-xl"
      style={cardStyle}
    >
      {onDeactivate ? (
        <button
          type="button"
          onClick={onDeactivate}
          className="absolute left-4 top-4 z-30 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/55 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md transition hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 cursor-pointer"
          aria-label={videoText.backToPreview}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
            <line x1="9" y1="12" x2="21" y2="12" />
          </svg>
          <span>{videoText.back}</span>
        </button>
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/10 opacity-60" />
      <div className="relative z-10 flex h-full w-full flex-col">
        <div className="pointer-events-none absolute inset-0" />
        <div className="flex flex-1 items-center justify-center">
          {source ? (
            <div className="inline-video-player h-full w-full">
              <Plyr ref={playerRef} source={source} options={options} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
