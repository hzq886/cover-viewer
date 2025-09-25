"use client";

import type { ReactNode } from "react";
import { LanguageProvider } from "@/i18n/I18nProvider";
import { AuthProvider } from "@/auth/AuthProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>{children}</AuthProvider>
    </LanguageProvider>
  );
}
