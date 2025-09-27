"use client";

import { useMemo, useState } from "react";
import {
  MaterialSymbolsLightFavorite,
  MaterialSymbolsLightFavoriteOutline,
} from "@/components/icons/FavoriteIcon";

type Props = {
  size?: number; // pixel size baseline for heart icon
  height?: number; // align panel height with carousel container
};

type Comment = {
  id: string;
  text: string;
};

const DEFAULT_COMMENTS: Comment[] = [
  { id: "sample-1", text: "Aaaaaa" },
  { id: "sample-2", text: "Bbbbbb" },
  { id: "sample-3", text: "Cccccc" },
];

const createComment = (text: string): Comment => ({
  id:
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  text,
});

export default function CommentPanel({ size = 96, height }: Props) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [popKey, setPopKey] = useState(0);
  const [comments, setComments] = useState<Comment[]>(DEFAULT_COMMENTS);
  const [pending, setPending] = useState("");

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

  const handleCommentSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const value = pending.trim();
    if (!value) return;
    setComments((prev) => [...prev, createComment(value)]);
    setPending("");
  };

  const placeholder = useMemo(() => {
    if (liked) return "留下你的想法...";
    if (comments.length === 0) return "抢个沙发吧";
    return "写点什么";
  }, [liked, comments.length]);

  const panelHeight = useMemo(
    () => (height ? Math.max(height, 320) : undefined),
    [height],
  );

  return (
    <div
      className="flex h-full min-h-[320px] w-full max-w-[360px] flex-col gap-4 rounded-3xl border border-white/12 bg-black/30 p-4 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)] backdrop-blur-md"
      style={panelHeight ? { height: `${panelHeight}px` } : undefined}
    >
      <div className="flex items-center justify-between px-2">
        <button
          type="button"
          aria-label={liked ? "取消喜欢" : "点个喜欢"}
          aria-pressed={liked}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className="relative flex items-center justify-center rounded-full p-1 outline-none transition-transform duration-200 ease-out hover:scale-105 focus-visible:ring-2 focus-visible:ring-rose-300/60"
          style={{ fontSize: `${size}px` }}
        >
          {/* Outline */}
          <span
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out ${
              liked ? "scale-75 opacity-0" : "scale-100 opacity-100"
            }`}
          >
            <MaterialSymbolsLightFavoriteOutline className="text-white drop-shadow-[0_10px_26px_rgba(255,255,255,0.28)]" />
          </span>

          {/* Filled */}
          <span
            key={popKey}
            className={`relative flex items-center justify-center transition-all duration-300 ease-out ${
              liked
                ? "scale-100 opacity-100 animate-heart-pop"
                : "scale-50 opacity-0"
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
          className="ml-6 text-right text-3xl font-semibold text-rose-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]"
          aria-live="polite"
        >
          {count}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden rounded-2xl border border-white/5 bg-black/30 p-4">
        <div
          className="flex h-full flex-col gap-3 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ msOverflowStyle: "none" }}
        >
          {comments.length === 0 ? (
            <p className="text-sm text-slate-200/60">
              还没有评论，快来抢个沙发。
            </p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm text-slate-50/90 shadow-[0_6px_14px_-10px_rgba(0,0,0,0.8)]"
              >
                {comment.text}
              </div>
            ))
          )}
        </div>
      </div>

      <form
        className="flex-shrink-0 rounded-2xl border border-white/10 bg-white/5 p-3 shadow-inner"
        onSubmit={handleCommentSubmit}
      >
        <label className="sr-only" htmlFor="comment-input">
          添加评论
        </label>
        <div className="flex items-center gap-2">
          <input
            id="comment-input"
            type="text"
            value={pending}
            onChange={(e) => setPending(e.target.value)}
            placeholder={placeholder}
            className="h-10 flex-1 rounded-xl border border-white/10 bg-black/50 px-3 text-sm text-white placeholder:text-slate-300/50 outline-none ring-2 ring-transparent transition focus:border-white/30 focus:ring-rose-300/40"
          />
          <button
            type="submit"
            className="h-10 min-w-[68px] rounded-xl bg-rose-500 px-4 text-sm font-semibold text-white transition hover:bg-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200/70 disabled:cursor-not-allowed disabled:bg-rose-500/50"
            disabled={!pending.trim()}
          >
            发送
          </button>
        </div>
      </form>
    </div>
  );
}
