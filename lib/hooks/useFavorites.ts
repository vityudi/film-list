import { useEffect, useCallback } from 'react';
import {
  addFavoriteToDatabase,
  removeFavoriteFromDatabase,
  getUserFavorites,
} from '@/lib/services/favoritesService';
import { useFavoritesStore } from '@/lib/utils/store';
import { useNotificationStore } from '@/lib/utils/notificationStore';
import { useAuth } from './useAuth';
import type { Movie } from '@/lib/types';

export function useFavorites() {
  const { user } = useAuth();
  const { favorites, addFavorite, removeFavorite, setFavorites } = useFavoritesStore();
  const { addNotification } = useNotificationStore();

  const loadFavorites = useCallback(async () => {
    if (!user) return;

    const dbFavorites = await getUserFavorites(user.id);
    setFavorites(dbFavorites);
  }, [user, setFavorites]);

  // Load favorites from database on mount or when user changes
  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setFavorites([]);
    }
  }, [user?.id, loadFavorites, setFavorites]);

  const handleAddFavorite = useCallback(
    async (movie: Movie) => {
      if (!user) return;

      // Check if already favorited
      const alreadyFavorited = favorites.some((m) => m.id === movie.id);
      if (alreadyFavorited) {
        return; // Already favorited, do nothing
      }

      // Optimistically add to local state
      addFavorite(movie);

      // Show success notification
      addNotification(`Added "${movie.title}" to favorites`, 'success');

      // Add to database
      const response = await addFavoriteToDatabase(user.id, movie.id, movie);

      if (!response.success) {
        // Revert on failure
        removeFavorite(movie.id);
        addNotification(
          `Failed to add "${movie.title}" to favorites`,
          'error'
        );
        console.error('Failed to add favorite:', response.error);
      }
    },
    [user, addFavorite, removeFavorite, favorites, addNotification]
  );

  const handleRemoveFavorite = useCallback(
    async (movieId: number) => {
      if (!user) return;

      // Get the movie title before removing
      const movie = favorites.find((m) => m.id === movieId);
      const movieTitle = movie?.title || 'Movie';

      // Optimistically remove from local state
      removeFavorite(movieId);

      // Show success notification
      addNotification(`Removed "${movieTitle}" from favorites`, 'success');

      // Remove from database
      const response = await removeFavoriteFromDatabase(user.id, movieId);

      if (!response.success) {
        // Revert on failure - reload from database
        const dbFavorites = await getUserFavorites(user.id);
        setFavorites(dbFavorites);
        addNotification(
          `Failed to remove "${movieTitle}" from favorites`,
          'error'
        );
        console.error('Failed to remove favorite:', response.error);
      }
    },
    [user, removeFavorite, setFavorites, favorites, addNotification]
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
