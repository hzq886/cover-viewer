import cloudscraper from "cloudscraper";
import { NextResponse } from "next/server";
import type { CookieJar as RequestCookieJar } from "request";
import { CookieJar } from "tough-cookie";

export const runtime = "nodejs";

const RESPONSE_HEADERS = {
  "Cache-Control":
    "public, max-age=300, s-maxage=300, stale-while-revalidate=1200",
};
const ERROR_HEADERS = {
  "Cache-Control":
    "public, max-age=60, s-maxage=60, stale-while-revalidate=600",
};

const MISSAV_BASE_URL = "https://missav.ai/";

async function probeMissav(contentId: string) {
  const targetUrl = `${MISSAV_BASE_URL}${encodeURIComponent(contentId)}`;
  try {
    const jar = new CookieJar() as unknown as RequestCookieJar;
    // Prime the cookie jar (may still return a challenge, which we ignore).
    const baseOptions = {
      method: "GET",
      jar,
      resolveWithFullResponse: true,
      simple: false,
      challengesToSolve: 3,
      timeout: 10000,
    } as const;

    await cloudscraper({
      ...baseOptions,
      uri: MISSAV_BASE_URL,
    });

    const response = (await cloudscraper({
      ...baseOptions,
      uri: targetUrl,
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
    return NextResponse.json(
      { message: "Missing contentId" },
      { status: 400, headers: ERROR_HEADERS },
    );
  }

  const result = await probeMissav(contentId);
  const headers = result.exists ? RESPONSE_HEADERS : ERROR_HEADERS;
  return NextResponse.json(result, {
    headers,
  });
}
