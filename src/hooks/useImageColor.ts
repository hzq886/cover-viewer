"use client";

import { useEffect, useState } from "react";
import type { RGB } from "../lib/color";

export function useImageColor(
  posterUrl: string | undefined | null,
  proxiedUrl?: string,
) {
  const [dominant, setDominant] = useState<RGB | null>(null);
  const [naturalSize, setNaturalSize] = useState<{
    w: number;
    h: number;
  } | null>(null);

  useEffect(() => {
    if (!posterUrl) {
      setDominant(null);
      setNaturalSize(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(
          `/api/color?url=${encodeURIComponent(posterUrl)}`,
        );
        const data = await r.json();
        if (!r.ok)
          throw new Error(data?.message || "Failed to analyze dominant colors");
        if (!cancelled) {
          if (data?.dominant) setDominant(data.dominant);
          if (data?.original?.width && data?.original?.height) {
            setNaturalSize({ w: data.original.width, h: data.original.height });
          }
        }
      } catch {
        if (!proxiedUrl) return;
        try {
          const img = new Image();
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error("fallback img load failed"));
            img.src = proxiedUrl;
          });
          if (!cancelled)
            setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
        } catch {
          if (!cancelled) setNaturalSize(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [posterUrl, proxiedUrl]);

  return { dominant, naturalSize } as const;
}
