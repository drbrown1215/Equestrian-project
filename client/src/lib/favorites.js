const KEY = "eqNews:favorites:v1";

export function loadFavorites() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

export function saveFavorites(favsById) {
  localStorage.setItem(KEY, JSON.stringify(favsById));
}

