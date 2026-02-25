function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ArticleCard({ article, isFavorite, onToggleFavorite }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/30 shadow-sm transition hover:bg-slate-900/50">
      <a
        href={article.url}
        target="_blank"
        rel="noreferrer"
        className="block"
      >
        <div className="aspect-[16/9] w-full overflow-hidden bg-slate-900">
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
              <span className="text-sm">No image</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="line-clamp-2 text-base font-semibold text-slate-100">
              {article.title}
            </h2>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
            <span className="rounded-full border border-slate-800 bg-slate-950/40 px-2 py-1">
              {article.sourceName}
            </span>
            <span>{formatDate(article.publishedAt)}</span>
          </div>

          {article.summary ? (
            <p className="mt-3 line-clamp-3 text-sm text-slate-200/90">
              {article.summary}
            </p>
          ) : null}
        </div>
      </a>

      <button
        type="button"
        onClick={onToggleFavorite}
        className={[
          "absolute right-3 top-3 rounded-xl border px-2.5 py-1.5 text-xs font-medium backdrop-blur transition",
          isFavorite
            ? "border-amber-400/40 bg-amber-400/20 text-amber-100"
            : "border-slate-700 bg-slate-950/30 text-slate-200 hover:bg-slate-950/60",
        ].join(" ")}
        title={isFavorite ? "Unfavorite" : "Favorite"}
        aria-label={isFavorite ? "Unfavorite" : "Favorite"}
      >
        {isFavorite ? "★" : "☆"}
      </button>
    </article>
  );
}

