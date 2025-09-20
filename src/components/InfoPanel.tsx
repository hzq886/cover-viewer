"use client";

import React, { type SVGProps } from "react";

type Props = {
  contentId: string;
  title: string;
  affiliate: string;
  actressNames: string;
  makerName: string;
  directorNames: string;
  releaseDate: string;
  onPlay?: () => void;
  keyword?: string;
  stageSizeText?: string; // e.g. "800px × 1200px"
  imageSizeText?: string; // actual pixel size of image
  remainingCount?: number;
};

const InfoPanel = React.forwardRef<HTMLDivElement, Props>(function InfoPanel(
  {
    contentId,
    title,
    affiliate,
    actressNames,
    makerName,
    directorNames,
    releaseDate,
    onPlay,
    keyword,
    stageSizeText,
    imageSizeText,
    remainingCount,
  },
  ref,
) {
  const dateOnly = (releaseDate || "").slice(0, 10);
  function IcRoundConfirmationNumber(props: SVGProps<SVGSVGElement>) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}><path fill="currentColor" d="M22 8.54V6c0-1.1-.9-2-2-2H4c-1.1 0-1.99.89-1.99 2v2.54c0 .69.33 1.37.94 1.69C3.58 10.58 4 11.24 4 12s-.43 1.43-1.06 1.76c-.6.33-.94 1.01-.94 1.7V18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-2.54c0-.69-.34-1.37-.94-1.7c-.63-.34-1.06-1-1.06-1.76s.43-1.42 1.06-1.76c.6-.33.94-1.01.94-1.7m-9 8.96h-2v-2h2zm0-4.5h-2v-2h2zm0-4.5h-2v-2h2z" /></svg>
    );
  }
  function IcOutlineHomeWork(props: SVGProps<SVGSVGElement>) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}><path fill="currentColor" d="M1 11v10h6v-5h2v5h6V11L8 6zm12 8h-2v-5H5v5H3v-6.97l5-3.57l5 3.57zm4-12h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2z" /><path fill="currentColor" d="M10 3v1.97l2 1.43V5h9v14h-4v2h6V3z" /></svg>
    );
  }
  function IcTwotoneVideoCameraFront(props: SVGProps<SVGSVGElement>) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}><path fill="currentColor" d="M18 10.48V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4.48l4 3.98v-11zM16 18H4V6h12zm-6-6c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2m4 3.43c0-.81-.48-1.53-1.22-1.85a6.95 6.95 0 0 0-5.56 0A2.01 2.01 0 0 0 6 15.43V16h8z" /><path fill="currentColor" d="M4 18h12V6H4zm6-10c1.1 0 2 .9 2 2s-.9 2-2 2s-2-.9-2-2s.9-2 2-2m-4 7.43c0-.81.48-1.53 1.22-1.85a6.95 6.95 0 0 1 5.56 0A2.01 2.01 0 0 1 14 15.43V16H6z" opacity=".3" /></svg>
    );
  }
  function IcTwotoneCalendarToday(props: SVGProps<SVGSVGElement>) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}><path fill="currentColor" d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m0 2v3H4V5zM4 21V10h16v11z" /><path fill="currentColor" d="M4 5.01h16V8H4z" opacity=".3" /></svg>
    );
  }
  // Custom icons for actions
  function IcBaselinePlayCircleFilled(props: SVGProps<SVGSVGElement>) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m-2 14.5v-9l6 4.5z" /></svg>
    );
  }
  return (
    <aside ref={ref} className="md:w-[min(42ch,36vw)] bg-white/5 border border-white/15 rounded-2xl p-4 md:p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.5)] backdrop-blur-sm">
      <div className="space-y-2">
        <div className="text-white/95 text-lg md:text-xl font-semibold leading-snug break-words">
          {title ? (
            <a href={affiliate} target="_blank" rel="noopener noreferrer" className="hover:text-violet-200 text-white/95 underline underline-offset-4 decoration-violet-400/50">
              {title}
            </a>
          ) : null}
        </div>
        {actressNames && <div className="text-violet-200 text-base md:text-lg font-semibold">{actressNames}</div>}
      </div>

      <div className="mt-4 space-y-2 text-[12px] md:text-sm text-slate-100/95">
        {contentId && (
          <div className="flex items-center gap-2">
            <span className="text-violet-300/90" aria-hidden><IcRoundConfirmationNumber /></span>
            <span className="text-slate-100/90">番号:</span>
            <span className="font-semibold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">{contentId}</span>
          </div>
        )}
        {makerName && (
          <div className="flex items-center gap-2">
            <span className="text-violet-300/90" aria-hidden><IcOutlineHomeWork /></span>
            <span className="text-slate-100/90">厂商:</span>
            <span className="font-semibold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">{makerName}</span>
          </div>
        )}
        {directorNames && (
          <div className="flex items-center gap-2">
            <span className="text-violet-300/90" aria-hidden><IcTwotoneVideoCameraFront /></span>
            <span className="text-slate-100/90">导演:</span>
            <span className="font-semibold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">{directorNames}</span>
          </div>
        )}
        {dateOnly && (
          <div className="flex items-center gap-2">
            <span className="text-violet-300/90" aria-hidden><IcTwotoneCalendarToday /></span>
            <span className="text-slate-100/90">发布日期:</span>
            <span className="font-semibold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">{dateOnly}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      {onPlay && (
        <div className="mt-5">
          <button
            onClick={onPlay}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white/90 hover:bg-white/15 shadow cursor-pointer ring-1 ring-inset ring-violet-400/20 hover:ring-2 hover:ring-violet-400/45 focus-visible:ring-2 focus-visible:ring-violet-400/60 transition-colors transition-shadow"
            aria-label="播放样片"
            title="播放样片"
          >
            <IcBaselinePlayCircleFilled className="text-violet-300/90" />
            播放样片
          </button>
        </div>
      )}

      {(stageSizeText || imageSizeText) && (
        <div className="mt-3 space-y-1 text-xs md:text-sm text-white/90">
          {imageSizeText && (
            <div>图片实际分辨率: {imageSizeText}</div>
          )}
          {stageSizeText && (
            <div>显示区域尺寸: {stageSizeText}</div>
          )}
          {typeof remainingCount === "number" && (
            <div>
              当前关键词剩余数量: {remainingCount}
            </div>
          )}
        </div>
      )}
    </aside>
  );
});

export default InfoPanel;
