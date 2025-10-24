"use client";

import { useEffect } from "react";
import { useI18n } from "./I18nProvider";
import { resolveMetadataMessage } from "./metadata";

export function MetadataSynchronizer() {
  const { language } = useI18n();

  useEffect(() => {
    const { title, description } = resolveMetadataMessage(language);

    if (typeof document === "undefined") {
      return;
    }

    document.title = title;
    const descriptionTag = document.querySelector('meta[name="description"]');
    if (descriptionTag) {
      descriptionTag.setAttribute("content", description);
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = description;
      document.head.appendChild(meta);
    }
  }, [language]);

  return null;
}
