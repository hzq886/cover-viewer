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

// 将远程 URL 转换为代理地址，确保统一走本地 API
const toProxyUrl = (url?: string | null): string => {
  if (!url) return "";
  return url.startsWith("/api/") ? url : `/api/proxy?url=${encodeURIComponent(url)}`;
};

// 从 DMM 提供的多尺寸图片对象中提取首选海报 URL
const extractPosterUrl = (imageUrl?: { large?: string | null; small?: string | null } | null): string => {
  if (!imageUrl) return "";
  return imageUrl.large || imageUrl.small || "";
};

// 将演员、导演等信息统一整理为“、”分隔的字符串
const joinNames = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "object" && item && "name" in item ? (item as DmmNameObj).name ?? "" : ""))
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
  // 搜索 hook 提供的状态与动作
  const { keyword, setKeyword, currentItem, remainingItems, loading, error, hasSearched, submit, reset } = useDmmSearch();
  // 是否处于紧凑布局（显示结果后自动启用）
  const [compact, setCompact] = useState(false);
  // 当前视口尺寸，驱动舞台自适应
  const [viewport, setViewport] = useState<{ vw: number; vh: number }>({ vw: 0, vh: 0 });
  // 海报展示区域的引用，用于判断点击区域
  const posterRef = useRef<HTMLDivElement>(null);
  // 布局高度 Hook，提供 header/footer 引用与高度
  const { headerRef, footerRef, layoutH } = useLayoutHeights();
  // 详情信息面板引用，阻止外层点击切换
  const detailsRef = useRef<HTMLDivElement>(null);
  // Logo 容器引用，阻止外层点击切换
  const logoRef = useRef<HTMLDivElement>(null);
  // 样图列表引用，阻止外层点击切换
  const sampleRef = useRef<HTMLDivElement>(null);

  // 放大查看模态框是否打开
  const [modalOpen, setModalOpen] = useState(false);
  // 放大模态框当前使用的图片地址
  const [modalImgUrl, setModalImgUrl] = useState<string>("");
  // 试看视频模态框是否打开
  const [videoOpen, setVideoOpen] = useState(false);
  // 试看视频播放地址
  const [videoUrl, setVideoUrl] = useState<string>("");

  // 当前选中的搜索结果
  const pick = currentItem;

  // 当前作品对应的基础海报 URL
  const basePosterUrl = useMemo(() => extractPosterUrl((pick as any)?.imageURL ?? null), [pick]);
  // 样图模式下选中的单张图片地址
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");
  // 当前海报朝向，front 为封面，back 为封底
  const [selectedSide, setSelectedSide] = useState<"front" | "back" | null>(null);

  // 作品切换时重置选中图片与朝向
  useEffect(() => {
    setSelectedImageUrl("");
    setSelectedSide(pick ? "front" : null);
  }, [pick]);

  // 当前展示的主图地址：优先样图，其次海报
  const posterUrl = selectedImageUrl || basePosterUrl;
  // 当前展示图的代理地址
  const proxiedPosterUrl = useMemo(() => toProxyUrl(posterUrl), [posterUrl]);
  // 用于取色的海报代理地址
  const proxiedColorUrl = useMemo(() => toProxyUrl(basePosterUrl), [basePosterUrl]);
  // 主图的主色与原始尺寸信息
  const { dominant, naturalSize } = useImageColor(basePosterUrl, proxiedColorUrl);

  // 选中样图的代理地址
  const proxiedSelectedUrl = useMemo(() => toProxyUrl(selectedImageUrl), [selectedImageUrl]);
  // 选中样图的尺寸信息，用于展示面板
  const { naturalSize: selectedNatural } = useImageColor(
    selectedImageUrl || null,
    selectedImageUrl ? proxiedSelectedUrl : undefined,
  );

  // 一旦有海报可用则切换为紧凑模式
  useEffect(() => {
    if (!posterUrl) return;
    setCompact(true);
  }, [posterUrl]);

  // 监听窗口尺寸变化，更新视口参数
  useEffect(() => {
    // 窗口尺寸变更时的处理逻辑
    const handleResize = () => setViewport({ vw: window.innerWidth, vh: window.innerHeight });
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

  // 是否处于海报模式（即展示整张封面/封底组合）
  const isPosterMode = !selectedImageUrl || selectedImageUrl.startsWith("/api/split");
  // 是否展示单张图片（样图模式）
  const showSingle = !isPosterMode;
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
    const clampedHeight = Math.floor(Math.min(availableHeight, MAX_STAGE_HEIGHT));
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
    // 封面宽度占比（含书脊）
    const frontFrac = showSingle ? 1 : 0.5 + POSTER_SPINE_RATIO / 2;
    // 封底宽度占比（扣除书脊）
    const backFrac = showSingle ? 0 : 0.5 - POSTER_SPINE_RATIO / 2;
    // 实际封面宽度（像素）
    const frontW = Math.floor(stageW * frontFrac);
    // 实际封底宽度（像素）
    const backW = Math.max(0, Math.floor(stageW * backFrac));
    // 样图缩略图基础尺寸（单边）
    const baseThumb = Math.max(96, Math.min(160, Math.floor((containerH || 480) / 3.2)));
    // 缩略图最终尺寸（考虑 2x 像素）
    const thumbSize = baseThumb * 2;

    return {
      containerH,
      stageW,
      frontW,
      backW,
      thumbSize,
      stageSizeText: `${frontW + backW}px × ${containerH}px`,
    };
  }, [compact, footerHeight, headerHeight, showSingle, viewport.vh, viewport.vw]);

  // 展示在 InfoPanel 中的图片尺寸文案
  const imageSizeText = useMemo(() => {
    if (isPosterMode) {
      if (!naturalSize) return undefined;
      // 不同朝向使用不同宽度比例
      const widthRatio = selectedSide === "back" ? 0.5 - POSTER_SPINE_RATIO / 2 : 0.5 + POSTER_SPINE_RATIO / 2;
      // 当前侧面的实际宽度
      const widthPx = Math.floor((naturalSize.w || 0) * widthRatio);
      return `${widthPx || 0}px × ${naturalSize.h || 0}px`;
    }
    if (selectedNatural) {
      return `${selectedNatural.w}px × ${selectedNatural.h}px`;
    }
    return undefined;
  }, [isPosterMode, naturalSize, selectedNatural, selectedSide]);

  // 来源于 DMM 样图字段的原始地址列表
  const sampleImages: string[] = useMemo(() => {
    const images =
      (pick as any)?.sampleImageURL?.sample_l?.image || (pick as any)?.sampleImageURL?.sample_s?.image || [];
    return Array.isArray(images) ? images : [];
  }, [pick]);

  // 排序后的样图列表（先竖版后横版）
  const [orderedSamples, setOrderedSamples] = useState<SampleThumb[]>([]);
  // 根据尺寸判定样图方向并排序
  useEffect(() => {
    let cancelled = false;
    if (sampleImages.length === 0) {
      setOrderedSamples([]);
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      // 并行加载样图并记录宽高信息
      const results = await Promise.all(
        sampleImages.map(async (url, index) => {
          try {
            // 浏览器 Image 对象用于探测尺寸
            const img = new Image();
            await new Promise<void>((resolve) => {
              img.onload = () => resolve();
              img.onerror = () => resolve();
              img.src = `/api/proxy?url=${encodeURIComponent(url)}`;
            });
            // 竖版判断：高度是否不小于宽度
            const portrait = img.naturalHeight >= img.naturalWidth;
            return { url, index, portrait };
          } catch {
            return { url, index, portrait: true };
          }
        }),
      );
      if (cancelled) return;
      // 竖版样图保持原有顺序
      const portraits: SampleThumb[] = results
        .filter((item) => item.portrait)
        .sort((a, b) => a.index - b.index)
        .map((item) => ({ url: item.url, portrait: true }));
      // 横版样图保持原有顺序
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

  // DMM 返回的试看视频地址
  const sampleMovie: string = useMemo(
    () =>
      (pick as any)?.sampleMovieURL?.sampleMovieURL?.size_720_480 ||
      (pick as any)?.sampleMovieURL?.size_720_480 ||
      (pick as any)?.sample_movie_url?.size_720_480 ||
      "",
    [pick],
  );

  // 搜索事件处理（触发 DMM 接口请求）
  const handleSearch = useCallback(async () => {
    await submit();
  }, [submit]);

  // 重置页面状态并返回初始界面
  const handleResetHome = useCallback(() => {
    reset();
    setCompact(false);
    setSelectedImageUrl("");
    setSelectedSide(null);
    setOrderedSamples([]);
    setModalOpen(false);
    setModalImgUrl("");
    setVideoOpen(false);
    setVideoUrl("");
  }, [reset]);

  // 播放试看视频，先尝试解析真实地址
  const handlePlay = useCallback(async () => {
    if (!sampleMovie) return;
    try {
      // 请求后端解析试看视频的真实地址
      const response = await fetch(`/api/resolve-video?url=${encodeURIComponent(sampleMovie)}`);
      // 解析接口返回的 JSON 数据
      const data = await response.json();
      // 获取优先使用的实际播放地址
      const resolved = data?.url || sampleMovie;
      setVideoUrl(resolved);
      setVideoOpen(true);
    } catch {
      setVideoUrl(sampleMovie);
      setVideoOpen(true);
    }
  }, [sampleMovie]);

  // Header 导航的布局样式
  const navBase = compact
    ? "flex w-full items-center justify-start gap-4 md:gap-6 transition"
    : "flex w-full flex-col items-center justify-center gap-6 transition";

  // 作品 ID（多字段兼容）
  const contentId = (pick as any)?.content_id || (pick as any)?.contentid || "";
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
  const releaseDate = (pick as any)?.date || (pick as any)?.release_date || "";

  // 样图模块的总高度，留出额外空间
  const stageHeightForSamples = stage.containerH + 24;

  return (
    <div
      className="relative min-h-svh w-full overflow-hidden text-slate-100"
      onClickCapture={(event) => {
        // 当前点击的目标节点
        const target = event.target as Node;
        if (headerRef.current && headerRef.current.contains(target)) return;
        if (logoRef.current && logoRef.current.contains(target)) return;
        if (footerRef.current && footerRef.current.contains(target)) return;
        if (detailsRef.current && detailsRef.current.contains(target)) return;
        if (sampleRef.current && sampleRef.current.contains(target)) return;
        if (modalOpen) return;
        if (posterRef.current && posterUrl && !posterRef.current.contains(target) && isPosterMode) {
          setSelectedSide((prev) => (prev === "back" ? "front" : "back"));
        }
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
                onSubmit={handleSearch}
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
                <InfoPanel
                  ref={detailsRef}
                  contentId={contentId}
                  title={title}
                  affiliate={affiliate}
                  actressNames={actressNames}
                  makerName={makerName}
                  directorNames={directorNames}
                  releaseDate={releaseDate}
                  onPlay={sampleMovie ? handlePlay : undefined}
                  keyword={keyword}
                  stageSizeText={stage.stageSizeText}
                  imageSizeText={imageSizeText}
                  remainingCount={remainingItems.length}
                />

                <div className="flex-1 flex justify-center">
                  <PosterComposite
                    ref={posterRef}
                    posterUrl={posterUrl}
                    proxiedPosterUrl={proxiedPosterUrl}
                    basePosterUrl={basePosterUrl}
                    containerH={stage.containerH}
                    frontW={stage.frontW}
                    backW={stage.backW}
                    defaultShowBack={false}
                    onOpenModal={() => {
                      setModalImgUrl(posterUrl);
                      setModalOpen(true);
                    }}
                    single={showSingle}
                    hoverFlip={false}
                    forceSide={selectedSide || undefined}
                  />
                </div>

                {orderedSamples.length > 0 && (
                  <SampleColumn
                    ref={sampleRef}
                    images={orderedSamples}
                    height={stageHeightForSamples}
                    thumbSize={stage.thumbSize}
                    onSelect={(url, meta) => {
                      if (meta?.side) {
                        setSelectedSide(meta.side);
                        setSelectedImageUrl("");
                      } else {
                        setSelectedSide(null);
                        setSelectedImageUrl(url);
                      }
                    }}
                    frontBackSrc={basePosterUrl}
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
        samples={orderedSamples.map((sample) => sample.url)}
        posterUrl={basePosterUrl}
      />
      <VideoModal open={videoOpen} onClose={() => setVideoOpen(false)} videoUrl={videoUrl} />
    </div>
  );
}
