"use client";

import { useEffect, useRef, useState } from "react";

export function useLayoutHeights() {
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [layoutH, setLayoutH] = useState<{ header: number; footer: number }>({ header: 0, footer: 0 });

  useEffect(() => {
    const calc = () => {
      setLayoutH({
        header: headerRef.current?.getBoundingClientRect().height || 0,
        footer: footerRef.current?.getBoundingClientRect().height || 0,
      });
    };
    calc();
    const ro = new ResizeObserver(calc);
    if (headerRef.current) ro.observe(headerRef.current as Element);
    if (footerRef.current) ro.observe(footerRef.current as Element);
    window.addEventListener("resize", calc);
    return () => { window.removeEventListener("resize", calc); ro.disconnect(); };
  }, []);

  return { headerRef, footerRef, layoutH } as const;
}

