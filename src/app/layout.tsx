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
import type { LanguageCode } from "@/i18n/translations";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const METADATA_MESSAGES: Record<
  LanguageCode,
  { title: string; description: string }
> = {
  "zh-CN": {
    title: "Lucky JAV | 你的线上日本成人影片情报站。管理你的影片并分享你的想法。",
    description: "你的线上日本成人影片情报站。管理你的影片并分享你的想法。",
  },
  "zh-TW": {
    title: "Lucky JAV | 你的線上日本成人影片情報站。管理你的影片並分享你的想法。",
    description: "你的線上日本成人影片情報站。管理你的影片並分享你的想法。",
  },
  ja: {
    title:
      "Lucky JAV | あなたのアダルトビデオ情報源！自分のビデオを管理し、評価を投稿しています。",
    description:
      "あなたのアダルトビデオ情報源！自分のビデオを管理し、評価を投稿しています。",
  },
  en: {
    title:
      "Lucky JAV | Your online informative source for Japanese adult videos; manage your video collection and share your thoughts.",
    description:
      "Your online informative source for Japanese adult videos; manage your video collection and share your thoughts.",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers();
  const acceptLanguage = headerStore.get("accept-language");
  const language =
    resolveFromAcceptLanguage(acceptLanguage) ?? DEFAULT_LANGUAGE;
  const { title, description } =
    METADATA_MESSAGES[language] ?? METADATA_MESSAGES[DEFAULT_LANGUAGE];

  return {
    title,
    description,
    icons: {
      icon: "/favicon.png",
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
