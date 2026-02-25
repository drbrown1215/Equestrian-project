const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const cors = require("cors");
const Parser = require("rss-parser");

const { feeds, cacheTtlMs } = require("./feeds");

const PORT = process.env.PORT ? Number(process.env.PORT) : 5174;

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
      ["enclosure", "enclosure"],
      ["content:encoded", "contentEncoded"],
    ],
  },
});

/** @type {Map<string, { fetchedAt: number, items: any[] }>} */
const feedCache = new Map();

function safeString(value) {
  return typeof value === "string" ? value : "";
}

function stripHtml(html) {
  const text = safeString(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
  return text;
}

function parsePublishedAt(item) {
  const candidates = [
    item.isoDate,
    item.pubDate,
    item.published,
    item.updated,
  ].filter(Boolean);

  for (const c of candidates) {
    const d = new Date(c);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

function pickImageUrl(item) {
  // rss-parser may normalize enclosure as { url, type, length }
  if (item?.enclosure?.url) return item.enclosure.url;

  // Media RSS fields
  const mediaContentUrl =
    item?.mediaContent?.$?.url || item?.mediaContent?.url || null;
  if (mediaContentUrl) return mediaContentUrl;

  const mediaThumbUrl =
    item?.mediaThumbnail?.$?.url || item?.mediaThumbnail?.url || null;
  if (mediaThumbUrl) return mediaThumbUrl;

  // Try to extract first <img src=""> from encoded content/description
  const html = safeString(item?.contentEncoded) || safeString(item?.content) || safeString(item?.description);
  const m = html.match(/<img[^>]+src=[\"']([^\"']+)[\"']/i);
  return m?.[1] || null;
}

function makeId(input) {
  return crypto.createHash("sha256").update(input).digest("hex").slice(0, 24);
}

function normalizeItemToArticle(item, sourceName) {
  const url = safeString(item.link) || safeString(item.guid);
  if (!url) return null;

  const title = stripHtml(item.title) || url;
  const summaryRaw = safeString(item.contentSnippet) || safeString(item.summary) || safeString(item.description) || safeString(item.content);
  const summary = stripHtml(summaryRaw);
  const published = parsePublishedAt(item);
  const publishedAt = published ? published.toISOString() : null;
  const imageUrl = pickImageUrl(item);

  return {
    id: makeId(url),
    title,
    url,
    sourceName,
    publishedAt,
    summary,
    imageUrl,
  };
}

async function fetchFeedItems(feed) {
  const now = Date.now();
  const cached = feedCache.get(feed.url);
  if (cached && now - cached.fetchedAt < cacheTtlMs) return cached.items;

  const parsed = await parser.parseURL(feed.url);
  const items = Array.isArray(parsed.items) ? parsed.items : [];

  feedCache.set(feed.url, { fetchedAt: now, items });
  return items;
}

function filterByQuery(articles, q) {
  const query = safeString(q).trim().toLowerCase();
  if (!query) return articles;
  return articles.filter((a) => {
    const hay = `${a.title} ${a.summary}`.toLowerCase();
    return hay.includes(query);
  });
}

function filterBySince(articles, sinceMs) {
  if (!sinceMs) return articles;
  return articles.filter((a) => {
    if (!a.publishedAt) return true;
    const t = new Date(a.publishedAt).getTime();
    return Number.isNaN(t) ? true : t >= sinceMs;
  });
}

function sortNewest(articles) {
  return [...articles].sort((a, b) => {
    const at = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bt = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bt - at;
  });
}

const app = express();
app.use(cors());

// If a production frontend build exists at ../client/dist, serve it.
// This enables a simple single-process LAN deployment: Node serves both API + UI.
const clientDistPath = path.resolve(__dirname, "..", "client", "dist");
const hasClientDist = fs.existsSync(clientDistPath);
if (hasClientDist) {
  app.use(express.static(clientDistPath));
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, feeds: feeds.length });
});

app.get("/api/articles", async (req, res) => {
  try {
    const q = req.query.q;
    const range = safeString(req.query.range);
    const limit = req.query.limit ? Number(req.query.limit) : 120;

    let sinceMs = null;
    if (range === "24h") sinceMs = Date.now() - 24 * 60 * 60 * 1000;
    if (range === "7d") sinceMs = Date.now() - 7 * 24 * 60 * 60 * 1000;
    if (range === "30d") sinceMs = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const all = [];
    for (const feed of feeds) {
      const items = await fetchFeedItems(feed);
      for (const item of items) {
        const article = normalizeItemToArticle(item, feed.name);
        if (article) all.push(article);
      }
    }

    // Dedupe by URL (or id)
    const seenUrl = new Set();
    const deduped = [];
    for (const a of all) {
      if (seenUrl.has(a.url)) continue;
      seenUrl.add(a.url);
      deduped.push(a);
    }

    const filtered = filterBySince(filterByQuery(deduped, q), sinceMs);
    const sorted = sortNewest(filtered);
    const clipped = Number.isFinite(limit) ? sorted.slice(0, Math.max(1, Math.min(500, limit))) : sorted;

    res.json({
      meta: {
        count: clipped.length,
        total: sorted.length,
        range: range || null,
        q: safeString(q) || null,
      },
      articles: clipped,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load feeds", detail: String(err?.message || err) });
  }
});

// Express 5 note: `app.get("*", ...)` throws in path-to-regexp.
// Use a regex and exclude `/api/*`.
if (hasClientDist) {
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`RSS API listening on http://localhost:${PORT}`);
});

