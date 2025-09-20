"use client";

import { type FormEvent, type SVGProps, useEffect, useMemo, useRef, useState } from "react";

type Props = {
  keyword: string;
  setKeyword: (v: string) => void;
  loading?: boolean;
  onSubmit: () => void;
  compact?: boolean;
  className?: string;
};

const storageKey = "recentSearchKeywords";

export function MdiMagnify(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      {/* Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE */}
      <path
        fill="currentColor"
        d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5"
      />
    </svg>
  );
}

export default function SearchBar({ keyword, setKeyword, loading, onSubmit, compact, className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLFormElement>(null);
  const [recentKeywords, setRecentKeywords] = useState<string[]>([]);
  const [showRecent, setShowRecent] = useState(false);
  const hasRecent = recentKeywords.length > 0;

  const placeholder = useMemo(
    () => (compact ? "继续检索关键词" : "输入任意关键词(多个关键词用空格隔开)"),
    [compact],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setRecentKeywords(parsed.filter((item): item is string => typeof item === "string"));
      }
    } catch {
      // ignore malformed storage content
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(recentKeywords));
  }, [recentKeywords]);

  useEffect(() => {
    if (!hasRecent) setShowRecent(false);
  }, [hasRecent]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (wrapperRef.current.contains(event.target as Node)) return;
      setShowRecent(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = keyword.trim();
    if (trimmed) {
      setRecentKeywords((prev) => {
        const withoutCurrent = prev.filter((item) => item !== trimmed);
        return [trimmed, ...withoutCurrent].slice(0, 10);
      });
    }
    setShowRecent(false);
    onSubmit();
  };

  const openRecent = () => {
    if (hasRecent) setShowRecent(true);
  };

  const containerRounded = showRecent && hasRecent ? "rounded-[32px] rounded-b-none border-b-0" : "rounded-[32px]";
  const widthClass = compact ? "max-w-2xl" : "max-w-3xl";
  const submitButtonClass = compact
    ? `flex h-10 w-10 items-center justify-center rounded-full text-violet-200/90 transition hover:bg-violet-500/20 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 disabled:cursor-not-allowed disabled:text-white/40 disabled:hover:bg-transparent ${
        loading ? "cursor-wait" : "cursor-pointer"
      }`
    : `flex h-11 min-w-[3rem] items-center justify-center rounded-full bg-gradient-to-r from-violet-500/90 via-fuchsia-500/90 to-violet-600/90 px-4 text-sm font-medium text-white shadow-[0_12px_28px_-16px_rgba(168,85,247,0.9)] transition hover:from-violet-400 hover:via-fuchsia-400 hover:to-violet-500 active:from-violet-500 active:via-fuchsia-500 active:to-violet-600 disabled:cursor-not-allowed disabled:from-white/10 disabled:via-white/10 disabled:to-white/10 disabled:text-white/50 disabled:shadow-none ${
        compact ? "w-12 px-0" : "w-24"
      } ${loading ? "cursor-wait" : "cursor-pointer"}`;

  return (
    <form
      ref={wrapperRef}
      role="search"
      onSubmit={handleSubmit}
      className={`relative w-full ${widthClass} ${className || ""}`.trim()}
    >
      <div className="relative w-full">
        <div
          className={`flex w-full items-center gap-3 border border-white/12 bg-black/45 px-5 py-2 text-slate-100 backdrop-blur-xl shadow-[0_25px_80px_-40px_rgba(76,29,149,0.7)] transition focus-within:border-violet-300/60 focus-within:bg-black/35 focus-within:shadow-[0_35px_120px_-45px_rgba(129,104,238,0.8)] ${containerRounded}`}
        >
          <span className="flex h-9 w-9 items-center justify-center text-violet-200/80">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input
            ref={inputRef}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onFocus={openRecent}
            onClick={openRecent}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setShowRecent(false);
                inputRef.current?.blur();
              }
            }}
            placeholder={placeholder}
            className="flex-1 border-none bg-transparent py-2 text-base text-slate-100 outline-none placeholder:text-slate-300/70"
          />
          {keyword.trim() !== "" && (
            <button
              type="button"
              aria-label="清除搜索内容"
              onClick={() => {
                setKeyword("");
                requestAnimationFrame(() => {
                  inputRef.current?.focus();
                });
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-200/80 transition hover:bg-white/15 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !keyword.trim()}
            className={submitButtonClass}
            title="搜索"
            aria-label={compact ? "执行搜索" : undefined}
          >
            {loading ? (
              <span className="relative flex h-5 w-5 items-center justify-center text-white">
                <span className="absolute h-full w-full rounded-full border-2 border-white/30 border-t-transparent animate-spin" />
                <span
                  className="absolute h-full w-full rounded-full border-2 border-transparent border-t-white/80 animate-spin"
                  style={{ animationDuration: "900ms", animationDirection: "reverse" }}
                />
              </span>
            ) : compact ? (
              <MdiMagnify className="h-5 w-5" />
            ) : (
              "搜索"
            )}
          </button>
        </div>

        {showRecent && hasRecent && (
          <div className="absolute left-0 right-0 top-full z-40 rounded-b-[32px] border border-t border-white/12 bg-black/65 pb-3 pt-2 text-slate-100 backdrop-blur-xl shadow-[0_35px_120px_-45px_rgba(76,29,149,0.75)]">
            <ul className="max-h-64 overflow-y-auto hide-scrollbar">
              {recentKeywords.map((item) => (
                <li key={item} className="group flex items-center gap-3 px-5 py-2 text-sm text-slate-100 transition hover:bg-white/10">
                  <span className="flex h-6 w-6 items-center justify-center text-violet-200/80">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M12 6v6l3 3" />
                      <circle cx="12" cy="12" r="9" />
                    </svg>
                  </span>
                  <button
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      setKeyword(item);
                      requestAnimationFrame(() => {
                        inputRef.current?.focus();
                        setShowRecent(false);
                      });
                    }}
                    className="flex-1 truncate text-left text-slate-100 hover:text-white cursor-pointer"
                    title={item}
                  >
                    {item}
                  </button>
                  <button
                    type="button"
                    aria-label={`删除 '${item}'`}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      setRecentKeywords((prev) => prev.filter((keywordItem) => keywordItem !== item));
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-200/80 opacity-0 transition hover:bg-white/15 hover:text-white focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 group-hover:opacity-100 cursor-pointer"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </form>
  );
}
