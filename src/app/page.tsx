"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import AuthBar from "@/components/AuthBar";
import CommentPanel from "@/components/CommentPanel";
import InfoPanel from "@/components/InfoPanel";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Logo from "@/components/Logo";
import PosterPanel, { type MediaSlide } from "@/components/PosterPanel";
import SearchBar from "@/components/SearchBar";
import VideoPanel, {
  VIDEO_MIN_HEIGHT,
  VIDEO_MIN_WIDTH,
} from "@/components/VideoPanel";
import ZoomModal from "@/components/ZoomModal";
import { useDmmSearch } from "@/hooks/useDmmSearch";
import { useImageColor } from "@/hooks/useImageColor";
import { useLayoutHeights } from "@/hooks/useLayoutHeights";
import { useI18n } from "@/i18n/I18nProvider";
import { adjustLightness } from "@/lib/color";
import type { DmmNameObj } from "@/types/dmm";

// 默认背景色回退值（深蓝色调，用于无主色时）
const FALLBACK_COLOR = { r: 2, g: 6, b: 23 };
// 海报书脊占整体宽度的比例
const POSTER_SPINE_RATIO = 0.02;
// 舞台目标宽高比（宽:高 = 2:3）
const TARGET_ASPECT_RATIO = 2 / 3;
// 舞台宽度在不同断点下的预设值
const STAGE_WIDTH_PRESETS: Array<{ min: number; width: number }> = [
  { min: 1280, width: 420 },
  { min: 1024, width: 380 },
  { min: 768, width: 360 },
  { min: 640, width: 320 },
];
const STAGE_WIDTH_DEFAULT = 280;
const FEATURE_ACCENT_CLASSES = [
  "bg-violet-400 shadow-[0_0_0_6px_rgba(168,85,247,0.35)]",
  "bg-fuchsia-400 shadow-[0_0_0_6px_rgba(232,121,249,0.35)]",
  "bg-sky-400 shadow-[0_0_0_6px_rgba(56,189,248,0.35)]",
  "bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.35)]",
  "bg-amber-400 shadow-[0_0_0_6px_rgba(251,191,36,0.35)]",
] as const;

// 将远程 URL 转换为代理地址，确保统一走本地 API
const toProxyUrl = (url?: string | null): string => {
  if (!url) return "";
  return url.startsWith("/api/")
    ? url
    : `/api/proxy?url=${encodeURIComponent(url)}`;
};

// 从 DMM 提供的多尺寸图片对象中提取首选海报 URL
const extractPosterUrl = (
  imageUrl?: { large?: string | null; small?: string | null } | null,
): string => {
  if (!imageUrl) return "";
  return imageUrl.large || imageUrl.small || "";
};

// 将演员、导演等信息统一整理为“、”分隔的字符串
const joinNames = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        typeof item === "object" && item && "name" in item
          ? ((item as DmmNameObj).name ?? "")
          : "",
      )
      .filter(Boolean)
      .join("、");
  }
  if (typeof value === "object" && value && "name" in value) {
    return ((value as DmmNameObj).name ?? "") || "";
  }
  return "";
};

// 样图缩略信息的数据结构
type SampleThumb = { url: string; portrait: boolean };

