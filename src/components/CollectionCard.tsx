import type { CollectionCard } from "@/types/collection";

const accentPresets: Record<
  CollectionCard["accent"],
  {
    frame: string;
    surface: string;
    aura: string;
    glow: string;
    badge: string;
    streak: string;
  }
> = {
  amethyst: {
    frame: "border-violet-300/35",
    surface:
      "bg-gradient-to-br from-[#3b1d62]/90 via-[#6b21a8]/65 to-[#0f172a]/92",
    aura: "bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.35),_transparent_55%),radial-gradient(circle_at_80%_30%,_rgba(59,130,246,0.28),_transparent_52%)]",
    glow: "shadow-[0_28px_85px_-40px_rgba(129,140,248,0.9)]",
    badge: "from-[#a855f7] via-[#d946ef] to-[#38bdf8]",
    streak: "bg-gradient-to-r from-transparent via-white/50 to-transparent",
  },
  azure: {
    frame: "border-sky-300/35",
    surface:
      "bg-gradient-to-br from-[#082f49]/92 via-[#0ea5e9]/55 to-[#020617]/95",
    aura: "bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.32),_transparent_60%),radial-gradient(circle_at_20%_70%,_rgba(14,116,144,0.3),_transparent_55%)]",
    glow: "shadow-[0_28px_90px_-42px_rgba(56,189,248,0.9)]",
    badge: "from-[#38bdf8] via-[#22d3ee] to-[#818cf8]",
    streak: "bg-gradient-to-r from-transparent via-sky-100/70 to-transparent",
  },
  sunrise: {
    frame: "border-amber-300/40",
    surface:
      "bg-gradient-to-br from-[#7c2d12]/95 via-[#f97316]/55 to-[#0f172a]/90",
    aura: "bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.33),_transparent_58%),radial-gradient(circle_at_70%_80%,_rgba(251,191,36,0.28),_transparent_55%)]",
    glow: "shadow-[0_28px_90px_-42px_rgba(251,191,36,0.88)]",
    badge: "from-[#f97316] via-[#fbbf24] to-[#f472b6]",
    streak: "bg-gradient-to-r from-transparent via-amber-100/70 to-transparent",
  },
  emerald: {
    frame: "border-emerald-300/35",
    surface:
      "bg-gradient-to-br from-[#064e3b]/92 via-[#10b981]/55 to-[#0f172a]/94",
    aura: "bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.33),_transparent_58%),radial-gradient(circle_at_30%_70%,_rgba(34,197,94,0.28),_transparent_55%)]",
    glow: "shadow-[0_28px_90px_-42px_rgba(16,185,129,0.88)]",
    badge: "from-[#34d399] via-[#22d3ee] to-[#a7f3d0]",
    streak:
      "bg-gradient-to-r from-transparent via-emerald-100/70 to-transparent",
  },
  crimson: {
    frame: "border-rose-300/35",
    surface:
      "bg-gradient-to-br from-[#7f1d1d]/94 via-[#f43f5e]/55 to-[#111827]/93",
    aura: "bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.33),_transparent_58%),radial-gradient(circle_at_20%_65%,_rgba(244,114,182,0.28),_transparent_55%)]",
    glow: "shadow-[0_28px_90px_-42px_rgba(244,63,94,0.85)]",
    badge: "from-[#f43f5e] via-[#fb7185] to-[#fda4af]",
    streak: "bg-gradient-to-r from-transparent via-rose-100/70 to-transparent",
  },
  void: {
    frame: "border-slate-400/30",
    surface:
      "bg-gradient-to-br from-[#18181b]/96 via-[#334155]/55 to-[#020617]/95",
    aura: "bg-[radial-gradient(circle_at_top,_rgba(100,116,139,0.32),_transparent_58%),radial-gradient(circle_at_80%_75%,_rgba(148,163,184,0.26),_transparent_55%)]",
    glow: "shadow-[0_28px_90px_-42px_rgba(148,163,184,0.6)]",
    badge: "from-[#818cf8] via-[#a855f7] to-[#94a3b8]",
    streak: "bg-gradient-to-r from-transparent via-white/40 to-transparent",
  },
};

