import { NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");
    if (!url) {
      return NextResponse.json({ message: "缺少 url 参数" }, { status: 400 });
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; CoverViewer/1.0; +https://localhost)",
      },
      signal: (AbortSignal as any).timeout
        ? (AbortSignal as any).timeout(10000)
        : undefined,
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

    return NextResponse.json({ dominant, original });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "未知错误" },
      { status: 500 },
    );
  }
}
