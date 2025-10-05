import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

import { getFirebaseAdminFirestore } from "@/lib/firebase-admin";
import {
  buildKeywordDocumentId,
  KEYWORD_AGGREGATES_SUBCOLLECTION,
  METRICS_COLLECTION,
  normalizeKeyword,
  SELECTED_KEYWORD_DOC,
} from "@/lib/keyword-metrics";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const rawKeyword =
      body && typeof body.keyword === "string" ? body.keyword : "";
    const keyword = rawKeyword.trim();

    if (!keyword) {
      return NextResponse.json(
        { code: "invalid_keyword", message: "Keyword is required" },
        { status: 400 },
      );
    }

    const docId = buildKeywordDocumentId(keyword);
    if (!docId) {
      return NextResponse.json(
        { code: "invalid_keyword", message: "Keyword is invalid" },
        { status: 400 },
      );
    }

    const db = getFirebaseAdminFirestore();

    await db
      .collection(METRICS_COLLECTION)
      .doc(SELECTED_KEYWORD_DOC)
      .collection(KEYWORD_AGGREGATES_SUBCOLLECTION)
      .doc(docId)
      .set(
        {
          keyword,
          normalized: normalizeKeyword(keyword),
          count: FieldValue.increment(1),
          lastSelectedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to record selected keyword metric", error);
    return NextResponse.json(
      { code: "internal_error", message: "Failed to record selected keyword" },
      { status: 500 },
    );
  }
}
