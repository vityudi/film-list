import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore, useFavoritesStore } from '../../lib/utils/store';
import type { Movie } from '../../lib/types';

const mockMovie: Movie = {
  id: 550,
  title: 'Fight Club',
  posterPath: '/poster.jpg',
  backdropPath: '/backdrop.jpg',
  overview: 'An insomniac office worker',
  releaseDate: '1999-10-15',
  voteAverage: 8.8,
  voteCount: 25000,
  genreIds: [18, 53],
};

const mockMovie2: Movie = {
  id: 551,
  title: 'Se7en',
  posterPath: '/poster2.jpg',
  backdropPath: '/backdrop2.jpg',
  overview: 'Detectives hunt a serial killer',
  releaseDate: '1995-09-22',
  voteAverage: 8.6,
  voteCount: 20000,
  genreIds: [18, 53, 80],
};

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({ user: null, loading: true });
  });

  describe('initial state', () => {
    it('should have null user initially', () => {
      const { user } = useAuthStore.getState();
      expect(user).toBeNull();
    });

    it('should have loading set to true initially', () => {
      const { loading } = useAuthStore.getState();
      expect(loading).toBe(true);
    });
  });

  describe('setUser', () => {
    it('should set user with provided data', () => {
      const userData = { id: 'user-123', email: 'test@example.com' };

      useAuthStore.getState().setUser(userData);

      const { user } = useAuthStore.getState();
      expect(user).toEqual(userData);
    });

    it('should set user to null', () => {
      useAuthStore.setState({
        user: { id: 'user-123', email: 'test@example.com' },
      });

      useAuthStore.getState().setUser(null);

      const { user } = useAuthStore.getState();
      expect(user).toBeNull();
    });

    it('should update user data', () => {
      useAuthStore.setState({
        user: { id: 'user-123', email: 'old@example.com' },
      });

      const newUserData = { id: 'user-456', email: 'new@example.com' };
      useAuthStore.getState().setUser(newUserData);

      const { user } = useAuthStore.getState();
      expect(user).toEqual(newUserData);
    });
  });

  describe('setLoading', () => {
    it('should set loading to true', () => {
      useAuthStore.setState({ loading: false });

      useAuthStore.getState().setLoading(true);

      const { loading } = useAuthStore.getState();
      expect(loading).toBe(true);
    });

    it('should set loading to false', () => {
      useAuthStore.setState({ loading: true });

      useAuthStore.getState().setLoading(false);

      const { loading } = useAuthStore.getState();
      expect(loading).toBe(false);
    });
  });

  describe('state transitions', () => {
    it('should handle multiple state updates', () => {
      const userData = { id: 'user-123', email: 'test@example.com' };

      useAuthStore.getState().setUser(userData);
      useAuthStore.getState().setLoading(false);

      const { user, loading } = useAuthStore.getState();
      expect(user).toEqual(userData);
      expect(loading).toBe(false);
    });

    it('should allow setting user and loading independently', () => {
      useAuthStore.getState().setLoading(false);
      const { loading: loadingBeforeUser } = useAuthStore.getState();

      const userData = { id: 'user-123', email: 'test@example.com' };
      useAuthStore.getState().setUser(userData);

      const { user, loading } = useAuthStore.getState();
      expect(user).toEqual(userData);
      expect(loading).toBe(loadingBeforeUser);
    });
  });
});