const rarityDecor = {
  UR: {
    text: "text-amber-50",
    badge: "from-amber-400 via-rose-400 to-fuchsia-400",
    outline: "border-amber-200/50",
  },
  SSR: {
    text: "text-fuchsia-100",
    badge: "from-fuchsia-400 via-violet-400 to-sky-400",
    outline: "border-fuchsia-200/45",
  },
  SR: {
    text: "text-sky-100",
    badge: "from-sky-400 via-cyan-400 to-emerald-400",
    outline: "border-sky-200/45",
  },
  R: {
    text: "text-emerald-100",
    badge: "from-emerald-400 via-lime-400 to-sky-300",
    outline: "border-emerald-200/45",
  },
  N: {
    text: "text-slate-200",
    badge: "from-slate-400 via-slate-500 to-slate-600",
    outline: "border-slate-300/35",
  },
} satisfies Record<
  CollectionCard["rarity"],
  {
    text: string;
    badge: string;
    outline: string;
  }
>;

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

export default function CollectionCardTile({ card }: { card: CollectionCard }) {
  const accent = accentPresets[card.accent];
  const decor = rarityDecor[card.rarity];
  const obtained = formatDate(card.obtainedAt);

  return (
    <article
      className={`group relative h-full rounded-[22px] border ${accent.frame} p-[1px] transition duration-500 ease-out hover:border-white/45 hover:shadow-[0_0_45px_rgba(255,255,255,0.25)] ${accent.glow}`}
    >
      <div
        className={`relative flex h-full flex-col gap-5 overflow-hidden rounded-[21px] border border-white/5 px-5 py-6 backdrop-blur-xl ${accent.surface}`}
      >
        <div
          className={`pointer-events-none absolute inset-0 opacity-60 ${accent.aura}`}
        />
        <div className="pointer-events-none absolute -inset-px rounded-[22px] bg-white/10 mix-blend-soft-light opacity-0 transition duration-500 group-hover:opacity-100" />
        <div className="pointer-events-none absolute -inset-x-2 top-2 h-1 opacity-0 blur group-hover:opacity-100">
          <div className={`h-full w-full ${accent.streak}`} />
        </div>

        <header className="relative z-10 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] ${decor.outline} ${decor.text} bg-gradient-to-r ${decor.badge} bg-clip-text text-transparent`}
            >
              <span className="text-white/90">{card.rarity}</span>
              {card.attribute && (
                <span className="font-sans text-[10px] tracking-[0.45em] text-white/80">
                  {card.attribute}
                </span>
              )}
            </span>
            <h3 className="text-lg font-semibold text-white drop-shadow-[0_4px_18px_rgba(15,23,42,0.35)]">
              {card.title}
            </h3>
            {card.subtitle && (
              <p className="text-sm text-violet-100/80">{card.subtitle}</p>
            )}
          </div>
          {card.series && (
            <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-right text-[11px] uppercase tracking-[0.32em] text-white/70">
              {card.series}
            </div>
          )}
        </header>

        <div className="relative z-10 mt-1 overflow-hidden rounded-3xl border border-white/10 bg-black/40">
          <div
            className="relative aspect-[3/4] w-full overflow-hidden"
            style={{
              backgroundImage: card.coverUrl
                ? `linear-gradient(160deg, rgba(15,23,42,0.35), rgba(15,23,42,0.8)), url(${card.coverUrl})`
                : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {!card.coverUrl && (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/10 via-white/0 to-white/5">
                <span className="text-5xl font-semibold uppercase tracking-[0.6em] text-white/15">
                  {card.rarity}
                </span>
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/60" />
            <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-60">
              <div className="absolute -inset-16 rotate-12 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.22),_transparent_60%)]" />
            </div>
          </div>
        </div>

        {(card.tags?.length || card.description) && (
          <div className="relative z-10 space-y-3">
            {card.tags?.length ? (
              <div className="flex flex-wrap gap-2">
                {card.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-white/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
            {card.description && (
              <p className="text-sm leading-relaxed text-slate-100/80">
                {card.description}
              </p>
            )}
          </div>
        )}

        {(card.stats?.length || obtained) && (
          <footer className="relative z-10 mt-auto flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
            {card.stats?.length ? (
              <dl className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.32em] text-white/70">
                {card.stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex flex-col gap-1 text-[11px]"
                  >
                    <dt className="text-white/50">{stat.label}</dt>
                    <dd className="text-[12px] text-white/90 tracking-[0.25em]">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <div />
            )}
            {obtained && (
              <div className="text-right text-[11px] uppercase tracking-[0.32em] text-white/60">
                Obtained
                <br />
                <span className="text-white/80">{obtained}</span>
              </div>
            )}
          </footer>
        )}
      </div>
    </article>
  );
}
