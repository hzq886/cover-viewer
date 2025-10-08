"use client";

import { useCallback, useEffect, useState } from "react";
import type { TranslationDictionary } from "@/i18n/translations";
import type { DmmItem } from "@/types/dmm";

const DEFAULT_KEYWORD = "新作";

type ErrorKey = keyof TranslationDictionary["errors"];

type SearchError = {
  code: ErrorKey;
  status?: number;
};

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
  const [error, setError] = useState<SearchError | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastKeyword, setLastKeyword] = useState<string>("");
  const [offset, setOffset] = useState<number>(1);
  const [initialized, setInitialized] = useState(false);

  const mapError = useCallback(
    (payload: unknown, httpStatus?: number): SearchError => {
      const data = payload as { code?: unknown; status?: unknown };
      const rawCode =
        typeof data?.code === "string" ? (data.code as string) : undefined;
      const status =
        typeof data?.status === "number"
          ? (data.status as number)
          : typeof httpStatus === "number"
            ? httpStatus
            : undefined;
      switch (rawCode) {
        case "server_missing_config":
          return { code: "serverMissingConfig" };
        case "dmm_api_error":
          return { code: "dmmApi", status };
        case "timeout":
          return { code: "timeout" };
        case "unknown":
          return { code: "unknown", status };
        default:
          return { code: "searchFailed", status };
      }
    },
    [],
  );

  const requestBatch = useCallback(
    async (targetKeyword: string, targetOffset: number) => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?keyword=${encodeURIComponent(targetKeyword)}&offset=${targetOffset}`,
        );
        const data = await res.json();
        if (!res.ok) {
          const mapped = mapError(data, res.status);
          setError(mapped);
          setCurrentItem(null);
          setRemainingItems([]);
          return false;
        }

        const incoming = Array.isArray(data?.items) ? data.items : [];
        const { picked, remaining } = pickRandomItem(incoming);
        setCurrentItem(picked);
        setRemainingItems(remaining);
        setLastKeyword(targetKeyword);
        setOffset(
          incoming.length > 0 ? targetOffset : Math.max(1, targetOffset - 100),
        );
        setError(null);
        return !!picked;
      } catch (error: unknown) {
        setError(mapError(error));
        setCurrentItem(null);
        setRemainingItems([]);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [mapError],
  );

  const submit = useCallback(async () => {
    const q = keyword.trim();

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
    setInitialized(false);
  }, []);

  useEffect(() => {
    if (initialized) return;
    setInitialized(true);
    void (async () => {
      setKeyword(DEFAULT_KEYWORD);
      const success = await requestBatch(DEFAULT_KEYWORD, 1);
      setHasSearched(success);
      if (!success) {
        setLastKeyword("");
      }
    })();
  }, [initialized, requestBatch]);

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
