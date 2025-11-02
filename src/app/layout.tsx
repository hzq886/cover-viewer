import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import Providers from "./providers";
import "./globals.css";
import {
  DEFAULT_LANGUAGE,
  resolveFromAcceptLanguage,
} from "@/i18n/language-utils";
import { resolveMetadataMessage } from "@/i18n/metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers();
  const acceptLanguage = headerStore.get("accept-language");
  const language =
    resolveFromAcceptLanguage(acceptLanguage) ?? DEFAULT_LANGUAGE;
  const { title, description } = resolveMetadataMessage(language);

  return {
    title,
    description,
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerStore = await headers();
  const acceptLanguage = headerStore.get("accept-language");
  const initialLanguage =
    resolveFromAcceptLanguage(acceptLanguage) ?? DEFAULT_LANGUAGE;

  return (
    <html lang={initialLanguage}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers initialLanguage={initialLanguage}>{children}</Providers>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
