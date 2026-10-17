import { useCallback, useState } from 'react';
import { STORAGE, readJson } from '../lib/storage';

function readIds(): string[] {
  const parsed = readJson<unknown>(STORAGE.favorites, []);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((item): item is string => typeof item === 'string');
}

export function useFavorites() {
  const [ids, setIds] = useState<string[]>(readIds);

  const toggle = useCallback((id: string) => {
    setIds((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      localStorage.setItem(STORAGE.favorites, JSON.stringify(next));
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setIds((current) => {
      const next = current.filter((item) => item !== id);
      localStorage.setItem(STORAGE.favorites, JSON.stringify(next));
      return next;
    });
  }, []);

  return { ids, toggle, remove, has: (id: string) => ids.includes(id) };
}
