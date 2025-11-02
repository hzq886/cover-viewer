import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

import { timeoutSignal } from "@/lib/abort";
import { incrementDmmDailyApiCount } from "@/lib/dmm-metrics";
import { getFirebaseAdminFirestore } from "@/lib/firebase-admin";
import {
  buildKeywordDocumentId,
  KEYWORD_AGGREGATES_SUBCOLLECTION,
  METRICS_COLLECTION,
  normalizeKeyword,
  SEARCH_KEYWORD_DOC,
} from "@/lib/keyword-metrics";

export const runtime = "nodejs";

async function recordSearchMetrics(keyword: string) {
  try {
    const db = getFirebaseAdminFirestore();
    const metrics = db.collection(METRICS_COLLECTION);
    const updates: Promise<unknown>[] = [incrementDmmDailyApiCount(db)];

    const keywordDocId = buildKeywordDocumentId(keyword);
    if (keywordDocId) {
      const normalized = normalizeKeyword(keyword);
      updates.push(
        metrics
          .doc(SEARCH_KEYWORD_DOC)
          .collection(KEYWORD_AGGREGATES_SUBCOLLECTION)
          .doc(keywordDocId)
          .set(
            {
              normalized,
              count: FieldValue.increment(1),
              lastSearchedAt: FieldValue.serverTimestamp(),
            },
            { merge: true },
          ),
      );
    }

    await Promise.all(updates);
  } catch (error) {
    console.error("Failed to record search metrics", error);
  }
}

export async function GET(req: Request) {
  let metricsPromise: Promise<void> | undefined;
  try {
    const { searchParams } = new URL(req.url);
    const keyword = (searchParams.get("keyword") || "").trim();
    const offsetParam = searchParams.get("offset");
    const offset = offsetParam
      ? Math.max(1, Number.parseInt(offsetParam, 10) || 1)
      : 1;

    const apiId = process.env.DMM_API_ID;
    const affiliateId = process.env.DMM_AFFILIATE_ID;

    if (!apiId || !affiliateId) {
      return NextResponse.json(
        {
          code: "server_missing_config",
          message: "Missing DMM_API_ID or DMM_AFFILIATE_ID",
        },
        { status: 500 },
      );
    }

    metricsPromise = recordSearchMetrics(keyword);

    // Build DMM 商品情報API URL
    const endpoint = new URL("https://api.dmm.com/affiliate/v3/ItemList");
    const params: Record<string, string> = {
      api_id: apiId,
      affiliate_id: affiliateId,
      site: "FANZA",
      service: "digital",
      floor: "videoa",
      hits: "100",
      sort: "rank",
      keyword,
      offset: String(offset),
      output: "json",
    };
    Object.entries(params).forEach(([key, value]) => {
      endpoint.searchParams.set(key, value);
    });

    const res = await fetch(endpoint.toString(), {
      // DMM API is public over HTTPS; no headers are strictly required.
      // 10s timeout
      signal: timeoutSignal(10000),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CoverViewer/1.0)",
        Referer: "https://www.dmm.co.jp/",
      },
      cache: "default",
      next: {
        revalidate: 300,
        tags: [`search:${keyword}:${offset}`],
      },
    });

    if (!res.ok) {
      const text = await res.text();
      const status = res.status;
      if (metricsPromise) {
        await metricsPromise;
      }
      return NextResponse.json(
        {
          code: "dmm_api_error",
          message: `DMM API error: ${status}`,
          details: text?.slice(0, 500),
          status,
        },
        { status: status >= 500 ? 502 : status },
      );
    }
    const data = await res.json();
    const result = data?.result ?? {};
    const items = result.items ?? [];

    if (metricsPromise) {
      await metricsPromise;
    }

    return NextResponse.json(
      { items, result },
      {
        headers: {
          "Cache-Control":
            "public, max-age=300, s-maxage=300, stale-while-revalidate=900",
        },
      },
    );
  } catch (error: unknown) {
    if (metricsPromise) {
      await metricsPromise;
    }
    const isTimeout =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");
    const code = isTimeout ? "timeout" : "unknown";
    const message =
      error instanceof Error
        ? error.message
        : isTimeout
          ? "Request timed out"
          : "Unknown error";
    return NextResponse.json({ code, message }, { status: 500 });
  }
}
