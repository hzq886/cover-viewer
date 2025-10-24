"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import AuthBar from "@/components/AuthBar";
import ImageFeed, { type FeedCard } from "@/components/ImageFeed";
import InfoPanel from "@/components/InfoPanel";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Logo from "@/components/Logo";
import PosterPanel, { type MediaSlide } from "@/components/PosterPanel";
import SearchBar from "@/components/SearchBar";
import ViewerModal from "@/components/ViewerModal";
import ZoomModal from "@/components/ZoomModal";
import { useDmmSearch } from "@/hooks/useDmmSearch";
import { useLayoutHeights } from "@/hooks/useLayoutHeights";
import { useI18n } from "@/i18n/I18nProvider";
import type { DmmItem, DmmNameObj } from "@/types/dmm";

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

const getLegacyField = (
  item: DmmItem | null | undefined,
  key: string,
): string | undefined => {
  if (!item) return undefined;
  const record = item as Record<string, unknown>;
  const value = record[key];
  return typeof value === "string" ? value : undefined;
};

// 样图缩略信息的数据结构
type SampleThumb = { url: string; portrait: boolean };

// 页面入口组件
export default function Home() {
  const { t } = useI18n();
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
  // 当前窗口尺寸，驱动舞台的断点切换
  const [viewportWidth, setViewportWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  // 媒体展示区域引用，用于阻止冒泡
  const carouselRef = useRef<HTMLDivElement>(null);
  // 布局高度 Hook，提供 header/footer 引用与高度
  const { headerRef } = useLayoutHeights();
  // 详情信息面板引用，阻止外层点击切换
  const detailsRef = useRef<HTMLDivElement>(null);
  // Logo 容器引用，阻止外层点击切换
  const logoRef = useRef<HTMLDivElement>(null);
  // 媒体放大模态框控制
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string>("");
  const resolvingVideoRef = useRef(false);
  const [selectedItem, setSelectedItem] = useState<DmmItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
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
  const resultItems = useMemo(() => {
    const seen = new Set<string>();
    const collection: DmmItem[] = [];
    const register = (item: DmmItem | null) => {
      if (!item) return;
      const key =
        item.content_id ||
        item.contentid ||
        getLegacyField(item, "product_id") ||
        getLegacyField(item, "service_code") ||
        item.title ||
        "";
      if (key && seen.has(key)) return;
      if (key) seen.add(key);
      collection.push(item);
    };
    register(currentItem);
    if (Array.isArray(remainingItems)) {
      for (const entry of remainingItems) {
        register(entry ?? null);
      }
    }
    return collection;
  }, [currentItem, remainingItems]);

  const feedCards = useMemo<FeedCard[]>(() => {
    const spine = POSTER_SPINE_RATIO.toFixed(2);
    return resultItems.map((item, index) => {
      const poster = extractPosterUrl(item.imageURL ?? null);
      let coverUrl = "";
      if (poster) {
        const proxied = toProxyUrl(poster);
        coverUrl = `/api/split?url=${encodeURIComponent(proxied)}&side=front&spine=${spine}`;
      } else {
        const largeSamples = Array.isArray(item.sampleImageURL?.sample_l?.image)
          ? item.sampleImageURL?.sample_l?.image
          : [];
        const smallSamples = Array.isArray(item.sampleImageURL?.sample_s?.image)
          ? item.sampleImageURL?.sample_s?.image
          : [];
        const firstSample = [...largeSamples, ...smallSamples].find(
          (value): value is string =>
            typeof value === "string" && value.length > 0,
        );
        coverUrl = firstSample ? toProxyUrl(firstSample) : "";
      }
      const identifier =
        item.content_id ||
        item.contentid ||
        getLegacyField(item, "product_id") ||
        getLegacyField(item, "service_code") ||
        item.title ||
        `item-${index}`;
      return {
        id: identifier,
        item,
        coverUrl,
        title: item.title || "",
        maker: joinNames(item.iteminfo?.maker),
        releaseDate: item.date || item.release_date || "",
      } satisfies FeedCard;
    });
  }, [resultItems]);

  // 当前作品对应的基础海报 URL
  const basePosterUrl = useMemo(
    () => extractPosterUrl(selectedItem?.imageURL ?? null),
    [selectedItem],
  );
  const posterSmallUrl = useMemo(
    () =>
      selectedItem?.imageURL?.small ? String(selectedItem.imageURL.small) : "",
    [selectedItem],
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
    if (!selectedItem) {
      return;
    }
  }, [selectedItem]);
  useEffect(() => {
    if (currentItem || currentItem === null) {
      setSelectedItem(null);
      setDetailOpen(false);
    }
  }, [currentItem]);
  const sampleImages: string[] = useMemo(() => {
    const images =
      selectedItem?.sampleImageURL?.sample_l?.image ||
      selectedItem?.sampleImageURL?.sample_s?.image ||
      [];
    return Array.isArray(images) ? images : [];
  }, [selectedItem]);

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
      selectedItem?.sampleMovieURL?.sampleMovieURL?.size_720_480 ||
      selectedItem?.sampleMovieURL?.size_720_480 ||
      selectedItem?.sample_movie_url?.size_720_480 ||
      "",
    [selectedItem],
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

  const { imageSlides, mediaSlides } = useMemo(() => {
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

    const combined = video ? [...images, video] : images;

    return { imageSlides: images, mediaSlides: combined };
  }, [basePosterUrl, orderedSamples, sampleMovie, videoUrl]);

  const activeSlide = useMemo(
    () => mediaSlides[activeIndex] ?? null,
    [mediaSlides, activeIndex],
  );

  useEffect(() => {
    if (activeSlide?.type === "video") {
      void ensureVideoSource();
    }
  }, [activeSlide, ensureVideoSource]);

  // 监听窗口尺寸变化，更新视口尺寸
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 舞台相关尺寸，按照断点预设值计算
  const stage = useMemo(() => {
    const preset = STAGE_WIDTH_PRESETS.find(({ min }) => viewportWidth >= min);
    const baseWidth = preset ? preset.width : STAGE_WIDTH_DEFAULT;
    const horizontalMargin = viewportWidth >= 960 ? 96 : 48;
    const verticalMargin = 64;
    const infoWidth =
      viewportWidth >= 960
        ? Math.min(
            Math.max(Math.round(viewportWidth * 0.26), 220),
            360,
          )
        : 0;
    const fallbackHeight = Math.round(baseWidth / TARGET_ASPECT_RATIO);
    const availableHeight = viewportHeight
      ? Math.max(fallbackHeight, viewportHeight - verticalMargin)
      : fallbackHeight;
    const widthFromHeight = Math.round(availableHeight * TARGET_ASPECT_RATIO);
    const availableWidth = viewportWidth
      ? Math.max(
          STAGE_WIDTH_DEFAULT,
          viewportWidth - horizontalMargin - infoWidth,
        )
      : widthFromHeight;
    const stageW = Math.max(
      STAGE_WIDTH_DEFAULT,
      Math.min(widthFromHeight, availableWidth),
    );
    const containerH = Math.min(
      availableHeight,
      Math.round(stageW / TARGET_ASPECT_RATIO),
    );
    return {
      containerH,
      stageW,
    };
  }, [viewportHeight, viewportWidth]);

  const mediaDimensions = useMemo(
    () => ({ width: stage.stageW, height: stage.containerH }),
    [stage.containerH, stage.stageW],
  );

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
      if (mediaSlides.length === 0) return 0;
      const clamped = Math.min(prev, mediaSlides.length - 1);
      return clamped < 0 ? 0 : clamped;
    });
  }, [mediaSlides.length]);

  const resultsCount = resultItems.length;

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

  const handleOpenDetail = useCallback((item: DmmItem) => {
    setSelectedItem(item);
    setDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailOpen(false);
    setSelectedItem(null);
  }, []);

  // 重置页面状态并返回初始界面
  const handleResetHome = useCallback(() => {
    reset();
    setOrderedSamples([]);
    setActiveIndex(0);
    setZoomIndex(0);
    setZoomOpen(false);
    setResolvedVideoUrl("");
    resolvingVideoRef.current = false;
    setSelectedItem(null);
    setDetailOpen(false);
  }, [reset]);

  useEffect(() => {
    if (!detailOpen) return;
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleCloseDetail();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [detailOpen, handleCloseDetail]);

  // Header 导航的布局样式
  const navBase =
    "flex w-full items-center justify-start gap-4 md:gap-6 transition";

  const { contentId, title, affiliate, actressNames } =
    useMemo(() => {
      const iteminfo = selectedItem?.iteminfo;
      return {
        contentId:
          selectedItem?.content_id ||
          selectedItem?.contentid ||
          getLegacyField(selectedItem, "product_id") ||
          "",
        title: selectedItem?.title || "",
        affiliate: selectedItem?.affiliateURL || selectedItem?.URL || "",
        actressNames: joinNames(iteminfo?.actress),
      };
    }, [selectedItem]);

  return (
    <div className="relative min-h-svh w-full overflow-x-hidden overflow-y-auto bg-slate-950 text-slate-100 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="relative mx-auto max-w-7xl px-6 py-5">
        <header
          ref={headerRef}
          className="relative z-[80] flex w-full justify-start"
        >
          <nav className={navBase}>
            <div ref={logoRef} className="flex items-center justify-start">
              <Logo
                onHome={handleResetHome}
                className="scale-90 opacity-95 transition-transform hover:opacity-100"
              />
            </div>
            <div className="flex-1 min-w-[260px]">
              <SearchBar
                keyword={keyword}
                setKeyword={setKeyword}
                loading={loading}
                onSubmit={handleSearch}
              />
            </div>
            <div className="flex min-w-[120px] items-center justify-end">
              <div className="flex items-center gap-3">
                <LanguageSwitcher />
                <AuthBar />
              </div>
            </div>
          </nav>
        </header>

        <main className="mt-3 md:mt-4">
          <div className="relative flex min-h-[40svh] flex-col">
            <ImageFeed
              loading={loading}
              hasError={Boolean(error)}
              errorMessage={errorMessage ?? t("errors.unknown")}
              hasSearched={hasSearched}
              resultsCount={resultsCount}
              feedCards={feedCards}
              onOpenDetail={handleOpenDetail}
              startHint="开始输入关键字，探索最新的封面与样图。"
              emptyLabel={t("page.noResults")}
            />
          </div>
        </main>
      </div>

      <ViewerModal
        open={detailOpen && Boolean(selectedItem)}
        onClose={handleCloseDetail}
        poster={
          selectedItem && mediaSlides.length > 0 ? (
            <PosterPanel
              ref={carouselRef}
              slides={mediaSlides}
              width={mediaDimensions.width}
              height={mediaDimensions.height}
              disableKeyboardNavigation={activeSlide?.type === "video"}
              initialIndex={activeIndex}
              onSlideChange={(slide, index) => {
                if (index === activeIndex) {
                  return;
                }
                setActiveIndex(index);
                if (slide.type === "video") {
                  void ensureVideoSource();
                }
              }}
              onRequestZoom={(index) => {
                const target = imageIndexToZoom[index] ?? 0;
                setZoomIndex(target);
                setZoomOpen(true);
              }}
            />
          ) : null
        }
        info={
          selectedItem ? (
            <InfoPanel
              ref={detailsRef}
              contentId={contentId}
              title={title}
              affiliate={affiliate}
              actressNames={actressNames}
              posterProxyUrl={proxiedPosterSmallUrl || undefined}
              affiliateUrl={affiliate || undefined}
              commentAreaHeight={stage.containerH}
            />
          ) : null
        }
      />

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
