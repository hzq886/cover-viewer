// Shared helpers for keyword metrics stored in Firestore.

const INVALID_KEYWORD_ID = "";

export function normalizeKeyword(rawKeyword: string): string {
  return rawKeyword.trim().toLowerCase();
}

export function buildKeywordDocumentId(rawKeyword: string): string {
  const normalized = normalizeKeyword(rawKeyword);
  if (!normalized) {
    return INVALID_KEYWORD_ID;
  }
  // Firestore 文档 ID 支持大部分 Unicode 字符，仅避免斜杠等保留字符。
  return normalized.replaceAll("/", "／");
}

export function hasKeywordIdentifier(docId: string): docId is string {
  return docId !== INVALID_KEYWORD_ID;
}

export const METRICS_COLLECTION = "metrics";
export const DMM_API_DOC = "dmmApi";
export const SEARCH_KEYWORD_DOC = "searchKeywords";
export const SELECTED_KEYWORD_DOC = "selectedKeywords";
export const DAILY_SUBCOLLECTION = "daily";
export const KEYWORD_AGGREGATES_SUBCOLLECTION = "data";
