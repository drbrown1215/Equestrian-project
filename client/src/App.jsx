import { useEffect, useMemo, useState } from "react";
import { ControlsBar } from "./components/ControlsBar.jsx";
import { ArticleGrid } from "./components/ArticleGrid.jsx";
import { fetchArticles } from "./lib/api.js";
import { loadFavorites, saveFavorites } from "./lib/favorites.js";

function App() {
  const [topic, setTopic] = useState("equestrian");
  const [q, setQ] = useState("");
  const [range, setRange] = useState("7d");
  const [sort, setSort] = useState("newest");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [favoritesById, setFavoritesById] = useState(() => loadFavorites());

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [articles, setArticles] = useState([]);

  async function load({ asRefresh } = { asRefresh: false }) {
    setError("");
    if (asRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    try {
      const data = await fetchArticles({ q, range, limit: 200, topic });
      setArticles(Array.isArray(data.articles) ? data.articles : []);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    load({ asRefresh: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  useEffect(() => {
    load({ asRefresh: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic]);

  useEffect(() => {
    const t = setTimeout(() => {
      load({ asRefresh: false });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function toggleFavorite(article) {
    setFavoritesById((prev) => {
      const next = { ...prev };
      if (next[article.id]) delete next[article.id];
      else next[article.id] = {
        id: article.id,
        title: article.title,
        url: article.url,
        sourceName: article.sourceName,
        publishedAt: article.publishedAt,
        summary: article.summary,
        imageUrl: article.imageUrl,
        savedAt: new Date().toISOString(),
      };
      saveFavorites(next);
      return next;
    });
  }

  const visibleArticles = useMemo(() => {
    let list = articles;
    if (showFavoritesOnly) {
      const favIds = new Set(Object.keys(favoritesById));
      list = list.filter((a) => favIds.has(a.id));
    }
    // sort is currently only newest (server already sorts), but keep here for future expansion
    if (sort === "newest") return list;
    return list;
  }, [articles, favoritesById, showFavoritesOnly, sort]);

  const title =
    topic === "offroad" ? "Off-Roading News Grid" : "Equestrian News Grid";
  const description =
    topic === "offroad"
      ? "Curated off-roading and overland news articles from RSS feeds. Click any card to open the original story."
      : "Curated Equestrian News articles from RSS feeds. Click any card to open the original story.";

  return (
    <div
      className={[
        "min-h-screen transition-colors duration-300",
        topic === "offroad" ? "bg-amber-950" : "bg-slate-950",
      ].join(" ")}
    >
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-6 flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
            {title}
          </h1>
          <p className="text-sm text-slate-300">
            {description}
          </p>
        </header>

        <div className="mb-6">
          <ControlsBar
            topic={topic}
            onChangeTopic={setTopic}
            q={q}
            onChangeQ={setQ}
            range={range}
            onChangeRange={setRange}
            sort={sort}
            onChangeSort={setSort}
            showFavoritesOnly={showFavoritesOnly}
            onToggleFavoritesOnly={() =>
              setShowFavoritesOnly((v) => !v)
            }
            isRefreshing={isRefreshing}
            onRefresh={() => load({ asRefresh: true })}
          />
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-100">
            <div className="text-sm font-semibold">Couldn’t load articles</div>
            <div className="mt-1 text-sm opacity-90">{error}</div>
            <button
              type="button"
              onClick={() => load({ asRefresh: true })}
              className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-medium hover:bg-rose-500/20"
            >
              Try again
            </button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="text-slate-300">Loading articles…</div>
        ) : visibleArticles.length ? (
          <ArticleGrid
            articles={visibleArticles}
            favoritesById={favoritesById}
            onToggleFavorite={toggleFavorite}
          />
        ) : (
          <div
            className={[
              "rounded-2xl border p-6 text-slate-200",
              topic === "offroad"
                ? "border-amber-900/60 bg-amber-950/30"
                : "border-slate-800 bg-slate-900/30",
            ].join(" ")}
          >
            No articles match your filters.
          </div>
        )}

        <footer className="mt-10 text-xs text-slate-400">
          Favorites are stored locally in your browser.
        </footer>
      </div>
    </div>
  );
}

export default App;