describe('useFavoritesStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useFavoritesStore.setState({
      favorites: [],
    });
  });

  describe('initial state', () => {
    it('should have empty favorites initially', () => {
      const { favorites } = useFavoritesStore.getState();
      expect(favorites).toEqual([]);
    });
  });

  describe('addFavorite', () => {
    it('should add a new favorite', () => {
      useFavoritesStore.getState().addFavorite(mockMovie);

      const { favorites } = useFavoritesStore.getState();
      expect(favorites).toHaveLength(1);
      expect(favorites[0]).toEqual(mockMovie);
    });

    it('should add multiple favorites', () => {
      useFavoritesStore.getState().addFavorite(mockMovie);
      useFavoritesStore.getState().addFavorite(mockMovie2);

      const { favorites } = useFavoritesStore.getState();
      expect(favorites).toHaveLength(2);
      expect(favorites).toContain(mockMovie);
      expect(favorites).toContain(mockMovie2);
    });

    it('should not add duplicate favorite', () => {
      useFavoritesStore.getState().addFavorite(mockMovie);
      useFavoritesStore.getState().addFavorite(mockMovie);

      const { favorites } = useFavoritesStore.getState();
      expect(favorites).toHaveLength(1);
      expect(favorites[0]).toEqual(mockMovie);
    });

    it('should maintain order when adding favorites', () => {
      useFavoritesStore.getState().addFavorite(mockMovie);
      useFavoritesStore.getState().addFavorite(mockMovie2);

      const { favorites } = useFavoritesStore.getState();
      expect(favorites[0].id).toBe(550);
      expect(favorites[1].id).toBe(551);
    });
  });

  describe('removeFavorite', () => {
    it('should remove a favorite by id', () => {
      useFavoritesStore.getState().addFavorite(mockMovie);
      useFavoritesStore.getState().addFavorite(mockMovie2);

      useFavoritesStore.getState().removeFavorite(550);

      const { favorites } = useFavoritesStore.getState();
      expect(favorites).toHaveLength(1);
      expect(favorites[0]).toEqual(mockMovie2);
    });

    it('should handle removing non-existent favorite', () => {
      useFavoritesStore.getState().addFavorite(mockMovie);

      useFavoritesStore.getState().removeFavorite(999);

      const { favorites } = useFavoritesStore.getState();
      expect(favorites).toHaveLength(1);
      expect(favorites[0]).toEqual(mockMovie);
    });

    it('should clear all favorites when removing all items', () => {
      useFavoritesStore.getState().addFavorite(mockMovie);

      useFavoritesStore.getState().removeFavorite(550);

      const { favorites } = useFavoritesStore.getState();
      expect(favorites).toHaveLength(0);
    });
  });

  describe('setFavorites', () => {
    it('should set favorites to provided array', () => {
      const newFavorites = [mockMovie, mockMovie2];

      useFavoritesStore.getState().setFavorites(newFavorites);

      const { favorites } = useFavoritesStore.getState();
      expect(favorites).toEqual(newFavorites);
    });

    it('should replace existing favorites', () => {
      useFavoritesStore.getState().addFavorite(mockMovie);

      useFavoritesStore.getState().setFavorites([mockMovie2]);

      const { favorites } = useFavoritesStore.getState();
      expect(favorites).toHaveLength(1);
      expect(favorites[0]).toEqual(mockMovie2);
    });

    it('should clear favorites with empty array', () => {
      useFavoritesStore.getState().addFavorite(mockMovie);

      useFavoritesStore.getState().setFavorites([]);

      const { favorites } = useFavoritesStore.getState();
      expect(favorites).toHaveLength(0);
    });
  });

  describe('isFavorite', () => {
    it('should return true when favorite exists', () => {
      useFavoritesStore.getState().addFavorite(mockMovie);

      const isFav = useFavoritesStore.getState().isFavorite(550);

      expect(isFav).toBe(true);
    });

    it('should return false when favorite does not exist', () => {
      useFavoritesStore.getState().addFavorite(mockMovie);

      const isFav = useFavoritesStore.getState().isFavorite(999);

      expect(isFav).toBe(false);
    });

    it('should return false when no favorites exist', () => {
      const isFav = useFavoritesStore.getState().isFavorite(550);

      expect(isFav).toBe(false);
    });

    it('should correctly check multiple favorites', () => {
      useFavoritesStore.getState().addFavorite(mockMovie);
      useFavoritesStore.getState().addFavorite(mockMovie2);

      expect(useFavoritesStore.getState().isFavorite(550)).toBe(true);
      expect(useFavoritesStore.getState().isFavorite(551)).toBe(true);
      expect(useFavoritesStore.getState().isFavorite(999)).toBe(false);
    });
  });

  describe('complex workflows', () => {
    it('should handle add-remove-add workflow', () => {
      useFavoritesStore.getState().addFavorite(mockMovie);
      useFavoritesStore.getState().removeFavorite(550);
      useFavoritesStore.getState().addFavorite(mockMovie);

      const { favorites } = useFavoritesStore.getState();
      expect(favorites).toHaveLength(1);
      expect(favorites[0]).toEqual(mockMovie);
    });

    it('should handle setFavorites after add operations', () => {
      useFavoritesStore.getState().addFavorite(mockMovie);
      useFavoritesStore.getState().setFavorites([mockMovie2]);

      const { favorites } = useFavoritesStore.getState();
      expect(favorites).toHaveLength(1);
      expect(favorites[0]).toEqual(mockMovie2);
      expect(useFavoritesStore.getState().isFavorite(550)).toBe(false);
      expect(useFavoritesStore.getState().isFavorite(551)).toBe(true);
    });

    it('should maintain consistency across multiple operations', () => {
      const newFavorites = [mockMovie, mockMovie2];
      useFavoritesStore.getState().setFavorites(newFavorites);

      expect(useFavoritesStore.getState().isFavorite(550)).toBe(true);
      expect(useFavoritesStore.getState().isFavorite(551)).toBe(true);

      useFavoritesStore.getState().removeFavorite(550);

      expect(useFavoritesStore.getState().isFavorite(550)).toBe(false);
      expect(useFavoritesStore.getState().isFavorite(551)).toBe(true);
      expect(useFavoritesStore.getState().favorites).toHaveLength(1);
    });
  });
});
