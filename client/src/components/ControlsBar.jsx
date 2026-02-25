export function ControlsBar({
  q,
  onChangeQ,
  range,
  onChangeRange,
  sort,
  onChangeSort,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  isRefreshing,
  onRefresh,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
          <div className="flex-1">
            <label className="sr-only" htmlFor="search">
              Search
            </label>
            <input
              id="search"
              value={q}
              onChange={(e) => onChangeQ(e.target.value)}
              placeholder="Search headlines and summaries…"
              className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
            />
          </div>

          <div className="flex gap-2">
            <div>
              <label className="sr-only" htmlFor="range">
                Time range
              </label>
              <select
                id="range"
                value={range}
                onChange={(e) => onChangeRange(e.target.value)}
                className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
            </div>

            <div>
              <label className="sr-only" htmlFor="sort">
                Sort
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => onChangeSort(e.target.value)}
                className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
              >
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleFavoritesOnly}
            className={[
              "rounded-xl border px-3 py-2 text-sm font-medium transition",
              showFavoritesOnly
                ? "border-amber-400/40 bg-amber-400/10 text-amber-200"
                : "border-slate-800 bg-slate-950/40 text-slate-200 hover:bg-slate-950/70",
            ].join(" ")}
            title="Show favorites only"
          >
            Favorites
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-950/70 disabled:opacity-60"
            title="Refresh"
          >
            {isRefreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>
    </div>
  );
}

