import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import { NextResponse } from "next/server";
import sharp from "sharp";
import { timeoutSignal } from "@/lib/abort";

export const runtime = "nodejs";
export const preferredRegion = ["hnd1", "kix1"];

const bufferToBody = (buf: Buffer) => Uint8Array.from(buf);

// GET /api/split?url=<remote>&side=front|back&spine=0.02&format=webp
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const urlParam = searchParams.get("url");
    const side = (searchParams.get("side") || "front").toLowerCase();
    const spine = Number(searchParams.get("spine") || "0.02");
    const format = (searchParams.get("format") || "webp").toLowerCase();

    if (!urlParam)
      return NextResponse.json({ message: "缺少 url 参数" }, { status: 400 });
    if (side !== "front" && side !== "back")
      return NextResponse.json(
        { message: "side 只能为 front/back" },
        { status: 400 },
      );
    const spineRatio =
      Number.isFinite(spine) && spine >= 0 && spine < 0.2 ? spine : 0.02;

    // Simple disk cache under .next/cache/split
    const key = createHash("sha1")
      .update(`${urlParam}|${side}|${spineRatio}|${format}`)
      .digest("hex");
    const cacheDir = path.join(process.cwd(), ".next", "cache", "split");
    const file = path.join(
      cacheDir,
      `${key}.${format === "png" ? "png" : (format === "jpg" || format === "jpeg") ? "jpg" : "webp"}`,
    );
    try {
      await fs.mkdir(cacheDir, { recursive: true });
      const stat = await fs.stat(file).catch(() => null);
      if (stat?.isFile()) {
        const cached = await fs.readFile(file);
        const type =
          format === "png"
            ? "image/png"
            : format === "jpg" || format === "jpeg"
              ? "image/jpeg"
              : "image/webp";
        return new NextResponse(bufferToBody(cached), {
          status: 200,
          headers: {
            "Content-Type": type,
            "Cache-Control":
              "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
          },
        });
      }
    } catch {}

    // Friendlier headers for upstreams (e.g., DMM may require Referer)
    const splitHeaders: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (compatible; CoverViewer/1.0)",
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    };
    // Support internal proxy URL (relative path)
    const reqUrl = new URL(req.url);
    const fetchUrl = urlParam.startsWith("/")
      ? `${reqUrl.origin}${urlParam}`
      : urlParam;
    try {
      const h = new URL(fetchUrl).hostname;
      if (h.endsWith(".dmm.co.jp") || h === "dmm.co.jp") {
        splitHeaders.Referer = "https://www.dmm.co.jp/";
      }
    } catch {}

    const res = await fetch(fetchUrl, {
      headers: splitHeaders,
      signal: timeoutSignal(12000),
    });
    if (!res.ok) {
      return NextResponse.json(
        { message: `下载失败: ${res.status}` },
        { status: 502 },
      );
    }

    const buf = Buffer.from(await res.arrayBuffer());
    const img = sharp(buf, { failOn: "none" }).ensureAlpha();
    const meta = await img.metadata();
    const w = meta.width || 0;
    const h = meta.height || 0;
    if (!w || !h)
      return NextResponse.json(
        { message: "无法读取图片尺寸" },
        { status: 415 },
      );

    // Compute split widths using the same rule as the client: 0.5 +/- spine/2
    const frontFrac = 0.5 + spineRatio / 2;
    let frontW = Math.round(w * frontFrac);
    frontW = Math.min(w - 1, Math.max(1, frontW));
    const backW = Math.max(1, w - frontW);

    const extract =
      side === "front"
        ? { left: w - frontW, top: 0, width: frontW, height: h }
        : { left: 0, top: 0, width: backW, height: h };

    let out = img.extract(extract).removeAlpha();
    // Choose output format
    if (format === "jpg" || format === "jpeg") out = out.jpeg({ quality: 90 });
    else if (format === "png") out = out.png();
    else out = out.webp({ quality: 90 });

    const outBuf = await out.toBuffer();
    // write to cache (best effort)
    try {
      await fs.writeFile(file, outBuf);
    } catch {}
    const type =
      format === "png"
        ? "image/png"
        : format === "jpg" || format === "jpeg"
          ? "image/jpeg"
          : "image/webp";
    return new NextResponse(bufferToBody(outBuf), {
      status: 200,
      headers: {
        "Content-Type": type,
        "Cache-Control":
          "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "服务器内部错误";
    return NextResponse.json({ message }, { status: 500 });
  }
}
