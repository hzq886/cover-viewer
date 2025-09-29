"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthProvider";

type Poster = {
  id: string;
  url: string;
};

const POSTER_STORAGE_KEY = "cover-viewer:poster-album";
const PAGE_SIZE = 10;
const TEST_POSTER_URL =
  "https://pics.dmm.co.jp/digital/video/mizd00320/mizd00320ps.jpg";

const samplePosters: Poster[] = Array.from({ length: 12 }, (_, index) => ({
  id: `preview-${index + 1}`,
  url: `${TEST_POSTER_URL}?variant=${index + 1}`,
}));

const normalizePoster = (value: unknown, index: number): Poster | null => {
  if (!value || typeof value !== "object") return null;
  const maybePoster = value as Partial<Poster>;
  if (!maybePoster.url || typeof maybePoster.url !== "string") return null;
  const url = maybePoster.url.trim();
  if (!url) return null;
  const id =
    typeof maybePoster.id === "string" && maybePoster.id.trim().length > 0
      ? maybePoster.id
      : `poster-${index + 1}`;
  return { id, url };
};

export default function MyPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [posters, setPosters] = useState<Poster[]>([]);
  const [ready, setReady] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setPosters([]);
      if (!loading) {
        setReady(true);
      }
      return;
    }

    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(POSTER_STORAGE_KEY);
      if (!raw) {
        setPosters([]);
        setReady(true);
        return;
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        setPosters([]);
        setReady(true);
        return;
      }

      const normalized = parsed
        .map((item, index) => normalizePoster(item, index))
        .filter((item): item is Poster => !!item);

      setPosters(normalized);
    } catch (error) {
      console.error("Failed to load posters", error);
      setPosters([]);
    } finally {
      setReady(true);
    }
  }, [isAuthenticated, loading]);

  useEffect(() => {
    if (!ready || !isAuthenticated) return;
    if (typeof window === "undefined") return;
    window.localStorage.setItem(POSTER_STORAGE_KEY, JSON.stringify(posters));
  }, [isAuthenticated, posters, ready]);

  const showContent = ready && !loading && isAuthenticated;
  const usingSample = posters.length === 0;
  const displayPosters = usingSample ? samplePosters : posters;
  const totalPages = Math.max(1, Math.ceil(displayPosters.length / PAGE_SIZE));
  const currentSliceStart = currentPage * PAGE_SIZE;
  const visiblePosters = displayPosters.slice(
    currentSliceStart,
    currentSliceStart + PAGE_SIZE,
  );

  useEffect(() => {
    setCurrentPage((prev) => {
      const maxPageIndex = Math.max(0, totalPages - 1);
      return Math.min(prev, maxPageIndex);
    });
  }, [totalPages]);

  const handleRemovePoster = useCallback((posterId: string) => {
    if (posters.length === 0) return;
    setPosters((prev) => prev.filter((poster) => poster.id !== posterId));
  }, [posters.length]);

  const handlePosterAction = useCallback((url: string) => {
    if (typeof window === "undefined") return;
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  return (
    <div className="relative h-[100svh] overflow-x-hidden overflow-y-auto bg-[#07030f] text-slate-100">
      <div className="pointer-events-none absolute -left-32 top-12 h-[420px] w-[420px] rounded-full bg-fuchsia-500/20 blur-[160px]" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-[380px] w-[380px] rounded-full bg-sky-500/15 blur-[150px]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[520px] bg-[radial-gradient(circle_at_bottom,_rgba(88,28,135,0.25)_0%,_transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),rgba(2,6,23,0))] mix-blend-screen" />

      <main className="relative z-10">
        <div className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-12">
          <header className="flex flex-col-reverse items-start gap-4 text-xs text-slate-200/70 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-white transition hover:border-white/40 hover:bg-white/20"
            >
              返回首页
            </Link>
            <div className="rounded-3xl border border-white/20 bg-white/15 px-4 py-2 text-right">
              <div className="text-[10px] uppercase tracking-[0.38em] text-white/70">
                Posters
              </div>
              <div className="text-xl font-semibold text-white">
                {displayPosters.length.toString().padStart(2, "0")}
              </div>
            </div>
          </header>

          {loading && (
            <div className="mt-24 flex justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/10 border-t-fuchsia-400" />
            </div>
          )}

          {!loading && !isAuthenticated && (
            <section className="mt-20 flex flex-col items-center gap-6 text-center">
              <h2 className="text-2xl font-semibold text-white">需要登录以查看私人藏册</h2>
              <p className="max-w-md text-sm text-slate-200/70">
                登录后，我们会为你的专属海报建立一整册收藏夹。每张海报会记录保养痕迹，随时能翻阅与管理。
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full border border-fuchsia-200/30 bg-fuchsia-500/40 px-6 py-2 text-sm text-white backdrop-blur transition hover:bg-fuchsia-500/50"
              >
                前往登录
              </Link>
            </section>
          )}

          {showContent && (
            <section className="mt-14">
              <div className="rounded-[32px] border border-white/10 bg-slate-950/40 p-8 shadow-[0_40px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
                <div className="flex flex-col gap-4 pb-8 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {usingSample ? "示例册页" : "我的收藏"}
                    </h2>
                    <p className="text-sm text-slate-200/70">
                      一页陈列 10 张海报，排成双行，可通过翻页切换更多藏品。
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.28em] text-white/70">
                    第 {currentPage + 1} / {totalPages} 页
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
                  {visiblePosters.map((poster) => (
                    <article
                      key={poster.id}
                      className="group relative flex flex-col items-center"
                    >
                      <div className="pointer-events-none absolute inset-x-6 top-10 h-3 rounded-full bg-slate-500/30 blur-sm transition group-hover:bg-fuchsia-400/40" />
                      <div className="relative">
                        <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-b from-white/12 via-white/4 to-transparent opacity-0 blur-xl transition group-hover:opacity-100" />
                        <div className="relative flex h-[232px] w-[188px] flex-col items-center justify-center rounded-[30px] border border-white/15 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-4 shadow-[inset_10px_18px_40px_rgba(255,255,255,0.08)]">
                          <button
                            type="button"
                            onClick={() => handleRemovePoster(poster.id)}
                            disabled={posters.length === 0}
                            className="absolute right-3 top-3 z-20 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-black/65 text-sm font-semibold text-white/90 shadow-[0_6px_16px_rgba(0,0,0,0.45)] backdrop-blur hover:border-fuchsia-300/50 hover:text-white disabled:cursor-not-allowed disabled:border-white/15 disabled:bg-black/30 disabled:text-white/50"
                            aria-label="删除海报"
                          >
                            ×
                          </button>
                          <div className="relative flex h-[200px] w-[147px] items-center justify-center overflow-hidden rounded-[20px] border border-white/15 bg-slate-800/70 shadow-[0_18px_30px_rgba(2,6,23,0.55)]">
                            <img
                              src={poster.url}
                              alt="Poster"
                              className="h-full w-full object-cover pointer-events-none"
                              draggable={false}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex w-full max-w-[188px] items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => handlePosterAction(poster.url)}
                          className="flex-1 cursor-pointer rounded-full border border-white/20 bg-white/15 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:border-white/40 hover:bg-white/25"
                        >
                          购买
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePosterAction(poster.url)}
                          className="flex-1 cursor-pointer rounded-full border border-fuchsia-200/30 bg-fuchsia-500/40 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:border-fuchsia-200/60 hover:bg-fuchsia-500/50"
                        >
                          观看
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="mt-12 flex items-center justify-between gap-4 text-xs uppercase tracking-[0.3em] text-white/70">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                    disabled={currentPage === 0}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 transition hover:border-white/30 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    上一页
                  </button>
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                    {currentPage + 1} / {totalPages}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, Math.max(0, totalPages - 1)),
                      )
                    }
                    disabled={currentPage >= totalPages - 1}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 transition hover:border-white/30 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    下一页
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
