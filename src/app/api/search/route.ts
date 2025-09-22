import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const keyword = (searchParams.get("keyword") || "").trim();
    const offsetParam = searchParams.get("offset");
    const offset = offsetParam
      ? Math.max(1, Number.parseInt(offsetParam, 10) || 1)
      : 1;

    if (!keyword) {
      return NextResponse.json(
        { code: "missing_keyword", message: "Missing keyword parameter" },
        { status: 400 },
      );
    }

    console.log(
      `[${new Date().toISOString()}] search keyword: ${keyword} offset=${offset}`,
    );

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
    Object.entries(params).forEach(([k, v]) => endpoint.searchParams.set(k, v));

    const res = await fetch(endpoint.toString(), {
      // DMM API is public over HTTPS; no headers are strictly required.
      // 10s timeout
      signal: AbortSignal.timeout ? AbortSignal.timeout(10000) : undefined,
      cache: "force-cache",
      next: {
        revalidate: 300,
        tags: [`${keyword}`],
      },
    });

    if (!res.ok) {
      const text = await res.text();
      const status = res.status;
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
    const items = data?.result?.items ?? [];

    return NextResponse.json({ items });
  } catch (err: any) {
    const isTimeout = err?.name === "TimeoutError";
    const code = isTimeout ? "timeout" : "unknown";
    const message = isTimeout
      ? "DMM API request timed out"
      : err?.message || "Unknown error";
    return NextResponse.json({ code, message }, { status: 500 });
  }
}
