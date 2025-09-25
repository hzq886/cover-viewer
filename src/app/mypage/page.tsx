"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/auth/AuthProvider";
import CollectionCardTile from "@/components/CollectionCard";
import type {
  CollectionCard as CollectionCardType,
  CollectionRarity,
} from "@/types/collection";

const STORAGE_KEY = "cover-viewer:collection";
const accentKeys: CollectionCardType["accent"][] = [
  "amethyst",
  "azure",
  "sunrise",
  "emerald",
  "crimson",
  "void",
];

const createSvgDataUri = (svg: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const sampleShowcase: CollectionCardType[] = [
  {
    id: "aurora-resonance",
    title: "Aurora Resonance",
    subtitle: "星辉偶像·限定签绘海报",
    rarity: "UR",
    accent: "amethyst",
    attribute: "STELLA",
    series: "Starlight Waltz",
    tags: ["Hologram", "Limited", "Signed"],
    description:
      "虹彩箔材质展现出渐变星辉，偶像签名采用实金热封，每次翻页都能看到光晕游走。",
    coverUrl: createSvgDataUri(`
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 800'>
        <defs>
          <radialGradient id='glow1' cx='30%' cy='20%' r='70%'>
            <stop offset='0%' stop-color='#F0ABFC'/>
            <stop offset='40%' stop-color='rgba(192,132,252,0.35)'/>
            <stop offset='100%' stop-color='rgba(15,23,42,0.1)'/>
          </radialGradient>
          <radialGradient id='glow2' cx='80%' cy='75%' r='60%'>
            <stop offset='0%' stop-color='#38BDF8'/>
            <stop offset='45%' stop-color='rgba(56,189,248,0.35)'/>
            <stop offset='100%' stop-color='rgba(15,23,42,0.1)'/>
          </radialGradient>
          <linearGradient id='bg' x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' stop-color='#3B1D62'/>
            <stop offset='50%' stop-color='#6B21A8'/>
            <stop offset='100%' stop-color='#0F172A'/>
          </linearGradient>
        </defs>
        <rect width='600' height='800' fill='url(#bg)'/>
        <circle cx='180' cy='160' r='140' fill='url(#glow1)'/>
        <circle cx='420' cy='620' r='200' fill='url(#glow2)'/>
        <path d='M80 520 C220 420 380 640 520 520' stroke='rgba(244,114,182,0.55)' stroke-width='26' stroke-linecap='round' fill='none'/>
        <path d='M100 640 Q300 720 480 560' stroke='rgba(56,189,248,0.45)' stroke-width='18' stroke-linecap='round' fill='none'/>
      </svg>
    `),
    stats: [
      { label: "EDITION", value: "No.01/50" },
      { label: "SYNC", value: "ST✶R" },
    ],
    obtainedAt: "2024-08-15",
  },
  {
    id: "luminous-tide",
    title: "Luminous Tide",
    subtitle: "潮音都市·夜光巡航海报",
    rarity: "SSR",
    accent: "azure",
    attribute: "AQUA",
    series: "Neonwave Cruise",
    tags: ["Neon", "Citypop"],
    description:
      "海报采用全息水波纹制作，角落的靖海徽印会在紫外光下显现隐藏签章。",
    coverUrl: createSvgDataUri(`
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 800'>
        <defs>
          <linearGradient id='bg2' x1='0%' y1='0%' x2='100%' y2='120%'>
            <stop offset='0%' stop-color='#082F49'/>
            <stop offset='45%' stop-color='#0284C7'/>
            <stop offset='100%' stop-color='#020617'/>
          </linearGradient>
          <radialGradient id='glow3' cx='20%' cy='30%' r='60%'>
            <stop offset='0%' stop-color='rgba(125,211,252,0.6)'/>
            <stop offset='100%' stop-color='rgba(2,6,23,0)'/>
          </radialGradient>
          <radialGradient id='glow4' cx='75%' cy='70%' r='65%'>
            <stop offset='0%' stop-color='rgba(14,165,233,0.6)'/>
            <stop offset='100%' stop-color='rgba(2,6,23,0)'/>
          </radialGradient>
        </defs>
        <rect width='600' height='800' fill='url(#bg2)'/>
        <circle cx='140' cy='220' r='180' fill='url(#glow3)'/>
        <circle cx='460' cy='580' r='220' fill='url(#glow4)'/>
        <path d='M60 580 C200 520 400 640 540 540' stroke='rgba(56,189,248,0.5)' stroke-width='24' stroke-linecap='round' fill='none'/>
        <path d='M100 660 C260 700 360 660 520 620' stroke='rgba(125,211,252,0.4)' stroke-width='20' stroke-linecap='round' fill='none'/>
      </svg>
    `),
    stats: [
      { label: "EDITION", value: "Ne-02" },
      { label: "DEPTH", value: "AQUA+" },
    ],
    obtainedAt: "2024-07-02",
  },
  {
    id: "sunrise-serenade",
    title: "Sunrise Serenade",
    subtitle: "晨曦序章·双人伴舞",
    rarity: "SR",
    accent: "sunrise",
    attribute: "DAWN",
    series: "Aurora Prelude",
    tags: ["Duet", "First-Press"],
    description:
      "晨曦渐层使用双色亮银手工压印，边缘饰以轻微烫金颗粒，呈现砂糖般甜感。",
    coverUrl: createSvgDataUri(`
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 800'>
        <defs>
          <linearGradient id='bg3' x1='0%' y1='0%' x2='90%' y2='110%'>
            <stop offset='0%' stop-color='#7C2D12'/>
            <stop offset='50%' stop-color='#F97316'/>
            <stop offset='100%' stop-color='#0F172A'/>
          </linearGradient>
          <radialGradient id='glow5' cx='25%' cy='25%' r='55%'>
            <stop offset='0%' stop-color='rgba(253,186,116,0.6)'/>
            <stop offset='100%' stop-color='rgba(15,23,42,0)'/>
          </radialGradient>
          <radialGradient id='glow6' cx='70%' cy='70%' r='60%'>
            <stop offset='0%' stop-color='rgba(249,115,22,0.55)'/>
            <stop offset='100%' stop-color='rgba(15,23,42,0)'/>
          </radialGradient>
        </defs>
        <rect width='600' height='800' fill='url(#bg3)'/>
        <circle cx='180' cy='200' r='170' fill='url(#glow5)'/>
        <circle cx='460' cy='580' r='210' fill='url(#glow6)'/>
        <path d='M80 580 C210 460 360 640 520 520' stroke='rgba(251,191,36,0.45)' stroke-width='24' stroke-linecap='round' fill='none'/>
        <path d='M120 660 C240 720 360 700 520 640' stroke='rgba(253,164,59,0.45)' stroke-width='18' stroke-linecap='round' fill='none'/>
      </svg>
    `),
    stats: [
      { label: "EDITION", value: "PRM-07" },
      { label: "HARMONY", value: "DUO" },
    ],
    obtainedAt: "2024-06-11",
  },
  {
    id: "verdant-pulse",
    title: "Verdant Pulse",
    subtitle: "森林律动·能量召唤",
    rarity: "SSR",
    accent: "emerald",
    attribute: "GAIA",
    series: "Sylvan Anthem",
    tags: ["Mythic", "Foil"],
    description:
      "柔和绿光与秘术线条构成魔阵，使用全幅烫箔与局部UV形成年轻幻想气息。",
    stats: [
      { label: "EDITION", value: "GA-12" },
      { label: "BPM", value: "128" },
    ],
    obtainedAt: "2024-05-23",
  },
  {
    id: "crimson-rush",
    title: "Crimson Rush",
    subtitle: "夜幕追逐·极限爆裂",
    rarity: "SR",
    accent: "crimson",
    attribute: "BLAZE",
    series: "Riot Circuit",
    tags: ["Rock", "Event"],
    description:
      "红曜核心刻有能量脉络，配合微粒闪粉，让整张海报的冲击力直接爆表。",
    stats: [
      { label: "EDITION", value: "RC-05" },
      { label: "BOOST", value: "MAX" },
    ],
    obtainedAt: "2024-04-29",
  },
  {
    id: "lunar-silhouette",
    title: "Lunar Silhouette",
    subtitle: "月影手札·静夜密语",
    rarity: "R",
    accent: "void",
    attribute: "NOX",
    series: "Nocturne Diary",
    tags: ["Monochrome", "Story"],
    description:
      "以冷调银灰描绘的手绘月影，搭配镜面压线与局部暗光，营造静夜画卷。",
    stats: [
      { label: "EDITION", value: "ND-03" },
      { label: "MOON", value: "47%" },
    ],
    obtainedAt: "2024-03-12",
  },
];

type StoredCardPayload = Partial<CollectionCardType> & {
  posterUrl?: string;
  image?: string;
  rarity?: CollectionRarity;
  accent?: CollectionCardType["accent"] | string;
};

const normalizeStoredCard = (
  value: StoredCardPayload,
  index: number,
): CollectionCardType | null => {
  const title = value.title?.trim();
  if (!title) return null;
  const rarity = (value.rarity || "SR") as CollectionRarity;
  const accent = accentKeys.includes(
    value.accent as CollectionCardType["accent"],
  )
    ? (value.accent as CollectionCardType["accent"])
    : "amethyst";
  return {
    id: value.id || `stored-${index}`,
    title,
    subtitle: value.subtitle,
    rarity,
    accent,
    attribute: value.attribute,
    series: value.series,
    tags: value.tags,
    description: value.description,
    coverUrl: value.coverUrl || value.posterUrl || value.image,
    obtainedAt: value.obtainedAt,
    stats: value.stats,
  };
};

export default function MyPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [cards, setCards] = useState<CollectionCardType[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setCards([]);
      if (!loading) {
        setReady(true);
      }
      return;
    }
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setCards([]);
        setReady(true);
        return;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        setCards([]);
        setReady(true);
        return;
      }
      const normalized = parsed
        .map((item, index) =>
          normalizeStoredCard(item as StoredCardPayload, index),
        )
        .filter((item): item is CollectionCardType => !!item);
      setCards(normalized);
    } catch (error) {
      console.error("Failed to load collection", error);
      setCards([]);
    } finally {
      setReady(true);
    }
  }, [isAuthenticated, loading]);

  const displayCards = cards.length > 0 ? cards : sampleShowcase;
  const usingSample = cards.length === 0;

  const collectorName = useMemo(() => {
    if (user?.email) return user.email;
    if (user?.displayName) return user.displayName;
    return "Guest";
  }, [user]);

  const showContent = ready && !loading && isAuthenticated;

  return (
    <div className="relative flex h-[100svh] flex-col overflow-hidden bg-[#050617] text-white">
      <div className="pointer-events-none absolute -left-44 top-10 h-[480px] w-[480px] rounded-full bg-violet-500/25 blur-[140px]" />
      <div className="pointer-events-none absolute -right-36 bottom-0 h-[520px] w-[480px] rounded-full bg-sky-500/20 blur-[140px]" />
      <div className="pointer-events-none absolute left-1/3 top-1/2 h-[360px] w-[360px] -translate-y-1/2 rounded-full bg-fuchsia-500/16 blur-[120px]" />

      <main className="relative z-10 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <header className="flex flex-col gap-6 border-b border-white/10 pb-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.38em] text-violet-200/70">
                  Collector Profile
                </p>
                <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
                  {collectorName}
                </h1>
                <p className="mt-3 max-w-2xl text-sm text-slate-200/75">
                  欢迎来到你的收藏图鉴。未来在海报详情页点赞后，这里会自动解锁专属卡牌，呈现每张精选封面的独特光辉。
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 md:items-end">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur transition hover:border-violet-300/60 hover:bg-white/20"
                >
                  返回舞台
                </Link>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right text-xs uppercase tracking-[0.34em] text-white/60">
                  Cards Ready
                  <div className="text-lg font-semibold text-white">
                    {cards.length.toString().padStart(2, "0")}
                  </div>
                </div>
              </div>
            </div>
            {usingSample && showContent && (
              <div className="rounded-2xl border border-violet-200/25 bg-violet-500/10 px-5 py-4 text-sm text-violet-100/90">
                目前还没有实际收藏，这里展示的是概念样式。待点赞功能完成后，你的专属海报卡牌会自动出现在此处。
              </div>
            )}
          </header>

          {loading && (
            <div className="flex h-[50svh] items-center justify-center">
              <div className="h-20 w-20 animate-spin rounded-full border-4 border-white/20 border-t-violet-400" />
            </div>
          )}

          {!loading && !isAuthenticated && (
            <div className="mt-16 flex flex-col items-center gap-6 text-center">
              <h2 className="text-2xl font-semibold text-white">需要登录</h2>
              <p className="max-w-md text-sm text-slate-200/70">
                请先完成登录，以便同步你的收藏。我们将为每一张点赞的海报生成独特卡面。
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full border border-violet-200/20 bg-violet-500/30 px-5 py-2 text-sm text-white backdrop-blur transition hover:bg-violet-500/40"
              >
                前往登录
              </Link>
            </div>
          )}

          {showContent && (
            <section className="mt-12 space-y-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {usingSample ? "Concept Deck" : "My Collection"}
                  </h2>
                  <p className="text-sm text-slate-200/70">
                    {usingSample
                      ? "预览套牌用于展示卡牌呈现风格与光效。"
                      : "你已解锁的点赞海报会以卡牌形式陈列在此。"}
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] uppercase tracking-[0.34em] text-white/60">
                  {displayCards.length} 枚卡牌
                </div>
              </div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                {displayCards.map((card) => (
                  <CollectionCardTile key={card.id} card={card} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
