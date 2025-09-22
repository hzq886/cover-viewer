import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import { NextResponse } from "next/server";
import sharp from "sharp";
import { timeoutSignal } from "@/lib/abort";

export const runtime = "nodejs";

const bufferToBody = (buf: Buffer) => Uint8Array.from(buf);

export async function GET(req: Request) {
  try {
    const urlObj = new URL(req.url);
    const { searchParams, origin } = urlObj;
    const url = searchParams.get("url");
    const s = Number(searchParams.get("s") || "0");
    const format = (searchParams.get("format") || "webp").toLowerCase();

    if (!url)
      return NextResponse.json({ message: "缺少 url 参数" }, { status: 400 });
    const targetSize =
      Number.isFinite(s) && s > 0
        ? Math.min(Math.max(32, Math.floor(s)), 1024)
        : 512;

    // Support local API URLs like /api/split by turning them into absolute
    const remoteUrl = url.startsWith("/") ? `${origin}${url}` : url;

    const cacheDir = path.join(process.cwd(), ".next", "cache", "thumb");
    const key = createHash("sha1")
      .update(`${remoteUrl}|${targetSize}|${format}`)
      .digest("hex");
    const ext =
      format === "png"
        ? "png"
        : format === "jpg" || format === "jpeg"
          ? "jpg"
          : "webp";
    const file = path.join(cacheDir, `${key}.${ext}`);
    try {
      await fs.mkdir(cacheDir, { recursive: true });
      const stat = await fs.stat(file).catch(() => null);
      if (stat?.isFile()) {
        const buf = await fs.readFile(file);
        const type =
          ext === "png"
            ? "image/png"
            : ext === "jpg"
              ? "image/jpeg"
              : "image/webp";
        return new NextResponse(bufferToBody(buf), {
          status: 200,
          headers: {
            "Content-Type": type,
            "Cache-Control":
              "public, max-age=86400, stale-while-revalidate=604800",
          },
        });
      }
    } catch {}

    const res = await fetch(remoteUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CoverViewer/1.0)" },
      signal: timeoutSignal(15000),
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

    const side = w > h ? "landscape" : "portrait";
    const size = Math.min(w, h);
    let left = 0,
      top = 0;
    if (side === "portrait") {
      // crop a top-aligned square (keep head area)
      left = 0;
      top = 0;
    } else {
      // landscape: center square (trim left/right)
      left = Math.max(0, Math.floor((w - size) / 2));
      top = 0;
    }

    let out = img
      .extract({ left, top, width: size, height: size })
      .removeAlpha()
      .resize({
        width: targetSize,
        height: targetSize,
        fit: "cover",
        withoutEnlargement: true,
      });
    if (format === "png") out = out.png();
    else if (format === "jpg" || format === "jpeg")
      out = out.jpeg({ quality: 90 });
    else out = out.webp({ quality: 90 });

    const outBuf = await out.toBuffer();
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
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "服务器内部错误";
    return NextResponse.json({ message }, { status: 500 });
  }
}
