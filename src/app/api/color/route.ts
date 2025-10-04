import { NextResponse } from "next/server";
import sharp from "sharp";

import { timeoutSignal } from "@/lib/abort";

export const runtime = "nodejs";
export const config = { regions: ["hnd1"] };

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const urlParam = searchParams.get("url");
    if (!urlParam) {
      return NextResponse.json({ message: "缺少 url 参数" }, { status: 400 });
    }

    // Support relative internal URLs like "/api/proxy?url=..."
    const reqUrl = new URL(req.url);
    const fetchUrl = urlParam.startsWith("/")
      ? `${reqUrl.origin}${urlParam}`
      : urlParam;

    // Build headers friendlier to upstreams (e.g., DMM)
    const headers: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (compatible; CoverViewer/1.0)",
      Accept:
        "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    };
    try {
      const h = new URL(fetchUrl).hostname;
      if (h.endsWith(".dmm.co.jp") || h === "dmm.co.jp") {
        headers.Referer = "https://www.dmm.co.jp/";
      }
    } catch {}

    const res = await fetch(fetchUrl, {
      headers,
      signal: timeoutSignal(10000),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { message: `下载失败: ${res.status}`, details: text.slice(0, 500) },
        { status: 502 },
      );
    }

    const buf = Buffer.from(await res.arrayBuffer());

    const image = sharp(buf, { failOn: "none" }).ensureAlpha();
    const meta = await image.metadata();
    const original = { width: meta.width || 0, height: meta.height || 0 };

    // Downscale for performance, keep aspect, raw RGBA
    const { data, info } = await image
      .resize({ width: 80, withoutEnlargement: true })
      .toColorspace("srgb")
      .raw()
      .toBuffer({ resolveWithObject: true });

    let r = 0,
      g = 0,
      b = 0,
      count = 0;
    const ch = info.channels; // expect 4
    for (let i = 0; i < data.length; i += ch) {
      const R = data[i];
      const G = data[i + 1];
      const B = data[i + 2];
      const A = ch > 3 ? data[i + 3] : 255;
      if (A < 128) continue;
      r += R;
      g += G;
      b += B;
      count++;
    }
    const dominant =
      count > 0
        ? {
            r: Math.round(r / count),
            g: Math.round(g / count),
            b: Math.round(b / count),
          }
        : { r: 2, g: 6, b: 23 };

    return NextResponse.json(
      { dominant, original },
      {
        headers: {
          "Cache-Control":
            "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
        },
      },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json({ message }, { status: 500 });
  }
}
