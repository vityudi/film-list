import { supabase } from './supabaseClient';
import type { Movie } from '@/lib/types';

export interface SharedList {
  id: string;
  share_token: string;
  user_id: string;
  favorites_data: Movie[];
  created_at: string;
  expires_at: string | null;
}

export interface ShareResponse {
  success: boolean;
  shareToken?: string;
  shareUrl?: string;
  error?: string;
}

/**
 * Create a public share link for the user's current favorites
 */
export async function createShareLink(
  userId: string,
  favorites: Movie[]
): Promise<ShareResponse> {
  try {
    // Generate a unique share token
    const shareToken = generateShareToken();

    const { data, error } = await supabase
      .from('shared_lists')
      .insert([
        {
          user_id: userId,
          share_token: shareToken,
          favorites_data: favorites,
          created_at: new Date().toISOString(),
          expires_at: null, // No expiration for now
        },
      ])
      .select('share_token');

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        error: 'Failed to create share link',
      };
    }

    const token = data[0].share_token;
    const shareUrl = `${window.location.origin}/share/${token}`;

    return {
      success: true,
      shareToken: token,
      shareUrl,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create share link',
    };
  }
}

/**
 * Get shared list by share token
 */
export async function getSharedList(shareToken: string): Promise<Movie[] | null> {
  try {
    const { data, error } = await supabase
      .from('shared_lists')
      .select('favorites_data')
      .eq('share_token', shareToken)
      .single();

    if (error) {
      console.error('Error fetching shared list:', error);
      return null;
    }

    return data?.favorites_data || null;
  } catch (err) {
    console.error('Error fetching shared list:', err);
    return null;
  }
}

/**
 * Get share info by token
 */
export async function getShareInfo(shareToken: string): Promise<SharedList | null> {
  try {
    const { data, error } = await supabase
      .from('shared_lists')
      .select('*')
      .eq('share_token', shareToken)
      .single();

    if (error) {
      console.error('Error fetching share info:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error fetching share info:', err);
    return null;
  }
}

/**
 * Delete a shared list
 */
export async function deleteShareLink(shareToken: string): Promise<ShareResponse> {
  try {
    const { error } = await supabase
      .from('shared_lists')
      .delete()
      .eq('share_token', shareToken);

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
      error: err instanceof Error ? err.message : 'Failed to delete share link',
    };
  }
}

/**
 * Get all share links for a user
 */
export async function getUserShareLinks(userId: string): Promise<SharedList[]> {
  try {
    const { data, error } = await supabase
      .from('shared_lists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching share links:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching share links:', err);
    return [];
  }
}

/**
 * Generate a random share token
 */
function generateShareToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 16; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}
