import { NextResponse } from "next/server";
import sharp from "sharp";
import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

// GET /api/split?url=<remote>&side=front|back&spine=0.02&format=webp
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");
    const side = (searchParams.get("side") || "front").toLowerCase();
    const spine = Number(searchParams.get("spine") || "0.02");
    const format = (searchParams.get("format") || "webp").toLowerCase();

    if (!url) return NextResponse.json({ message: "缺少 url 参数" }, { status: 400 });
    if (side !== "front" && side !== "back") return NextResponse.json({ message: "side 只能为 front/back" }, { status: 400 });
    const spineRatio = isFinite(spine) && spine >= 0 && spine < 0.2 ? spine : 0.02;

    // Simple disk cache under .next/cache/split
    const key = createHash("sha1").update(`${url}|${side}|${spineRatio}|${format}`).digest("hex");
    const cacheDir = path.join(process.cwd(), ".next", "cache", "split");
    const file = path.join(cacheDir, `${key}.${format === "png" ? "png" : (format === "jpg" || format === "jpeg") ? "jpg" : "webp"}`);
    try {
      await fs.mkdir(cacheDir, { recursive: true });
      const stat = await fs.stat(file).catch(() => null as any);
      if (stat && stat.isFile()) {
        const cached = await fs.readFile(file);
        const type = format === "png" ? "image/png" : (format === "jpg" || format === "jpeg") ? "image/jpeg" : "image/webp";
        return new NextResponse(cached, {
          status: 200,
          headers: { "Content-Type": type, "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
        });
      }
    } catch {}

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CoverViewer/1.0)" },
      signal: (AbortSignal as any).timeout ? (AbortSignal as any).timeout(12000) : undefined,
    });
    if (!res.ok) {
      return NextResponse.json({ message: `下载失败: ${res.status}` }, { status: 502 });
    }

    const buf = Buffer.from(await res.arrayBuffer());
    const img = sharp(buf, { failOn: "none" }).ensureAlpha();
    const meta = await img.metadata();
    const w = meta.width || 0;
    const h = meta.height || 0;
    if (!w || !h) return NextResponse.json({ message: "无法读取图片尺寸" }, { status: 415 });

    // Compute split widths using the same rule as the client: 0.5 +/- spine/2
    const frontFrac = 0.5 + spineRatio / 2;
    const backFrac = 0.5 - spineRatio / 2;
    const backW = Math.max(1, Math.round(w * backFrac));
    const frontW = w - backW; // keep total width consistent

    const extract = side === "front"
      ? { left: w - frontW, top: 0, width: frontW, height: h }
      : { left: 0, top: 0, width: backW, height: h };

    let out = img.extract(extract).removeAlpha();
    // Choose output format
    if (format === "jpg" || format === "jpeg") out = out.jpeg({ quality: 90 });
    else if (format === "png") out = out.png();
    else out = out.webp({ quality: 90 });

    const outBuf = await out.toBuffer();
    // write to cache (best effort)
    try { await fs.writeFile(file, outBuf); } catch {}
    const type = format === "png" ? "image/png" : (format === "jpg" || format === "jpeg") ? "image/jpeg" : "image/webp";
    return new NextResponse(outBuf, {
      status: 200,
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || "服务器内部错误" }, { status: 500 });
  }
}
