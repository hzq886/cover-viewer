"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import type { APITypes, PlyrOptions } from "plyr-react";
import "plyr-react/plyr.css";

type Props = {
  open: boolean;
  onClose: () => void;
  videoUrl?: string;
};

const Plyr = dynamic(() => import("plyr-react").then((mod) => mod.default), { ssr: false });
const DEFAULT_VOLUME = 0.7;

function isPromise<T = unknown>(value: unknown): value is Promise<T> {
  return typeof value === "object" && value !== null && typeof (value as any).then === "function";
}

export default function VideoModal({ open, onClose, videoUrl }: Props) {
  const playerRef = useRef<APITypes | null>(null);
  const openRef = useRef(open);
  const initializedRef = useRef(false);
  const lastVideoUrlRef = useRef<string | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const handleKey = useCallback((event: KeyboardEvent) => {
    if (!openRef.current) return;
    const instance = playerRef.current?.plyr;
    if (!instance) return;
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
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
      } else if (typeof instance.currentTime === "number" && typeof instance.duration === "number") {
        instance.currentTime = Math.min(instance.duration || 0, instance.currentTime + 5);
      }
    } else if (event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      if (typeof (instance as any).togglePlay === "function") {
        (instance as any).togglePlay();
      } else if (typeof instance.play === "function" && typeof instance.pause === "function") {
        if ((instance as any).playing) {
          instance.pause();
        } else {
          const result = instance.play();
          if (isPromise(result)) result.catch(() => {});
        }
      }
    }
  }, [onClose]);

  const handleWheel = useCallback((event: WheelEvent) => {
    if (!openRef.current) return;
    const instance = playerRef.current?.plyr;
    if (!instance) return;
    event.preventDefault();
    const deltaY = event.deltaY;
    if (!deltaY) return;
    const currentVolume = typeof instance.volume === "number" ? instance.volume : DEFAULT_VOLUME;
    const baseScalar = event.deltaMode === 1 ? 0.08 : 0.0015;
    let deltaVolume = -deltaY * baseScalar;
    if (deltaVolume === 0) {
      deltaVolume = deltaY < 0 ? 0.02 : -0.02;
    }
    deltaVolume = Math.max(-0.2, Math.min(0.2, deltaVolume));
    const nextVolume = Math.min(1, Math.max(0, currentVolume + deltaVolume));
    instance.volume = nextVolume;
    if (nextVolume > 0 && instance.muted) instance.muted = false;
    if (nextVolume === 0 && !instance.muted) instance.muted = true;
  }, []);

  useEffect(() => {
    const api = playerRef.current;
    const instance = api?.plyr;

    if (!open) {
      initializedRef.current = false;
      lastVideoUrlRef.current = undefined;
      if (instance && typeof instance.pause === "function") {
        instance.pause();
      }
      window.removeEventListener("keydown", handleKey);
      return;
    }

    let cancelled = false;

    const applyDefaults = (plyrInstance: typeof instance) => {
      if (!plyrInstance) return;
      const shouldInit = !initializedRef.current || lastVideoUrlRef.current !== videoUrl;
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
    window.addEventListener("keydown", handleKey);

    return () => {
      cancelled = true;
      window.removeEventListener("keydown", handleKey);
    };
  }, [handleKey, open, videoUrl]);

  useEffect(() => {
    if (!open) return;
    const el = containerRef.current;
    if (!el) return;
    const wheelListener = (event: WheelEvent) => handleWheel(event);
    el.addEventListener("wheel", wheelListener, { passive: false });
    return () => {
      el.removeEventListener("wheel", wheelListener);
    };
  }, [handleWheel, open]);

  const proxiedUrl = videoUrl ? `/api/proxy?url=${encodeURIComponent(videoUrl)}` : "";

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
      ratio: "3:2",
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
        "pip",
        "airplay",
        "fullscreen",
      ],
      settings: ["speed", "quality"],
      speed: { selected: 1, options: [1, 1.5, 2] },
    }),
    [],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-[60] h-9 w-9 rounded-full bg-black/60 text-white/90 flex items-center justify-center border border-white/20 hover:bg-black/75"
        title="关闭"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>

      <div
        ref={containerRef}
        className="relative w-full max-w-[760px] rounded-2xl border border-white/15 bg-black/65 shadow-[0_50px_140px_-40px_rgba(88,28,135,0.85)] overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-600/20 via-transparent to-indigo-500/20" />
        <div className="relative">
          {source ? (
            <Plyr
              ref={playerRef}
              source={source}
              options={options}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
