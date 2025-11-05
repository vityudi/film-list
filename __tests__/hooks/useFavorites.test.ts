import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFavorites } from '../../lib/hooks/useFavorites';
import * as favoritesServiceModule from '../../lib/services/favoritesService';
import * as storeModule from '../../lib/utils/store';
import * as notificationStoreModule from '../../lib/utils/notificationStore';
import * as authHookModule from '../../lib/hooks/useAuth';
import type { Movie } from '../../lib/types';

// Mock dependencies
vi.mock('../../lib/services/favoritesService');
vi.mock('../../lib/utils/store');
vi.mock('../../lib/utils/notificationStore');
vi.mock('../../lib/hooks/useAuth');

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

describe('useFavorites', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const setupMocks = (user: any = { id: 'user-123', email: 'test@example.com' }) => {
    const addFavoriteMock = vi.fn();
    const removeFavoriteMock = vi.fn();
    const setFavoritesMock = vi.fn();
    const addNotificationMock = vi.fn();

    vi.mocked(authHookModule.useAuth).mockReturnValue({
      user,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    } as any);

    vi.mocked(storeModule.useFavoritesStore).mockReturnValue({
      favorites: [],
      addFavorite: addFavoriteMock,
      removeFavorite: removeFavoriteMock,
      setFavorites: setFavoritesMock,
      isFavorite: vi.fn(),
    } as any);

    vi.mocked(notificationStoreModule.useNotificationStore).mockReturnValue({
      notifications: [],
      addNotification: addNotificationMock,
      removeNotification: vi.fn(),
      clearNotifications: vi.fn(),
    } as any);

    return {
      addFavoriteMock,
      removeFavoriteMock,
      setFavoritesMock,
      addNotificationMock,
    };
  };

  describe('loadFavorites', () => {
    it('should load favorites from database when user exists', async () => {
      const mockFavorites = [mockMovie, mockMovie2];
      vi.mocked(favoritesServiceModule.getUserFavorites).mockResolvedValue(
        mockFavorites
      );

      const { setFavoritesMock } = setupMocks();

      renderHook(() => useFavorites());

      await waitFor(() => {
        expect(favoritesServiceModule.getUserFavorites).toHaveBeenCalledWith(
          'user-123'
        );
      });

      expect(setFavoritesMock).toHaveBeenCalledWith(mockFavorites);
    });

    it('should clear favorites when user is null', async () => {
      const { setFavoritesMock } = setupMocks(null);

      renderHook(() => useFavorites());

      await waitFor(() => {
        expect(setFavoritesMock).toHaveBeenCalledWith([]);
      });
    });

    it('should not load favorites if user is not logged in', () => {
      setupMocks(null);

      vi.mocked(favoritesServiceModule.getUserFavorites).mockResolvedValue([]);

      renderHook(() => useFavorites());

      expect(favoritesServiceModule.getUserFavorites).not.toHaveBeenCalled();
    });
  });

  describe('handleAddFavorite', () => {
    it('should add favorite optimistically and show success notification', async () => {
      vi.mocked(favoritesServiceModule.addFavoriteToDatabase).mockResolvedValue({
        success: true,
      });

      const { addFavoriteMock, addNotificationMock } = setupMocks();

      vi.mocked(storeModule.useFavoritesStore).mockReturnValue({
        favorites: [],
        addFavorite: addFavoriteMock,
        removeFavorite: vi.fn(),
        setFavorites: vi.fn(),
        isFavorite: vi.fn(),
      } as any);

      const { result } = renderHook(() => useFavorites());

      await result.current.addFavorite(mockMovie);

      await waitFor(() => {
        expect(addFavoriteMock).toHaveBeenCalledWith(mockMovie);
        expect(addNotificationMock).toHaveBeenCalledWith(
          'Added "Fight Club" to favorites',
          'success'
        );
        expect(favoritesServiceModule.addFavoriteToDatabase).toHaveBeenCalledWith(
          'user-123',
          550,
          mockMovie
        );
      });
    });

    it('should not add if movie is already favorited', async () => {
      const { addFavoriteMock, addNotificationMock } = setupMocks();

      vi.mocked(storeModule.useFavoritesStore).mockReturnValue({
        favorites: [mockMovie],
        addFavorite: addFavoriteMock,
        removeFavorite: vi.fn(),
        setFavorites: vi.fn(),
        isFavorite: vi.fn(),
      } as any);

      const { result } = renderHook(() => useFavorites());

      await result.current.addFavorite(mockMovie);

      expect(addFavoriteMock).not.toHaveBeenCalled();
      expect(addNotificationMock).not.toHaveBeenCalled();
    });

    it('should revert on failure and show error notification', async () => {
      vi.mocked(favoritesServiceModule.addFavoriteToDatabase).mockResolvedValue({
        success: false,
        error: 'Database error',
      });

      const { addFavoriteMock, removeFavoriteMock, addNotificationMock } =
        setupMocks();

      vi.mocked(storeModule.useFavoritesStore).mockReturnValue({
        favorites: [],
        addFavorite: addFavoriteMock,
        removeFavorite: removeFavoriteMock,
        setFavorites: vi.fn(),
        isFavorite: vi.fn(),
      } as any);

      const { result } = renderHook(() => useFavorites());

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await result.current.addFavorite(mockMovie);

      await waitFor(() => {
        expect(addFavoriteMock).toHaveBeenCalledWith(mockMovie);
        expect(removeFavoriteMock).toHaveBeenCalledWith(550);
        expect(addNotificationMock).toHaveBeenCalledWith(
          'Failed to add "Fight Club" to favorites',
          'error'
        );
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to add favorite:',
          'Database error'
        );
      });

      consoleSpy.mockRestore();
    });

    it('should not add favorite if user is not logged in', async () => {
      const { addFavoriteMock } = setupMocks(null);

      vi.mocked(storeModule.useFavoritesStore).mockReturnValue({
        favorites: [],
        addFavorite: addFavoriteMock,
        removeFavorite: vi.fn(),
        setFavorites: vi.fn(),
        isFavorite: vi.fn(),
      } as any);

      const { result } = renderHook(() => useFavorites());

      await result.current.addFavorite(mockMovie);

      expect(addFavoriteMock).not.toHaveBeenCalled();
      expect(
        favoritesServiceModule.addFavoriteToDatabase
      ).not.toHaveBeenCalled();
    });
  });

  describe('handleRemoveFavorite', () => {
    it('should remove favorite optimistically and show success notification', async () => {
      vi.mocked(favoritesServiceModule.removeFavoriteFromDatabase).mockResolvedValue({
        success: true,
      });

      const { removeFavoriteMock, addNotificationMock } = setupMocks();

      vi.mocked(storeModule.useFavoritesStore).mockReturnValue({
        favorites: [mockMovie],
        addFavorite: vi.fn(),
        removeFavorite: removeFavoriteMock,
        setFavorites: vi.fn(),
        isFavorite: vi.fn(),
      } as any);

      const { result } = renderHook(() => useFavorites());

      await result.current.removeFavorite(550);

      await waitFor(() => {
        expect(removeFavoriteMock).toHaveBeenCalledWith(550);
        expect(addNotificationMock).toHaveBeenCalledWith(
          'Removed "Fight Club" from favorites',
          'success'
        );
        expect(favoritesServiceModule.removeFavoriteFromDatabase).toHaveBeenCalledWith(
          'user-123',
          550
        );
      });
    });

    it('should use generic title when movie not found', async () => {
      vi.mocked(favoritesServiceModule.removeFavoriteFromDatabase).mockResolvedValue({
        success: true,
      });

      const { addNotificationMock } = setupMocks();

      vi.mocked(storeModule.useFavoritesStore).mockReturnValue({
        favorites: [],
        addFavorite: vi.fn(),
        removeFavorite: vi.fn(),
        setFavorites: vi.fn(),
        isFavorite: vi.fn(),
      } as any);

      const { result } = renderHook(() => useFavorites());

      await result.current.removeFavorite(999);

      await waitFor(() => {
        expect(addNotificationMock).toHaveBeenCalledWith(
          'Removed "Movie" from favorites',
          'success'
        );
      });
    });

    it('should reload favorites on failure and show error notification', async () => {
      vi.mocked(favoritesServiceModule.removeFavoriteFromDatabase).mockResolvedValue({
        success: false,
        error: 'Permission denied',
      });

      vi.mocked(favoritesServiceModule.getUserFavorites).mockResolvedValue([
        mockMovie,
      ]);

      const { removeFavoriteMock, setFavoritesMock, addNotificationMock } =
        setupMocks();

      vi.mocked(storeModule.useFavoritesStore).mockReturnValue({
        favorites: [mockMovie],
        addFavorite: vi.fn(),
        removeFavorite: removeFavoriteMock,
        setFavorites: setFavoritesMock,
        isFavorite: vi.fn(),
      } as any);

      const { result } = renderHook(() => useFavorites());

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await result.current.removeFavorite(550);

      await waitFor(() => {
        expect(removeFavoriteMock).toHaveBeenCalledWith(550);
        expect(setFavoritesMock).toHaveBeenCalledWith([mockMovie]);
        expect(addNotificationMock).toHaveBeenCalledWith(
          'Failed to remove "Fight Club" from favorites',
          'error'
        );
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to remove favorite:',
          'Permission denied'
        );
      });

      consoleSpy.mockRestore();
    });

    it('should not remove favorite if user is not logged in', async () => {
      const { removeFavoriteMock } = setupMocks(null);

      vi.mocked(storeModule.useFavoritesStore).mockReturnValue({
        favorites: [mockMovie],
        addFavorite: vi.fn(),
        removeFavorite: removeFavoriteMock,
        setFavorites: vi.fn(),
        isFavorite: vi.fn(),
      } as any);

      const { result } = renderHook(() => useFavorites());

      await result.current.removeFavorite(550);

      expect(removeFavoriteMock).not.toHaveBeenCalled();
      expect(
        favoritesServiceModule.removeFavoriteFromDatabase
      ).not.toHaveBeenCalled();
    });
  });

  describe('isFavorite', () => {
    it('should return true when movie is favorited', () => {
      setupMocks();

      vi.mocked(storeModule.useFavoritesStore).mockReturnValue({
        favorites: [mockMovie, mockMovie2],
        addFavorite: vi.fn(),
        removeFavorite: vi.fn(),
        setFavorites: vi.fn(),
        isFavorite: vi.fn(),
      } as any);

      const { result } = renderHook(() => useFavorites());

      expect(result.current.isFavorite(550)).toBe(true);
    });

    it('should return false when movie is not favorited', () => {
      setupMocks();

      vi.mocked(storeModule.useFavoritesStore).mockReturnValue({
        favorites: [mockMovie2],
        addFavorite: vi.fn(),
        removeFavorite: vi.fn(),
        setFavorites: vi.fn(),
        isFavorite: vi.fn(),
      } as any);

      const { result } = renderHook(() => useFavorites());

      expect(result.current.isFavorite(550)).toBe(false);
    });

    it('should return false when no favorites exist', () => {
      setupMocks();

      vi.mocked(storeModule.useFavoritesStore).mockReturnValue({
        favorites: [],
        addFavorite: vi.fn(),
        removeFavorite: vi.fn(),
        setFavorites: vi.fn(),
        isFavorite: vi.fn(),
      } as any);

      const { result } = renderHook(() => useFavorites());

      expect(result.current.isFavorite(550)).toBe(false);
    });
  });

  describe('reloadFavorites', () => {
    it('should reload favorites from database', async () => {
      const mockFavorites = [mockMovie, mockMovie2];
      vi.mocked(favoritesServiceModule.getUserFavorites).mockResolvedValue(
        mockFavorites
      );

      const { setFavoritesMock } = setupMocks();

      const { result } = renderHook(() => useFavorites());

      await result.current.reloadFavorites();

      await waitFor(() => {
        expect(favoritesServiceModule.getUserFavorites).toHaveBeenCalledWith(
          'user-123'
        );
        expect(setFavoritesMock).toHaveBeenCalledWith(mockFavorites);
      });
    });

    it('should not reload if user is not logged in', async () => {
      setupMocks(null);

      const { result } = renderHook(() => useFavorites());

      await result.current.reloadFavorites();

      expect(favoritesServiceModule.getUserFavorites).not.toHaveBeenCalled();
    });
  });
});
