"use client";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  type QueryDocumentSnapshot,
  query,
  runTransaction,
  startAfter,
} from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { useI18n } from "@/i18n/I18nProvider";
import { getFirestoreDb, hasFirebaseConfig } from "@/lib/firebase";
import { getDownloadURL, getStorageRef } from "@/lib/storage";

const PAGE_SIZE = 10;

type Poster = {
  id: string;
  imagePath: string;
  affiliateUrl: string;
};

type PageData = {
  items: Poster[];
  cursor: QueryDocumentSnapshot | null;
  hasMore: boolean;
};

export default function MyPage() {
  const firebaseReady = useMemo(() => hasFirebaseConfig(), []);
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { dictionary, t } = useI18n();
  const myPage = dictionary.myPage;
  const [pages, setPages] = useState<PageData[]>([]);
  const pagesRef = useRef<PageData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});
  const [checkingMissavId, setCheckingMissavId] = useState<string | null>(null);

  useEffect(() => {
    const uid = user?.uid;
    if (!uid) {
      setPages([]);
      pagesRef.current = [];
      setCurrentPage(0);
      setError(null);
      return;
    }
    setPages([]);
    pagesRef.current = [];
    setCurrentPage(0);
    setError(null);
  }, [user?.uid]);

  const fetchPage = useCallback(
    async (pageIndex: number) => {
      if (!firebaseReady || !user) return;
      if (pageIndex > 0) {
        const prev = pagesRef.current[pageIndex - 1];
        if (!prev || (!prev.cursor && prev.items.length < PAGE_SIZE)) {
          // Previous page not loaded or already exhausted.
          setPages((prevPages) => {
            const next = [...prevPages];
            next[pageIndex] = { items: [], cursor: null, hasMore: false };
            pagesRef.current = next;
            return next;
          });
          setCurrentPage(pageIndex);
          return;
        }
      }

      setLoading(true);
      setError(null);
      try {
        const db = getFirestoreDb();
        const likesCol = collection(db, "users", user.uid, "likes");
        const baseOrder = orderBy("likedAt", "desc");
        const previousCursor =
          pageIndex > 0 ? pagesRef.current[pageIndex - 1]?.cursor : null;
        const likesQuery = previousCursor
          ? query(
              likesCol,
              baseOrder,
              startAfter(previousCursor),
              limit(PAGE_SIZE),
            )
          : query(likesCol, baseOrder, limit(PAGE_SIZE));

        const snapshot = await getDocs(likesQuery);
        const docs = snapshot.docs;
        const items: Poster[] = await Promise.all(
          docs.map(async (docSnap) => {
            const data = docSnap.data() as {
              imagePath?: string;
              affiliateUrl?: string;
              likedAt?: { toDate?: () => Date } | Date | null;
            } | null;

            let imagePath =
              typeof data?.imagePath === "string" ? data.imagePath : "";
            if (imagePath) {
              try {
                imagePath = await getDownloadURL(getStorageRef(imagePath));
              } catch (err) {
                console.warn(
                  `Failed to get download URL for ${imagePath}`,
                  err,
                );
              }
            }

            return {
              id: docSnap.id,
              imagePath,
              affiliateUrl: data?.affiliateUrl || "",
            } satisfies Poster;
          }),
        );

        const lastDoc = docs.length > 0 ? docs[docs.length - 1] : null;
        const pageData: PageData = {
          items,
          cursor: lastDoc,
          hasMore: docs.length === PAGE_SIZE,
        };

        setPages((prevPages) => {
          const next = [...prevPages];
          next[pageIndex] = pageData;
          pagesRef.current = next;
          return next;
        });
        setCurrentPage(pageIndex);
      } catch (err) {
        console.error("Failed to load liked posters", err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [firebaseReady, user],
  );

  useEffect(() => {
    if (!firebaseReady || !isAuthenticated || authLoading) return;
    if (pagesRef.current[0]?.items) return;
    void fetchPage(0);
  }, [firebaseReady, isAuthenticated, authLoading, fetchPage]);

  const handleNextPage = useCallback(() => {
    const current = pagesRef.current[currentPage];
    if (!current?.hasMore) return;
    const target = currentPage + 1;
    if (pagesRef.current[target]?.items) {
      setCurrentPage(target);
    } else {
      void fetchPage(target);
    }
  }, [currentPage, fetchPage]);

  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  }, []);

  const totalLoadedPages = pages.length;
  const currentData = pages[currentPage];
  const visiblePosters = currentData?.items ?? [];
  const hasNext = currentData?.hasMore ?? false;
  const hasPrev = currentPage > 0;
  const totalKnownPages = Math.max(
    1,
    totalLoadedPages +
      (pagesRef.current[totalLoadedPages - 1]?.hasMore ? 1 : 0),
  );

  const showLoginPrompt = !loading && !authLoading && !isAuthenticated;
  const showEmpty =
    !loading &&
    isAuthenticated &&
    visiblePosters.length === 0 &&
    !(currentData?.hasMore ?? false);

  const updateLikeDocument = useCallback(
    async (contentId: string, delta: number) => {
      if (!firebaseReady) return;
      const db = getFirestoreDb();
      const baseDocRef = doc(db, "avs", contentId);

      await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(baseDocRef);
        if (!snapshot.exists()) {
          return;
        }
        const data = snapshot.data();
        const current =
          data && typeof data.likeCount === "number" ? data.likeCount : 0;
        const next = Math.max(0, current + delta);
        transaction.update(baseDocRef, { likeCount: next });
      });
    },
    [firebaseReady],
  );

  const handleDeletePoster = useCallback(
    async (poster: Poster) => {
      if (!firebaseReady || !user) {
        console.warn("Cannot delete poster without Firebase or user");
        return;
      }

      setDeletingIds((prev) => ({ ...prev, [poster.id]: true }));

      try {
        await updateLikeDocument(poster.id, -1);
        const db = getFirestoreDb();
        const likeRef = doc(db, "users", user.uid, "likes", poster.id);
        await deleteDoc(likeRef);

        let updatedPages: PageData[] = pagesRef.current;
        setPages((prev) => {
          const next = prev.map((page) => {
            const filtered = page.items.filter((item) => item.id !== poster.id);
            if (filtered.length === page.items.length) {
              return page;
            }
            return { ...page, items: filtered } satisfies PageData;
          });
          pagesRef.current = next;
          updatedPages = next;
          return next;
        });

        if (!updatedPages[currentPage]?.items.length && currentPage > 0) {
          let target = currentPage;
          while (target > 0 && !updatedPages[target]?.items.length) {
            target -= 1;
          }
          if (target !== currentPage) {
            setCurrentPage(target);
          }
        }

        setError(null);
      } catch (err) {
        console.error("Failed to delete poster", err);
        setError((err as Error).message ?? t("myPage.deleteFailure"));
      } finally {
        setDeletingIds((prev) => {
          const next = { ...prev };
          delete next[poster.id];
          return next;
        });
      }
    },
    [currentPage, firebaseReady, t, updateLikeDocument, user],
  );

  const handleOpenMissav = useCallback(
    async (id: string) => {
      if (!id) return;
      setCheckingMissavId(id);
      try {
        const response = await fetch(
          `/api/missav-status?contentId=${encodeURIComponent(id)}`,
          {
            cache: "no-store",
          },
        );
        if (response.ok) {
          const data = (await response.json()) as {
            exists?: boolean;
          };
          if (data.exists) {
            window.open(
              `https://missav.ai/${encodeURIComponent(id)}`,
              "_blank",
              "noopener,noreferrer",
            );
            return;
          }
        }
      } catch {
        // Swallow network errors and fall through to alert
      } finally {
        setCheckingMissavId((current) => (current === id ? null : current));
      }
      window.alert(myPage.videoNotFound);
    },
    [myPage.videoNotFound],
  );

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
              {myPage.backToHome}
            </Link>
            <div className="rounded-3xl border border-white/20 bg-white/15 px-4 py-2 text-right">
              <div className="text-[10px] uppercase tracking-[0.38em] text-white/70">
                {myPage.posterLabel}
              </div>
              <div className="text-xl font-semibold text-white">
                {visiblePosters.length.toString().padStart(2, "0")}
              </div>
            </div>
          </header>

          {loading && (
            <div className="mt-24 flex justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/10 border-t-fuchsia-400" />
            </div>
          )}

          {error && (
            <div className="mt-10 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          {showLoginPrompt && (
            <section className="mt-20 flex flex-col items-center gap-6 text-center">
              <h2 className="text-2xl font-semibold text-white">
                {myPage.loginRequiredTitle}
              </h2>
              <p className="max-w-md text-sm text-slate-200/70">
                {myPage.loginRequiredDescription}
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full border border-fuchsia-200/30 bg-fuchsia-500/40 px-6 py-2 text-sm text-white backdrop-blur transition hover:bg-fuchsia-500/50"
              >
                {myPage.loginRequiredCta}
              </Link>
            </section>
          )}

          {showEmpty && (
            <section className="mt-20 flex flex-col items-center gap-4 text-center text-slate-200/70">
              <h2 className="text-xl font-semibold text-white">
                {myPage.emptyTitle}
              </h2>
              <p className="max-w-md text-sm">{myPage.emptyDescription}</p>
            </section>
          )}

          {!showLoginPrompt && !showEmpty && visiblePosters.length > 0 && (
            <section className="mt-14">
              <div className="rounded-[32px] border border-white/10 bg-slate-950/40 p-8 shadow-[0_40px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
                <div className="flex flex-col gap-4 pb-8 sm:flex-row sm:items-end sm:justify-between">
                  <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.28em] text-white/70">
                    {t("myPage.pageIndicator", {
                      current: currentPage + 1,
                      total: totalKnownPages,
                    })}
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
                            onClick={() => {
                              void handleDeletePoster(poster);
                            }}
                            disabled={Boolean(deletingIds[poster.id])}
                            className="absolute right-3 top-3 z-20 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-black/65 text-sm font-semibold text-white/90 shadow-[0_6px_16px_rgba(0,0,0,0.45)] backdrop-blur hover:border-fuchsia-300/50 hover:text-white disabled:cursor-not-allowed disabled:border-white/15 disabled:bg-black/30 disabled:text-white/50"
                            aria-label={myPage.deleteAria}
                          >
                            ×
                          </button>
                          <div className="relative flex h-[200px] w-[147px] items-center justify-center overflow-hidden rounded-[20px] border border-white/15 bg-slate-800/70 shadow-[0_18px_30px_rgba(2,6,23,0.55)]">
                            {poster.imagePath ? (
                              <Image
                                src={poster.imagePath}
                                alt={myPage.posterAlt}
                                width={147}
                                height={200}
                                className="h-full w-full object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-slate-200/60">
                                {myPage.imageMissing}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex w-full max-w-[188px] items-center justify-between gap-3">
                        {poster.affiliateUrl ? (
                          <a
                            href={poster.affiliateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:border-white/40 hover:bg-white/25"
                          >
                            {myPage.buy}
                          </a>
                        ) : (
                          <span className="flex-1 cursor-not-allowed rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/40">
                            {myPage.buy}
                          </span>
                        )}
                        <button
                          type="button"
                          className="flex-1 cursor-pointer rounded-full border border-fuchsia-200/30 bg-fuchsia-500/40 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:border-fuchsia-200/60 hover:bg-fuchsia-500/50 disabled:cursor-not-allowed disabled:border-fuchsia-200/20 disabled:bg-fuchsia-500/30 disabled:text-white/70"
                          onClick={() => {
                            void handleOpenMissav(poster.id);
                          }}
                          disabled={checkingMissavId === poster.id}
                        >
                          {checkingMissavId === poster.id
                            ? myPage.checkingVideo
                            : myPage.watch}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="mt-10 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    disabled={!hasPrev}
                    className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/70 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {myPage.prevPage}
                  </button>
                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={!hasNext}
                    className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/70 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {myPage.nextPage}
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
