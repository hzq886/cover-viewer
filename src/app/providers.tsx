"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/auth/AuthProvider";
import { LanguageProvider } from "@/i18n/I18nProvider";
import type { LanguageCode } from "@/i18n/translations";

export default function Providers({
  children,
  initialLanguage,
}: {
  children: ReactNode;
  initialLanguage?: LanguageCode;
}) {
  return (
    <LanguageProvider initialLanguage={initialLanguage}>
      <AuthProvider>{children}</AuthProvider>
    </LanguageProvider>
  );
}
