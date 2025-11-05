import { useEffect, useCallback } from 'react';
import {
  addFavoriteToDatabase,
  removeFavoriteFromDatabase,
  getUserFavorites,
} from '@/lib/services/favoritesService';
import { useFavoritesStore } from '@/lib/utils/store';
import { useAuth } from './useAuth';
import type { Movie } from '@/lib/types';

export function useFavorites() {
  const { user } = useAuth();
  const { favorites, addFavorite, removeFavorite, setFavorites } = useFavoritesStore();

  // Load favorites from database on mount or when user changes
  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setFavorites([]);
    }
  }, [user?.id]);

  const loadFavorites = useCallback(async () => {
    if (!user) return;

    const dbFavorites = await getUserFavorites(user.id);
    setFavorites(dbFavorites);
  }, [user, setFavorites]);

  const handleAddFavorite = useCallback(
    async (movie: Movie) => {
      if (!user) return;

      // Optimistically add to local state
      addFavorite(movie);

      // Add to database
      const response = await addFavoriteToDatabase(user.id, movie.id, movie);

      if (!response.success) {
        // Revert on failure
        removeFavorite(movie.id);
        console.error('Failed to add favorite:', response.error);
      }
    },
    [user, addFavorite, removeFavorite]
  );

  const handleRemoveFavorite = useCallback(
    async (movieId: number) => {
      if (!user) return;

      // Optimistically remove from local state
      removeFavorite(movieId);

      // Remove from database
      const response = await removeFavoriteFromDatabase(user.id, movieId);

      if (!response.success) {
        // Revert on failure - reload from database
        const dbFavorites = await getUserFavorites(user.id);
        setFavorites(dbFavorites);
        console.error('Failed to remove favorite:', response.error);
      }
    },
    [user, removeFavorite, setFavorites]
  );

  const isFavorite = useCallback(
    (movieId: number) => {
      return favorites.some((m) => m.id === movieId);
    },
    [favorites]
  );

  return {
    favorites,
    addFavorite: handleAddFavorite,
    removeFavorite: handleRemoveFavorite,
    isFavorite,
    reloadFavorites: loadFavorites,
  };
}
