import { useStore } from '../hooks/StoreContext';

export function useFavorites() {
  const { favorites, toggleFavorite, removeFavorite } = useStore();
  return {
    ids: favorites,
    toggle: (id: string) => {
      void toggleFavorite(id);
    },
    remove: (id: string) => {
      void removeFavorite(id);
    },
    has: (id: string) => favorites.includes(id),
  };
}
