"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DEFAULT_LANGUAGE, resolveLanguage } from "./language-utils";
import {
  type LanguageCode,
  SUPPORTED_LANGUAGES,
  type TranslationDictionary,
  translations,
} from "./translations";

type TranslationParams = Record<string, string | number>;

// I18nContextValue 描述了组件可访问的语言状态与工具方法
type I18nContextValue = {
  language: LanguageCode;
  languages: LanguageCode[];
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, params?: TranslationParams) => string;
  dictionary: TranslationDictionary;
};

const STORAGE_KEY = "cover-viewer:language";
const I18nContext = createContext<I18nContextValue | undefined>(undefined);

// 同步 <html> 标签的语言信息，便于辅助功能/SEO
function applyLanguageToDocument(lang: LanguageCode) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = lang;
  document.documentElement.setAttribute("data-lang", lang);
}

// 检测初始语言：优先本地缓存，其次服务端推断，再加浏览器环境，最后兜底
function detectInitialLanguage(preferred: LanguageCode): LanguageCode {
  if (typeof window === "undefined") return preferred;
  const candidates: Array<string | null | undefined> = [];
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) candidates.push(stored);
  } catch {
    // Ignore storage access errors
  }
  candidates.push(preferred);
  const { navigator } = window;
  if (navigator) {
    if (Array.isArray(navigator.languages)) {
      candidates.push(...navigator.languages);
    }
    candidates.push(navigator.language);
  }
  for (const candidate of candidates) {
    const resolved = resolveLanguage(candidate ?? undefined);
    if (resolved) {
      return resolved;
    }
  }
  return preferred;
}

// 支持通过路径形式（如 "search.placeholder.default"）获取嵌套的翻译文案
function getTranslationValue(lang: LanguageCode, key: string): unknown {
  const segments = key.split(".");
  let current: unknown = translations[lang];
  for (const segment of segments) {
    if (current && typeof current === "object" && segment in current) {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
  }
  return current;
}

// 将 {{placeholder}} 占位符替换成实际参数
function format(template: string, params?: TranslationParams): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = params[key];
    return value === undefined || value === null ? match : String(value);
  });
}

// 翻译函数：先查当前语言，找不到时回退到英文，再退回 key 本身
function translate(
  lang: LanguageCode,
  key: string,
  params?: TranslationParams,
): string {
  const primary = getTranslationValue(lang, key);
  if (typeof primary === "string") {
    return format(primary, params);
  }
  const fallback = getTranslationValue("en", key);
  if (typeof fallback === "string") {
    return format(fallback, params);
  }
  return key;
}

type LanguageProviderProps = {
  children: ReactNode;
  initialLanguage?: LanguageCode;
};

export function LanguageProvider({
  children,
  initialLanguage,
}: LanguageProviderProps) {
  const preferredLanguage = initialLanguage ?? DEFAULT_LANGUAGE;
  const [language, setLanguageState] =
    useState<LanguageCode>(preferredLanguage);
  const [initialized, setInitialized] = useState(false);

  // 页面挂载后检测首选语言，并立即同步到文档
  useEffect(() => {
    const initial = detectInitialLanguage(preferredLanguage);
    setLanguageState(initial);
    applyLanguageToDocument(initial);
    setInitialized(true);
  }, [preferredLanguage]);

  // 语言切换后写入 localStorage，并更新 <html lang>
  useEffect(() => {
    if (!initialized) return;
    applyLanguageToDocument(language);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Ignore storage write errors
    }
  }, [language, initialized]);

  // 对外暴露的 setLanguage：避免重复更新相同语言
  const setLanguage = useCallback((next: LanguageCode) => {
    setLanguageState((prev) => (prev === next ? prev : next));
  }, []);

  // useMemo 缓存上下文对象，避免不必要的重新渲染
  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      languages: SUPPORTED_LANGUAGES,
      setLanguage,
      t: (key: string, params?: TranslationParams) =>
        translate(language, key, params),
      dictionary: translations[language],
    }),
    [language, setLanguage],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside LanguageProvider");
  }
  return context;
}
