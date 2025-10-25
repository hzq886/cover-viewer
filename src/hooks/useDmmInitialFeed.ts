"use client";

import { useCallback, useEffect, useState } from "react";

import type { DmmItem } from "@/types/dmm";
import type { SearchError } from "./useDmmSearch";

const INITIAL_ENDPOINT = "/api/home";

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

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(INITIAL_ENDPOINT);
      const data = await res.json();
      if (!res.ok) {
        const mapped = mapError(data, res.status);
        setError(mapped);
        setItems([]);
        return false;
      }
      const incoming = Array.isArray(data?.items) ? data.items : [];
      setItems(incoming);
      return incoming.length > 0;
    } catch (err: unknown) {
      setError(mapError(err));
      setItems([]);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    items,
    loading,
    error,
    reload: load,
  };
}
