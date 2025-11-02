"use client";

import { useCallback, useRef, useState } from "react";
import type { TranslationDictionary } from "@/i18n/translations";
import type { DmmItem } from "@/types/dmm";

const DEFAULT_SEARCH_KEYWORD = "巨乳";
const DEFAULT_OFFSET = 1;
const BATCH_SIZE = 100;

type ErrorKey = keyof TranslationDictionary["errors"];

export type SearchError = {
  code: ErrorKey;
  status?: number;
};

export function useDmmSearch() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<DmmItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<SearchError | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [activeKeyword, setActiveKeyword] = useState<string>("");
  const loadingMoreRef = useRef(false);

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

  const parseNumber = useCallback((value: unknown): number | null => {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string") {
      const parsed = Number.parseInt(value, 10);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  }, []);

  const computeNextOffset = useCallback(
    (
      result: unknown,
      currentOffset: number,
      batchLength: number,
    ): number | null => {
      if (!batchLength) return null;
      const record = (result as Record<string, unknown>) || {};
      const firstPosition = parseNumber(record.first_position) ?? currentOffset;
      const resultCount = parseNumber(record.result_count) ?? batchLength;
      const totalCount = parseNumber(record.total_count);
      const next = firstPosition + resultCount;
      if (totalCount !== null && next > totalCount) {
        return null;
      }
      const hasMoreByBatch =
        resultCount >= BATCH_SIZE || batchLength >= BATCH_SIZE;
      if (totalCount === null && !hasMoreByBatch) {
        return null;
      }
      return next;
    },
    [parseNumber],
  );

  const requestBatch = useCallback(
    async (targetKeyword: string, offset: number, append: boolean) => {
      if (append) {
        if (loadingMoreRef.current) {
          return false;
        }
        loadingMoreRef.current = true;
        setLoadingMore(true);
      } else {
        loadingMoreRef.current = false;
        setLoadingMore(false);
        setLoading(true);
        setError(null);
        setNextOffset(null);
      }
      try {
        const res = await fetch(
          `/api/search?keyword=${encodeURIComponent(targetKeyword)}&offset=${offset}`,
        );
        const data = await res.json();
        if (!res.ok) {
          const mapped = mapError(data, res.status);
          setError(mapped);
          if (!append) {
            setResults([]);
          }
          return false;
        }

        const incoming = Array.isArray(data?.items) ? data.items : [];
        setResults((prev) => (append ? [...prev, ...incoming] : incoming));
        setError(null);
        setActiveKeyword(targetKeyword);
        const next = computeNextOffset(data?.result, offset, incoming.length);
        setNextOffset(next);
        return incoming.length > 0;
      } catch (error: unknown) {
        setError(mapError(error));
        if (!append) {
          setResults([]);
        }
        return false;
      } finally {
        if (append) {
          loadingMoreRef.current = false;
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [computeNextOffset, mapError],
  );

  const submit = useCallback(async () => {
    const q = keyword.trim();
    const finalKeyword = q || DEFAULT_SEARCH_KEYWORD;

    if (!q) {
      setKeyword(finalKeyword);
    }

    setHasSearched(true);
    setError(null);

    if (loading || loadingMore) {
      return false;
    }

    return requestBatch(finalKeyword, DEFAULT_OFFSET, false);
  }, [keyword, loading, loadingMore, requestBatch]);

  const reset = useCallback(() => {
    setKeyword("");
    setResults([]);
    setError(null);
    setHasSearched(false);
    setLoading(false);
    setLoadingMore(false);
    setNextOffset(null);
    setActiveKeyword("");
    loadingMoreRef.current = false;
  }, []);

  const loadMore = useCallback(async () => {
    if (nextOffset === null) {
      return false;
    }
    const currentKeyword =
      activeKeyword || keyword.trim() || DEFAULT_SEARCH_KEYWORD;
    return requestBatch(currentKeyword, nextOffset, true);
  }, [activeKeyword, keyword, nextOffset, requestBatch]);

  return {
    keyword,
    setKeyword,
    results,
    loading,
    error,
    hasSearched,
    submit,
    reset,
    hasMore: nextOffset !== null,
    loadMore,
    loadingMore,
  };
}
