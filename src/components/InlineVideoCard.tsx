"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import type { APITypes, PlyrOptions } from "plyr-react";
import "plyr-react/plyr.css";
import { useCallback, useEffect, useMemo, useRef } from "react";

const Plyr = dynamic(() => import("plyr-react").then((mod) => mod.default), {
  ssr: false,
});

const DEFAULT_VOLUME = 0.7;
const VIDEO_MIN_WIDTH = 720;
const VIDEO_MIN_HEIGHT = 480;

type PromiseLikeValue<_T = unknown> = { then?: unknown } & object;

type PlyrLike = {
  togglePlay?: () => void;
  playing?: boolean;
};

type Props = {
  videoUrl: string;
  posterUrl?: string;
  width: number;
  height: number;
  active: boolean;
  onActivate: () => void;
  onDeactivate?: () => void;
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

export default function InlineVideoCard({
  videoUrl,
  posterUrl,
  width,
  height,
  active,
  onActivate,
  onDeactivate,
}: Props) {
  const playerRef = useRef<APITypes | null>(null);
  const activeRef = useRef(active);
  const initializedRef = useRef(false);
  const lastVideoUrlRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const handleKey = useCallback(
    (event: KeyboardEvent) => {
      if (!activeRef.current) return;
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
    if (!active) return;
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [active, handleKey]);

  useEffect(() => {
    const api = playerRef.current;
    const instance = api?.plyr;

    if (!active) {
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
  }, [active, videoUrl]);

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
      ratio: "16:9",
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

  const cardStyle: React.CSSProperties = {
    width: `${width}px`,
    height: `${height}px`,
    maxWidth: "100%",
    transition: "width 0.45s ease, height 0.45s ease",
  };

  if (active) {
    cardStyle.minWidth = `${VIDEO_MIN_WIDTH}px`;
    cardStyle.minHeight = `${VIDEO_MIN_HEIGHT}px`;
  }

  if (!active) {
    return (
      <button
        type="button"
        onClick={onActivate}
        className="relative flex w-full select-none flex-col items-center justify-center overflow-hidden rounded-[28px] border border-white/15 bg-black/35 p-6 text-slate-200 shadow-[0_40px_120px_-45px_rgba(0,0,0,0.85)] backdrop-blur-xl transition hover:border-violet-200/60 hover:bg-black/45 cursor-pointer"
        style={cardStyle}
        aria-label="Activate video preview"
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
              <title>播放</title>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <span className="text-base font-medium text-white/90">
            点击播放视频
          </span>
        </div>
        {posterUrl && (
          <Image
            src={posterUrl}
            alt="video preview"
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
          aria-label="返回图片预览"
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
          <span>返回</span>
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
