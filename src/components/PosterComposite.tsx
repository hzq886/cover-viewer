"use client";

import React from "react";
import Image from "next/image";

type Props = {
  posterUrl: string;
  proxiedPosterUrl: string;
  basePosterUrl?: string;
  containerH: number;
  frontW: number;
  backW: number;
  defaultShowBack?: boolean;
  onOpenModal: () => void;
  onShowBackChange?: (v: boolean) => void;
  single?: boolean;
  hoverFlip?: boolean;
  forceSide?: 'front' | 'back';
};

const PosterComposite = React.forwardRef<HTMLDivElement, Props>(function PosterComposite(
  { posterUrl, proxiedPosterUrl, basePosterUrl, containerH, frontW, backW, defaultShowBack, onOpenModal, onShowBackChange, single, hoverFlip = true, forceSide },
  ref,
) {
  const [showBack, setShowBack] = React.useState(!!defaultShowBack);
  React.useEffect(() => { onShowBackChange?.(showBack); }, [showBack, onShowBackChange]);
  React.useEffect(() => {
    if (forceSide) setShowBack(forceSide === 'back');
  }, [forceSide]);
  const noAnim = false;

  // Crossfade for single-image mode
  const [currSrc, setCurrSrc] = React.useState(proxiedPosterUrl);
  const [prevSrc, setPrevSrc] = React.useState<string | null>(null);
  const [newLoaded, setNewLoaded] = React.useState(false);
  // 统一 Crossfade 管道：根据模式计算当前有效图片 URL
  const effectiveUrl = single
    ? proxiedPosterUrl
    : `/api/split?url=${encodeURIComponent(basePosterUrl || posterUrl)}&side=${showBack ? 'back' : 'front'}&spine=0.02`;

  React.useEffect(() => {
    if (!effectiveUrl) return;
    if (effectiveUrl !== currSrc) {
      setPrevSrc(currSrc);
      setCurrSrc(effectiveUrl);
      setNewLoaded(false);
      // 下一帧再设置 loaded，确保过渡有一帧 0→1
      requestAnimationFrame(() => requestAnimationFrame(() => setNewLoaded(true)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveUrl]);

  return (
    <div
      ref={ref}
      className="group relative cursor-zoom-in"
      onClick={onOpenModal}
      onMouseEnter={() => { if (!single && hoverFlip && !forceSide) setShowBack(true); }}
      onMouseLeave={() => { if (!single && hoverFlip && !forceSide) setShowBack(false); }}
    >
      {/* External play button removed; handled in page.tsx */}

      <div
        className="relative rounded-2xl border border-white/15 ring-1 ring-white/10 bg-white/5 backdrop-blur-xl shadow-[0_40px_120px_-40px_rgba(0,0,0,0.8)] px-0 py-2 md:py-3 flex items-stretch justify-start"
        style={{ width: `${single ? frontW : (frontW + backW)}px`, transition: 'width 300ms ease' }}
      >
        {/* Viewport (rounded corners, no extra background panel) */}
        <div
          className="relative rounded-lg overflow-hidden"
          style={{ height: `${containerH}px`, width: '100%', transition: noAnim ? 'none' : 'opacity 400ms ease, transform 400ms ease, width 400ms ease' }}
          aria-label="poster"
        >
          {/* Unified crossfade for both modes */}
          <>
            {prevSrc && (
              <Image
                key={`prev-${prevSrc}`}
                src={prevSrc}
                alt={posterUrl}
                fill
                sizes="(max-width: 1024px) 92vw, 72vw"
                style={{
                  objectFit: 'contain',
                  objectPosition: 'center',
                  opacity: newLoaded ? 0 : 1,
                  transform: newLoaded ? 'scale(1.02)' : 'scale(1)',
                  filter: newLoaded ? 'blur(1px) brightness(1.02) contrast(0.98)' : 'none',
                  transition: noAnim ? 'none' : 'opacity 600ms cubic-bezier(0.22,1,0.36,1), transform 600ms cubic-bezier(0.22,1,0.36,1), filter 600ms cubic-bezier(0.22,1,0.36,1)'
                }}
                priority
              />
            )}
            {currSrc && (
              <Image
                key={`curr-${currSrc}`}
                src={currSrc}
                alt={posterUrl}
                fill
                sizes="(max-width: 1024px) 92vw, 72vw"
                style={{
                  objectFit: 'contain',
                  objectPosition: 'center',
                  opacity: newLoaded ? 1 : 0,
                  transform: newLoaded ? 'scale(1)' : 'scale(0.96)',
                  filter: newLoaded ? 'none' : 'blur(3px) brightness(0.95) contrast(1.05)',
                  transition: noAnim ? 'none' : 'opacity 600ms cubic-bezier(0.22,1,0.36,1), transform 600ms cubic-bezier(0.22,1,0.36,1), filter 600ms cubic-bezier(0.22,1,0.36,1)'
                }}
                priority
              />
            )}
          </>
        </div>
        {/* Subtle glow overlay */}
        {!single && (
          <div
            className="pointer-events-none absolute inset-0 rounded-lg"
            style={{
              opacity: 0.6,
              transition: noAnim ? 'none' : 'opacity 500ms ease',
              background:
                'radial-gradient(800px 400px at 20% 10%, rgba(168,85,247,0.18), transparent), radial-gradient(600px 300px at 120% 120%, rgba(59,130,246,0.18), transparent)',
              mixBlendMode: 'screen',
            }}
          />
        )}

        {/* Size badge moved to InfoPanel */}
      </div>
    </div>
  );
});

export default PosterComposite;
