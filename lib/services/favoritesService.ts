import { supabase } from './supabaseClient';
import type { Movie } from '@/lib/types';

export interface FavoriteResponse {
  success: boolean;
  error?: string;
}

export async function addFavoriteToDatabase(
  userId: string,
  movieId: number,
  movieData: Movie
): Promise<FavoriteResponse> {
  try {
    const { error } = await supabase.from('favorites').insert([
      {
        user_id: userId,
        movie_id: movieId,
        movie_data: movieData,
      },
    ]);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to add favorite',
    };
  }
}

export async function removeFavoriteFromDatabase(
  userId: string,
  movieId: number
): Promise<FavoriteResponse> {
  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('movie_id', movieId);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to remove favorite',
    };
  }
}

export async function getUserFavorites(userId: string): Promise<Movie[]> {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('movie_data')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }

    return data?.map((fav) => fav.movie_data) || [];
  } catch (err) {
    console.error('Error fetching favorites:', err);
    return [];
  }
}

export async function isFavorited(userId: string, movieId: number): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('movie_id', movieId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected
      console.error('Error checking favorite:', error);
    }

    return !!data;
  } catch (err) {
    console.error('Error checking favorite:', err);
    return false;
  }
}
