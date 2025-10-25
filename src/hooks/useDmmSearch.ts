"use client";

import { useCallback, useState } from "react";
import type { TranslationDictionary } from "@/i18n/translations";
import type { DmmItem } from "@/types/dmm";

const DEFAULT_SEARCH_KEYWORD = "巨乳";

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
    async (targetKeyword: string) => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?keyword=${encodeURIComponent(targetKeyword)}&offset=1`,
        );
        const data = await res.json();
        if (!res.ok) {
          const mapped = mapError(data, res.status);
          setError(mapped);
          setResults([]);
          return false;
        }

        const incoming = Array.isArray(data?.items) ? data.items : [];
        setResults(incoming);
        setError(null);
        return incoming.length > 0;
      } catch (error: unknown) {
        setError(mapError(error));
        setResults([]);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [mapError],
  );

  const submit = useCallback(async () => {
    const q = keyword.trim();
    const finalKeyword = q || DEFAULT_SEARCH_KEYWORD;

    if (!q) {
      setKeyword(finalKeyword);
    }

    setHasSearched(true);
    setError(null);

    if (loading) {
      return false;
    }

    return requestBatch(finalKeyword);
  }, [keyword, loading, requestBatch]);

  const reset = useCallback(() => {
    setKeyword("");
    setResults([]);
    setError(null);
    setHasSearched(false);
    setLoading(false);
  }, []);

  return {
    keyword,
    setKeyword,
    results,
    loading,
    error,
    hasSearched,
    submit,
    reset,
  };
}