// 页面入口组件
export default function Home() {
  const { dictionary, t } = useI18n();
  // 搜索 hook 提供的状态与动作
  const {
    keyword,
    setKeyword,
    currentItem,
    remainingItems,
    loading,
    error,
    hasSearched,
    submit,
    reset,
  } = useDmmSearch();
  // 是否处于紧凑布局（显示结果后自动启用）
  const [compact, setCompact] = useState(false);
  // 当前窗口宽度，驱动舞台的断点切换
  const [viewportWidth, setViewportWidth] = useState(0);
  // 媒体展示区域引用，用于阻止冒泡
  const carouselRef = useRef<HTMLDivElement>(null);
  // 布局高度 Hook，提供 header/footer 引用与高度
  const { headerRef, footerRef } = useLayoutHeights();
  // 详情信息面板引用，阻止外层点击切换
  const detailsRef = useRef<HTMLDivElement>(null);
  // Logo 容器引用，阻止外层点击切换
  const logoRef = useRef<HTMLDivElement>(null);
  // 媒体放大模态框控制
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoFront, setVideoFront] = useState(false);
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string>("");
  const resolvingVideoRef = useRef(false);
  const hero = dictionary.hero;
  const heroFeatures = hero.features;
  const errorMessage = useMemo(() => {
    if (!error) return null;
    const params =
      typeof error.status === "number" ? { status: error.status } : undefined;
    const message = t(`errors.${error.code}`, params);
    if (!message || message === `errors.${error.code}`) {
      return t("errors.unknown");
    }
    return message;
  }, [error, t]);

  // 当前选中的搜索结果
  const pick = currentItem;

  // 当前作品对应的基础海报 URL
  const basePosterUrl = useMemo(
    () => extractPosterUrl(pick?.imageURL ?? null),
    [pick],
  );
  const posterSmallUrl = useMemo(
    () => (pick?.imageURL?.small ? String(pick.imageURL.small) : ""),
    [pick],
  );
  const proxiedPosterSmallUrl = useMemo(
    () => toProxyUrl(posterSmallUrl),
    [posterSmallUrl],
  );
  // 作品切换时重置媒体状态
  useEffect(() => {
    setActiveIndex(0);
    setResolvedVideoUrl("");
    resolvingVideoRef.current = false;
    setVideoFront(false);
    if (!currentItem) {
      return;
    }
  }, [currentItem]);

  const sampleImages: string[] = useMemo(() => {
    const images =
      pick?.sampleImageURL?.sample_l?.image ||
      pick?.sampleImageURL?.sample_s?.image ||
      [];
    return Array.isArray(images) ? images : [];
  }, [pick]);

  const [orderedSamples, setOrderedSamples] = useState<SampleThumb[]>([]);
  useEffect(() => {
    let cancelled = false;
    if (sampleImages.length === 0) {
      setOrderedSamples([]);
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      const results = await Promise.all(
        sampleImages.map(async (url, index) => {
          try {
            const img = new Image();
            await new Promise<void>((resolve) => {
              img.onload = () => resolve();
              img.onerror = () => resolve();
              img.src = `/api/proxy?url=${encodeURIComponent(url)}`;
            });
            const portrait = img.naturalHeight >= img.naturalWidth;
            return { url, index, portrait };
          } catch {
            return { url, index, portrait: true };
          }
        }),
      );
      if (cancelled) return;
      const portraits: SampleThumb[] = results
        .filter((item) => item.portrait)
        .sort((a, b) => a.index - b.index)
        .map((item) => ({ url: item.url, portrait: true }));
      const landscapes: SampleThumb[] = results
        .filter((item) => !item.portrait)
        .sort((a, b) => a.index - b.index)
        .map((item) => ({ url: item.url, portrait: false }));
      setOrderedSamples([...portraits, ...landscapes]);
    })();

    return () => {
      cancelled = true;
    };
  }, [sampleImages]);

  const sampleMovie: string = useMemo(
    () =>
      pick?.sampleMovieURL?.sampleMovieURL?.size_720_480 ||
      pick?.sampleMovieURL?.size_720_480 ||
      pick?.sample_movie_url?.size_720_480 ||
      "",
    [pick],
  );

  const videoUrl = resolvedVideoUrl || sampleMovie;

  const ensureVideoSource = useCallback(async () => {
    if (!sampleMovie) return undefined;
    if (resolvedVideoUrl) return resolvedVideoUrl;
    if (resolvingVideoRef.current) return videoUrl;
    resolvingVideoRef.current = true;
    try {
      const response = await fetch(
        `/api/resolve-video?url=${encodeURIComponent(sampleMovie)}`,
      );
      const data = await response.json();
      const resolved = data?.url || sampleMovie;
      setResolvedVideoUrl(resolved);
      return resolved;
    } catch {
      setResolvedVideoUrl(sampleMovie);
      return sampleMovie;
    } finally {
      resolvingVideoRef.current = false;
    }
  }, [resolvedVideoUrl, sampleMovie, videoUrl]);

  const { imageSlides, videoSlide } = useMemo(() => {
    const images: MediaSlide[] = [];
    let video: MediaSlide | null = null;

    if (basePosterUrl) {
      const spine = POSTER_SPINE_RATIO.toFixed(2);
      images.push({
        type: "poster",
        side: "front",
        url: `${basePosterUrl}?side=front`,
        displayUrl: `/api/split?url=${encodeURIComponent(toProxyUrl(basePosterUrl))}&side=front&spine=${spine}`,
        portrait: true,
        label: "front",
        zoomUrl: toProxyUrl(basePosterUrl),
      });
      images.push({
        type: "poster",
        side: "back",
        url: `${basePosterUrl}?side=back`,
        displayUrl: `/api/split?url=${encodeURIComponent(toProxyUrl(basePosterUrl))}&side=back&spine=${spine}`,
        portrait: true,
        label: "back",
        zoomUrl: toProxyUrl(basePosterUrl),
      });
    }

    if (orderedSamples.length > 0) {
      for (const item of orderedSamples) {
        images.push({
          type: "image",
          url: item.url,
          displayUrl: toProxyUrl(item.url),
          portrait: Boolean(item.portrait),
          zoomUrl: toProxyUrl(item.url),
        });
      }
    }

    if (sampleMovie) {
      const videoSource = videoUrl;
      video = {
        type: "video",
        url: videoSource,
        displayUrl: toProxyUrl(videoSource),
        zoomUrl: toProxyUrl(videoSource),
      };
    }

    return { imageSlides: images, videoSlide: video };
  }, [basePosterUrl, orderedSamples, sampleMovie, videoUrl]);

  const activeSlide = useMemo(
    () => imageSlides[activeIndex] ?? null,
    [imageSlides, activeIndex],
  );

  useEffect(() => {
    if (!videoSlide) {
      setVideoFront(false);
    }
  }, [videoSlide]);

  useEffect(() => {
    if (videoFront) {
      void ensureVideoSource();
    }
  }, [videoFront, ensureVideoSource]);

  // 当前展示的媒体地址，用于舞台背景
  const activeDisplayUrl = useMemo(() => {
    if (videoFront && videoSlide) {
      return videoSlide.displayUrl;
    }
    if (!activeSlide) return basePosterUrl;
    if (activeSlide.type === "poster" || activeSlide.type === "image") {
      return activeSlide.displayUrl;
    }
    return basePosterUrl;
  }, [activeSlide, basePosterUrl, videoFront, videoSlide]);

  // 当前展示图的代理地址
  const proxiedPosterUrl = useMemo(
    () => toProxyUrl(activeDisplayUrl),
    [activeDisplayUrl],
  );
  // 基础海报的代理地址
  const proxiedBasePosterUrl = useMemo(
    () => toProxyUrl(basePosterUrl),
    [basePosterUrl],
  );
  // 主图的主色与原始尺寸信息
  const { dominant, naturalSize } = useImageColor(
    basePosterUrl,
    proxiedBasePosterUrl,
  );

  // 选中样图的尺寸信息，用于展示面板
  const activeImageOriginal =
    activeSlide?.type === "image" ? activeSlide.url : "";
  const activeImageProxy =
    activeSlide?.type === "image" ? activeSlide.displayUrl : "";
  const { naturalSize: selectedNatural } = useImageColor(
    activeImageOriginal || null,
    activeImageOriginal ? activeImageProxy : undefined,
  );
  // 监听窗口尺寸变化，更新视口宽度
  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 背景基色，优先使用主色，否则使用回退值
  const baseRgb = dominant || FALLBACK_COLOR;
  // 背景渐变的高亮色
  const accent = adjustLightness(baseRgb, 0.12);
  // 背景渐变的阴影色
  const subtle = adjustLightness(baseRgb, -0.08);
  // 色彩渐变背景样式字符串
  const radial = `radial-gradient(1200px 800px at 80% -10%, rgba(${accent.r},${accent.g},${accent.b},0.45), transparent), radial-gradient(900px 600px at 10% 110%, rgba(${subtle.r},${subtle.g},${subtle.b},0.55), transparent)`;

  // 舞台相关尺寸，按照断点预设值计算
  const stage = useMemo(() => {
    const preset = STAGE_WIDTH_PRESETS.find(({ min }) => viewportWidth >= min);
    const stageW = preset ? preset.width : STAGE_WIDTH_DEFAULT;
    const containerH = Math.round(stageW / TARGET_ASPECT_RATIO);
    return {
      containerH,
      stageW,
      stageSizeText: `${stageW}px × ${containerH}px`,
    };
  }, [viewportWidth]);

  const mediaDimensions = useMemo(() => {
    if (videoFront && videoSlide) {
      const width = Math.max(stage.stageW, VIDEO_MIN_WIDTH);
      const height = Math.max(
        VIDEO_MIN_HEIGHT,
        Math.round((width * VIDEO_MIN_HEIGHT) / VIDEO_MIN_WIDTH),
      );
      return { width, height };
    }
    return { width: stage.stageW, height: stage.containerH };
  }, [stage.containerH, stage.stageW, videoFront, videoSlide]);

  const containerDimensions = useMemo(
    () => ({
      width: Math.max(mediaDimensions.width, stage.stageW),
      height: Math.max(mediaDimensions.height, stage.containerH),
    }),
    [
      mediaDimensions.height,
      mediaDimensions.width,
      stage.containerH,
      stage.stageW,
    ],
  );

  const mediaStageSizeText = useMemo(() => {
    if (videoFront && videoSlide) {
      return `${mediaDimensions.width}px × ${mediaDimensions.height}px`;
    }
    return stage.stageSizeText;
  }, [
    mediaDimensions.height,
    mediaDimensions.width,
    stage.stageSizeText,
    videoFront,
    videoSlide,
  ]);

  // 展示在 InfoPanel 中的图片尺寸文案
  const imageSizeText = useMemo(() => {
    if (!activeSlide) return undefined;
    if (activeSlide.type === "poster") {
      if (!naturalSize) return undefined;
      const widthRatio =
        activeSlide.side === "back"
          ? 0.5 - POSTER_SPINE_RATIO / 2
          : 0.5 + POSTER_SPINE_RATIO / 2;
      const widthPx = Math.floor((naturalSize.w || 0) * widthRatio);
      return `${widthPx || 0}px × ${naturalSize.h || 0}px`;
    }
    if (activeSlide.type === "image" && selectedNatural) {
      return `${selectedNatural.w}px × ${selectedNatural.h}px`;
    }
    return undefined;
  }, [activeSlide, naturalSize, selectedNatural]);

  // 来源于 DMM 样图字段的原始地址列表
  const { zoomSlides, imageIndexToZoom, zoomToImage } = useMemo(() => {
    const zoomSlides: MediaSlide[] = [];
    const imageIndexToZoom: number[] = [];
    const zoomToImage: number[] = [];
    const seen = new Map<string, number>();

    imageSlides.forEach((slide, originalIndex) => {
      const key =
        slide.zoomUrl || slide.displayUrl || slide.url || `__${originalIndex}`;
      const existing = seen.get(key);
      if (existing !== undefined) {
        imageIndexToZoom[originalIndex] = existing;
        return;
      }
      const nextIndex = zoomSlides.length;
      seen.set(key, nextIndex);
      zoomSlides.push(slide);
      zoomToImage.push(originalIndex);
      imageIndexToZoom[originalIndex] = nextIndex;
    });

    return { zoomSlides, imageIndexToZoom, zoomToImage };
  }, [imageSlides]);

  // 避免索引在媒体数量变化后越界
  useEffect(() => {
    setActiveIndex((prev) => {
      if (imageSlides.length === 0) return 0;
      const clamped = Math.min(prev, imageSlides.length - 1);
      return clamped < 0 ? 0 : clamped;
    });
  }, [imageSlides.length]);

  const slidesCount = imageSlides.length;

  // 根据媒体是否可展示切换到紧凑布局
  useEffect(() => {
    setCompact(slidesCount > 0);
  }, [slidesCount]);

  useEffect(() => {
    setZoomIndex((prev) => {
      if (zoomSlides.length === 0) return 0;
      const clamped = Math.min(prev, zoomSlides.length - 1);
      return clamped < 0 ? 0 : clamped;
    });
  }, [zoomSlides.length]);

  const handleZoomClose = useCallback(
    (finalIndex?: number) => {
      setZoomOpen(false);
      if (typeof finalIndex !== "number") return;
      setZoomIndex(finalIndex);
      const nextImageIndex = zoomToImage[finalIndex] ?? 0;
      setActiveIndex(nextImageIndex);
    },
    [zoomToImage],
  );

  // 搜索事件处理（触发 DMM 接口请求）
  const handleSearch = useCallback(async () => {
    await submit();
  }, [submit]);

  // 重置页面状态并返回初始界面
  const handleResetHome = useCallback(() => {
    reset();
    setCompact(false);
    setOrderedSamples([]);
    setActiveIndex(0);
    setZoomIndex(0);
    setZoomOpen(false);
    setResolvedVideoUrl("");
    resolvingVideoRef.current = false;
  }, [reset]);

  // Header 导航的布局样式
  const navBase = compact
    ? "flex w-full items-center justify-start gap-4 md:gap-6 transition"
    : "flex w-full flex-col items-center justify-center gap-6 transition";

  const {
    contentId,
    title,
    affiliate,
    actressNames,
    directorNames,
    makerName,
    releaseDate,
  } = useMemo(() => {
    const iteminfo = pick?.iteminfo;
    return {
      contentId: pick?.content_id || pick?.contentid || "",
      title: pick?.title || "",
      affiliate: pick?.affiliateURL || pick?.URL || "",
      actressNames: joinNames(iteminfo?.actress),
      directorNames: joinNames(iteminfo?.director),
      makerName: joinNames(iteminfo?.maker) || pick?.maker?.name || "",
      releaseDate: pick?.date || pick?.release_date || "",
    };
  }, [pick]);

  return (
    <div
      className="relative min-h-svh w-full overflow-hidden text-slate-100"
      onClickCapture={(event) => {
        // 当前点击的目标节点
        const target = event.target as Node;
        if (headerRef.current?.contains(target)) return;
        if (logoRef.current?.contains(target)) return;
        if (footerRef.current?.contains(target)) return;
        if (detailsRef.current?.contains(target)) return;
        if (carouselRef.current?.contains(target)) return;
        if (zoomOpen) return;
      }}
    >
      <div
        className="absolute inset-0 -z-20"
        style={{
          background: radial,
          backgroundColor: `rgb(${baseRgb.r}, ${baseRgb.g}, ${baseRgb.b})`,
        }}
      />
      {proxiedPosterUrl && (
        <div
          className="absolute inset-0 -z-10 bg-center bg-cover blur-3xl scale-110 opacity-50"
          style={{ backgroundImage: `url(${proxiedPosterUrl})` }}
        />
      )}

      <div
        className={`relative mx-auto max-w-7xl px-6 ${compact ? "py-5" : "py-10"}`}
      >
        <header
          ref={headerRef}
          className={`relative z-[80] flex w-full ${compact ? "justify-start" : "justify-center"}`}
        >
          <nav className={navBase}>
            <div
              ref={logoRef}
              className={
                compact
                  ? "flex items-center justify-start"
                  : "flex w-full items-center justify-center"
              }
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
                onSubmit={handleSearch}
                compact={compact}
                className={compact ? "" : "mx-auto"}
              />
            </div>
            <div
              className={
                compact
                  ? "flex min-w-[120px] items-center justify-end"
                  : "mt-4 flex w-full items-center justify-center md:mt-0 md:justify-end"
              }
            >
              <div className="flex items-center gap-3">
                <LanguageSwitcher />
                <AuthBar />
              </div>
            </div>
          </nav>
        </header>

        {!compact && !loading && (
          <section className="mt-6 w-full">
            <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-slate-950/80 via-indigo-900/40 to-fuchsia-900/30 px-6 py-8 shadow-[0_40px_120px_-45px_rgba(15,23,42,0.95)] backdrop-blur-xl md:px-10 md:py-10">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_55%)]" />
              <div className="pointer-events-none absolute -top-24 left-[-15%] h-72 w-72 rounded-full bg-violet-500/35 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-32 right-[-10%] h-80 w-80 rounded-full bg-fuchsia-500/25 blur-3xl" />
              <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center">
                <div className="flex-1">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-violet-100 ring-1 ring-inset ring-white/25">
                    {hero.badge}
                  </span>
                  <h1 className="mt-5 text-2xl font-semibold leading-tight text-white md:text-4xl">
                    {hero.heading1}
                  </h1>
                  <p className="mt-4 text-sm leading-relaxed text-slate-200/85 md:text-base">
                    {hero.description}
                  </p>
                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.4em] text-violet-200/80">
                    {hero.emphasis}
                  </p>
                </div>
                <div className="grid flex-1 grid-cols-1 gap-4 text-sm text-slate-100 md:grid-cols-2">
                  {heroFeatures.map((feature, index) => {
                    const accent =
                      FEATURE_ACCENT_CLASSES[
                        index % FEATURE_ACCENT_CLASSES.length
                      ];
                    const dotClass = `mt-[6px] h-2.5 w-2.5 flex-shrink-0 rounded-full ${accent}`;
                    return (
                      <div
                        key={`${feature.title}-${index}`}
                        className="group flex items-start gap-3 rounded-2xl bg-white/5 p-5 ring-1 ring-inset ring-white/15 backdrop-blur-sm transition will-change-transform hover:-translate-y-1 hover:bg-white/10"
                      >
                        <span className={dotClass} />
                        <div>
                          <p className="font-medium text-white/90">
                            {feature.title}
                          </p>
                          <p className="mt-2 text-xs text-slate-300/85">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        <main className={`${compact ? "mt-3 md:mt-4" : "mt-12 md:mt-16"}`}>
          {loading && (
            <div className="flex items-center justify-center h-[60svh]">
              <div className="h-24 w-24 rounded-full border border-white/15 bg-white/10 shadow-[0_0_60px_-20px_rgba(148,163,184,0.6)] animate-pulse" />
            </div>
          )}

          {!loading && error && (
            <div className="flex items-center justify-center h-[50svh]">
              <div className="rounded-xl bg-red-600/10 text-red-200 border border-red-400/30 px-4 py-3">
                {errorMessage}
              </div>
            </div>
          )}

          {!loading && !error && hasSearched && slidesCount === 0 && (
            <div className="flex items-center justify-center h-[50svh]">
              <div className="rounded-xl bg-white/5 text-slate-200 border border-white/15 px-4 py-3">
                {t("page.noResults")}
              </div>
            </div>
          )}

          {!loading && !error && slidesCount > 0 && (
            <div className="relative flex flex-col items-stretch">
              <div className="grid w-full max-w-7xl gap-6 md:grid-cols-[minmax(0,320px)_minmax(0,340px)_minmax(0,1fr)] md:gap-8 md:items-start lg:grid-cols-[minmax(0,340px)_minmax(0,380px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,360px)_minmax(0,420px)_minmax(0,1fr)]">
                <InfoPanel
                  ref={detailsRef}
                  contentId={contentId}
                  title={title}
                  affiliate={affiliate}
                  actressNames={actressNames}
                  makerName={makerName}
                  directorNames={directorNames}
                  releaseDate={releaseDate}
                  keyword={keyword}
                  stageSizeText={mediaStageSizeText}
                  imageSizeText={imageSizeText}
                  remainingCount={remainingItems.length}
                />

                <div className="relative order-2 md:order-none md:col-start-2 flex justify-center md:justify-center">
                  <div
                    className="relative flex items-center justify-center overflow-visible"
                    style={{
                      width: `${containerDimensions.width}px`,
                      height: `${containerDimensions.height}px`,
                      transition: "width 0.45s ease, height 0.45s ease",
                    }}
                  >
                    {videoSlide && (
                      <div
                        className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out ${
                          videoFront
                            ? "z-40"
                            : "z-20 translate-x-12 translate-y-10 scale-[0.95]"
                        } ${videoFront ? "" : "cursor-pointer"}`}
                      >
                        <VideoPanel
                          videoUrl={videoUrl}
                          posterUrl={
                            basePosterUrl ? proxiedBasePosterUrl : undefined
                          }
                          width={mediaDimensions.width}
                          height={mediaDimensions.height}
                          active={videoFront}
                          onActivate={() => {
                            setVideoFront(true);
                            void ensureVideoSource();
                          }}
                          onDeactivate={() => setVideoFront(false)}
                        />
                      </div>
                    )}
                    <div
                      className={`absolute inset-0 flex justify-center transition-all duration-500 ease-out ${
                        videoSlide ? (videoFront ? "z-30" : "z-50") : "z-50"
                      }`}
                    >
                      <div className="relative h-full w-full overflow-hidden rounded-[28px]">
                        <div
                          className={
                            videoSlide && videoFront
                              ? "pointer-events-none"
                              : "pointer-events-auto"
                          }
                        >
                          <PosterPanel
                            ref={carouselRef}
                            slides={imageSlides}
                            width={stage.stageW}
                            height={stage.containerH}
                            disableKeyboardNavigation={Boolean(
                              videoSlide && videoFront,
                            )}
                            initialIndex={activeIndex}
                            onSlideChange={(_, index) => {
                              if (index === activeIndex) {
                                return;
                              }
                              setActiveIndex(index);
                              setVideoFront(false);
                            }}
                            onRequestZoom={(index) => {
                              setVideoFront(false);
                              const target = imageIndexToZoom[index] ?? 0;
                              setZoomIndex(target);
                              setZoomOpen(true);
                            }}
                          />
                        </div>
                        {videoSlide && videoFront ? (
                          <div
                            aria-hidden="true"
                            className="pointer-events-auto absolute inset-0 z-30 rounded-[28px] border border-white/15 bg-white/15 backdrop-blur-[5px]"
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="order-3 mt-8 flex justify-center md:order-none md:col-start-3 md:mt-0 md:w-full md:justify-end md:justify-self-end">
                  <div className="sticky top-24 flex w-full max-w-[22rem] items-start md:max-w-[312px] lg:max-w-[360px] xl:max-w-[360px]">
                    <CommentPanel
                      height={stage.containerH}
                      size={Math.min(
                        128,
                        Math.max(
                          68,
                          Math.floor(
                            Math.min(stage.stageW, stage.containerH) * 0.18,
                          ),
                        ),
                      )}
                      contentId={contentId}
                      posterProxyUrl={proxiedPosterSmallUrl || undefined}
                      affiliateUrl={affiliate || undefined}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <ZoomModal
        open={zoomOpen}
        onClose={handleZoomClose}
        slides={zoomSlides}
        initialIndex={zoomIndex}
        onIndexChange={setZoomIndex}
      />
    </div>
  );
}
