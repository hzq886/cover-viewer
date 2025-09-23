"use client";

import { useEffect, useState } from "react";
import {
  MaterialSymbolsLightFavorite,
  MaterialSymbolsLightFavoriteOutline,
} from "@/components/icons/HeartIcons";

type Props = {
  size?: number; // pixel size baseline for 1em icons
};

export default function FavoriteHeart({ size = 160 }: Props) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [popKey, setPopKey] = useState(0);

  const handleClick = () => {
    setLiked((v) => !v);
    setCount((c) => c + 1);
    setPopKey((k) => k + 1); // retrigger CSS animation
  };

  // Keyboard accessibility: space/enter to toggle
  const handleKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleClick();
    }
  };

  // Ensure a short animation rerun when state changes
  useEffect(() => {
    const t = setTimeout(() => {
      // no-op; allow CSS animation to complete
    }, 320);
    return () => clearTimeout(t);
  }, [liked, popKey]);

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <button
        type="button"
        aria-label={liked ? "取消喜欢" : "点个喜欢"}
        aria-pressed={liked}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className="relative cursor-pointer outline-none group"
        style={{ fontSize: `${size}px` }}
      >
        {/* Soft glass panel + glow */}
        <span className="absolute -inset-6 rounded-3xl bg-white/6 border border-white/15 backdrop-blur-md shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)]" />
        <span className="absolute -inset-10 rounded-[40px] opacity-70 blur-2xl bg-[radial-gradient(closest-side,rgba(255,255,255,0.18),transparent_70%)]" />

        {/* Outline */}
        <span
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out ${
            liked ? "scale-75 opacity-0" : "scale-100 opacity-100"
          } group-hover:scale-[1.06]`}
        >
          <MaterialSymbolsLightFavoriteOutline className="text-white drop-shadow-[0_10px_26px_rgba(255,255,255,0.28)]" />
        </span>

        {/* Filled */}
        <span
          key={popKey}
          className={`relative flex items-center justify-center transition-all duration-300 ease-out ${
            liked ? "scale-100 opacity-100 animate-heart-pop" : "scale-50 opacity-0"
          }`}
        >
          <MaterialSymbolsLightFavorite className="text-red-500 drop-shadow-[0_14px_34px_rgba(239,68,68,0.55)]" />
          {/* Sparkle ring when liking */}
          {liked && (
            <span className="pointer-events-none absolute inset-0 rounded-full border-2 border-red-300/60 shadow-[0_0_0_8px_rgba(239,68,68,0.1)] animate-heart-ring" />
          )}
        </span>
      </button>

      <div
        className="mt-3 text-center font-semibold text-rose-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]"
        aria-live="polite"
      >
        {count}
      </div>
    </div>
  );
}
