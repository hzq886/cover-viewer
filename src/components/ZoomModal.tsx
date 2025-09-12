"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  mainUrl: string;
  samples: string[];
  posterUrl?: string;
};

export default function ZoomModal(props: Props) {
  const { open, onClose, mainUrl, posterUrl } = props;

  const displayUrl = useMemo(() => mainUrl || posterUrl || "", [mainUrl, posterUrl]);
  const [activeUrl, setActiveUrl] = useState(displayUrl);
  const [rendered, setRendered] = useState(Boolean(open && displayUrl));
  const [visible, setVisible] = useState(open);
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open && displayUrl) {
      setClosing(false);
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
      setActiveUrl(displayUrl);
      setRendered(true);
      requestAnimationFrame(() => setVisible(true));
      return;
    }

    if (!open && rendered) {
      setClosing(true);
      setVisible(false);
      const timer = setTimeout(() => setRendered(false), 220);
      return () => clearTimeout(timer);
    }
  }, [open, displayUrl, rendered]);

  useEffect(() => () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const proxiedUrl = useMemo(() => {
    if (!activeUrl) return "";
    return activeUrl.startsWith("/api/") ? activeUrl : `/api/proxy?url=${encodeURIComponent(activeUrl)}`;
  }, [activeUrl]);

  const closeWithAnimation = useCallback(() => {
    if (closing) return;
    setClosing(true);
    setVisible(false);
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null;
      onClose();
    }, 200);
  }, [closing, onClose]);

  useEffect(() => {
    if (!rendered) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeWithAnimation();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [rendered, closeWithAnimation]);

  if (!rendered || !proxiedUrl) return null;

  const overlayStyle = {
    opacity: visible ? 1 : 0,
    transition: "opacity 260ms cubic-bezier(0.22,1,0.36,1)",
  } as const;

  const cardStyle = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0px) scale(1)" : "translateY(18px) scale(0.94)",
    transition: "opacity 300ms cubic-bezier(0.22,1,0.36,1), transform 300ms cubic-bezier(0.22,1,0.36,1)",
  } as const;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
      style={overlayStyle}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeWithAnimation();
        }
      }}
    >
      <div
        className="group relative w-[92vw] max-w-4xl cursor-zoom-out"
        style={cardStyle}
        onClick={(e) => {
          e.stopPropagation();
          closeWithAnimation();
        }}
      >
        <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-black/45 p-4 shadow-[0_45px_140px_-60px_rgba(0,0,0,0.9)] backdrop-blur-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={proxiedUrl} alt="zoom" className="mx-auto max-h-[80vh] w-full object-contain select-none" />
        </div>
      </div>
    </div>
  );
}
