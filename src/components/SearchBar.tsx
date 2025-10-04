"use client";

import {
  type FormEvent,
  type SVGProps,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GENRE_TRANSLATIONS } from "@/data/genre-translations";
import { GENRE_GROUPS } from "@/data/genres";
import { useI18n } from "@/i18n/I18nProvider";

type Props = {
  keyword: string;
  setKeyword: (v: string) => void;
  loading?: boolean;
  onSubmit: () => void;
  compact?: boolean;
  className?: string;
};

const storageKey = "recentSearchKeywords";

const loadRecentKeywords = (): string[] => {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
};

type TooltipState = {
  text: string;
  x: number;
  y: number;
};

export function MdiMagnify(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <title>Search</title>
      {/* Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE */}
      <path
        fill="currentColor"
        d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5"
      />
    </svg>
  );
}

export function MaterialSymbolsBook4SparkOutlineRounded(
  props: SVGProps<SVGSVGElement>,
) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <title>Books</title>
      {/* Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE */}
      <path
        fill="currentColor"
        d="M5 16.175q.25-.075.488-.125T6 16h1V4H6q-.425 0-.712.288T5 5zM6 22q-1.25 0-2.125-.875T3 19V5q0-1.25.875-2.125T6 2h6q.425 0 .713.288T13 3t-.288.713T12 4H9v12h6v-2q0-.425.288-.712T16 13t.713.288T17 14v4H6q-.425 0-.712.288T5 19t.288.713T6 20h13v-7q0-.425.288-.712T20 12t.713.288T21 13v7q0 .825-.587 1.413T19 22zm-1-5.825V4zM17.5 12q0-2.3 1.6-3.9T23 6.5q-2.3 0-3.9-1.6T17.5 1q0 2.3-1.6 3.9T12 6.5q2.3 0 3.9 1.6t1.6 3.9"
      />
    </svg>
  );
}

