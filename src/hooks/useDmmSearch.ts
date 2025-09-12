"use client";

import { useCallback, useState } from "react";
import type { DmmItem } from "../types/dmm";

function pickRandomItem(list: DmmItem[]) {
  if (!Array.isArray(list) || list.length === 0) {
    return { picked: null, remaining: [] as DmmItem[] };
  }
  const next = [...list];
  const index = Math.floor(Math.random() * next.length);
  const [picked] = next.splice(index, 1);
  return { picked: picked ?? null, remaining: next };
}

export function useDmmSearch() {
  const [keyword, setKeyword] = useState("");
  const [remainingItems, setRemainingItems] = useState<DmmItem[]>([]);
  const [currentItem, setCurrentItem] = useState<DmmItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastKeyword, setLastKeyword] = useState<string>("");
  const [offset, setOffset] = useState<number>(1);

  const requestBatch = useCallback(
    async (targetKeyword: string, targetOffset: number) => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?keyword=${encodeURIComponent(targetKeyword)}&offset=${targetOffset}`,
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "搜索失败");

        const incoming = Array.isArray(data?.items) ? data.items : [];
        const { picked, remaining } = pickRandomItem(incoming);
        setCurrentItem(picked);
        setRemainingItems(remaining);
        setLastKeyword(targetKeyword);
        setOffset(incoming.length > 0 ? targetOffset : Math.max(1, targetOffset - 100));
        setError(null);
        return !!picked;
      } catch (e: any) {
        setError(e?.message || "搜索失败");
        setCurrentItem(null);
        setRemainingItems([]);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const submit = useCallback(async () => {
    const q = keyword.trim();
    if (!q) return false;

    setHasSearched(true);
    setError(null);

    if (loading) {
      return false;
    }

    if (q !== lastKeyword) {
      return requestBatch(q, 1);
    }

    if (remainingItems.length > 0) {
      const { picked, remaining } = pickRandomItem(remainingItems);
      setCurrentItem(picked);
      setRemainingItems(remaining);
      return !!picked;
    }

    const nextOffset = offset + 100;
    return requestBatch(q, nextOffset);
  }, [keyword, lastKeyword, remainingItems, offset, requestBatch, loading]);

  const reset = useCallback(() => {
    setKeyword("");
    setRemainingItems([]);
    setCurrentItem(null);
    setError(null);
    setHasSearched(false);
    setLoading(false);
    setLastKeyword("");
    setOffset(1);
  }, []);

  return {
    keyword,
    setKeyword,
    currentItem,
    remainingItems,
    loading,
    error,
    hasSearched,
    submit,
    reset,
  };
}
