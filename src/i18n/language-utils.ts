import type { LanguageCode } from "./translations";
import { SUPPORTED_LANGUAGES } from "./translations";

export const DEFAULT_LANGUAGE: LanguageCode = "en";

const LANGUAGE_ALIAS: Record<string, LanguageCode> = {
  zh: "zh-CN",
  "zh-cn": "zh-CN",
  "zh-hans": "zh-CN",
  "zh-sg": "zh-CN",
  "zh-my": "zh-CN",
  "zh-tw": "zh-TW",
  "zh-hant": "zh-TW",
  "zh-hk": "zh-TW",
  "zh-mo": "zh-TW",
  ja: "ja",
  "ja-jp": "ja",
  en: "en",
  "en-us": "en",
  "en-gb": "en",
  "en-au": "en",
  "en-ca": "en",
};

const SUPPORTED_SET = new Set<LanguageCode>(SUPPORTED_LANGUAGES);

export function resolveLanguage(value?: string | null): LanguageCode | null {
  if (!value) return null;
  if (SUPPORTED_SET.has(value as LanguageCode)) {
    return value as LanguageCode;
  }
  const normalized = value.toLowerCase();
  if (SUPPORTED_SET.has(normalized as LanguageCode)) {
    return normalized as LanguageCode;
  }
  if (LANGUAGE_ALIAS[normalized]) {
    return LANGUAGE_ALIAS[normalized];
  }
  return null;
}

type WeightedLang = {
  value: string;
  weight: number;
  index: number;
};

export function resolveFromAcceptLanguage(
  header?: string | null,
): LanguageCode | null {
  if (!header) return null;
  const weighted: WeightedLang[] = header
    .split(",")
    .map((item, index) => {
      const [langPart, ...params] = item.trim().split(";");
      let weight = 1;
      for (const param of params) {
        const [key, raw] = param.split("=");
        if (key?.trim().toLowerCase() === "q") {
          const parsed = Number.parseFloat(raw ?? "");
          if (!Number.isNaN(parsed)) {
            weight = parsed;
          }
        }
      }
      return {
        value: langPart.trim(),
        weight,
        index,
      };
    })
    .filter((item) => item.value.length > 0)
    .sort((a, b) => {
      if (b.weight !== a.weight) {
        return b.weight - a.weight;
      }
      return a.index - b.index;
    });

  for (const entry of weighted) {
    const resolved = resolveLanguage(entry.value);
    if (resolved) return resolved;
  }

  return null;
}
