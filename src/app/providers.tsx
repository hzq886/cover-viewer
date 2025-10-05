"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AuthProvider } from "@/auth/AuthProvider";
import { LanguageProvider } from "@/i18n/I18nProvider";
import type { LanguageCode } from "@/i18n/translations";
import { getFirebaseAnalytics } from "@/lib/firebase";
import { logEvent } from "firebase/analytics";

export default function Providers({
  children,
  initialLanguage,
}: {
  children: ReactNode;
  initialLanguage?: LanguageCode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const analytics = await getFirebaseAnalytics();
        if (!analytics || cancelled) {
          return;
        }

        if (typeof window !== "undefined") {
          const pageLocation = window.location.href;
          const pagePath = `${window.location.pathname}${window.location.search}`;
          const storageKey = "firebase:first_visit_logged";

          try {
            const hasLogged = window.localStorage.getItem(storageKey);
            if (!hasLogged) {
              logEvent(analytics, "first_visit", {
                page_location: pageLocation,
                page_path: pagePath,
              });
              window.localStorage.setItem(storageKey, "true");
            }
          } catch (storageError) {
            if (process.env.NODE_ENV !== "production") {
              console.error("Failed to persist Firebase first_visit flag", storageError);
            }
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Failed to initialize Firebase Analytics", error);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const pagePath = `${pathname ?? "/"}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;
    let cancelled = false;

    void (async () => {
      try {
        const analytics = await getFirebaseAnalytics();
        if (!analytics || cancelled) {
          return;
        }
        logEvent(analytics, "page_view", {
          page_path: pagePath,
          page_location: typeof window !== "undefined" ? window.location.href : undefined,
        });
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Failed to log Firebase Analytics page_view", error);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, searchParams]);

  useEffect(() => {
    let cancelled = false;
    let removeListener: (() => void) | undefined;

    void (async () => {
      try {
        const analytics = await getFirebaseAnalytics();
        if (!analytics || cancelled) {
          return;
        }

        const handleClick = (event: MouseEvent) => {
          const target = event.target as HTMLElement | null;
          const elementClasses =
            target?.className && typeof target.className === "string"
              ? target.className
              : undefined;
          const elementText = target?.innerText ? target.innerText.slice(0, 100) : undefined;

          logEvent(analytics, "click", {
            page_location: typeof window !== "undefined" ? window.location.href : undefined,
            page_path: typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : undefined,
            element_tag: target?.tagName,
            element_id: target?.id || undefined,
            element_classes: elementClasses,
            element_text: elementText,
          });
        };

        window.addEventListener("click", handleClick);
        removeListener = () => {
          window.removeEventListener("click", handleClick);
        };
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Failed to log Firebase Analytics click", error);
        }
      }
    })();

    return () => {
      cancelled = true;
      removeListener?.();
    };
  }, []);

  return (
    <LanguageProvider initialLanguage={initialLanguage}>
      <AuthProvider>{children}</AuthProvider>
    </LanguageProvider>
  );
}
