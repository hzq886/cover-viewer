#!/usr/bin/env python3
import re
from pathlib import Path

root = Path(__file__).resolve().parent.parent
html_path = root / "scripts" / "genre.html"
out_path = root / "src" / "data" / "genres.ts"

html = html_path.read_text(encoding="utf-8")

def strip_tags(s: str) -> str:
    s = re.sub(r"<[^>]+>", "", s)
    s = re.sub(r"\s+", " ", s)
    return s.strip()

groups = []

# Helper: get first <ul> after a given position
def extract_first_ul(start: int) -> str:
    m = re.search(r"<ul[^>]*>", html[start:], re.I)
    if not m:
        return ""
    ul_start = start + m.start()
    # find closing </ul> matching this ul (non-greedy)
    m2 = re.search(r"</ul>", html[ul_start:], re.I)
    if not m2:
        return ""
    ul_end = ul_start + m2.end()
    return html[ul_start:ul_end]

# 1) Recommended section (no id, title contains おすすめジャンル)
for m in re.finditer(r"<h2[^>]*>[^<]*おすすめジャンル[^<]*</h2>", html):
    h2_html = m.group(0)
    title = strip_tags(h2_html)
    ul = extract_first_ul(m.end())
    items = []
    # items are inside <p class="line-clamp-2 ...">TEXT</p>
    for li in re.findall(r"<li[\s\S]*?</li>", ul):
        label_m = re.search(r"<p[^>]*class=\"[^\"]*line-clamp-2[^\"]*\"[^>]*>([\s\S]*?)</p>", li)
        if not label_m:
            continue
        label = strip_tags(label_m.group(1))
        kw_m = re.search(r"keyword=(\d+)", li)
        item = {"id": kw_m.group(1) if kw_m else None, "label": label}
        items.append(item)
    if items:
        groups.append({"id": "recommended", "title": title, "items": items})

# 2) Category sections by id
for sec_id in ["situation", "type", "costume", "genre", "play", "other", "campaign"]:
    h2 = re.search(rf"<h2[^>]*id=\"{sec_id}\"[^>]*>([\s\S]*?)</h2>", html)
    if not h2:
        continue
    title = strip_tags(h2.group(0))
    ul = extract_first_ul(h2.end())
    items = []
    # Items look like: <span class="line-clamp-2">TEXT</span> or similar
    for li in re.findall(r"<li[\s\S]*?</li>", ul):
        label_m = re.search(r"<span[^>]*class=\"[^\"]*line-clamp-2[^\"]*\"[^>]*>([\s\S]*?)</span>", li)
        if not label_m:
            # fallback: p
            label_m = re.search(r"<p[^>]*class=\"[^\"]*line-clamp-2[^\"]*\"[^>]*>([\s\S]*?)</p>", li)
        if not label_m:
            continue
        label = strip_tags(label_m.group(1))
        kw_m = re.search(r"keyword=(\d+)", li)
        item = {"id": kw_m.group(1) if kw_m else None, "label": label}
        items.append(item)
    if items:
        groups.append({"id": sec_id, "title": title, "items": items})

out_path.parent.mkdir(parents=True, exist_ok=True)

def ts_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace("`", "\\`").replace("$", "\\$").replace("\"", "\\\"")

with out_path.open("w", encoding="utf-8") as f:
    f.write("// Generated from scripts/genre.html by scripts/extract_genres.py\n")
    f.write("export type GenreItem = { id?: string; label: string };\n")
    f.write("export type GenreGroup = { id: string; title: string; items: GenreItem[] };\n")
    f.write("export const GENRE_GROUPS: GenreGroup[] = [\n")
    for gi, g in enumerate(groups):
        f.write("  {\n")
        f.write(f"    id: \"{ts_escape(g['id'])}\",\n")
        f.write(f"    title: \"{ts_escape(g['title'])}\",\n")
        f.write("    items: [\n")
        for ii, it in enumerate(g["items"]):
            id_part = ("id: \"" + ts_escape(it['id']) + "\", ") if it.get("id") else ""
            line = "      { " + id_part + "label: \"" + ts_escape(it['label']) + "\" },\n"
            f.write(line)
        f.write("    ],\n")
        f.write("  },\n")
    f.write("] as const;\n")
print(f"Extracted {sum(len(g['items']) for g in groups)} items in {len(groups)} groups to {out_path}")
