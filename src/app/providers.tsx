"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/auth/AuthProvider";
import { LanguageProvider } from "@/i18n/I18nProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>{children}</AuthProvider>
    </LanguageProvider>
  );
}
