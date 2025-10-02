import cloudscraper from "cloudscraper";
import { NextResponse } from "next/server";
import { CookieJar } from "tough-cookie";

export const runtime = "nodejs";

const MISSAV_BASE_URL = "https://missav.ai/";

async function probeMissav(contentId: string) {
  const targetUrl = `${MISSAV_BASE_URL}${encodeURIComponent(contentId)}`;
  try {
    const jar = new CookieJar();
    // Prime the cookie jar (may still return a challenge, which we ignore).
    await cloudscraper({
      uri: MISSAV_BASE_URL,
      method: "GET",
      jar,
      resolveWithFullResponse: true,
      simple: false,
      challengesToSolve: 3,
    });

    const response = (await cloudscraper({
      uri: targetUrl,
      method: "GET",
      jar,
      resolveWithFullResponse: true,
      simple: false,
      challengesToSolve: 3,
    })) as { statusCode?: number };

    const status = response.statusCode ?? 0;
    return {
      status,
      exists: status !== 404,
      targetUrl,
    };
  } catch (error) {
    console.error("Failed to probe MissAV", error);
    return {
      status: 0,
      exists: false,
      targetUrl,
    };
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const contentId = url.searchParams.get("contentId");

  if (!contentId) {
    return NextResponse.json({ message: "Missing contentId" }, { status: 400 });
  }

  const result = await probeMissav(contentId);
  return NextResponse.json(result);
}
