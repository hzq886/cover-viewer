import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import Providers from "./providers";
import "./globals.css";
import {
  DEFAULT_LANGUAGE,
  resolveFromAcceptLanguage,
} from "@/i18n/language-utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lucky JAV Cover | Multi-language Poster Viewer",
  description: "Discover random JAV covers with localized interface support.",
  icons: {
    icon: "/favicon.png",
  },
};

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
      </body>
    </html>
  );
}
