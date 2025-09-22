import { NextResponse } from "next/server";

export const runtime = "nodejs";

function toAbsoluteUrl(src: string): string {
  if (!src) return src;
  if (src.startsWith("//")) return "https:" + src;
  return src;
}

function toAbsoluteFrom(base: string, href: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

function normalizeSlashes(value: string): string {
  return value.replace(/\\\//g, "/");
}

function extractMp4(html: string, baseUrl?: string): string | null {
  const normalized = html.includes("\\/") ? normalizeSlashes(html) : html;
  const searchSpaces = [normalized, html];

  const patterns: RegExp[] = [
    /<video[^>]+src=["']([^"']+\.mp4)["']/i,
    /["']((?:https?:)?\/\/[^"']+\.mp4)["']/i,
    /(https?:)?\/\/cc\d+\.dmm\.co\.jp[^"']+\.mp4/i,
  ];

  for (const source of searchSpaces) {
    for (const re of patterns) {
      const m = source.match(re);
      if (!m) continue;
      const candidates = m
        .slice(1)
        .filter((x) => typeof x === "string" && /\.mp4/i.test(x));
      const raw = candidates.length > 0 ? candidates[0] : m[0];
      if (!raw || typeof raw !== "string") continue;
      const cleaned = normalizeSlashes(raw);
      const absolute = baseUrl ? toAbsoluteFrom(baseUrl, cleaned) : cleaned;
      return toAbsoluteUrl(absolute);
    }
  }

  // Try to parse const args = {...}; blocks used by DMM player
  const argsMatch = html.match(/(?:const|let|var)\s+args\s*=\s*({[\s\S]+?});/i);
  if (argsMatch && argsMatch[1]) {
    try {
      const jsonText = normalizeSlashes(argsMatch[1]);
      const args = JSON.parse(jsonText);
      const sources: string[] = [];
      if (typeof args?.src === "string") sources.push(args.src);
      if (Array.isArray(args?.bitrates)) {
        for (const entry of args.bitrates) {
          if (typeof entry?.src === "string") sources.push(entry.src);
        }
      }
      for (const candidate of sources) {
        const cleaned = normalizeSlashes(candidate);
        const absolute = baseUrl ? toAbsoluteFrom(baseUrl, cleaned) : cleaned;
        const finalUrl = toAbsoluteUrl(absolute);
        if (/\.mp4($|\?)/i.test(finalUrl)) {
          return finalUrl;
        }
      }
    } catch {
      // fall through to 404
    }
  }

  return null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url") || "";
    if (!url)
      return NextResponse.json({ message: "缺少 url 参数" }, { status: 400 });

    // If already an mp4, return as-is
    if (/\.mp4($|\?)/i.test(url)) {
      return NextResponse.json({ url });
    }

    // Fetch the wrapper page and extract video src
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; CoverViewer/1.0; +https://localhost)",
        Referer: "https://www.dmm.co.jp/",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    const html = await res.text();
    // Try direct extraction
    let mp4 = extractMp4(html, url);
    if (mp4) return NextResponse.json({ url: mp4 });

    // If there is an iframe, fetch it and parse again
    const iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (iframeMatch && iframeMatch[1]) {
      const iframeUrl = toAbsoluteFrom(url, iframeMatch[1]);
      const r2 = await fetch(iframeUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; CoverViewer/1.0; +https://localhost)",
          Referer: "https://www.dmm.co.jp/",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });
      const html2 = await r2.text();
      mp4 = extractMp4(html2, iframeUrl);
      if (mp4) return NextResponse.json({ url: mp4 });
    }

    return NextResponse.json({ message: "未能解析视频地址" }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "未知错误" },
      { status: 500 },
    );
  }
}
