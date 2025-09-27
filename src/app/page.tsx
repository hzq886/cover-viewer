"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import AuthBar from "@/components/AuthBar";
import CommentPanel from "@/components/CommentPanel";
import InfoPanel from "@/components/InfoPanel";
import VideoPanel from "@/components/VideoPanel";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Logo from "@/components/Logo";
import PosterPanel, { type MediaSlide } from "@/components/PosterPanel";
import SearchBar from "@/components/SearchBar";
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
// 舞台宽度上限占视口宽度的比例
const STAGE_WIDTH_FRACTION = 0.72;
// 舞台允许的最大高度
const MAX_STAGE_HEIGHT = 800;
// 舞台可用高度下限，避免过小
const MIN_AVAILABLE_HEIGHT = 180;
// 紧凑布局时的上下内边距
const COMPACT_PADDING = 24;
// 宽松布局时的上下内边距
const RELAXED_PADDING = 40;
// 额外安全间距，避免底部遮挡
const SAFETY_GAP = 48;
// 视频原生尺寸（DMM 示例片段）
const VIDEO_NATIVE_WIDTH = 720;
const VIDEO_NATIVE_HEIGHT = 480;
const VIDEO_ASPECT_RATIO = VIDEO_NATIVE_WIDTH / VIDEO_NATIVE_HEIGHT;
const VIDEO_HEIGHT_FACTOR = VIDEO_NATIVE_HEIGHT / VIDEO_NATIVE_WIDTH;

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
  // 当前视口尺寸，驱动舞台自适应
  const [viewport, setViewport] = useState<{ vw: number; vh: number }>({
    vw: 0,
    vh: 0,
  });
  // 媒体展示区域引用，用于阻止冒泡
  const carouselRef = useRef<HTMLDivElement>(null);
  // 布局高度 Hook，提供 header/footer 引用与高度
  const { headerRef, footerRef, layoutH } = useLayoutHeights();
  // 详情信息面板引用，阻止外层点击切换
  const detailsRef = useRef<HTMLDivElement>(null);
  // Logo 容器引用，阻止外层点击切换
  const logoRef = useRef<HTMLDivElement>(null);
  // 媒体放大模态框控制
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [activeSlide, setActiveSlide] = useState<MediaSlide | null>(null);
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
  // 作品切换时重置媒体状态
  useEffect(() => {
    setActiveIndex(0);
    setActiveSlide(null);
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

  const ensureVideoSource = useCallback(async () => {
    if (!sampleMovie) return undefined;
    if (resolvedVideoUrl) return resolvedVideoUrl;
    if (resolvingVideoRef.current) return resolvedVideoUrl || sampleMovie;
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
  }, [resolvedVideoUrl, sampleMovie]);

  const { imageSlides, videoSlide } = useMemo(() => {
    const images: MediaSlide[] = [];
    let video: MediaSlide | null = null;

    if (basePosterUrl) {
      const spine = POSTER_SPINE_RATIO.toFixed(2);
      images.push({
        type: "poster",
        side: "front",
        url: `${basePosterUrl}?side=front`,
        displayUrl: `/api/split?url=${encodeURIComponent(basePosterUrl)}&side=front&spine=${spine}`,
        portrait: true,
        label: "front",
        zoomUrl: toProxyUrl(basePosterUrl),
      });
      images.push({
        type: "poster",
        side: "back",
        url: `${basePosterUrl}?side=back`,
        displayUrl: `/api/split?url=${encodeURIComponent(basePosterUrl)}&side=back&spine=${spine}`,
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
      const videoSource = resolvedVideoUrl || sampleMovie;
      video = {
        type: "video",
        url: videoSource,
        displayUrl: toProxyUrl(videoSource),
        zoomUrl: toProxyUrl(videoSource),
      };
    }

    return { imageSlides: images, videoSlide: video };
  }, [basePosterUrl, orderedSamples, resolvedVideoUrl, sampleMovie]);

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
  // 用于取色的海报代理地址
  const proxiedColorUrl = useMemo(
    () => toProxyUrl(basePosterUrl),
    [basePosterUrl],
  );
  // 主图的主色与原始尺寸信息
  const { dominant, naturalSize } = useImageColor(
    basePosterUrl,
    proxiedColorUrl,
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

  // 一旦有海报可用则切换为紧凑模式

  // 监听窗口尺寸变化，更新视口参数
  useEffect(() => {
    // 窗口尺寸变更时的处理逻辑
    const handleResize = () =>
      setViewport({ vw: window.innerWidth, vh: window.innerHeight });
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

  // Header/Footer 的高度信息
  const { header: headerHeight, footer: footerHeight } = layoutH;

  // 舞台相关尺寸，随视口变化动态计算
  const stage = useMemo(() => {
    // 当前上下 padding，根据紧凑状态决定
    const verticalPadding = compact ? COMPACT_PADDING : RELAXED_PADDING;
    // 计算可用高度，扣除头尾与安全间距
    const availableHeight = Math.max(
      MIN_AVAILABLE_HEIGHT,
      viewport.vh - headerHeight - footerHeight - verticalPadding - SAFETY_GAP,
    );
    // 限制高度不超过设定上限
    const clampedHeight = Math.floor(
      Math.min(availableHeight, MAX_STAGE_HEIGHT),
    );
    // 初始舞台高度，保持在最小高度以上
    let containerH = Math.max(clampedHeight, MIN_AVAILABLE_HEIGHT);
    // 根据目标宽高比计算舞台宽度
    let stageW = Math.floor(containerH * TARGET_ASPECT_RATIO);
    // 视口允许的最大宽度
    const widthLimit = Math.floor(viewport.vw * STAGE_WIDTH_FRACTION);
    // 如果舞台宽度超限，按宽度反推高度
    if (widthLimit > 0 && stageW > widthLimit) {
      stageW = widthLimit;
      containerH = Math.floor(stageW / TARGET_ASPECT_RATIO);
    }
    return {
      containerH,
      stageW,
      stageSizeText: `${stageW}px × ${containerH}px`,
    };
  }, [compact, footerHeight, headerHeight, viewport.vh, viewport.vw]);

  const videoCardDimensions = useMemo(() => {
    const inactiveWidth = stage.stageW;
    const inactiveHeight = stage.containerH;
    if (!inactiveWidth || !inactiveHeight) {
      return {
        inactiveWidth,
        inactiveHeight,
        activeWidth: inactiveWidth,
        activeHeight: inactiveHeight,
      };
    }
    if (!videoSlide) {
      return {
        inactiveWidth,
        inactiveHeight,
        activeWidth: inactiveWidth,
        activeHeight: inactiveHeight,
      };
    }

    const viewportLimit =
      viewport.vw > 0
        ? Math.floor(viewport.vw * 0.8)
        : Number.POSITIVE_INFINITY;
    const heightDrivenWidth = Math.round(inactiveHeight * VIDEO_ASPECT_RATIO);
    const widthDrivenWidth = Math.round(inactiveWidth * 1.35);
    const baseMinWidth = Math.max(inactiveWidth, VIDEO_NATIVE_WIDTH);
    const rawWidth = Math.max(
      baseMinWidth,
      heightDrivenWidth,
      widthDrivenWidth,
    );
    const maxByMultiplier = Math.round(inactiveWidth * 1.8);
    const cappedWidth = Math.max(
      baseMinWidth,
      Math.min(rawWidth, viewportLimit, maxByMultiplier),
    );
    const aspectHeight = Math.round(cappedWidth * VIDEO_HEIGHT_FACTOR);
    const activeHeight = Math.max(VIDEO_NATIVE_HEIGHT, aspectHeight);

    return {
      inactiveWidth,
      inactiveHeight,
      activeWidth: cappedWidth,
      activeHeight,
    };
  }, [stage.containerH, stage.stageW, videoSlide, viewport.vw]);

  const inlineVideoWidth = videoFront
    ? videoCardDimensions.activeWidth
    : videoCardDimensions.inactiveWidth;

  const inlineVideoHeight = videoFront
    ? videoCardDimensions.activeHeight
    : videoCardDimensions.inactiveHeight;

  const videoContainerWidth = videoFront
    ? Math.max(videoCardDimensions.activeWidth, stage.stageW)
    : stage.stageW;

  const videoContainerHeight = videoFront
    ? Math.max(videoCardDimensions.activeHeight, stage.containerH)
    : stage.containerH;

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

  const slidesCount = imageSlides.length;

  useEffect(() => {
    if (!slidesCount) return;
    setCompact(true);
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
      const nextSlide = imageSlides[nextImageIndex] ?? null;
      setActiveSlide(nextSlide);
      if (nextSlide?.type === "video") {
        void ensureVideoSource();
      }
    },
    [ensureVideoSource, imageSlides, zoomToImage],
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
    setActiveSlide(null);
    setZoomIndex(0);
    setZoomOpen(false);
    setResolvedVideoUrl("");
    resolvingVideoRef.current = false;
  }, [reset]);

  // Header 导航的布局样式
  const navBase = compact
    ? "flex w-full items-center justify-start gap-4 md:gap-6 transition"
    : "flex w-full flex-col items-center justify-center gap-6 transition";

  // 作品 ID（多字段兼容）
  const contentId = pick?.content_id || pick?.contentid || "";
  // 作品标题
  const title = pick?.title || "";
  // 推广链接或原始详情页
  const affiliate = pick?.affiliateURL || pick?.URL || "";
  // 演员列表
  const actressNames = joinNames(pick?.iteminfo?.actress);
  // 导演列表
  const directorNames = joinNames(pick?.iteminfo?.director);
  // 制作方名称
  const makerName = joinNames(pick?.iteminfo?.maker) || pick?.maker?.name || "";
  // 发售日期
  const releaseDate = pick?.date || pick?.release_date || "";

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

        {!compact && (
          <section className="mt-6 w-full">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 px-6 py-7 shadow-[0_40px_120px_-45px_rgba(15,23,42,0.95)] md:px-9 md:py-9">
              <div className="pointer-events-none absolute -top-20 right-6 h-44 w-44 rounded-full bg-violet-500/30 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 left-0 h-48 w-48 rounded-full bg-fuchsia-500/25 blur-3xl" />
              <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center">
                <div className="flex-1">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-violet-100 ring-1 ring-inset ring-white/20">
                    {hero.badge}
                  </span>
                  <h2 className="mt-4 text-xl md:text-2xl font-semibold text-white">
                    {hero.heading1}
                  </h2>
                  <h2 className="mt-4 text-xl md:text-2xl font-semibold text-white">
                    {hero.heading2}
                  </h2>
                  <p className="mt-3 text-sm md:text-base text-slate-200/80">
                    {hero.description}
                    <br />
                    <em className="font-mono not-italic">{hero.emphasis}</em>
                  </p>
                </div>
                <div className="grid flex-1 grid-cols-1 gap-3 text-sm text-slate-100 md:grid-cols-2">
                  {heroFeatures.map((feature, index) => {
                    const dotClass =
                      index === 0
                        ? "mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-violet-400 shadow-[0_0_0_6px_rgba(168,85,247,0.2)]"
                        : "mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-fuchsia-400 shadow-[0_0_0_6px_rgba(232,121,249,0.2)]";
                    return (
                      <div
                        key={`${feature.title}-${index}`}
                        className="flex items-start gap-3 rounded-2xl bg-black/30 p-4 ring-1 ring-inset ring-white/10"
                      >
                        <span className={dotClass} />
                        <div>
                          <p className="font-medium text-white/90">
                            {feature.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-300/80">
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
              <div className="relative">
                <div className="h-24 w-24 rounded-full border-4 border-white/20 border-t-violet-400 animate-spin" />
              </div>
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
              <div className="grid w-full max-w-7xl gap-6 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)_minmax(0,280px)] md:gap-8 md:items-start xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)_minmax(0,320px)]">
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
                  stageSizeText={stage.stageSizeText}
                  imageSizeText={imageSizeText}
                  remainingCount={remainingItems.length}
                />

                <div className="relative order-2 md:order-none md:col-start-2 flex justify-center md:justify-start md:pl-8 xl:pl-12">
                  <div
                    className="relative flex items-center justify-center overflow-visible"
                    style={{
                      width: `${videoContainerWidth}px`,
                      height: `${videoContainerHeight}px`,
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
                          videoUrl={resolvedVideoUrl || sampleMovie}
                          posterUrl={
                            basePosterUrl
                              ? toProxyUrl(basePosterUrl)
                              : undefined
                          }
                          width={inlineVideoWidth}
                          height={inlineVideoHeight}
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
                      className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out ${
                        videoSlide ? (videoFront ? "z-30" : "z-50") : "z-50"
                      }`}
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
                        onSlideChange={(slide, index) => {
                          if (
                            index === activeIndex &&
                            activeSlide?.url === slide.url
                          ) {
                            return;
                          }
                          setActiveIndex(index);
                          setActiveSlide(slide);
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
                  </div>
                </div>
                <div className="order-3 mt-8 flex justify-center md:order-none md:col-start-3 md:mt-0 md:justify-end md:pl-3 xl:pl-3">
                  <div className="sticky top-24 flex w-full max-w-xs items-start md:max-w-[260px] xl:max-w-[320px]">
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
