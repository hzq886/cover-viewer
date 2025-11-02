import { DEFAULT_LANGUAGE } from "./language-utils";
import type { LanguageCode } from "./translations";

export const METADATA_MESSAGES: Record<
  LanguageCode,
  { title: string; description: string }
> = {
  "zh-CN": {
    title:
      "Jav hub | 你的线上日本成人影片情报站。管理你的影片并分享你的想法。",
    description: "你的线上日本成人影片情报站。管理你的影片并分享你的想法。",
  },
  "zh-TW": {
    title:
      "Jav hub | 你的線上日本成人影片情報站。管理你的影片並分享你的想法。",
    description: "你的線上日本成人影片情報站。管理你的影片並分享你的想法。",
  },
  ja: {
    title:
      "Jav hub | あなたのアダルトビデオ情報源！自分のビデオを管理し、評価を投稿しています。",
    description:
      "あなたのアダルトビデオ情報源！自分のビデオを管理し、評価を投稿しています。",
  },
  en: {
    title:
      "Jav hub | Your online informative source for Japanese adult videos; manage your video collection and share your thoughts.",
    description:
      "Your online informative source for Japanese adult videos; manage your video collection and share your thoughts.",
  },
};

export function resolveMetadataMessage(lang: LanguageCode) {
  return METADATA_MESSAGES[lang] ?? METADATA_MESSAGES[DEFAULT_LANGUAGE];
}
