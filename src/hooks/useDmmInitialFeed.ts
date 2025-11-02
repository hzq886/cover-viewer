"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { DmmItem } from "@/types/dmm";
import type { SearchError } from "./useDmmSearch";

const INITIAL_ENDPOINT = "/api/home";
const DEFAULT_OFFSET = 1;
const BATCH_SIZE = 100;

const mapError = (payload: unknown, httpStatus?: number): SearchError => {
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
};

export function useDmmInitialFeed() {
  const [items, setItems] = useState<DmmItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<SearchError | null>(null);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const loadingMoreRef = useRef(false);

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
      if (!batchLength) {
        return null;
      }
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

  const fetchBatch = useCallback(
    async (offset: number, append: boolean) => {
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
      }
      try {
        const res = await fetch(`${INITIAL_ENDPOINT}?offset=${offset}`);
        const data = await res.json();
        if (!res.ok) {
          const mapped = mapError(data, res.status);
          setError(mapped);
          if (!append) {
            setItems([]);
          }
          return false;
        }
        const incoming = Array.isArray(data?.items) ? data.items : [];
        setItems((prev) => (append ? [...prev, ...incoming] : incoming));
        setError(null);
        const next = computeNextOffset(data?.result, offset, incoming.length);
        setNextOffset(next);
        return incoming.length > 0;
      } catch (err: unknown) {
        const mapped = mapError(err);
        setError(mapped);
        if (!append) {
          setItems([]);
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
    [computeNextOffset],
  );

  const load = useCallback(async () => {
    setNextOffset(null);
    return fetchBatch(DEFAULT_OFFSET, false);
  }, [fetchBatch]);

  useEffect(() => {
    void load();
  }, [load]);

  const loadMore = useCallback(async () => {
    if (nextOffset === null) {
      return false;
    }
    return fetchBatch(nextOffset, true);
  }, [fetchBatch, nextOffset]);

  return {
    items,
    loading,
    error,
    reload: load,
    hasMore: nextOffset !== null,
    loadMore,
    loadingMore,
  };
}
