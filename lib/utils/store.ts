import { create } from 'zustand';
import type { Movie } from '@/lib/types';

interface AuthState {
  user: { id: string; email: string } | null;
  loading: boolean;
  setUser: (user: { id: string; email: string } | null) => void;
  setLoading: (loading: boolean) => void;
}

interface FavoritesState {
  favorites: Movie[];
  addFavorite: (movie: Movie) => void;
  removeFavorite: (movieId: number) => void;
  setFavorites: (favorites: Movie[]) => void;
  isFavorite: (movieId: number) => boolean;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
}));

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  addFavorite: (movie) =>
    set((state) => {
      if (!state.favorites.find((m) => m.id === movie.id)) {
        return { favorites: [...state.favorites, movie] };
      }
      return state;
    }),
  removeFavorite: (movieId) =>
    set((state) => ({
      favorites: state.favorites.filter((m) => m.id !== movieId),
    })),
  setFavorites: (favorites) => set({ favorites }),
  isFavorite: (movieId) => get().favorites.some((m) => m.id === movieId),
}));
