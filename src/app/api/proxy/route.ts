import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Strict allowlist to avoid open proxy misuse
const ALLOW_HOSTS = new Set([
  "pics.dmm.co.jp",
  "www.dmm.co.jp",
  "cc3001.dmm.co.jp",
  "cc3002.dmm.co.jp",
  "cc3003.dmm.co.jp",
]);

const IDLE_TIMEOUT_MS = 15000;

export async function GET(req: Request) {
  const abortController = new AbortController();
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");
    if (!url) {
      return NextResponse.json({ message: "缺少 url 参数" }, { status: 400 });
    }
    const parsed = new URL(url);
    if (!/^https?:$/.test(parsed.protocol)) {
      return NextResponse.json({ message: "仅支持 http/https" }, { status: 400 });
    }
    if (!ALLOW_HOSTS.has(parsed.hostname)) {
      return NextResponse.json({ message: "目标域名不在允许列表" }, { status: 403 });
    }

    const range = req.headers.get("range") || undefined;
    const upstream = await fetch(parsed.toString(), {
      headers: {
        // Spoof a UA to be safe
        "User-Agent": "Mozilla/5.0 (compatible; CoverViewer/1.0; +https://localhost)",
        // Some hosts require a referer
        Referer: "https://www.dmm.co.jp/",
        ...(range ? { Range: range } : {}),
      },
      signal: abortController.signal,
    });

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text().catch(() => "");
      return NextResponse.json(
        { message: `上游请求失败: ${upstream.status}`, details: text.slice(0, 500) },
        { status: 502 },
      );
    }

    const headers = new Headers();
    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    headers.set("content-type", contentType);
    headers.set("cache-control", "public, s-maxage=86400, stale-while-revalidate=604800, immutable");
    headers.set("access-control-allow-origin", "*");
    // Preserve range/length headers for media playback
    const pass = ["content-length", "content-range", "accept-ranges", "etag", "last-modified"];
    for (const key of pass) {
      const v = upstream.headers.get(key);
      if (v) headers.set(key, v);
    }

    const upstreamStream = upstream.body;
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    const clearIdleTimer = () => {
      if (idleTimer) {
        clearTimeout(idleTimer);
        idleTimer = null;
      }
    };

    const resetIdleTimer = () => {
      clearIdleTimer();
      idleTimer = setTimeout(() => {
        abortController.abort(new Error("空闲超时"));
      }, IDLE_TIMEOUT_MS);
    };

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        reader = upstreamStream.getReader();
        try {
          while (true) {
            resetIdleTimer();
            const { done, value } = await reader.read();
            if (done) {
              clearIdleTimer();
              controller.close();
              break;
            }
            if (value) controller.enqueue(value);
          }
        } catch (err) {
          clearIdleTimer();
          controller.error(err);
        } finally {
          reader?.releaseLock();
          reader = null;
        }
      },
      async cancel(reason) {
        clearIdleTimer();
        if (reader && upstreamStream.locked) {
          await reader.cancel(reason);
        }
        if (!abortController.signal.aborted) {
          abortController.abort(reason instanceof Error ? reason : undefined);
        }
      },
    });

    return new Response(stream, { headers, status: upstream.status });
  } catch (err: any) {
    if (err?.name === "AbortError") {
      const reason = (abortController.signal as any).reason;
      const message =
        (reason instanceof Error && reason.message) || err?.message || "代理请求空闲超时";
      return NextResponse.json({ message }, { status: 504 });
    }
    return NextResponse.json({ message: err?.message || "未知错误" }, { status: 500 });
  }
}
