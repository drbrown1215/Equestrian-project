export async function fetchArticles({ q, range, limit, topic } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (range) params.set("range", range);
  if (limit) params.set("limit", String(limit));
  if (topic) params.set("topic", topic);

  const res = await fetch(`/api/articles?${params.toString()}`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text || res.statusText}`);
  }
  return await res.json();
}

