import { DEFAULT_LANGUAGE, resolveLanguage } from "@/i18n/language-utils";
import { type LanguageCode, translations } from "@/i18n/translations";

export type SignInEmailContent = {
  language: LanguageCode;
  subject: string;
  previewText: string;
  html: string;
  text: string;
};

const EMAIL_BUTTON_STYLE =
  "display:inline-block;padding:12px 24px;border-radius:9999px;background-color:#6d28d9;color:#ffffff;text-decoration:none;font-weight:600;";
const EMAIL_LINK_STYLE =
  "color:#6d28d9;text-decoration:none;word-break:break-all;";
const EMAIL_FOOTER_STYLE = "color:#64748b;font-size:12px;margin-top:24px;";

const HTML_ESCAPE_LOOKUP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};
const HTML_ESCAPE_REGEX = /[&<>"']/g;

const escapeHtml = (value: string): string =>
  value.replace(
    HTML_ESCAPE_REGEX,
    (char) => HTML_ESCAPE_LOOKUP[char as keyof typeof HTML_ESCAPE_LOOKUP],
  );

const sanitize = (value: string): string => (value ? escapeHtml(value) : "");

// Compose localized email copy for Resend using the dictionary, with a fallback to English.
export function buildSignInEmail(
  rawLanguage: string | null | undefined,
  link: string,
): SignInEmailContent {
  const language =
    resolveLanguage(rawLanguage ?? undefined) ?? DEFAULT_LANGUAGE;
  const template =
    translations[language].signInEmail ?? translations.en.signInEmail;
  const trimmedLink = (link ?? "").trim();
  const href = trimmedLink.length > 0 ? trimmedLink : "#";
  const escapedHref = sanitize(href);
  const escapedLinkText = sanitize(trimmedLink.length > 0 ? trimmedLink : href);

  const htmlParts = [
    `<p>${sanitize(template.greeting)}</p>`,
    `<p>${sanitize(template.intro)}</p>`,
    `<p><a href="${escapedHref}" style="${EMAIL_BUTTON_STYLE}">${sanitize(template.button)}</a></p>`,
    `<p>${sanitize(template.fallbackIntro)}</p>`,
    `<p><a href="${escapedHref}" style="${EMAIL_LINK_STYLE}">${escapedLinkText}</a></p>`,
    `<p>${sanitize(template.expiry)}</p>`,
    `<p>${sanitize(template.ignore)}</p>`,
    `<p>${sanitize(template.closing)}</p>`,
    `<p>${sanitize(template.signature)}</p>`,
    `<p style="${EMAIL_FOOTER_STYLE}">${sanitize(template.footer)}</p>`,
  ];

  const plainLink = trimmedLink.length > 0 ? trimmedLink : href;
  const textLines = [
    template.greeting,
    "",
    template.intro,
    "",
    `${template.button}: ${plainLink}`,
    "",
    template.fallbackIntro,
    plainLink,
    "",
    template.expiry,
    template.ignore,
    "",
    template.closing,
    template.signature,
    "",
    template.footer,
  ];

  return {
    language,
    subject: template.subject,
    previewText: template.previewText.trim(),
    html: htmlParts.join("\n"),
    text: textLines
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trimEnd(),
  };
}
