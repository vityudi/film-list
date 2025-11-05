import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  addFavoriteToDatabase,
  removeFavoriteFromDatabase,
  getUserFavorites,
  isFavorited,
} from '../../lib/services/favoritesService';
import * as supabaseModule from '../../lib/services/supabaseClient';
import type { Movie } from '../../lib/types';

// Mock the supabase client
vi.mock('../../lib/services/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const mockSupabase = supabaseModule.supabase as any;

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

const createMockQuery = (returnValue: any = null, error: any = null) => ({
  select: vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: returnValue, error }),
      }),
    }),
  }),
  delete: vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error }),
    }),
  }),
});

describe('favoritesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addFavoriteToDatabase', () => {
    it('should successfully add a favorite when it does not exist', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await addFavoriteToDatabase('user-123', 550, mockMovie);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockQuery.insert).toHaveBeenCalled();
    });

    it('should return success if favorite already exists', async () => {
      const existingFavorite = { id: 'fav-123' };

      const mockQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi
                .fn()
                .mockResolvedValue({ data: existingFavorite, error: null }),
            }),
          }),
        }),
        insert: vi.fn(),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await addFavoriteToDatabase('user-123', 550, mockMovie);

      expect(result.success).toBe(true);
      expect(mockQuery.insert).not.toHaveBeenCalled();
    });

    it('should handle insert errors', async () => {
      const insertError = { message: 'Database error' };

      const mockQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }),
        insert: vi.fn().mockResolvedValue({ error: insertError }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await addFavoriteToDatabase('user-123', 550, mockMovie);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('should handle exceptions during add favorite', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Network error');
      });

      const result = await addFavoriteToDatabase('user-123', 550, mockMovie);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should handle non-Error exceptions', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw 'Unknown error';
      });

      const result = await addFavoriteToDatabase('user-123', 550, mockMovie);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to add favorite');
    });

    it('should insert correct data with movie details', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      await addFavoriteToDatabase('user-123', 550, mockMovie);

      expect(mockQuery.insert).toHaveBeenCalledWith([
        {
          user_id: 'user-123',
          movie_id: 550,
          movie_data: mockMovie,
        },
      ]);
    });
  });

  describe('removeFavoriteFromDatabase', () => {
    it('should successfully remove a favorite', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await removeFavoriteFromDatabase('user-123', 550);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockQuery.delete).toHaveBeenCalled();
    });

    it('should handle delete errors', async () => {
      const deleteError = { message: 'Permission denied' };

      const mockQuery = {
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: deleteError }),
          }),
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await removeFavoriteFromDatabase('user-123', 550);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Permission denied');
    });

    it('should handle exceptions during remove favorite', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Network error');
      });

      const result = await removeFavoriteFromDatabase('user-123', 550);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should handle non-Error exceptions', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw 'Unknown error';
      });

      const result = await removeFavoriteFromDatabase('user-123', 550);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to remove favorite');
    });

    it('should call delete with correct user and movie IDs', async () => {
      const eqMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const mockQuery = {
        delete: vi.fn().mockReturnValue({
          eq: eqMock,
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      await removeFavoriteFromDatabase('user-123', 550);

      expect(eqMock).toHaveBeenNthCalledWith(1, 'user_id', 'user-123');
      expect(eqMock.mock.results[0].value.eq).toHaveBeenCalledWith('movie_id', 550);
    });
  });

  describe('getUserFavorites', () => {
    it('should return array of user favorites', async () => {
      const mockData = [
        { movie_data: mockMovie },
        { movie_data: { ...mockMovie, id: 551, title: 'Se7en' } },
      ];

      const mockQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: mockData, error: null }),
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await getUserFavorites('user-123');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockMovie);
      expect(result[1].id).toBe(551);
    });

    it('should return empty array when user has no favorites', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await getUserFavorites('user-123');

      expect(result).toEqual([]);
    });

    it('should handle errors gracefully and return empty array', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'Error' } }),
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await getUserFavorites('user-123');

      expect(result).toEqual([]);
    });

    it('should handle exceptions and return empty array', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Network error');
      });

      const result = await getUserFavorites('user-123');

      expect(result).toEqual([]);
    });

    it('should handle null data gracefully', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await getUserFavorites('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('isFavorited', () => {
    it('should return true when favorite exists', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi
                .fn()
                .mockResolvedValue({ data: { id: 'fav-123' }, error: null }),
            }),
          }),
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await isFavorited('user-123', 550);

      expect(result).toBe(true);
    });

    it('should return false when favorite does not exist', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await isFavorited('user-123', 550);

      expect(result).toBe(false);
    });

    it('should return false on PGRST116 (not found) error', async () => {
      const notFoundError = { code: 'PGRST116', message: 'Not found' };

      const mockQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: notFoundError }),
            }),
          }),
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await isFavorited('user-123', 550);

      expect(result).toBe(false);
    });

    it('should log error on non-404 errors', async () => {
      const error = { code: 'SOME_ERROR', message: 'Database error' };

      const mockQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error }),
            }),
          }),
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await isFavorited('user-123', 550);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Error checking favorite:', error);

      consoleSpy.mockRestore();
    });

    it('should handle exceptions and return false', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Network error');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await isFavorited('user-123', 550);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
