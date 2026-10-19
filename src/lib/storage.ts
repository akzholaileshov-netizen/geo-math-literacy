export const STORAGE = {
  lang: 'ubt-lang',
  theme: 'ubt-theme',
  favorites: 'ubt-favorites',
  favoritesMigrated: 'ubt-favorites-migrated',
  result: 'ubt-quiz-result',
  store: 'ubt-store-v1',
} as const;

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function readSessionJson<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
