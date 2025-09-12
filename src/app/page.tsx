"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { adjustLightness } from "../lib/color";
import { useDmmSearch } from "../hooks/useDmmSearch";
import { useImageColor } from "../hooks/useImageColor";
import { useLayoutHeights } from "../hooks/useLayoutHeights";
import type { DmmNameObj } from "../types/dmm";
import SearchBar from "../components/SearchBar";
import Logo from "../components/Logo";
import InfoPanel from "../components/InfoPanel";
import PosterComposite from "../components/PosterComposite";
import SampleColumn from "../components/SampleColumn";
import ZoomModal from "../components/ZoomModal";
import VideoModal from "../components/VideoModal";

export default function Home() {
  const { keyword, setKeyword, currentItem, remainingItems, loading, error, hasSearched, submit, reset } = useDmmSearch();
  const [showBack, setShowBack] = useState(false);
  const [compact, setCompact] = useState(false);
  const [vp, setVp] = useState<{ vw: number; vh: number }>({ vw: 0, vh: 0 });
  const posterRef = useRef<HTMLDivElement>(null);
  const { headerRef, footerRef, layoutH } = useLayoutHeights();
  const detailsRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const sampleRef = useRef<HTMLDivElement>(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImgUrl, setModalImgUrl] = useState<string>("");
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>("");

  const pick = currentItem;

  // 検索実行関数
  async function onSearch() { setShowBack(false); await submit(); }

  // 当前条目的封面/封底源
  const frontBackSrc = pick?.imageURL?.large || pick?.imageURL?.small || "";

  // 選択された画像のURL
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");
  const [selectedSide, setSelectedSide] = useState<"front" | "back" | null>(null);
  // 默认选中第1张（封面），进入“影片海报模式”
  useEffect(() => {
    setSelectedImageUrl("");
    setSelectedSide(pick ? "front" : null);
  }, [pick]);
  const posterUrl = selectedImageUrl || pick?.imageURL?.large || pick?.imageURL?.small || "";
  const proxiedPosterUrl = posterUrl
    ? (posterUrl.startsWith('/api/') ? posterUrl : `/api/proxy?url=${encodeURIComponent(posterUrl)}`)
    : "";
  const posterTitle = pick?.title || "";
  // Use original remote poster for color extraction to avoid passing local API URLs to /api/color
  const colorUrl = pick?.imageURL?.large || pick?.imageURL?.small || "";
  const proxiedColorUrl = colorUrl ? `/api/proxy?url=${encodeURIComponent(colorUrl)}` : "";
  const { dominant, naturalSize } = useImageColor(colorUrl, proxiedColorUrl);
  // 选中图片（样图或已裁剪半幅）的原始尺寸
  const proxiedSelectedUrl = selectedImageUrl
    ? (selectedImageUrl.startsWith('/api/') ? selectedImageUrl : `/api/proxy?url=${encodeURIComponent(selectedImageUrl)}`)
    : "";
  const { naturalSize: selectedNatural } = useImageColor(selectedImageUrl || null, proxiedSelectedUrl || undefined);
  // Detect natural size of selected sample (if any) to decide layout placement of InfoPanel
  // Note: previously used to decide layout for landscape samples, no longer needed

  // 色ユーティリティは ../lib/color を使用

  useEffect(() => { if (posterUrl) { setShowBack(false); setCompact(true); } }, [posterUrl]);

  // 布局高度由 useLayoutHeights 管理

  // ビューポートサイズ監視
  useEffect(() => {
    const handle = () => setVp({ vw: window.innerWidth, vh: window.innerHeight });
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  // Build dynamic background styles from dominant color
  const baseRgb = dominant || { r: 2, g: 6, b: 23 }; // slate-950 fallback
  const accent = adjustLightness(baseRgb, 0.12);
  const subtle = adjustLightness(baseRgb, -0.08);
  // グラデーションパターンの生成
  const radial = `radial-gradient(1200px 800px at 80% -10%, rgba(${accent.r},${accent.g},${accent.b},0.45), transparent), radial-gradient(900px 600px at 10% 110%, rgba(${subtle.r},${subtle.g},${subtle.b},0.55), transparent)`;

  // 展示规则：
  // - 影片海报：并排展示封面+封底（各半宽），按原像素比例缩放至可视区域内，完整显示不裁切
  // - 样图：单张按原像素比例缩放，完整显示不裁切
  const isPosterMode = !selectedImageUrl || selectedImageUrl.startsWith('/api/split');
  const showSingle = !isPosterMode;
  const verticalPadding = compact ? 24 : 40; // 容器上下内边距的近似
  const safetyGap = 48; // 额外间距避免滚动条遮挡
  const avail = Math.max(180, vp.vh - layoutH.header - layoutH.footer - verticalPadding - safetyGap);
  const maxHeightPx = Math.floor(avail);
  const maxWidthPx = Math.floor(vp.vw * 0.92);
  // 固定舞台：2/3 比例，宽占 72% 视口，最高 800px
  const targetAr = 2 / 3;
  const stageFrac = 0.72;
  const maxStageH = 800;
  let containerH = Math.floor(Math.min(maxHeightPx, maxStageH));
  let stageW = Math.floor(containerH * targetAr);
  const widthLimit = Math.floor(vp.vw * stageFrac);
  if (stageW > widthLimit) { stageW = widthLimit; containerH = Math.floor(stageW / targetAr); }
  // 书脊 2%（仅海报模式生效）；样图模式视为单图
  const spineRatio = 0.02;
  const showSingleNow = !isPosterMode;
  const frontFrac = showSingleNow ? 1 : 0.5 + spineRatio / 2;
  const backFrac = showSingleNow ? 0 : 0.5 - spineRatio / 2;
  const frontW = Math.floor(stageW * frontFrac);
  const backW = Math.floor(stageW * backFrac);

  // Details from DMM item
  const contentId = (pick as any)?.content_id || (pick as any)?.contentid || "";
  const title = posterTitle;
  const affiliate = pick?.affiliateURL || pick?.URL || "";
  const fromNameArray = (v: any): string =>
    Array.isArray(v) ? v.map((x) => x?.name).filter(Boolean).join("、") : v?.name || "";
  const actressNames = fromNameArray(pick?.iteminfo?.actress);
  const directorNames = fromNameArray(pick?.iteminfo?.director);
  const makerName =
    (Array.isArray(pick?.iteminfo?.maker)
      ? fromNameArray(pick?.iteminfo?.maker)
      : (pick?.iteminfo?.maker as DmmNameObj | undefined)?.name) || pick?.maker?.name || "";
  const releaseDate = (pick as any)?.date || (pick as any)?.release_date || "";
  type SampleThumb = { url: string; portrait: boolean };

  const sampleImages: string[] = useMemo(() => {
    const imgs: string[] = (pick as any)?.sampleImageURL?.sample_l?.image || (pick as any)?.sampleImageURL?.sample_s?.image || [];
    return Array.isArray(imgs) ? imgs : [];
  }, [pick]);
  // Reorder samples: show portrait first, then landscape
  const [orderedSamples, setOrderedSamples] = useState<SampleThumb[]>([]);
  useEffect(() => {
    let cancelled = false;
    if (!sampleImages || sampleImages.length === 0) { setOrderedSamples((prev) => (prev.length === 0 ? prev : [])); return; }
    (async () => {
      const results = await Promise.all(
        sampleImages.map(async (u, i) => {
          try {
            const img = new Image();
            await new Promise<void>((resolve) => {
              img.onload = () => resolve();
              img.onerror = () => resolve();
              img.src = `/api/proxy?url=${encodeURIComponent(u)}`;
            });
            const portrait = img.naturalHeight >= img.naturalWidth;
            return { u, i, portrait };
          } catch {
            return { u, i, portrait: true };
          }
        }),
      );
      if (cancelled) return;
      const portraits: SampleThumb[] = results
        .filter((r) => r.portrait)
        .sort((a, b) => a.i - b.i)
        .map((r) => ({ url: r.u, portrait: true }));
      const landscapes: SampleThumb[] = results
        .filter((r) => !r.portrait)
        .sort((a, b) => a.i - b.i)
        .map((r) => ({ url: r.u, portrait: false }));
      setOrderedSamples([...portraits, ...landscapes]);
    })();
    return () => { cancelled = true; };
  }, [sampleImages]);
  const sampleMovie: string =
    (pick as any)?.sampleMovieURL?.sampleMovieURL?.size_720_480 ||
    (pick as any)?.sampleMovieURL?.size_720_480 ||
    (pick as any)?.sample_movie_url?.size_720_480 ||
    "";

  const handleResetHome = useCallback(() => {
    reset();
    setShowBack(false);
    setCompact(false);
    setSelectedImageUrl("");
    setSelectedSide(null);
    setOrderedSamples([]);
    setModalOpen(false);
    setModalImgUrl("");
    setVideoOpen(false);
    setVideoUrl("");
  }, [reset]);

  // Thumbnail size for sample column
  const baseThumb = Math.max(96, Math.min(160, Math.floor((containerH || 480) / 3.2)));
  const thumbSize = baseThumb * 2;

  // Track whether sample column has more content to scroll
  // sample 列滚动状态由 SampleColumn 内部管理

  const navBase = compact
    ? "flex w-full items-center justify-start gap-4 md:gap-6 transition"
    : "flex w-full flex-col items-center justify-center gap-6 transition";

  return (
    <div
      className="relative min-h-svh w-full overflow-hidden text-slate-100"
      onClickCapture={(e) => {
        const target = e.target as Node;
        // Ignore clicks inside header (search bar, input, button) or footer
        if (headerRef.current && headerRef.current.contains(target)) return;
        if (logoRef.current && logoRef.current.contains(target)) return;
        if (footerRef.current && footerRef.current.contains(target)) return;
        if (detailsRef.current && detailsRef.current.contains(target)) return;
        if (sampleRef.current && sampleRef.current.contains(target)) return;
        
        if (modalOpen) return;
        if (posterRef.current && posterUrl && !posterRef.current.contains(target)) {
          setShowBack((prev) => !prev);
        }
      }}
    >
      {/* Color-based gradient background */}
      <div
        className="absolute inset-0 -z-20"
        style={{
          background: radial,
          backgroundColor: `rgb(${baseRgb.r}, ${baseRgb.g}, ${baseRgb.b})`,
        }}
      />
      {/* Blurred poster backdrop as a soft fill, only when we have an image */}
      {proxiedPosterUrl && (
        <div
          className="absolute inset-0 -z-10 bg-center bg-cover blur-3xl scale-110 opacity-50"
          style={{ backgroundImage: `url(${proxiedPosterUrl})` }}
        />
      )}

      <div className={`relative mx-auto max-w-7xl px-6 ${compact ? "py-5" : "py-10"}`}>
        <header
          ref={headerRef}
          className={`relative z-20 flex w-full ${compact ? "justify-start" : "justify-center"}`}
        >
          <nav className={navBase}>
            <div
              ref={logoRef}
              className={compact ? "flex items-center justify-start" : "flex w-full items-center justify-center"}
            >
              <Logo
                onHome={handleResetHome}
                className={`opacity-95 hover:opacity-100 transition-transform ${compact ? "scale-90" : "scale-100"}`}
              />
            </div>
            <div className={compact ? "flex-1 min-w-[260px]" : "w-full"}>
              <SearchBar
                keyword={keyword}
                setKeyword={setKeyword}
                loading={loading}
                onSubmit={onSearch}
                compact={compact}
                className={compact ? "" : "mx-auto"}
              />
            </div>
          </nav>
        </header>

        {!compact && (
          <section className="mt-6 w-full">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 px-6 py-7 shadow-[0_40px_120px_-45px_rgba(15,23,42,0.95)] md:px-9 md:py-9">
              <div className="pointer-events-none absolute -top-20 right-6 h-44 w-44 rounded-full bg-violet-500/30 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 left-0 h-48 w-48 rounded-full bg-fuchsia-500/25 blur-3xl" />
              <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center">
                <div className="flex-1">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-violet-100 ring-1 ring-inset ring-white/20">
                    Inspired Posters
                  </span>
                  <h2 className="mt-4 text-xl md:text-2xl font-semibold text-white">
                    输入任意关键词，随机挑选一张来自 DMM API 的海报图
                  </h2>
                  <p className="mt-3 text-sm md:text-base text-slate-200/80">
                    实时检索数万影片资源，即刻捕捉灵感。通过云端代理快速缓存高清封面，结合样图预览与视频花絮，全方位呈现作品细节。
                  </p>
                </div>
                <div className="grid flex-1 grid-cols-1 gap-3 text-sm text-slate-100 md:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-2xl bg-black/30 p-4 ring-1 ring-inset ring-white/10">
                    <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-violet-400 shadow-[0_0_0_6px_rgba(168,85,247,0.2)]" />
                    <div>
                      <p className="font-medium text-white/90">封面与封底一键切换</p>
                      <p className="mt-1 text-xs text-slate-300/80">点击海报即可翻面，细节级放大支持沉浸式浏览。</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl bg-black/30 p-4 ring-1 ring-inset ring-white/10">
                    <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-fuchsia-400 shadow-[0_0_0_6px_rgba(232,121,249,0.2)]" />
                    <div>
                      <p className="font-medium text-white/90">样图智能排序预览</p>
                      <p className="mt-1 text-xs text-slate-300/80">自动识别竖版与横版样图，突出重点画面一目了然。</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <main className={`${compact ? "mt-3 md:mt-4" : "mt-12 md:mt-16"}`}>
          {/* 顶部控制区已移除，播放与换一张移动到左侧信息区 */}
          {/* States: loading, error, empty, result */}
          {loading && (
            <div className="flex items-center justify-center h-[60svh]">
              <div className="relative">
                <div className="h-24 w-24 rounded-full border-4 border-white/20 border-t-violet-400 animate-spin" />
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="flex items-center justify-center h-[50svh]">
              <div className="rounded-xl bg-red-600/10 text-red-200 border border-red-400/30 px-4 py-3">
                {error}
              </div>
            </div>
          )}

          {!loading && !error && hasSearched && !posterUrl && (
            <div className="flex items-center justify-center h-[50svh]">
              <div className="rounded-xl bg-white/5 text-slate-200 border border-white/15 px-4 py-3">
                未找到相关海报，请更换关键词再试。
              </div>
            </div>
          )}

          {!loading && !error && posterUrl && naturalSize && (
            <div className="relative flex flex-col items-stretch">
              <div className="flex w-full max-w-7xl flex-col md:flex-row items-stretch gap-6">
                {/* InfoPanel always on the left */}
                <InfoPanel
                  ref={detailsRef}
                  contentId={contentId}
                  title={title}
                  affiliate={affiliate}
                  actressNames={actressNames}
                  makerName={makerName}
                  directorNames={directorNames}
                  releaseDate={releaseDate}
                  onPlay={!!sampleMovie ? async () => {
                    try {
                      const r = await fetch(`/api/resolve-video?url=${encodeURIComponent(sampleMovie)}`);
                      const data = await r.json();
                      const resolved = data?.url || sampleMovie;
                      setVideoUrl(resolved);
                      setVideoOpen(true);
                    } catch {
                      setVideoUrl(sampleMovie);
                      setVideoOpen(true);
                    }
                  } : undefined}
                  keyword={keyword}
                  stageSizeText={`${frontW + backW}px × ${containerH}px`}
                  imageSizeText={
                    isPosterMode
                      ? (naturalSize
                          ? `${Math.floor((naturalSize.w || 0) * (selectedSide === 'back' ? (0.5 - 0.01) : (0.5 + 0.01)))}px × ${naturalSize.h}px`
                          : undefined)
                      : (selectedNatural ? `${selectedNatural.w}px × ${selectedNatural.h}px` : undefined)
                  }
                  remainingCount={remainingItems.length}
                />

                <div className={`flex-1 flex justify-center`}>
                  <PosterComposite
                    ref={posterRef}
                    posterUrl={posterUrl}
                    proxiedPosterUrl={proxiedPosterUrl}
                    basePosterUrl={frontBackSrc}
                    containerH={containerH}
                    frontW={frontW}
                    backW={backW}
                    defaultShowBack={false}
                    onOpenModal={() => { setModalImgUrl(posterUrl); setModalOpen(true); }}
                    single={showSingle}
                    hoverFlip={false}
                    forceSide={selectedSide || undefined}
                  />
                </div>

                {orderedSamples.length > 0 && (
                  <SampleColumn
                    ref={sampleRef}
                    images={orderedSamples}
                    height={containerH + 24}
                    thumbSize={thumbSize}
                    onSelect={(u, meta) => {
                      if (meta?.side) {
                        // 影片海报模式：点击第一张=封面，第二张=背面
                        setSelectedSide(meta.side);
                        setSelectedImageUrl("");
                      } else {
                        // 样图模式：显示整张（单图）
                        setSelectedSide(null);
                        setSelectedImageUrl(u);
                      }
                    }}
                    frontBackSrc={frontBackSrc}
                    activeUrl={selectedImageUrl}
                    activeSide={selectedSide}
                />
              )}
              </div>
            </div>
          )}
        </main>

        <footer ref={footerRef} className={`${compact ? "mt-4" : "mt-10"} text-center text-xs text-slate-300/70`}>
          数据来源：DMM 商品情報API
        </footer>
      </div>

      <ZoomModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mainUrl={modalImgUrl || posterUrl}
        samples={orderedSamples.map((s) => s.url)}
        posterUrl={pick?.imageURL?.large || pick?.imageURL?.small || ""}
      />
      <VideoModal open={videoOpen} onClose={() => setVideoOpen(false)} videoUrl={videoUrl} />
    </div>
  );
}
