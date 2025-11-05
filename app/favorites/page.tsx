'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import MovieCard from '@/components/MovieCard';
import ShareButton from '@/components/ShareButton';
import { useAuth } from '@/lib/hooks/useAuth';
import { useFavorites } from '@/lib/hooks/useFavorites';
import { tmdbClient } from '@/lib/services/tmdbClient';
import type { TMDBMovie } from '@/lib/services/tmdbClient';
import type { Movie } from '@/lib/types';

export default function FavoritesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { favorites, removeFavorite, isFavorite } = useFavorites();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  // If no user, show nothing (will redirect via useEffect)
  if (!user) {
    return null;
  }

  const handleRemoveFavorite = (movieId: number) => {
    removeFavorite(movieId);
  };

  const handleAddFavorite = (movie: Movie) => {
    // Convert Movie to TMDBMovie format for the card
    // This shouldn't happen on favorites page, but kept for consistency
  };

  return (
    <div className="bg-black min-h-screen">
      <Header onSearch={() => {}} />

      <main className="pt-20 pb-8">
        <div className="px-4 md:px-8">
          <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">My Favorites</h1>
              <p className="text-gray-400">
                {favorites.length > 0
                  ? `You have ${favorites.length} favorite${favorites.length !== 1 ? 's' : ''}`
                  : 'No favorites yet'}
              </p>
            </div>
            {user && favorites.length > 0 && (
              <ShareButton favorites={favorites} userId={user.id} />
            )}
          </div>

          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg mb-6">
                You haven't added any favorites yet
              </p>
              <Link
                href="/browse"
                className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition-colors"
              >
                Browse Movies
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {favorites.map((movie) => (
                <div key={movie.id} className="relative group">
                  <MovieCard
                    movie={{
                      id: movie.id,
                      title: movie.title,
                      poster_path: movie.posterPath,
                      backdrop_path: movie.backdropPath,
                      overview: movie.overview,
                      release_date: movie.releaseDate,
                      vote_average: movie.voteAverage,
                      vote_count: movie.voteCount,
                      genre_ids: movie.genreIds,
                    }}
                    onFavoriteClick={() => handleRemoveFavorite(movie.id)}
                    isFavorite={true}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
