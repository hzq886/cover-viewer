import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const genresPath = path.join(projectRoot, "src/data/genres.ts");
const source = await fs.readFile(genresPath, "utf8");

const itemRegex =
  /\{\s*(id:\s*"(?<id>[^"]+)",\s*)?label:\s*"(?<label>[^"]+)"\s*\}/g;
const groupRegex =
  /\{\s*id:\s*"(?<groupId>[^"]+)",\s*title:\s*"(?<title>[^"]+)"/g;

const items = [];
for (
  let itemMatch = itemRegex.exec(source);
  itemMatch;
  itemMatch = itemRegex.exec(source)
) {
  items.push({
    key: itemMatch.groups?.id ?? itemMatch.groups?.label ?? itemMatch[0],
    label: itemMatch.groups?.label ?? "",
  });
}
const groups = [];
for (
  let groupMatch = groupRegex.exec(source);
  groupMatch;
  groupMatch = groupRegex.exec(source)
) {
  groups.push({
    key: `group:${groupMatch.groups.groupId}`,
    label: groupMatch.groups.title,
  });
}
const allEntries = [...groups, ...items];

const languages = [
  { code: "zh-CN", target: "zh-CN" },
  { code: "zh-TW", target: "zh-TW" },
  { code: "en", target: "en" },
];

async function translate(text, target) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=${target}&dt=t&q=${encodeURIComponent(
    text,
  )}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to translate ${text} -> ${target}: ${res.status}`);
  }
  const data = await res.json();
  const translated = data?.[0]?.[0]?.[0];
  if (typeof translated !== "string") {
    throw new Error(`Unexpected response for ${text}`);
  }
  return translated;
}

const translations = {
  "zh-CN": {},
  "zh-TW": {},
  en: {},
};

for (const entry of allEntries) {
  const { key, label } = entry;
  if (!label) continue;
  for (const { code, target } of languages) {
    try {
      const result = await translate(label, target);
      translations[code][key] = result;
      // Sleep a little to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 120));
    } catch (error) {
      console.error(`Error translating ${label} to ${code}:`, error);
      translations[code][key] = label;
    }
  }
  console.log(`Translated ${label}`);
}

const outputPath = path.join(__dirname, "genreTranslations.generated.json");
await fs.writeFile(outputPath, JSON.stringify(translations, null, 2), "utf8");
console.log("Translations saved to", outputPath);