export default function SearchBar({
  keyword,
  setKeyword,
  loading,
  onSubmit,
  compact,
  className,
}: Props) {
  const { t, language } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLFormElement>(null);
  const keywordPanelRef = useRef<HTMLDivElement>(null);
  const [recentKeywords, setRecentKeywords] = useState<string[]>(() =>
    loadRecentKeywords(),
  );
  const [showRecent, setShowRecent] = useState(false);
  const [showKeywordPanel, setShowKeywordPanel] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const hasRecent = recentKeywords.length > 0;

  const getGenreTranslation = useCallback(
    (key: string | undefined, fallback: string) => {
      const map = GENRE_TRANSLATIONS[language];
      if (!map) return fallback;
      if (key && map[key]) return map[key];
      return map[fallback] ?? fallback;
    },
    [language],
  );

  const beginTooltip = useCallback(
    (
      event: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>,
      text: string,
    ) => {
      if (!text) {
        setTooltip(null);
        return;
      }
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      setTooltip({
        text,
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    },
    [],
  );

  const moveTooltip = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setTooltip((current) =>
      current
        ? {
            ...current,
            x: event.clientX,
            y: event.clientY,
          }
        : current,
    );
  }, []);

  const endTooltip = useCallback(() => {
    setTooltip(null);
  }, []);

  const placeholder = useMemo(
    () =>
      compact
        ? t("search.placeholder.compact")
        : t("search.placeholder.default"),
    [compact, t],
  );

  const hasHydratedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      return;
    }
    window.localStorage.setItem(storageKey, JSON.stringify(recentKeywords));
  }, [recentKeywords]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncFromStorage = () => {
      const loaded = loadRecentKeywords();
      setRecentKeywords((prev) => {
        if (
          prev.length === loaded.length &&
          prev.every((v, i) => v === loaded[i])
        ) {
          return prev;
        }
        return loaded;
      });
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) return;
      syncFromStorage();
    };
    syncFromStorage();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const current = wrapperRef.current;
      if (!current) return;
      if (current.contains(event.target as Node)) return;
      setShowRecent(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!showKeywordPanel) {
      setTooltip(null);
    }
  }, [showKeywordPanel]);

  useEffect(() => {
    if (!showKeywordPanel) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setShowKeywordPanel(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showKeywordPanel]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedForSubmit = keyword.trimEnd();
    const normalized = trimmedForSubmit.trim();
    if (normalized) {
      setRecentKeywords((prev) => {
        const withoutCurrent = prev.filter((item) => item !== normalized);
        return [normalized, ...withoutCurrent].slice(0, 10);
      });
    }
    if (trimmedForSubmit !== keyword) {
      setKeyword(trimmedForSubmit);
    }
    setShowRecent(false);
    onSubmit();
  };

  const openRecent = () => {
    setShowRecent(true);
  };

  const containerRounded = showRecent
    ? "rounded-[32px] rounded-b-none border-b-0"
    : "rounded-[32px]";
  const widthClass = compact ? "max-w-2xl" : "max-w-3xl";
  const submitButtonClass = compact
    ? `flex h-10 w-10 items-center justify-center rounded-full text-violet-200/90 transition hover:bg-violet-500/20 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 disabled:cursor-not-allowed disabled:text-white/40 disabled:hover:bg-transparent ${
        loading ? "cursor-wait" : "cursor-pointer"
      }`
    : `flex h-11 min-w-[3rem] items-center justify-center rounded-full bg-gradient-to-r from-violet-500/90 via-fuchsia-500/90 to-violet-600/90 px-4 text-sm font-medium text-white shadow-[0_12px_28px_-16px_rgba(168,85,247,0.9)] transition hover:from-violet-400 hover:via-fuchsia-400 hover:to-violet-500 active:from-violet-500 active:via-fuchsia-500 active:to-violet-600 disabled:cursor-not-allowed disabled:from-white/10 disabled:via-white/10 disabled:to-white/10 disabled:text-white/50 disabled:shadow-none ${
        compact ? "w-12 px-0" : "w-24"
      } ${loading ? "cursor-wait" : "cursor-pointer"}`;

  const appendKeywordToken = (word: string) => {
    const tokens = keyword.split(/\s+/).filter(Boolean);
    const nextTokens = tokens.includes(word) ? tokens : [...tokens, word];
    const newValue = `${nextTokens.join(" ")} `.replace(/\s+$/, " ");
    setKeyword(newValue);
    // 将光标移动到文本末尾，便于继续输入
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (el) {
        el.focus();
        const pos = newValue.length;
        try {
          el.setSelectionRange(pos, pos);
        } catch {
          // ignore environments that don't support setSelectionRange
        }
      }
    });
  };

  const closeKeywordPanel = useCallback(() => {
    setTooltip(null);
    setShowKeywordPanel(false);
  }, []);

  return (
    <form
      ref={wrapperRef}
      onSubmit={handleSubmit}
      className={`relative w-full ${widthClass} ${className || ""}`.trim()}
    >
      <div className="relative w-full">
        <div
          className={`flex w-full items-center gap-3 border border-white/12 bg-black/45 px-5 py-2 text-slate-100 backdrop-blur-xl shadow-[0_25px_80px_-40px_rgba(76,29,149,0.7)] transition focus-within:border-violet-300/60 focus-within:bg-black/35 focus-within:shadow-[0_35px_120px_-45px_rgba(129,104,238,0.8)] ${containerRounded}`}
        >
          <button
            type="button"
            onClick={() => {
              setTooltip(null);
              setShowKeywordPanel(true);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full text-violet-200/80 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-violet-300 cursor-pointer"
            title={t("search.keywordPanel.open")}
            aria-label={t("search.keywordPanel.open")}
          >
            <MaterialSymbolsBook4SparkOutlineRounded className="h-5 w-5" />
          </button>
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
              aria-label={t("search.clear")}
              title={t("search.clear")}
              onClick={() => {
                setKeyword("");
                requestAnimationFrame(() => {
                  inputRef.current?.focus();
                });
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-200/80 transition hover:bg-white/15 hover:text-white focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-violet-300 cursor-pointer"
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
                aria-hidden
              >
                <title>{t("search.clear")}</title>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !keyword.trim()}
            className={submitButtonClass}
            title={t("search.submitTitle")}
            aria-label={compact ? t("search.submitCompactAria") : undefined}
          >
            {loading ? (
              <span className="relative flex h-5 w-5 items-center justify-center text-white">
                <span className="absolute h-full w-full rounded-full border-2 border-white/30 border-t-transparent animate-spin" />
                <span
                  className="absolute h-full w-full rounded-full border-2 border-transparent border-t-white/80 animate-spin"
                  style={{
                    animationDuration: "900ms",
                    animationDirection: "reverse",
                  }}
                />
              </span>
            ) : compact ? (
              <MdiMagnify className="h-5 w-5" />
            ) : (
              t("search.submit")
            )}
          </button>
        </div>

        {showRecent && (
          <div className="absolute left-0 right-0 top-full z-40 rounded-b-[32px] border border-t border-white/12 bg-black/65 pb-3 pt-2 text-slate-100 backdrop-blur-xl shadow-[0_35px_120px_-45px_rgba(76,29,149,0.75)]">
            {hasRecent ? (
              <ul className="max-h-64 overflow-y-auto hide-scrollbar">
                {recentKeywords.map((item) => (
                  <li
                    key={item}
                    className="group flex items-center gap-3 px-5 py-2 text-sm text-slate-100 transition hover:bg-white/10"
                  >
                    <span className="flex h-6 w-6 items-center justify-center text-violet-200/80">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <title>Open recent search</title>
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
                      aria-label={t("search.deleteRecent", { value: item })}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setRecentKeywords((prev) =>
                          prev.filter((keywordItem) => keywordItem !== item),
                        );
                        requestAnimationFrame(() => {
                          setShowRecent(true);
                        });
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-200/80 opacity-0 transition hover:bg-white/15 hover:text-white focus-visible:opacity-100 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-violet-300 group-hover:opacity-100 cursor-pointer"
                      title={t("search.deleteRecent", { value: item })}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <title>Remove recent search</title>
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-5 py-4 text-sm text-slate-300/80">
                {t("search.noRecent")}
              </div>
            )}
          </div>
        )}
      </div>
      {showKeywordPanel && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeKeywordPanel();
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            ref={keywordPanelRef}
            onMouseDown={(event) => {
              event.stopPropagation();
            }}
            className="relative mx-4 w-full max-w-6xl rounded-3xl border border-white/10 bg-black/70 p-6 text-slate-100 shadow-[0_35px_120px_-45px_rgba(76,29,149,0.85)]"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {t("search.keywordPanel.title")}
              </h2>
              <button
                type="button"
                onClick={closeKeywordPanel}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-200/80 transition hover:bg-white/15 hover:text-white focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-violet-300 cursor-pointer"
                aria-label={t("search.keywordPanel.close")}
                title={t("search.keywordPanel.close")}
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
                  aria-hidden
                >
                  <title>Close keyword panel</title>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="sticky top-0 z-10 -mx-6 border-b border-white/10 bg-black/60 px-6 py-3 backdrop-blur">
                <div className="flex flex-wrap gap-2">
                  {GENRE_GROUPS.map((g) => (
                    <a
                      key={g.id}
                      href={`#genre-${g.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        const el = document.getElementById(`genre-${g.id}`);
                        el?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }}
                      className="cursor-pointer rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-200 transition hover:border-violet-300/60 hover:bg-white/10 hover:text-white"
                      onMouseEnter={(event) =>
                        beginTooltip(
                          event,
                          getGenreTranslation(`group:${g.id}`, g.title),
                        )
                      }
                      onMouseMove={moveTooltip}
                      onMouseLeave={endTooltip}
                      onFocus={(event) =>
                        beginTooltip(
                          event,
                          getGenreTranslation(`group:${g.id}`, g.title),
                        )
                      }
                      onBlur={endTooltip}
                      title={getGenreTranslation(`group:${g.id}`, g.title)}
                    >
                      {g.title}
                    </a>
                  ))}
                </div>
              </div>
              <div className="max-h-[70vh] overflow-y-auto pr-1">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {GENRE_GROUPS.map((group) => (
                    <section
                      key={group.id}
                      id={`genre-${group.id}`}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <h3 className="mb-3 text-base font-medium text-white/90">
                        {group.title}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {group.items.map((it) => (
                          <button
                            key={(it.id || "") + it.label}
                            type="button"
                            onClick={() => {
                              appendKeywordToken(it.label);
                              setTooltip(null);
                              setShowKeywordPanel(false);
                            }}
                            className="cursor-pointer rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-slate-100 transition hover:border-violet-300/60 hover:bg-white/10 hover:text-white"
                            onMouseEnter={(event) =>
                              beginTooltip(
                                event,
                                getGenreTranslation(it.id, it.label),
                              )
                            }
                            onMouseMove={moveTooltip}
                            onMouseLeave={endTooltip}
                            onFocus={(event) =>
                              beginTooltip(
                                event,
                                getGenreTranslation(it.id, it.label),
                              )
                            }
                            onBlur={endTooltip}
                            title={getGenreTranslation(it.id, it.label)}
                          >
                            {it.label}
                          </button>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {tooltip ? (
        <div
          className="pointer-events-none fixed z-[120] max-w-xs rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white shadow-[0_18px_60px_-30px_rgba(76,29,149,0.75)] backdrop-blur"
          style={{
            left: (() => {
              const desired = tooltip.x + 16;
              if (typeof window === "undefined") return desired;
              return Math.min(desired, window.innerWidth - 220);
            })(),
            top: (() => {
              const desired = tooltip.y + 20;
              if (typeof window === "undefined") return desired;
              return Math.min(desired, window.innerHeight - 60);
            })(),
          }}
        >
          {tooltip.text}
        </div>
      ) : null}
    </form>
  );
}
